

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a permission associated with a role
    /// </summary>
    public class RolePermission : BaseEntity
    {
        /// <summary>
        /// Role ID
        /// </summary>
        public int RoleId { get; set; }

        /// <summary>
        /// Permission name
        /// </summary>
        public string PermissionName { get; set; }

        /// <summary>
        /// Whether the permission is allowed
        /// </summary>
        public bool IsAllowed { get; set; }

        /// <summary>
        /// Role
        /// </summary>
        public virtual Role Role { get; set; }
    }
}
