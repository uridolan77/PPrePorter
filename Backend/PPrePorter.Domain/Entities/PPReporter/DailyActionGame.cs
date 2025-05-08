using PPrePorter.Domain.Common;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class DailyActionGame : BaseEntity
    {
        public int GameId { get; set; }
        public int DailyActionId { get; set; }
        public int PlayerID { get; set; }  // Added this property
        public decimal? RealBetAmount { get; set; }
        public decimal? BonusBetAmount { get; set; }
        public decimal? RealWinAmount { get; set; }
        public decimal? BonusWinAmount { get; set; }
        
        public virtual Game Game { get; set; }
        public virtual DailyAction DailyAction { get; set; }
        public virtual Player Player { get; set; }  // Add the navigation property
    }
}
