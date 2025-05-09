using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PPrePorter.API.Features.Authentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PPRePorterDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            PPRePorterDbContext dbContext,
            IJwtService jwtService,
            ILogger<AuthController> logger)
        {
            _dbContext = dbContext;
            _jwtService = jwtService;
            _logger = logger;
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

                // Verify password
                // Special case for admin user during development
                if (user.Username == "admin" && loginRequest.Password == "Admin123!")
                {
                    // Allow admin login with the known password
                    _logger.LogWarning("Admin user logged in with development password");
                }
                else
                {
                    string passwordHash = HashPassword(loginRequest.Password);
                    if (user.PasswordHash != passwordHash)
                    {
                        _logger.LogWarning("Login attempt with invalid password for user: {Username}", loginRequest.Username);
                        _logger.LogWarning("Expected hash: {ExpectedHash}, Actual hash: {ActualHash}",
                            user.PasswordHash, passwordHash);
                        return Unauthorized(new { Message = "Invalid username or password" });
                    }
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login attempt for inactive user: {Username}", loginRequest.Username);
                    return Unauthorized(new { Message = "Your account is inactive. Please contact an administrator." });
                }

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
                    PasswordHash = HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RoleId = request.RoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
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

        private string HashPassword(string password)
        {
            // In a real application, you should use a more secure password hashing algorithm like BCrypt
            // This is a simple SHA256 hash for demo purposes
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}