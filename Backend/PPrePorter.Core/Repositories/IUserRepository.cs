using PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.Core.Repositories
{
    /// <summary>
    /// Repository interface for User entities
    /// </summary>
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>
        /// Gets a user by username
        /// </summary>
        /// <param name="username">Username</param>
        /// <returns>The user or null</returns>
        Task<User?> GetByUsernameAsync(string username);

        /// <summary>
        /// Gets a user by username with role and permissions
        /// </summary>
        /// <param name="username">Username</param>
        /// <returns>The user with role and permissions or null</returns>
        Task<User?> GetByUsernameWithRoleAndPermissionsAsync(string username);

        /// <summary>
        /// Gets a user by email
        /// </summary>
        /// <param name="email">Email</param>
        /// <returns>The user or null</returns>
        Task<User?> GetByEmailAsync(string email);

        /// <summary>
        /// Gets users by role ID
        /// </summary>
        /// <param name="roleId">Role ID</param>
        /// <returns>Users with the specified role</returns>
        Task<IEnumerable<User>> GetByRoleIdAsync(int roleId);

        /// <summary>
        /// Gets active users
        /// </summary>
        /// <returns>Active users</returns>
        Task<IEnumerable<User>> GetActiveUsersAsync();

        /// <summary>
        /// Gets users with a specific permission
        /// </summary>
        /// <param name="permissionName">Permission name</param>
        /// <returns>Users with the specified permission</returns>
        Task<IEnumerable<User>> GetUsersWithPermissionAsync(string permissionName);
    }
}
