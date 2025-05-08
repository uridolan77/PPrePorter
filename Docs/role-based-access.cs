// Role-Based Access Control Implementation

// --------------------------
// 1. RBAC Models and Entities
// --------------------------

namespace ProgressPlay.Reporting.Core.Security.Models
{
    // User roles in the system
    public enum Role
    {
        Admin,
        Partner,
        Subpartner
    }

    // User entity with role and access control information
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public Role Role { get; set; }
        public List<int> WhiteLabelIds { get; set; } = new List<int>();
        public int? WhiteLabelId { get; set; }  // For Subpartner (restricted to one WhiteLabel)
        public string Tracker { get; set; }     // For Subpartner (may be restricted to specific tracker)
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
    }

    // Permission entity
    public class Permission
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
    }

    // Role-Permission mapping entity
    public class RolePermission
    {
        public string RoleId { get; set; }
        public string PermissionId { get; set; }
    }

    // User-Permission mapping entity (for custom permissions)
    public class UserPermission
    {
        public string UserId { get; set; }
        public string PermissionId { get; set; }
        public bool IsGranted { get; set; }  // True = granted, False = denied (overrides role permission)
    }

    // WhiteLabel entity (for reference)
    public class WhiteLabel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UrlName { get; set; }
        public bool IsActive { get; set; }
    }
}

// --------------------------
// 2. RBAC Services Implementation
// --------------------------

using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProgressPlay.Reporting.Core.Data;
using ProgressPlay.Reporting.Core.Security.Models;

namespace ProgressPlay.Reporting.Core.Security.Services
{
    // Authentication & User management service
    public interface IUserService
    {
        Task<User> GetUserByIdAsync(string userId);
        Task<User> GetUserByUsernameAsync(string username);
        Task<bool> ValidateCredentialsAsync(string username, string password);
        Task<User> CreateUserAsync(User user, string password);
        Task UpdateUserAsync(User user);
        Task ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<bool> DeleteUserAsync(string userId);
        Task<List<User>> GetUsersAsync(int skip = 0, int take = 50);
        Task<List<User>> GetUsersByRoleAsync(Role role);
    }

