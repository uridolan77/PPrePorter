using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a casino revenue data point for the dashboard
    /// </summary>
    public class CasinoRevenueItem
    {
        /// <summary>
        /// Date of the revenue data
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Total revenue for the date
        /// </summary>
        public decimal Revenue { get; set; }

        /// <summary>
        /// Total bets placed on the date
        /// </summary>
        public decimal TotalBets { get; set; }

        /// <summary>
        /// Total wins paid out on the date
        /// </summary>
        public decimal TotalWins { get; set; }

        /// <summary>
        /// Number of unique players on the date
        /// </summary>
        public int PlayerCount { get; set; }

        /// <summary>
        /// Number of rounds played on the date
        /// </summary>
        public int RoundCount { get; set; }

        /// <summary>
        /// Average bet amount per round on the date
        /// </summary>
        public decimal AverageBetAmount { get; set; }

        /// <summary>
        /// Return to player percentage on the date
        /// </summary>
        public decimal RTP { get; set; }

        /// <summary>
        /// White label ID (if filtered by white label)
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// White label name (if filtered by white label)
        /// </summary>
        public string WhiteLabelName { get; set; }

        /// <summary>
        /// Game ID (if filtered by game)
        /// </summary>
        public int? GameId { get; set; }

        /// <summary>
        /// Game name (if filtered by game)
        /// </summary>
        public string GameName { get; set; }

        /// <summary>
        /// Country code (if filtered by country)
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Country name (if filtered by country)
        /// </summary>
        public string CountryName { get; set; }
    }
}
