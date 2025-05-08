using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class UserPreference : BaseEntity
    {
        public int UserId { get; set; }
        public virtual User User { get; set; }
        public string PreferenceKey { get; set; }
        public string PreferenceValue { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}