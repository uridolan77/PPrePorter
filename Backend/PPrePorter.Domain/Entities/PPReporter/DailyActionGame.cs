using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class DailyActionGame : BaseEntity
    {
        public int GameId { get; set; }
        public int DailyActionId { get; set; }
        public int PlayerID { get; set; }
        public decimal? RealBetAmount { get; set; }
        public decimal? BonusBetAmount { get; set; }
        public decimal? RealWinAmount { get; set; }
        public decimal? BonusWinAmount { get; set; }
        public DateTime GameDate { get; set; }
        
        // This property is used for ID in the queries
        public int GameID { get => GameId; }
        
        public virtual Game Game { get; set; }
        
        // Comment out or remove this navigation property until DailyAction class is fully implemented
        // public virtual DailyAction DailyAction { get; set; }
        
        public virtual Player Player { get; set; }
    }
}