    // Implementation of IUserService
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(ApplicationDbContext dbContext, IPasswordHasher passwordHasher)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
        }

        public async Task<User> GetUserByIdAsync(string userId)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<bool> ValidateCredentialsAsync(string username, string password)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower() && u.IsActive);

            if (user == null)
                return false;

            var passwordHash = await _dbContext.UserPasswords
                .Where(p => p.UserId == user.Id)
                .Select(p => p.PasswordHash)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(passwordHash))
                return false;

            return _passwordHasher.VerifyPassword(password, passwordHash);
        }

        public async Task<User> CreateUserAsync(User user, string password)
        {
            // Ensure username is unique
            if (await _dbContext.Users.AnyAsync(u => u.Username.ToLower() == user.Username.ToLower()))
                throw new DuplicateEntityException("Username already exists");

            // Set creation date
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;
            
            // Add user to database
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Create password hash
            var passwordHash = _passwordHasher.HashPassword(password);
            _dbContext.UserPasswords.Add(new UserPassword
            {
                UserId = user.Id,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            });
            
            await _dbContext.SaveChangesAsync();
            
            return user;
        }

        // Implementation of other IUserService methods...
        // UpdateUserAsync, ChangePasswordAsync, DeleteUserAsync, etc.

        public async Task<List<User>> GetUsersAsync(int skip = 0, int take = 50)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .OrderBy(u => u.Username)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<List<User>> GetUsersByRoleAsync(Role role)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Role == role)
                .OrderBy(u => u.Username)
                .ToListAsync();
        }
    }

    // Permission management service
    public interface IPermissionService
    {
        Task<List<Permission>> GetAllPermissionsAsync();
        Task<List<Permission>> GetPermissionsByRoleAsync(Role role);
        Task<List<Permission>> GetUserPermissionsAsync(string userId);
        Task GrantPermissionToUserAsync(string userId, string permissionId);
        Task RevokePermissionFromUserAsync(string userId, string permissionId);
        Task<bool> HasPermissionAsync(string userId, string permissionName);
    }

    // Implementation of IPermissionService
    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IUserService _userService;

        public PermissionService(ApplicationDbContext dbContext, IUserService userService)
        {
            _dbContext = dbContext;
            _userService = userService;
        }

        public async Task<List<Permission>> GetAllPermissionsAsync()
        {
            return await _dbContext.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<List<Permission>> GetPermissionsByRoleAsync(Role role)
        {
            return await _dbContext.RolePermissions
                .Where(rp => rp.RoleId == role.ToString())
                .Join(_dbContext.Permissions,
                    rp => rp.PermissionId,
                    p => p.Id,
                    (rp, p) => p)
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<List<Permission>> GetUserPermissionsAsync(string userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                throw new EntityNotFoundException("User not found");

            // Get role-based permissions
            var rolePermissions = await GetPermissionsByRoleAsync(user.Role);
            
            // Get user-specific permissions (overrides)
            var userPermissions = await _dbContext.UserPermissions
                .Where(up => up.UserId == userId)
                .ToListAsync();
            
            // Remove denied permissions
            var deniedPermissionIds = userPermissions
                .Where(up => !up.IsGranted)
                .Select(up => up.PermissionId)
                .ToHashSet();
            
            var effectivePermissions = rolePermissions
                .Where(p => !deniedPermissionIds.Contains(p.Id))
                .ToList();
            
            // Add granted permissions
            var grantedPermissionIds = userPermissions
                .Where(up => up.IsGranted)
                .Select(up => up.PermissionId)
                .ToHashSet();
            
            if (grantedPermissionIds.Count > 0)
            {
                var additionalPermissions = await _dbContext.Permissions
                    .Where(p => grantedPermissionIds.Contains(p.Id))
                    .ToListAsync();
                
                // Avoid duplicates
                foreach (var permission in additionalPermissions)
                {
                    if (!effectivePermissions.Any(p => p.Id == permission.Id))
                    {
                        effectivePermissions.Add(permission);
                    }
                }
            }
            
            return effectivePermissions
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .ToList();
        }

        public async Task GrantPermissionToUserAsync(string userId, string permissionId)
        {
            var userPermission = await _dbContext.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);
            
            if (userPermission != null)
            {
                userPermission.IsGranted = true;
            }
            else
            {
                _dbContext.UserPermissions.Add(new UserPermission
                {
                    UserId = userId,
                    PermissionId = permissionId,
                    IsGranted = true
                });
            }
            
            await _dbContext.SaveChangesAsync();
        }

        public async Task RevokePermissionFromUserAsync(string userId, string permissionId)
        {
            var userPermission = await _dbContext.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);
            
            if (userPermission != null)
            {
                userPermission.IsGranted = false;
            }
            else
            {
                _dbContext.UserPermissions.Add(new UserPermission
                {
                    UserId = userId,
                    PermissionId = permissionId,
                    IsGranted = false
                });
            }
            
            await _dbContext.SaveChangesAsync();
        }

        public async Task<bool> HasPermissionAsync(string userId, string permissionName)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                return false;

            // Admin has all permissions
            if (user.Role == Role.Admin)
                return true;

            // Check user-specific permission override
            var permission = await _dbContext.Permissions
                .FirstOrDefaultAsync(p => p.Name == permissionName);
            
            if (permission == null)
                return false;

            var userPermission = await _dbContext.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permission.Id);
            
            if (userPermission != null)
                return userPermission.IsGranted;

            // Check role-based permission
            return await _dbContext.RolePermissions
                .AnyAsync(rp => rp.RoleId == user.Role.ToString() && rp.PermissionId == permission.Id);
        }
    }

    // Data access filtering service
    public interface IDataFilterService
    {
        Task<List<int>> GetAccessibleWhiteLabelIdsAsync(string userId);
        bool CanAccessWhiteLabelData(User user, int whiteLabelId);
        bool CanAccessPlayerData(User user, long playerId, string tracker = null);
    }

    // Implementation of IDataFilterService
    public class DataFilterService : IDataFilterService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IUserService _userService;

        public DataFilterService(ApplicationDbContext dbContext, IUserService userService)
        {
            _dbContext = dbContext;
            _userService = userService;
        }

        public async Task<List<int>> GetAccessibleWhiteLabelIdsAsync(string userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                throw new EntityNotFoundException("User not found");

            // Admin can access all white labels
            if (user.Role == Role.Admin)
            {
                return await _dbContext.WhiteLabels
                    .Where(wl => wl.IsActive)
                    .Select(wl => wl.Id)
                    .ToListAsync();
            }

            // Partner can access specified white labels
            if (user.Role == Role.Partner)
            {
                return user.WhiteLabelIds;
            }

            // Subpartner can access only their specific white label
            if (user.Role == Role.Subpartner && user.WhiteLabelId.HasValue)
            {
                return new List<int> { user.WhiteLabelId.Value };
            }

            return new List<int>();
        }

        public bool CanAccessWhiteLabelData(User user, int whiteLabelId)
        {
            // Admin can access all white labels
            if (user.Role == Role.Admin)
                return true;

            // Partner can access specified white labels
            if (user.Role == Role.Partner)
                return user.WhiteLabelIds.Contains(whiteLabelId);

            // Subpartner can access only their specific white label
            if (user.Role == Role.Subpartner && user.WhiteLabelId.HasValue)
                return user.WhiteLabelId.Value == whiteLabelId;

            return false;
        }

        public bool CanAccessPlayerData(User user, long playerId, string tracker = null)
        {
            // Admin can access all player data
            if (user.Role == Role.Admin)
                return true;

            // For Partner and Subpartner, check if player belongs to accessible white label
            var playerWhiteLabelId = _dbContext.Players
                .Where(p => p.PlayerID == playerId)
                .Select(p => p.CasinoID)
                .FirstOrDefault();

            var canAccessWhiteLabel = CanAccessWhiteLabelData(user, playerWhiteLabelId);
            
            // If Subpartner is restricted to specific tracker, also check that
            if (canAccessWhiteLabel && user.Role == Role.Subpartner && !string.IsNullOrEmpty(user.Tracker))
            {
                if (string.IsNullOrEmpty(tracker))
                {
                    // Need to query the database to get player's tracker
                    var playerTracker = _dbContext.Players
                        .Where(p => p.PlayerID == playerId)
                        .Select(p => p.DynamicParameter)
                        .FirstOrDefault();
                    
                    return user.Tracker.Equals(playerTracker, StringComparison.OrdinalIgnoreCase);
                }
                else
                {
                    // Tracker value is provided
                    return user.Tracker.Equals(tracker, StringComparison.OrdinalIgnoreCase);
                }
            }
            
            return canAccessWhiteLabel;
        }
    }
}

