using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Infrastructure.Extensions;
using DomainEntities = PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.Infrastructure.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPPRePorterDbContext _dbContext;
        private readonly ILogger<UserContextService> _logger;

        public UserContextService(
            IHttpContextAccessor httpContextAccessor,
            IPPRePorterDbContext dbContext,
            ILogger<UserContextService> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<UserContext> GetCurrentUserAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                _logger.LogWarning("HttpContext is null when trying to get current user");
                throw new InvalidOperationException("HttpContext is not available");
            }

            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User identifier claim not found in the current HttpContext");
                // Return a default user context for unauthenticated requests instead of throwing an exception
                return new UserContext
                {
                    Id = "1", // Default user ID
                    Username = "Anonymous",
                    Email = "anonymous@example.com",
                    Role = "Guest"
                };
            }

            try
            {
                if (!int.TryParse(userId, out int parsedUserId))
                {
                    _logger.LogWarning("Failed to parse user ID {UserId} to integer", userId);
                    return new UserContext
                    {
                        Id = userId,
                        Username = "Anonymous",
                        Email = "anonymous@example.com",
                        Role = "Guest"
                    };
                }

                // Get user details from the database
                var user = await _dbContext.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == parsedUserId);

                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found in database", userId);
                    // Return a default user context if the user is not found in the database
                    return new UserContext
                    {
                        Id = userId,
                        Username = "Anonymous",
                        Email = "anonymous@example.com",
                        Role = "Guest"
                    };
                }

                return new UserContext
                {
                    Id = userId,  // Use the string ID from the claim
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role?.Name
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user context for user {UserId}", userId);
                // Return a default user context in case of any exception
                return new UserContext
                {
                    Id = userId,
                    Username = "Anonymous",
                    Email = "anonymous@example.com",
                    Role = "Guest"
                };
            }
        }
    }
}