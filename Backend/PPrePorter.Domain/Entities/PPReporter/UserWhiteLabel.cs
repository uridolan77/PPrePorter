using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class UserWhiteLabel : BaseEntity
    {
        public int UserId { get; set; }
        public int WhiteLabelId { get; set; }
        public DateTime AssignedAt { get; set; }
        
        public virtual User User { get; set; }
        public virtual WhiteLabel WhiteLabel { get; set; }
    }
}
