using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Data;
using System.Security.Claims;

namespace PPrePorter.API.Features.Authentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ApiExplorerSettings(GroupName = SwaggerGroups.Auth)]
    public class AuthController : ControllerBase
    {
        private readonly PPRePorterDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<AuthController> _logger;
        private readonly RateLimitingSettings _rateLimitingSettings;

        public AuthController(
            PPRePorterDbContext dbContext,
            IJwtService jwtService,
            IPasswordHasher passwordHasher,
            IOptions<RateLimitingSettings> rateLimitingSettings,
            ILogger<AuthController> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
            _rateLimitingSettings = rateLimitingSettings?.Value ?? throw new ArgumentNullException(nameof(rateLimitingSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                // Find user by username
                var user = await _dbContext.Users
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions.Where(p => p.PermissionName != null))
                    .FirstOrDefaultAsync(u => u.Username == loginRequest.Username);

                if (user == null)
                {
                    _logger.LogWarning("Login attempt with invalid username: {Username}", loginRequest.Username);
                    return Unauthorized(new { Message = "Invalid username or password" });
                }

                // Check if account is locked out
                if (user.IsLockedOut)
                {
                    var remainingLockoutTime = user.LockoutEnd!.Value - DateTime.UtcNow;
                    _logger.LogWarning("Login attempt for locked out user: {Username}, Remaining lockout time: {RemainingTime} minutes",
                        user.Username, Math.Ceiling(remainingLockoutTime.TotalMinutes));

                    return Unauthorized(new {
                        Message = $"Your account is temporarily locked due to multiple failed login attempts. Please try again in {Math.Ceiling(remainingLockoutTime.TotalMinutes)} minutes or contact an administrator."
                    });
                }

                // Check if user is active
                if (!user.IsActive)
                {
                    _logger.LogWarning("Login attempt for inactive user: {Username}", user.Username);
                    return Unauthorized(new { Message = "Your account is inactive. Please contact an administrator." });
                }

                bool isPasswordValid = false;

                // Verify password
                if (_passwordHasher.IsBCryptHash(user.PasswordHash))
                {
                    // Use BCrypt verification
                    isPasswordValid = _passwordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash);
                }
                else
                {
                    // Legacy verification - for backward compatibility
                    string legacyHash = _passwordHasher.GenerateLegacyHash(loginRequest.Password);
                    isPasswordValid = user.PasswordHash == legacyHash;

                    // Special case for admin user during development - to be removed in production
                    if (user.Username == "admin" && loginRequest.Password == "Admin123!")
                    {
                        _logger.LogWarning("Admin user logged in with development password");
                        isPasswordValid = true;
                    }

                    // If using legacy hash and password is valid, upgrade to BCrypt
                    if (isPasswordValid)
                    {
                        // Upgrade to BCrypt hash
                        user.PasswordHash = _passwordHasher.HashPassword(loginRequest.Password);
                        _logger.LogInformation("Upgraded password hash to BCrypt for user: {Username}", user.Username);
                    }
                }

                // Handle failed login attempt
                if (!isPasswordValid)
                {
                    // Increment failed login attempts
                    user.FailedLoginAttempts++;
                    user.LastFailedLoginAttempt = DateTime.UtcNow;

                    // Check if account should be locked
                    if (user.FailedLoginAttempts >= _rateLimitingSettings.MaxFailedLoginAttempts)
                    {
                        user.LockoutEnd = DateTime.UtcNow.AddMinutes(_rateLimitingSettings.LockoutDurationMinutes);
                        _logger.LogWarning("User {Username} has been locked out due to {Count} failed login attempts",
                            user.Username, user.FailedLoginAttempts);
                    }

                    await _dbContext.SaveChangesAsync();

                    _logger.LogWarning("Login attempt with invalid password for user: {Username}, Failed attempts: {FailedAttempts}",
                        user.Username, user.FailedLoginAttempts);

                    return Unauthorized(new { Message = "Invalid username or password" });
                }

                // Reset failed login attempts on successful login
                user.FailedLoginAttempts = 0;
                user.LastFailedLoginAttempt = null;
                user.LockoutEnd = null;

                // Get user permissions
                var permissions = user.Role.Permissions
                    .Where(p => p.IsAllowed && p.PermissionName != null)
                    .Select(p => p.PermissionName!)
                    .ToList();

                // Generate JWT token
                var token = _jwtService.GenerateJwtToken(
                    user.Id.ToString(),
                    user.Username,
                    user.Role.Name,
                    permissions);

                // Generate refresh token
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Store refresh token in the database
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Set refresh token expiry
                user.LastLogin = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("User {Username} logged in successfully", user.Username);

                // Return the login response with token and user information
                return Ok(new LoginResponse
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    Expiration = _jwtService.GetTokenExpirationTime(token),
                    Username = user.Username,
                    FullName = $"{user.FirstName} {user.LastName}".Trim(),
                    Role = user.Role.Name,
                    Permissions = permissions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user {Username}", loginRequest.Username);
                return StatusCode(500, new { Message = "An error occurred during login." });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<LoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RefreshToken))
                {
                    return BadRequest(new { Message = "Refresh token is required." });
                }

                // Get the expired token from the authorization header
                var authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return BadRequest(new { Message = "JWT token is required." });
                }

                var expiredToken = authHeader.Substring("Bearer ".Length).Trim();

                // Get principal from expired token
                var principal = _jwtService.GetPrincipalFromExpiredToken(expiredToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { Message = "Invalid JWT token." });
                }

                // Find user by ID
                var user = await _dbContext.Users
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions.Where(p => p.PermissionName != null))
                    .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

                if (user == null)
                {
                    return Unauthorized(new { Message = "User not found." });
                }

                // Validate the refresh token
                if (string.IsNullOrEmpty(user.RefreshToken) ||
                    user.RefreshToken != request.RefreshToken ||
                    !user.RefreshTokenExpiryTime.HasValue ||
                    user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    return Unauthorized(new { Message = "Invalid or expired refresh token." });
                }

                // Get user permissions
                var permissions = user.Role.Permissions
                    .Where(p => p.IsAllowed && p.PermissionName != null)
                    .Select(p => p.PermissionName!)
                    .ToList();

                // Generate new JWT token
                var newToken = _jwtService.GenerateJwtToken(
                    user.Id.ToString(),
                    user.Username,
                    user.Role.Name,
                    permissions);

                // Generate new refresh token
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                // Update refresh token in the database
                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Tokens refreshed for user {Username}", user.Username);

                // Return the new tokens
                return Ok(new LoginResponse
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    Expiration = _jwtService.GetTokenExpirationTime(newToken),
                    Username = user.Username,
                    FullName = $"{user.FirstName} {user.LastName}".Trim(),
                    Role = user.Role.Name,
                    Permissions = permissions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return StatusCode(500, new { Message = "An error occurred while refreshing the token." });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { Message = "Invalid user ID in token." });
                }

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Clear refresh token
                user.RefreshToken = string.Empty;
                user.RefreshTokenExpiryTime = null;
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("User {Username} logged out", user.Username);

                return Ok(new { Message = "You have been successfully logged out." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { Message = "An error occurred during logout." });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser([FromBody] RegisterUserRequest request)
        {
            try
            {
                // Validate request
                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new { Message = "Passwords do not match." });
                }

                // Check if username already exists
                var existingUserByUsername = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Username == request.Username);

                if (existingUserByUsername != null)
                {
                    _logger.LogWarning("Registration attempt with existing username: {Username}", request.Username);
                    return Conflict(new { Message = "Username already exists." });
                }

                // Check if email already exists
                var existingUserByEmail = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUserByEmail != null)
                {
                    _logger.LogWarning("Registration attempt with existing email: {Email}", request.Email);
                    return Conflict(new { Message = "Email already exists." });
                }

                // Get role from database
                var role = await _dbContext.Roles.FindAsync(request.RoleId);
                if (role == null)
                {
                    return BadRequest(new { Message = "Invalid role." });
                }

                // Create new user
                var newUser = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = _passwordHasher.HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RoleId = request.RoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    FailedLoginAttempts = 0
                };

                // Add user to database
                _dbContext.Users.Add(newUser);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("User {Username} registered successfully", newUser.Username);

                return Ok(new { Message = "User registered successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { Message = "An error occurred during registration." });
            }
        }


    }
}