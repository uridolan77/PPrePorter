using PPrePorter.Domain.Common;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Game : BaseEntity
    {
        public string GameName { get; set; }
        public string Provider { get; set; }
        public string GameType { get; set; }
        public bool IsActive { get; set; }
        
        // This property is used for ID in the queries
        public int GameId { get => Id; }
        public int GameID { get => Id; }
        
        public virtual ICollection<DailyActionGame> DailyActions { get; set; }
    }
}
