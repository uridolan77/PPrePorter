using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Role : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<RolePermission> Permissions { get; set; }
    }
}