// --------------------------
// 3. Authentication and JWT Implementation
// --------------------------

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ProgressPlay.Reporting.Core.Security.Models;
using ProgressPlay.Reporting.Core.Security.Services;

namespace ProgressPlay.Reporting.Core.Security.Auth
{
    // JWT settings configuration
    public class JwtSettings
    {
        public string Secret { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int ExpiryMinutes { get; set; }
    }

    // Authentication service
    public interface IAuthService
    {
        Task<AuthResult> AuthenticateAsync(string username, string password);
        Task<AuthResult> RefreshTokenAsync(string refreshToken);
        Task<bool> InvalidateTokenAsync(string refreshToken);
        ClaimsPrincipal GetPrincipalFromToken(string token);
    }

    // Authentication result
    public class AuthResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public User User { get; set; }
    }

    // Implementation of IAuthService
    public class JwtAuthService : IAuthService
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;
        private readonly JwtSettings _jwtSettings;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public JwtAuthService(
            IUserService userService,
            IPermissionService permissionService,
            IOptions<JwtSettings> jwtSettings,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _userService = userService;
            _permissionService = permissionService;
            _jwtSettings = jwtSettings.Value;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<AuthResult> AuthenticateAsync(string username, string password)
        {
            if (!await _userService.ValidateCredentialsAsync(username, password))
            {
                return new AuthResult { Success = false, ErrorMessage = "Invalid username or password" };
            }

            var user = await _userService.GetUserByUsernameAsync(username);
            
            // Update last login time
            user.LastLogin = DateTime.UtcNow;
            await _userService.UpdateUserAsync(user);

            // Generate JWT token
            var (accessToken, expiresAt) = GenerateJwtToken(user);
            
            // Generate refresh token
            var refreshToken = await _refreshTokenRepository.CreateTokenAsync(user.Id);

            return new AuthResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                User = user
            };
        }

