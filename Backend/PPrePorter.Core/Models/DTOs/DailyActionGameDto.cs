using System;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for daily action game data
    /// </summary>
    public class DailyActionGameDto
    {
        /// <summary>
        /// The ID
        /// </summary>
        public long ID { get; set; }

        /// <summary>
        /// The game date
        /// </summary>
        public DateTime? GameDate { get; set; }

        /// <summary>
        /// The player ID
        /// </summary>
        public long? PlayerID { get; set; }

        /// <summary>
        /// The game ID
        /// </summary>
        public long? GameID { get; set; }

        /// <summary>
        /// The platform
        /// </summary>
        public string? Platform { get; set; }

        /// <summary>
        /// The real bet amount
        /// </summary>
        public decimal? RealBetAmount { get; set; }

        /// <summary>
        /// The real win amount
        /// </summary>
        public decimal? RealWinAmount { get; set; }

        /// <summary>
        /// The bonus bet amount
        /// </summary>
        public decimal? BonusBetAmount { get; set; }

        /// <summary>
        /// The bonus win amount
        /// </summary>
        public decimal? BonusWinAmount { get; set; }

        /// <summary>
        /// The white label ID
        /// </summary>
        public int? WhiteLabelID { get; set; }

        /// <summary>
        /// The game name
        /// </summary>
        public string? GameName { get; set; }

        /// <summary>
        /// The player name
        /// </summary>
        public string? PlayerName { get; set; }

        /// <summary>
        /// The white label name
        /// </summary>
        public string? WhiteLabelName { get; set; }

        /// <summary>
        /// The provider
        /// </summary>
        public string? Provider { get; set; }

        /// <summary>
        /// The game type
        /// </summary>
        public string? GameType { get; set; }

        /// <summary>
        /// The country
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// The currency
        /// </summary>
        public string? Currency { get; set; }

        /// <summary>
        /// The net gaming revenue
        /// </summary>
        public decimal? NetGamingRevenue { get; set; }

        /// <summary>
        /// The number of real bets
        /// </summary>
        public int? NumberofRealBets { get; set; }

        /// <summary>
        /// The number of bonus bets
        /// </summary>
        public int? NumberofBonusBets { get; set; }

        /// <summary>
        /// The number of sessions
        /// </summary>
        public int? NumberofSessions { get; set; }

        /// <summary>
        /// The number of real wins
        /// </summary>
        public int? NumberofRealWins { get; set; }

        /// <summary>
        /// The number of bonus wins
        /// </summary>
        public int? NumberofBonusWins { get; set; }

        /// <summary>
        /// The original real bet amount
        /// </summary>
        public decimal? RealBetAmountOriginal { get; set; }

        /// <summary>
        /// The original real win amount
        /// </summary>
        public decimal? RealWinAmountOriginal { get; set; }

        /// <summary>
        /// The original bonus bet amount
        /// </summary>
        public decimal? BonusBetAmountOriginal { get; set; }

        /// <summary>
        /// The original bonus win amount
        /// </summary>
        public decimal? BonusWinAmountOriginal { get; set; }

        /// <summary>
        /// The original net gaming revenue
        /// </summary>
        public decimal? NetGamingRevenueOriginal { get; set; }

        /// <summary>
        /// The update date
        /// </summary>
        public DateTime? UpdateDate { get; set; }

        /// <summary>
        /// The total bet amount
        /// </summary>
        public decimal TotalBetAmount => (RealBetAmount ?? 0) + (BonusBetAmount ?? 0);

        /// <summary>
        /// The total win amount
        /// </summary>
        public decimal TotalWinAmount => (RealWinAmount ?? 0) + (BonusWinAmount ?? 0);

        /// <summary>
        /// The GGR (Gross Gaming Revenue)
        /// </summary>
        public decimal GGR => TotalBetAmount - TotalWinAmount;
    }
}
