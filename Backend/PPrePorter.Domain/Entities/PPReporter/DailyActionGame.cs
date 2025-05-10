using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class DailyActionGame : BaseEntity
    {
        public int GameId { get; set; }
        public int DailyActionId { get; set; }
        public int PlayerID { get; set; }
        public int WhiteLabelId { get; set; }
        public decimal? RealBetAmount { get; set; }
        public decimal? BonusBetAmount { get; set; }
        public decimal? RealWinAmount { get; set; }
        public decimal? BonusWinAmount { get; set; }
        public DateTime GameDate { get; set; }
        public decimal? Revenue { get; set; }
        public int? RoundCount { get; set; }
        public decimal? Bets { get; set; }
        public decimal? Wins { get; set; }

        // These properties are used for ID in the queries
        public int GameID { get => GameId; set => GameId = value; }
        public int WhiteLabelID { get => WhiteLabelId; set => WhiteLabelId = value; }
        public DateTime Date { get => GameDate; set => GameDate = value; }

        public virtual Game Game { get; set; }

        // Comment out or remove this navigation property until DailyAction class is fully implemented
        // public virtual DailyAction DailyAction { get; set; }

        public virtual Player Player { get; set; }
    }
}
