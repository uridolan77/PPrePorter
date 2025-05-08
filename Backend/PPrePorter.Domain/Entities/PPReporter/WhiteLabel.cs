using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class WhiteLabel : BaseEntity
    {
        public string LabelName { get; set; }
        public string LabelCode { get; set; }
        public bool IsActive { get; set; }
        
        public virtual ICollection<UserWhiteLabel> Users { get; set; }
    }
}
