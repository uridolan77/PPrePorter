using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Data;

namespace PPrePorter.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for User entities
    /// </summary>
    public class UserRepository : Repository<User>, IUserRepository
    {
        private readonly PPRePorterDbContext _ppReporterDbContext;

        public UserRepository(PPRePorterDbContext dbContext, ILogger<UserRepository> logger)
            : base(dbContext, logger)
        {
            _ppReporterDbContext = dbContext;
        }

        /// <summary>
        /// Gets a user by username
        /// </summary>
        public async Task<User?> GetByUsernameAsync(string username)
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Username == username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by username {Username}", username);
                throw;
            }
        }

        /// <summary>
        /// Gets a user by username with role and permissions
        /// </summary>
        public async Task<User?> GetByUsernameWithRoleAndPermissionsAsync(string username)
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions.Where(p => p.PermissionName != null && p.IsAllowed))
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Username == username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user with role and permissions by username {Username}", username);
                throw;
            }
        }

        /// <summary>
        /// Gets a user by email
        /// </summary>
        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Gets users by role ID
        /// </summary>
        public async Task<IEnumerable<User>> GetByRoleIdAsync(int roleId)
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .Where(u => u.RoleId == roleId)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users by role ID {RoleId}", roleId);
                throw;
            }
        }

        /// <summary>
        /// Gets active users
        /// </summary>
        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .Where(u => u.IsActive)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active users");
                throw;
            }
        }

        /// <summary>
        /// Gets users with a specific permission
        /// </summary>
        public async Task<IEnumerable<User>> GetUsersWithPermissionAsync(string permissionName)
        {
            try
            {
                return await _ppReporterDbContext.Users
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions)
                    .Where(u => u.Role.Permissions.Any(p => p.PermissionName == permissionName && p.IsAllowed))
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users with permission {PermissionName}", permissionName);
                throw;
            }
        }
    }
}