        public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
        {
            var storedToken = await _refreshTokenRepository.GetTokenAsync(refreshToken);
            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow || storedToken.IsRevoked)
            {
                return new AuthResult { Success = false, ErrorMessage = "Invalid or expired refresh token" };
            }

            var user = await _userService.GetUserByIdAsync(storedToken.UserId);
            if (user == null || !user.IsActive)
            {
                await _refreshTokenRepository.RevokeTokenAsync(refreshToken);
                return new AuthResult { Success = false, ErrorMessage = "User not found or inactive" };
            }

            // Generate new JWT token
            var (accessToken, expiresAt) = GenerateJwtToken(user);
            
            // Generate new refresh token and revoke old one
            await _refreshTokenRepository.RevokeTokenAsync(refreshToken);
            var newRefreshToken = await _refreshTokenRepository.CreateTokenAsync(user.Id);

            return new AuthResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = expiresAt,
                User = user
            };
        }

        public async Task<bool> InvalidateTokenAsync(string refreshToken)
        {
            return await _refreshTokenRepository.RevokeTokenAsync(refreshToken);
        }

        public ClaimsPrincipal GetPrincipalFromToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret)),
                ValidateLifetime = false // Don't validate lifetime here
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                
                if (!(securityToken is JwtSecurityToken jwtSecurityToken) || 
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }

        private (string token, DateTime expiresAt) GenerateJwtToken(User user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);
            
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            // Add WhiteLabelIds claims (for Partners)
            if (user.Role == Role.Partner && user.WhiteLabelIds.Count > 0)
            {
                claims.Add(new Claim("WhiteLabelIds", string.Join(",", user.WhiteLabelIds)));
            }

            // Add WhiteLabelId claim (for Subpartners)
            if (user.Role == Role.Subpartner && user.WhiteLabelId.HasValue)
            {
                claims.Add(new Claim("WhiteLabelId", user.WhiteLabelId.Value.ToString()));
            }

            // Add Tracker claim (for Subpartners)
            if (user.Role == Role.Subpartner && !string.IsNullOrEmpty(user.Tracker))
            {
                claims.Add(new Claim("Tracker", user.Tracker));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}

// --------------------------
// 4. ASP.NET Core Authorization Implementation
// --------------------------

using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using ProgressPlay.Reporting.Core.Security.Auth;
using ProgressPlay.Reporting.Core.Security.Authorization;
using ProgressPlay.Reporting.Core.Security.Models;
using ProgressPlay.Reporting.Core.Security.Services;

namespace ProgressPlay.Reporting.Api.Configuration
{
    // Extension methods for setting up authentication and authorization
    public static class AuthConfig
    {
        public static IServiceCollection AddProgressPlayAuth(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure JWT settings
            var jwtSettingsSection = configuration.GetSection("JwtSettings");
            services.Configure<JwtSettings>(jwtSettingsSection);
            
            var jwtSettings = jwtSettingsSection.Get<JwtSettings>();
            var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);
            
