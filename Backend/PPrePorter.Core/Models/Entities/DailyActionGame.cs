using PPrePorter.Core.Common;
using System;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a daily action for a game
    /// </summary>
    public class DailyActionGame : BaseEntity
    {
        /// <summary>
        /// Game ID
        /// </summary>
        public int GameId { get; set; }

        /// <summary>
        /// Daily action ID
        /// </summary>
        public int DailyActionId { get; set; }

        /// <summary>
        /// Player ID
        /// </summary>
        public int PlayerID { get; set; }

        /// <summary>
        /// White label ID
        /// </summary>
        public int WhiteLabelId { get; set; }

        /// <summary>
        /// Real bet amount
        /// </summary>
        public decimal? RealBetAmount { get; set; }

        /// <summary>
        /// Bonus bet amount
        /// </summary>
        public decimal? BonusBetAmount { get; set; }

        /// <summary>
        /// Real win amount
        /// </summary>
        public decimal? RealWinAmount { get; set; }

        /// <summary>
        /// Bonus win amount
        /// </summary>
        public decimal? BonusWinAmount { get; set; }

        /// <summary>
        /// Game date
        /// </summary>
        public DateTime GameDate { get; set; }

        /// <summary>
        /// Revenue
        /// </summary>
        public decimal? Revenue { get; set; }

        /// <summary>
        /// Round count
        /// </summary>
        public int? RoundCount { get; set; }

        /// <summary>
        /// Bets
        /// </summary>
        public decimal? Bets { get; set; }

        /// <summary>
        /// Wins
        /// </summary>
        public decimal? Wins { get; set; }

        /// <summary>
        /// White label ID (alias for WhiteLabelId)
        /// </summary>
        public int WhiteLabelID { get => WhiteLabelId; set => WhiteLabelId = value; }

        /// <summary>
        /// Date (alias for GameDate)
        /// </summary>
        public DateTime Date { get => GameDate; set => GameDate = value; }

        /// <summary>
        /// Game
        /// </summary>
        public virtual Game Game { get; set; }

        /// <summary>
        /// Player
        /// </summary>
        public virtual Player Player { get; set; }
    }
}
