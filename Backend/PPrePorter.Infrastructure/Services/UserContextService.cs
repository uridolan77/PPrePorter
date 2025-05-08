using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

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
                throw new InvalidOperationException("User is not authenticated");
            }

            try
            {
                // Get user details from the database
                var user = await _dbContext.Users
                    .Include(u => u.UserRole)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found in database", userId);
                    throw new InvalidOperationException($"User with ID {userId} not found");
                }

                return new UserContext
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.UserRole?.Name
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user context for user {UserId}", userId);
                throw;
            }
        }
    }
}