            // Add JWT authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
                
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        // Add additional validation if needed
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    }
                };
            });
            
            // Add authorization policies
            services.AddAuthorization(options =>
            {
                // Role-based policies
                options.AddPolicy("AdminOnly", policy => policy.RequireRole(Role.Admin.ToString()));
                options.AddPolicy("PartnerOrAdmin", policy => policy.RequireRole(
                    Role.Admin.ToString(), Role.Partner.ToString()));
                options.AddPolicy("AllRoles", policy => policy.RequireRole(
                    Role.Admin.ToString(), Role.Partner.ToString(), Role.Subpartner.ToString()));
                
                // Permission-based policies
                options.AddPolicy("ViewReports", policy =>
                    policy.Requirements.Add(new PermissionRequirement("ViewReports")));
                options.AddPolicy("ExportReports", policy =>
                    policy.Requirements.Add(new PermissionRequirement("ExportReports")));
                options.AddPolicy("ManagePlayers", policy =>
                    policy.Requirements.Add(new PermissionRequirement("ManagePlayers")));
                options.AddPolicy("ManageUsers", policy =>
                    policy.Requirements.Add(new PermissionRequirement("ManageUsers")));
                options.AddPolicy("ManageWhiteLabels", policy =>
                    policy.Requirements.Add(new PermissionRequirement("ManageWhiteLabels")));
            });
            
            // Register services
            services.AddScoped<IAuthService, JwtAuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IDataFilterService, DataFilterService>();
            services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            
            // Register authorization handlers
            services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
            services.AddScoped<IAuthorizationHandler, WhiteLabelAccessHandler>();
            services.AddScoped<IAuthorizationHandler, PlayerAccessHandler>();
            
            return services;
        }
    }
}

// Custom authorization requirements and handlers
namespace ProgressPlay.Reporting.Core.Security.Authorization
{
    // Permission-based authorization
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }
        
        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }
    
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IPermissionService _permissionService;
        
        public PermissionAuthorizationHandler(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }
        
        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            PermissionRequirement requirement)
        {
            if (!context.User.Identity.IsAuthenticated)
            {
                return;
            }
            
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return;
            }
            
            // Admin role has all permissions
            if (context.User.IsInRole(Role.Admin.ToString()))
            {
                context.Succeed(requirement);
                return;
            }
            
            // Check if user has the required permission
            if (await _permissionService.HasPermissionAsync(userId, requirement.Permission))
            {
                context.Succeed(requirement);
            }
        }
    }
    
    // WhiteLabel access authorization
    public class WhiteLabelAccessRequirement : IAuthorizationRequirement
    {
        public int WhiteLabelId { get; }
        
        public WhiteLabelAccessRequirement(int whiteLabelId)
        {
            WhiteLabelId = whiteLabelId;
        }
    }
    
    public class WhiteLabelAccessHandler : AuthorizationHandler<WhiteLabelAccessRequirement>
    {
        private readonly IDataFilterService _dataFilterService;
        private readonly IUserService _userService;
        
        public WhiteLabelAccessHandler(
            IDataFilterService dataFilterService,
            IUserService userService)
        {
            _dataFilterService = dataFilterService;
            _userService = userService;
        }
        
        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            WhiteLabelAccessRequirement requirement)
        {
            if (!context.User.Identity.IsAuthenticated)
            {
                return;
            }
            
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return;
            }
            
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return;
            }
            
            if (_dataFilterService.CanAccessWhiteLabelData(user, requirement.WhiteLabelId))
            {
                context.Succeed(requirement);
            }
        }
    }
    
    // Player access authorization
    public class PlayerAccessRequirement : IAuthorizationRequirement
    {
        public long PlayerId { get; }
        public string Tracker { get; }
        
        public PlayerAccessRequirement(long playerId, string tracker = null)
        {
            PlayerId = playerId;
            Tracker = tracker;
        }
    }
    
    public class PlayerAccessHandler : AuthorizationHandler<PlayerAccessRequirement>
    {
        private readonly IDataFilterService _dataFilterService;
        private readonly IUserService _userService;
        
        public PlayerAccessHandler(
            IDataFilterService dataFilterService,
            IUserService userService)
        {
            _dataFilterService = dataFilterService;
            _userService = userService;
        }
        
        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            PlayerAccessRequirement requirement)
        {
            if (!context.User.Identity.IsAuthenticated)
            {
                return;
            }
            
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return;
            }
            
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return;
            }
            
            if (_dataFilterService.CanAccessPlayerData(user, requirement.PlayerId, requirement.Tracker))
            {
                context.Succeed(requirement);
            }
        }
    }
}

