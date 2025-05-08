using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class RolePermission : BaseEntity
    {
        public int RoleId { get; set; }
        public virtual Role Role { get; set; }
        public string PermissionName { get; set; }
        public bool IsAllowed { get; set; }
    }
}