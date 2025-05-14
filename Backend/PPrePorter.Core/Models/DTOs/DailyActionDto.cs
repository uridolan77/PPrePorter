using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for daily actions
    /// </summary>
    public class DailyActionDto
    {
        /// <summary>
        /// The date of the daily action
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// The player ID
        /// </summary>
        public long? PlayerId { get; set; }

        /// <summary>
        /// The player name
        /// </summary>
        public string PlayerName { get; set; }

        /// <summary>
        /// The white label ID
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// The white label name
        /// </summary>
        public string WhiteLabelName { get; set; }

        /// <summary>
        /// The country ID
        /// </summary>
        public int? CountryId { get; set; }

        /// <summary>
        /// The country name
        /// </summary>
        public string CountryName { get; set; }

        /// <summary>
        /// The currency ID
        /// </summary>
        public int? CurrencyId { get; set; }

        /// <summary>
        /// The currency code
        /// </summary>
        public string CurrencyCode { get; set; }

        /// <summary>
        /// The platform
        /// </summary>
        public string Platform { get; set; }

        /// <summary>
        /// The number of registrations
        /// </summary>
        public int Registrations { get; set; }

        /// <summary>
        /// The number of first time depositors
        /// </summary>
        public int FTD { get; set; }

        /// <summary>
        /// The total deposits
        /// </summary>
        public decimal TotalDeposits { get; set; }

        /// <summary>
        /// The total cashouts
        /// </summary>
        public decimal TotalCashouts { get; set; }

        /// <summary>
        /// The total bets for casino
        /// </summary>
        public decimal TotalBetsCasino { get; set; }

        /// <summary>
        /// The total wins for casino
        /// </summary>
        public decimal TotalWinsCasino { get; set; }

        /// <summary>
        /// The total bets for sports
        /// </summary>
        public decimal TotalBetsSport { get; set; }

        /// <summary>
        /// The total wins for sports
        /// </summary>
        public decimal TotalWinsSport { get; set; }

        /// <summary>
        /// The total bets for live
        /// </summary>
        public decimal TotalBetsLive { get; set; }

        /// <summary>
        /// The total wins for live
        /// </summary>
        public decimal TotalWinsLive { get; set; }

        /// <summary>
        /// The total bets for bingo
        /// </summary>
        public decimal TotalBetsBingo { get; set; }

        /// <summary>
        /// The total wins for bingo
        /// </summary>
        public decimal TotalWinsBingo { get; set; }

        /// <summary>
        /// The total GGR
        /// </summary>
        public decimal TotalGGR { get; set; }

        /// <summary>
        /// Additional data for grouping
        /// </summary>
        public Dictionary<string, object> GroupData { get; set; } = new Dictionary<string, object>();
    }
}