// --------------------------
// 5. User Interface Integration
// --------------------------

// React Context for Authentication
/*
// src/contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('expiresAt', response.expiresAt);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN',
        payload: {
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt
        }
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      return logout();
    }
    
    try {
      const response = await authService.refreshToken(currentRefreshToken);
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('expiresAt', response.expiresAt);
      
      dispatch({
        type: 'REFRESH_TOKEN',
        payload: {
          token: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const expiresAt = localStorage.getItem('expiresAt');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedRefreshToken && expiresAt && storedUser) {
          // Check if token is expired
          if (new Date(expiresAt) <= new Date()) {
            // Token is expired, try to refresh
            await refreshToken();
          } else {
            // Token is still valid
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: true,
                user: JSON.parse(storedUser),
                token,
                refreshToken: storedRefreshToken,
                expiresAt
              }
            });
          }
        } else {
          // No stored credentials
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
              token: null,
              refreshToken: null,
              expiresAt: null
            }
          });
        }
      } catch (error) {
        console.error('Error initializing auth context:', error);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null
          }
        });
      }
    };
    
    initialize();
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (!state.isAuthenticated || !state.expiresAt) {
      return;
    }
    
    const expiryTime = new Date(state.expiresAt).getTime();
    const currentTime = new Date().getTime();
    
    // Refresh 5 minutes before expiry
    const timeUntilRefresh = expiryTime - currentTime - (5 * 60 * 1000);
    
    if (timeUntilRefresh <= 0) {
      // Token is about to expire, refresh now
      refreshToken();
      return;
    }
    
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);
    
    return () => {
      clearTimeout(refreshTimer);
    };
  }, [state.isAuthenticated, state.expiresAt]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
*/

// React Authorization Hooks
/*
// src/hooks/usePermission.js
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permissionName) => {
    if (!user) {
      return false;
    }
    
    // Admin has all permissions
    if (user.role === 'Admin') {
      return true;
    }
    
    // Check user permissions
    return user.permissions && user.permissions.includes(permissionName);
  }, [user]);
  
  const canAccessWhiteLabel = useCallback((whiteLabelId) => {
    if (!user || !whiteLabelId) {
      return false;
    }
    
    // Admin can access all white labels
    if (user.role === 'Admin') {
      return true;
    }
    
    // Partner can access specified white labels
    if (user.role === 'Partner' && user.whiteLabelIds) {
      return user.whiteLabelIds.includes(parseInt(whiteLabelId));
    }
    
    // Subpartner can access only their specific white label
    if (user.role === 'Subpartner' && user.whiteLabelId) {
      return user.whiteLabelId === parseInt(whiteLabelId);
    }
    
    return false;
  }, [user]);
  
  return {
    hasPermission,
    canAccessWhiteLabel
  };
};

// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';

const ProtectedRoute = ({ 
  element, 
  requiredPermission = null,
  requiredRole = null,
  whiteLabelId = null
}) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const { hasPermission, canAccessWhiteLabel } = usePermission();
  
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check role if required
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Check white label access if required
  if (whiteLabelId && !canAccessWhiteLabel(whiteLabelId)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

export default ProtectedRoute;
*/
