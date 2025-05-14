using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a user role in the system
    /// </summary>
    public class Role : BaseEntity
    {
        /// <summary>
        /// Role name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Role description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Users with this role
        /// </summary>
        public virtual ICollection<User> Users { get; set; }

        /// <summary>
        /// Permissions associated with this role
        /// </summary>
        public virtual ICollection<RolePermission> Permissions { get; set; }
    }
}
