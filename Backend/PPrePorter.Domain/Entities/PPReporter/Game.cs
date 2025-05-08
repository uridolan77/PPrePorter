using PPrePorter.Domain.Common;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Game : BaseEntity
    {
        public string GameName { get; set; }
        public string Provider { get; set; }
        public string GameType { get; set; }
        public bool IsActive { get; set; }
        
        public virtual ICollection<DailyActionGame> DailyActions { get; set; }
    }
}
