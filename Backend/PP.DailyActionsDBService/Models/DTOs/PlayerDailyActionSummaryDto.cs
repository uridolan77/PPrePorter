using System;
using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// DTO for player daily action summary
    /// </summary>
    public class PlayerDailyActionSummaryDto
    {
        /// <summary>
        /// Player ID
        /// </summary>
        public long PlayerId { get; set; }

        /// <summary>
        /// Player alias/username
        /// </summary>
        public string? Alias { get; set; }

        /// <summary>
        /// Player's first name
        /// </summary>
        public string? FirstName { get; set; }

        /// <summary>
        /// Player's last name
        /// </summary>
        public string? LastName { get; set; }

        /// <summary>
        /// Player's email
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Player's country
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// Player's currency
        /// </summary>
        public string? Currency { get; set; }

        /// <summary>
        /// Player's casino name
        /// </summary>
        public string? CasinoName { get; set; }

        /// <summary>
        /// Player's registration date
        /// </summary>
        public DateTime? RegisteredDate { get; set; }

        /// <summary>
        /// Player's first deposit date
        /// </summary>
        public DateTime? FirstDepositDate { get; set; }

        /// <summary>
        /// Player's last login date
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// Player's current balance
        /// </summary>
        public decimal? Balance { get; set; }

        /// <summary>
        /// Player's VIP level
        /// </summary>
        public string? VIPLevel { get; set; }

        /// <summary>
        /// Total deposits from daily actions in the selected period
        /// </summary>
        public decimal TotalDeposits { get; set; }

        /// <summary>
        /// Total cashouts from daily actions in the selected period
        /// </summary>
        public decimal TotalCashouts { get; set; }

        /// <summary>
        /// Total bets for casino games in the selected period
        /// </summary>
        public decimal TotalBetsCasino { get; set; }

        /// <summary>
        /// Total wins for casino games in the selected period
        /// </summary>
        public decimal TotalWinsCasino { get; set; }

        /// <summary>
        /// Total bets for sports in the selected period
        /// </summary>
        public decimal TotalBetsSport { get; set; }

        /// <summary>
        /// Total wins for sports in the selected period
        /// </summary>
        public decimal TotalWinsSport { get; set; }

        /// <summary>
        /// Total bets for live games in the selected period
        /// </summary>
        public decimal TotalBetsLive { get; set; }

        /// <summary>
        /// Total wins for live games in the selected period
        /// </summary>
        public decimal TotalWinsLive { get; set; }

        /// <summary>
        /// Total bets for bingo in the selected period
        /// </summary>
        public decimal TotalBetsBingo { get; set; }

        /// <summary>
        /// Total wins for bingo in the selected period
        /// </summary>
        public decimal TotalWinsBingo { get; set; }

        /// <summary>
        /// Total GGR (Gross Gaming Revenue) for casino games in the selected period
        /// </summary>
        public decimal GGRCasino => TotalBetsCasino - TotalWinsCasino;

        /// <summary>
        /// Total GGR (Gross Gaming Revenue) for sports in the selected period
        /// </summary>
        public decimal GGRSport => TotalBetsSport - TotalWinsSport;

        /// <summary>
        /// Total GGR (Gross Gaming Revenue) for live games in the selected period
        /// </summary>
        public decimal GGRLive => TotalBetsLive - TotalWinsLive;

        /// <summary>
        /// Total GGR (Gross Gaming Revenue) for bingo in the selected period
        /// </summary>
        public decimal GGRBingo => TotalBetsBingo - TotalWinsBingo;

        /// <summary>
        /// Total GGR (Gross Gaming Revenue) across all game types in the selected period
        /// </summary>
        public decimal TotalGGR => GGRCasino + GGRSport + GGRLive + GGRBingo;

        /// <summary>
        /// Number of registrations in the selected period
        /// </summary>
        public int Registrations { get; set; }

        /// <summary>
        /// Number of first-time deposits in the selected period
        /// </summary>
        public int FTDs { get; set; }
    }

    /// <summary>
    /// Response DTO for player daily action summary
    /// </summary>
    public class PlayerDailyActionSummaryResponseDto
    {
        /// <summary>
        /// List of player daily action summaries
        /// </summary>
        public List<PlayerDailyActionSummaryDto> Data { get; set; } = new List<PlayerDailyActionSummaryDto>();

        /// <summary>
        /// Total count of players
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Start date of the report
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the report
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Applied filters
        /// </summary>
        public object? Filters { get; set; }
    }
}
