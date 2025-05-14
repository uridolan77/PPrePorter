using System.Collections.Generic;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for daily action response
    /// </summary>
    public class DailyActionResponseDto
    {
        /// <summary>
        /// The list of daily actions
        /// </summary>
        public List<DailyActionDto> Data { get; set; } = new List<DailyActionDto>();

        /// <summary>
        /// The total number of records
        /// </summary>
        public int TotalRecords { get; set; }

        /// <summary>
        /// The total number of pages
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// The current page number
        /// </summary>
        public int CurrentPage { get; set; }

        /// <summary>
        /// The page size
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// The summary of the data
        /// </summary>
        public DailyActionSummaryDto Summary { get; set; } = new DailyActionSummaryDto();
    }

    /// <summary>
    /// DTO for daily action summary
    /// </summary>
    public class DailyActionSummaryDto
    {
        /// <summary>
        /// The total number of registrations
        /// </summary>
        public int TotalRegistrations { get; set; }

        /// <summary>
        /// The total number of first time depositors
        /// </summary>
        public int TotalFTD { get; set; }

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
    }
}
