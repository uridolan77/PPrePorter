using PPrePorter.Domain.Common;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class WhiteLabel : BaseEntity
    {
        public string LabelName { get; set; }
        public string LabelCode { get; set; }
        public bool IsActive { get; set; }
        
        // This property is used for ID in the queries
        public int LabelID { get => Id; }
        
        public virtual ICollection<UserWhiteLabel> Users { get; set; }
    }
}
