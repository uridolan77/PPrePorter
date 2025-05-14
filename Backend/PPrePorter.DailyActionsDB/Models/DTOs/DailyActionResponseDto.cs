using System;
using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// Response DTO for DailyActions report
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
        public DailyActionFilterDto AppliedFilters { get; set; } = new DailyActionFilterDto();

        /// <summary>
        /// Last time the historical data was refreshed
        /// </summary>
        public DateTime LastHistoricalRefreshTime { get; set; }

        /// <summary>
        /// Last time today's data was refreshed
        /// </summary>
        public DateTime LastTodayRefreshTime { get; set; }
    }

    /// <summary>
    /// DTO for daily action data
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
        public int? FTDA { get; set; }

        // Deposit-related properties
        public decimal Deposits { get; set; }
        public decimal? DepositsCreditCard { get; set; }
        public decimal? DepositsNeteller { get; set; }
        public decimal? DepositsMoneyBookers { get; set; }
        public decimal? DepositsOther { get; set; }
        public decimal? DepositsFee { get; set; }
        public decimal? DepositsSport { get; set; }
        public decimal? DepositsLive { get; set; }
        public decimal? DepositsBingo { get; set; }

        // Cashout-related properties
        public decimal? CashoutRequests { get; set; }
        public decimal PaidCashouts { get; set; }
        public decimal? Chargebacks { get; set; }
        public decimal? Voids { get; set; }
        public decimal? ReverseChargebacks { get; set; }

        // Bonus-related properties
        public decimal? Bonuses { get; set; }
        public decimal? BonusesSport { get; set; }
        public decimal? BonusesLive { get; set; }
        public decimal? BonusesBingo { get; set; }
        public decimal? CollectedBonuses { get; set; }
        public decimal? ExpiredBonuses { get; set; }
        public decimal? BonusConverted { get; set; }

        // Casino-related properties
        public decimal BetsCasino { get; set; }
        public decimal? BetsCasinoReal { get; set; }
        public decimal? BetsCasinoBonus { get; set; }
        public decimal? RefundsCasino { get; set; }
        public decimal? RefundsCasinoReal { get; set; }
        public decimal? RefundsCasinoBonus { get; set; }
        public decimal WinsCasino { get; set; }
        public decimal? WinsCasinoReal { get; set; }
        public decimal? WinsCasinoBonus { get; set; }

        // Sport-related properties
        public decimal BetsSport { get; set; }
        public decimal? BetsSportReal { get; set; }
        public decimal? BetsSportBonus { get; set; }
        public decimal? RefundsSport { get; set; }
        public decimal? RefundsSportReal { get; set; }
        public decimal? RefundsSportBonus { get; set; }
        public decimal WinsSport { get; set; }
        public decimal? WinsSportReal { get; set; }
        public decimal? WinsSportBonus { get; set; }

        // Live-related properties
        public decimal BetsLive { get; set; }
        public decimal? BetsLiveReal { get; set; }
        public decimal? BetsLiveBonus { get; set; }
        public decimal? RefundsLive { get; set; }
        public decimal? RefundsLiveReal { get; set; }
        public decimal? RefundsLiveBonus { get; set; }
        public decimal WinsLive { get; set; }
        public decimal? WinsLiveReal { get; set; }
        public decimal? WinsLiveBonus { get; set; }

        // Bingo-related properties
        public decimal BetsBingo { get; set; }
        public decimal? BetsBingoReal { get; set; }
        public decimal? BetsBingoBonus { get; set; }
        public decimal? RefundsBingo { get; set; }
        public decimal? RefundsBingoReal { get; set; }
        public decimal? RefundsBingoBonus { get; set; }
        public decimal WinsBingo { get; set; }
        public decimal? WinsBingoReal { get; set; }
        public decimal? WinsBingoBonus { get; set; }

        // Side games properties
        public decimal? SideGamesBets { get; set; }
        public decimal? SideGamesRefunds { get; set; }
        public decimal? SideGamesWins { get; set; }
        public decimal? SideGamesTableGamesBets { get; set; }
        public decimal? SideGamesTableGamesWins { get; set; }
        public decimal? SideGamesCasualGamesBets { get; set; }
        public decimal? SideGamesCasualGamesWins { get; set; }
        public decimal? SideGamesSlotsBets { get; set; }
        public decimal? SideGamesSlotsWins { get; set; }
        public decimal? SideGamesJackpotsBets { get; set; }
        public decimal? SideGamesJackpotsWins { get; set; }
        public decimal? SideGamesFeaturedBets { get; set; }
        public decimal? SideGamesFeaturedWins { get; set; }

        // Lotto-related properties
        public decimal? LottoBets { get; set; }
        public decimal? LottoAdvancedBets { get; set; }
        public decimal? LottoWins { get; set; }
        public decimal? LottoAdvancedWins { get; set; }

        // App-related properties
        public decimal? AppBets { get; set; }
        public decimal? AppRefunds { get; set; }
        public decimal? AppWins { get; set; }
        public decimal? AppBetsCasino { get; set; }
        public decimal? AppRefundsCasino { get; set; }
        public decimal? AppWinsCasino { get; set; }
        public decimal? AppBetsSport { get; set; }
        public decimal? AppRefundsSport { get; set; }
        public decimal? AppWinsSport { get; set; }

        // Other financial properties
        public decimal? ClubPointsConversion { get; set; }
        public decimal? BankRoll { get; set; }
        public decimal? JackpotContribution { get; set; }
        public decimal? InsuranceContribution { get; set; }
        public decimal? Adjustments { get; set; }
        public decimal? AdjustmentsAdd { get; set; }
        public decimal? ClearedBalance { get; set; }
        public decimal? RevenueAdjustments { get; set; }
        public decimal? RevenueAdjustmentsAdd { get; set; }
        public decimal? AdministrativeFee { get; set; }
        public decimal? AdministrativeFeeReturn { get; set; }
        public decimal? BetsReal { get; set; }
        public decimal? BetsBonus { get; set; }
        public decimal? RefundsReal { get; set; }
        public decimal? RefundsBonus { get; set; }
        public decimal? WinsReal { get; set; }
        public decimal? WinsBonus { get; set; }
        public decimal? EUR2GBP { get; set; }

        // Calculated GGR properties
        public decimal GGRCasino { get; set; }
        public decimal GGRSport { get; set; }
        public decimal GGRLive { get; set; }
        public decimal GGRBingo { get; set; }
        public decimal TotalGGR { get; set; }

        // Additional properties for grouped data
        public string? GroupKey { get; set; }
        public string? GroupValue { get; set; }
        public DateTime? UpdatedDate { get; set; }

        /// <summary>
        /// Additional data for grouping and other purposes
        /// </summary>
        public Dictionary<string, object>? GroupData { get; set; }
    }

    /// <summary>
    /// DTO for daily actions summary
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
