using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// Response DTO for DailyActions report in DailyActionsDB
    /// </summary>
    public class DailyActionResponseDto
    {
        /// <summary>
        /// List of daily action data
        /// </summary>
        public List<DailyActionDto> Data { get; set; } = new List<DailyActionDto>();

        /// <summary>
        /// Summary metrics
        /// </summary>
        public DailyActionsSummaryDto Summary { get; set; } = new DailyActionsSummaryDto();

        /// <summary>
        /// Total count of records (before pagination)
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Total pages
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// Current page number
        /// </summary>
        public int CurrentPage { get; set; }

        /// <summary>
        /// Page size
        /// </summary>
        public int PageSize { get; set; }
    }

    /// <summary>
    /// DTO for daily action data in DailyActionsDB
    /// </summary>
    public class DailyActionDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int WhiteLabelId { get; set; }
        public string WhiteLabelName { get; set; } = string.Empty;
        public long? PlayerId { get; set; }
        public string? PlayerName { get; set; }
        public string? CountryName { get; set; }
        public string? CurrencyCode { get; set; }
        public int Registrations { get; set; }
        public int FTD { get; set; }
        public decimal? Deposits { get; set; }
        public decimal? PaidCashouts { get; set; }
        public decimal BetsCasino { get; set; }
        public decimal WinsCasino { get; set; }
        public decimal? BetsSport { get; set; }
        public decimal? WinsSport { get; set; }
        public decimal? BetsLive { get; set; }
        public decimal? WinsLive { get; set; }
        public decimal? BetsBingo { get; set; }
        public decimal? WinsBingo { get; set; }
        public decimal TotalGGR { get; set; }
        public Dictionary<string, object>? GroupData { get; set; }
    }

    /// <summary>
    /// DTO for daily actions summary in DailyActionsDB
    /// </summary>
    public class DailyActionsSummaryDto
    {
        public int TotalRegistrations { get; set; }
        public int TotalFTD { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalCashouts { get; set; }
        public decimal TotalBetsCasino { get; set; }
        public decimal TotalWinsCasino { get; set; }
        public decimal TotalBetsSport { get; set; }
        public decimal TotalWinsSport { get; set; }
        public decimal TotalBetsLive { get; set; }
        public decimal TotalWinsLive { get; set; }
        public decimal TotalBetsBingo { get; set; }
        public decimal TotalWinsBingo { get; set; }
        public decimal TotalGGR { get; set; }
    }
}
