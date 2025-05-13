using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System.Text.Json;
using System.Linq;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Partial class for DailyActionsController containing filtered data endpoints
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Get filtered daily actions data with pagination
        /// </summary>
        /// <param name="filter">Filter parameters</param>
        [HttpPost("filtered-data")]
        public async Task<IActionResult> GetFilteredDailyActionsData([FromBody] DailyActionFilterDto filter)
        {
            try
            {
                // Validate filter
                if (filter == null)
                {
                    return BadRequest(new { message = "Filter is required" });
                }

                // Process string-based group by options if provided
                ProcessStringBasedGroupBy(filter);

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;

                // Default page size and page number
                if (filter.PageSize == 0) filter.PageSize = 50;
                if (filter.PageNumber == 0) filter.PageNumber = 1;

                // Get filtered daily actions data with pagination
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Map data to response model
                var mappedData = result.Data.Select(da => new
                {
                    // Basic identification fields
                    id = da.Id,
                    date = da.Date,
                    whiteLabelId = da.WhiteLabelId,
                    whiteLabelName = da.WhiteLabelName,
                    playerId = da.PlayerId,
                    playerName = da.PlayerName,
                    countryName = da.CountryName,
                    currencyCode = da.CurrencyCode,

                    // Registration and FTD metrics
                    registrations = da.Registrations,
                    ftd = da.FTD,
                    ftda = da.FTDA,

                    // Deposit-related properties
                    deposits = da.Deposits,
                    depositsCreditCard = da.DepositsCreditCard,
                    depositsNeteller = da.DepositsNeteller,
                    depositsMoneyBookers = da.DepositsMoneyBookers,
                    depositsOther = da.DepositsOther,
                    depositsFee = da.DepositsFee,
                    depositsSport = da.DepositsSport,
                    depositsLive = da.DepositsLive,
                    depositsBingo = da.DepositsBingo,

                    // Cashout-related properties
                    cashoutRequests = da.CashoutRequests,
                    paidCashouts = da.PaidCashouts,
                    chargebacks = da.Chargebacks,
                    voids = da.Voids,
                    reverseChargebacks = da.ReverseChargebacks,

                    // Bonus-related properties
                    bonuses = da.Bonuses,
                    bonusesSport = da.BonusesSport,
                    bonusesLive = da.BonusesLive,
                    bonusesBingo = da.BonusesBingo,
                    collectedBonuses = da.CollectedBonuses,
                    expiredBonuses = da.ExpiredBonuses,
                    bonusConverted = da.BonusConverted,

                    // Casino-related properties
                    betsCasino = da.BetsCasino,
                    betsCasinoReal = da.BetsCasinoReal,
                    betsCasinoBonus = da.BetsCasinoBonus,
                    refundsCasino = da.RefundsCasino,
                    refundsCasinoReal = da.RefundsCasinoReal,
                    refundsCasinoBonus = da.RefundsCasinoBonus,
                    winsCasino = da.WinsCasino,
                    winsCasinoReal = da.WinsCasinoReal,
                    winsCasinoBonus = da.WinsCasinoBonus,

                    // Sport-related properties
                    betsSport = da.BetsSport,
                    betsSportReal = da.BetsSportReal,
                    betsSportBonus = da.BetsSportBonus,
                    refundsSport = da.RefundsSport,
                    refundsSportReal = da.RefundsSportReal,
                    refundsSportBonus = da.RefundsSportBonus,
                    winsSport = da.WinsSport,
                    winsSportReal = da.WinsSportReal,
                    winsSportBonus = da.WinsSportBonus,

                    // Live-related properties
                    betsLive = da.BetsLive,
                    betsLiveReal = da.BetsLiveReal,
                    betsLiveBonus = da.BetsLiveBonus,
                    refundsLive = da.RefundsLive,
                    refundsLiveReal = da.RefundsLiveReal,
                    refundsLiveBonus = da.RefundsLiveBonus,
                    winsLive = da.WinsLive,
                    winsLiveReal = da.WinsLiveReal,
                    winsLiveBonus = da.WinsLiveBonus,

                    // Bingo-related properties
                    betsBingo = da.BetsBingo,
                    betsBingoReal = da.BetsBingoReal,
                    betsBingoBonus = da.BetsBingoBonus,
                    refundsBingo = da.RefundsBingo,
                    refundsBingoReal = da.RefundsBingoReal,
                    refundsBingoBonus = da.RefundsBingoBonus,
                    winsBingo = da.WinsBingo,
                    winsBingoReal = da.WinsBingoReal,
                    winsBingoBonus = da.WinsBingoBonus,

                    // Lotto-related properties
                    lottoBets = da.LottoBets,
                    lottoAdvancedBets = da.LottoAdvancedBets,
                    lottoWins = da.LottoWins,
                    lottoAdvancedWins = da.LottoAdvancedWins,

                    // App-related properties
                    appBets = da.AppBets,
                    appRefunds = da.AppRefunds,
                    appWins = da.AppWins,
                    appBetsCasino = da.AppBetsCasino,
                    appRefundsCasino = da.AppRefundsCasino,
                    appWinsCasino = da.AppWinsCasino,
                    appBetsSport = da.AppBetsSport,
                    appRefundsSport = da.AppRefundsSport,
                    appWinsSport = da.AppWinsSport,

                    // Other financial properties
                    clubPointsConversion = da.ClubPointsConversion,
                    bankRoll = da.BankRoll,
                    jackpotContribution = da.JackpotContribution,
                    insuranceContribution = da.InsuranceContribution,
                    adjustments = da.Adjustments,
                    adjustmentsAdd = da.AdjustmentsAdd,
                    clearedBalance = da.ClearedBalance,
                    revenueAdjustments = da.RevenueAdjustments,
                    revenueAdjustmentsAdd = da.RevenueAdjustmentsAdd,
                    administrativeFee = da.AdministrativeFee,
                    administrativeFeeReturn = da.AdministrativeFeeReturn,
                    betsReal = da.BetsReal,
                    betsBonus = da.BetsBonus,
                    refundsReal = da.RefundsReal,
                    refundsBonus = da.RefundsBonus,
                    winsReal = da.WinsReal,
                    winsBonus = da.WinsBonus,
                    eur2gbp = da.EUR2GBP,

                    // Calculated GGR metrics
                    ggrCasino = da.GGRCasino,
                    ggrSport = da.GGRSport,
                    ggrLive = da.GGRLive,
                    ggrBingo = da.GGRBingo,
                    totalGGR = da.TotalGGR,

                    // Group by fields if present
                    groupKey = da.GroupKey,
                    groupValue = da.GroupValue,
                    updatedDate = da.UpdatedDate
                }).ToList();

                // Get summary metrics
                var startDate = filter.StartDate ?? DateTime.UtcNow.Date.AddDays(-1);
                var endDate = filter.EndDate ?? DateTime.UtcNow.Date;

                // Get whiteLabelId for summary metrics
                int? whiteLabelIdForSummary = null;
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    whiteLabelIdForSummary = filter.WhiteLabelIds.FirstOrDefault();
                }

                // Extract the raw DailyAction objects from the result to pass to GetSummaryMetricsAsync
                var rawDailyActions = result.Data
                    .Select(dto => new DailyAction
                    {
                        Id = dto.Id,
                        Date = dto.Date,
                        WhiteLabelID = dto.WhiteLabelId > 0 ? (short?)dto.WhiteLabelId : null,
                        PlayerID = dto.PlayerId,
                        Registration = dto.Registrations > 0 ? (byte?)dto.Registrations : null,
                        FTD = dto.FTD > 0 ? (byte?)dto.FTD : null,
                        Deposits = dto.Deposits > 0 ? dto.Deposits : null,
                        PaidCashouts = dto.PaidCashouts > 0 ? dto.PaidCashouts : null,
                        BetsCasino = dto.BetsCasino > 0 ? dto.BetsCasino : null,
                        WinsCasino = dto.WinsCasino > 0 ? dto.WinsCasino : null,
                        BetsSport = dto.BetsSport > 0 ? dto.BetsSport : null,
                        WinsSport = dto.WinsSport > 0 ? dto.WinsSport : null,
                        BetsLive = dto.BetsLive > 0 ? dto.BetsLive : null,
                        WinsLive = dto.WinsLive > 0 ? dto.WinsLive : null,
                        BetsBingo = dto.BetsBingo > 0 ? dto.BetsBingo : null,
                        WinsBingo = dto.WinsBingo > 0 ? dto.WinsBingo : null
                    })
                    .ToList();

                // Get summary metrics using the preloaded data
                var summary = await _dailyActionsService.GetSummaryMetricsAsync(
                    startDate,
                    endDate,
                    whiteLabelIdForSummary,
                    rawDailyActions);

                return Ok(new
                {
                    data = mappedData,
                    summary = new
                    {
                        totalRegistrations = summary.TotalRegistrations,
                        totalFTD = summary.TotalFTD,
                        totalDeposits = summary.TotalDeposits,
                        totalCashouts = summary.TotalCashouts,
                        totalBetsCasino = summary.TotalBetsCasino,
                        totalWinsCasino = summary.TotalWinsCasino,
                        totalBetsSport = summary.TotalBetsSport,
                        totalWinsSport = summary.TotalWinsSport,
                        totalBetsLive = summary.TotalBetsLive,
                        totalWinsLive = summary.TotalWinsLive,
                        totalBetsBingo = summary.TotalBetsBingo,
                        totalWinsBingo = summary.TotalWinsBingo,
                        totalGGRCasino = summary.TotalBetsCasino - summary.TotalWinsCasino,
                        totalGGRSport = summary.TotalBetsSport - summary.TotalWinsSport,
                        totalGGRLive = summary.TotalBetsLive - summary.TotalWinsLive,
                        totalGGRBingo = summary.TotalBetsBingo - summary.TotalWinsBingo,
                        totalGGR = summary.TotalGGR
                    },
                    totalCount = result.TotalCount,
                    pageSize = filter.PageSize,
                    pageNumber = filter.PageNumber,
                    totalPages = filter.PageSize > 0 ? (int)Math.Ceiling((double)result.TotalCount / filter.PageSize) : 1,
                    startDate = filter.StartDate,
                    endDate = filter.EndDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filtered daily actions data");
                return StatusCode(500, new { message = "An error occurred while retrieving filtered daily actions data" });
            }
        }

        /// <summary>
        /// Get filtered and grouped daily actions data
        /// </summary>
        /// <param name="filter">Filter parameters with groupBy option</param>
        [HttpPost("filtered-grouped")]
        public async Task<IActionResult> GetFilteredGroupedDailyActionsData([FromBody] DailyActionFilterDto filter)
        {
            // Start a stopwatch to measure performance
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("GetFilteredGroupedDailyActionsData: Starting at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

            try
            {
                // Validate filter
                if (filter == null)
                {
                    _logger.LogInformation("GetFilteredGroupedDailyActionsData: Invalid filter at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
                    return BadRequest(new { message = "Filter is required" });
                }

                // Process string-based group by options if provided
                ProcessStringBasedGroupBy(filter);
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Processed string-based GroupBy at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;
                filter.EndDate = filter.EndDate.Value.AddDays(1).AddMilliseconds(-1);

                // Set a large page size to get all data for grouping
                filter.PageSize = 10000;
                filter.PageNumber = 1;
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Prepared filter parameters at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

                // Get all filtered daily actions data - this makes the database query
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Starting database query at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Database query completed at {ElapsedMs}ms, retrieved {Count} records",
                    stopwatch.ElapsedMilliseconds, result.Data.Count);

                // The data is already grouped by the database query, so we can directly use it
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Using data directly from database query at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

                // Create the response - use the summary that's already calculated in the service
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Creating response object at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
                var response = new
                {
                    data = result.Data,
                    summary = new
                    {
                        totalRegistrations = result.Summary.TotalRegistrations,
                        totalFTD = result.Summary.TotalFTD,
                        totalDeposits = result.Summary.TotalDeposits,
                        totalCashouts = result.Summary.TotalCashouts,
                        totalBetsCasino = result.Summary.TotalBetsCasino,
                        totalWinsCasino = result.Summary.TotalWinsCasino,
                        totalBetsSport = result.Summary.TotalBetsSport,
                        totalWinsSport = result.Summary.TotalWinsSport,
                        totalBetsLive = result.Summary.TotalBetsLive,
                        totalWinsLive = result.Summary.TotalWinsLive,
                        totalBetsBingo = result.Summary.TotalBetsBingo,
                        totalWinsBingo = result.Summary.TotalWinsBingo,
                        totalGGRCasino = result.Summary.TotalBetsCasino - result.Summary.TotalWinsCasino,
                        totalGGRSport = result.Summary.TotalBetsSport - result.Summary.TotalWinsSport,
                        totalGGRLive = result.Summary.TotalBetsLive - result.Summary.TotalWinsLive,
                        totalGGRBingo = result.Summary.TotalBetsBingo - result.Summary.TotalWinsBingo,
                        totalGGR = result.Summary.TotalGGR
                    },
                    totalCount = result.TotalCount,
                    groupBy = filter.GroupBy,
                    groupByString = filter.GroupByString,
                    startDate = filter.StartDate,
                    endDate = filter.EndDate
                };
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Response object created at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

                // Log minimal information about the response
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Returning {Count} records, date range: {StartDate} to {EndDate}, total elapsed time: {ElapsedMs}ms",
                    result.Data.Count, filter.StartDate?.ToString("yyyy-MM-dd"), filter.EndDate?.ToString("yyyy-MM-dd"), stopwatch.ElapsedMilliseconds);

                // Return the data with summary
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filtered and grouped daily actions data");
                return StatusCode(500, new { message = "An error occurred while retrieving filtered and grouped daily actions data" });
            }
        }

        /// <summary>
        /// Export filtered daily actions data
        /// </summary>
        /// <param name="filter">Filter parameters</param>
        [HttpPost("export")]
        public async Task<IActionResult> ExportDailyActionsData([FromBody] DailyActionFilterDto filter)
        {
            try
            {
                // Validate filter
                if (filter == null)
                {
                    return BadRequest(new { message = "Filter is required" });
                }

                // Process string-based group by options if provided
                ProcessStringBasedGroupBy(filter);

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;

                // Remove pagination for export
                filter.PageSize = 0;
                filter.PageNumber = 0;

                // Get all filtered daily actions data
                _logger.LogInformation("Calling GetFilteredDailyActionsAsync with date range: StartDate={StartDate}, EndDate={EndDate}, WhiteLabelIds={WhiteLabelIds}",
                    filter.StartDate?.ToString("yyyy-MM-dd"), filter.EndDate?.ToString("yyyy-MM-dd"),
                    filter.WhiteLabelIds != null ? string.Join(",", filter.WhiteLabelIds) : "null (all white labels)");

                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map data to export model with all available fields
                var exportData = result.Data.Select(da => new
                {
                    // Basic identification fields
                    ID = da.Id,
                    Date = da.Date.ToString("yyyy-MM-dd"),
                    WhiteLabelID = da.WhiteLabelId,
                    WhiteLabelName = da.WhiteLabelName,
                    PlayerID = da.PlayerId,
                    PlayerName = da.PlayerName,
                    CountryName = da.CountryName,
                    CurrencyCode = da.CurrencyCode,

                    // Registration and FTD metrics
                    Registrations = da.Registrations,
                    FTD = da.FTD,
                    FTDA = da.FTDA,

                    // Deposit-related properties
                    Deposits = da.Deposits,
                    DepositsCreditCard = da.DepositsCreditCard,
                    DepositsNeteller = da.DepositsNeteller,
                    DepositsMoneyBookers = da.DepositsMoneyBookers,
                    DepositsOther = da.DepositsOther,
                    DepositsFee = da.DepositsFee,
                    DepositsSport = da.DepositsSport,
                    DepositsLive = da.DepositsLive,
                    DepositsBingo = da.DepositsBingo,

                    // Cashout-related properties
                    CashoutRequests = da.CashoutRequests,
                    PaidCashouts = da.PaidCashouts,
                    Chargebacks = da.Chargebacks,
                    Voids = da.Voids,
                    ReverseChargebacks = da.ReverseChargebacks,

                    // Bonus-related properties
                    Bonuses = da.Bonuses,
                    BonusesSport = da.BonusesSport,
                    BonusesLive = da.BonusesLive,
                    BonusesBingo = da.BonusesBingo,
                    CollectedBonuses = da.CollectedBonuses,
                    ExpiredBonuses = da.ExpiredBonuses,
                    BonusConverted = da.BonusConverted,

                    // Casino-related properties
                    BetsCasino = da.BetsCasino,
                    BetsCasinoReal = da.BetsCasinoReal,
                    BetsCasinoBonus = da.BetsCasinoBonus,
                    RefundsCasino = da.RefundsCasino,
                    RefundsCasinoReal = da.RefundsCasinoReal,
                    RefundsCasinoBonus = da.RefundsCasinoBonus,
                    WinsCasino = da.WinsCasino,
                    WinsCasinoReal = da.WinsCasinoReal,
                    WinsCasinoBonus = da.WinsCasinoBonus,

                    // Sport-related properties
                    BetsSport = da.BetsSport,
                    BetsSportReal = da.BetsSportReal,
                    BetsSportBonus = da.BetsSportBonus,
                    RefundsSport = da.RefundsSport,
                    RefundsSportReal = da.RefundsSportReal,
                    RefundsSportBonus = da.RefundsSportBonus,
                    WinsSport = da.WinsSport,
                    WinsSportReal = da.WinsSportReal,
                    WinsSportBonus = da.WinsSportBonus,

                    // Live-related properties
                    BetsLive = da.BetsLive,
                    BetsLiveReal = da.BetsLiveReal,
                    BetsLiveBonus = da.BetsLiveBonus,
                    RefundsLive = da.RefundsLive,
                    RefundsLiveReal = da.RefundsLiveReal,
                    RefundsLiveBonus = da.RefundsLiveBonus,
                    WinsLive = da.WinsLive,
                    WinsLiveReal = da.WinsLiveReal,
                    WinsLiveBonus = da.WinsLiveBonus,

                    // Bingo-related properties
                    BetsBingo = da.BetsBingo,
                    BetsBingoReal = da.BetsBingoReal,
                    BetsBingoBonus = da.BetsBingoBonus,
                    RefundsBingo = da.RefundsBingo,
                    RefundsBingoReal = da.RefundsBingoReal,
                    RefundsBingoBonus = da.RefundsBingoBonus,
                    WinsBingo = da.WinsBingo,
                    WinsBingoReal = da.WinsBingoReal,
                    WinsBingoBonus = da.WinsBingoBonus,

                    // Lotto-related properties
                    LottoBets = da.LottoBets,
                    LottoAdvancedBets = da.LottoAdvancedBets,
                    LottoWins = da.LottoWins,
                    LottoAdvancedWins = da.LottoAdvancedWins,

                    // App-related properties
                    AppBets = da.AppBets,
                    AppRefunds = da.AppRefunds,
                    AppWins = da.AppWins,
                    AppBetsCasino = da.AppBetsCasino,
                    AppRefundsCasino = da.AppRefundsCasino,
                    AppWinsCasino = da.AppWinsCasino,
                    AppBetsSport = da.AppBetsSport,
                    AppRefundsSport = da.AppRefundsSport,
                    AppWinsSport = da.AppWinsSport,

                    // Other financial properties
                    ClubPointsConversion = da.ClubPointsConversion,
                    BankRoll = da.BankRoll,
                    JackpotContribution = da.JackpotContribution,
                    InsuranceContribution = da.InsuranceContribution,
                    Adjustments = da.Adjustments,
                    AdjustmentsAdd = da.AdjustmentsAdd,
                    ClearedBalance = da.ClearedBalance,
                    RevenueAdjustments = da.RevenueAdjustments,
                    RevenueAdjustmentsAdd = da.RevenueAdjustmentsAdd,
                    AdministrativeFee = da.AdministrativeFee,
                    AdministrativeFeeReturn = da.AdministrativeFeeReturn,
                    BetsReal = da.BetsReal,
                    BetsBonus = da.BetsBonus,
                    RefundsReal = da.RefundsReal,
                    RefundsBonus = da.RefundsBonus,
                    WinsReal = da.WinsReal,
                    WinsBonus = da.WinsBonus,
                    EUR2GBP = da.EUR2GBP,

                    // Calculated GGR metrics
                    GGRCasino = da.GGRCasino,
                    GGRSport = da.GGRSport,
                    GGRLive = da.GGRLive,
                    GGRBingo = da.GGRBingo,
                    TotalGGR = da.TotalGGR,

                    // Group by fields if present
                    GroupKey = da.GroupKey,
                    GroupValue = da.GroupValue,
                    UpdatedDate = da.UpdatedDate
                }).ToList();

                // Serialize to JSON
                var json = JsonSerializer.Serialize(exportData, _jsonOptions);

                // Return as file
                var fileName = $"DailyActions_{filter.StartDate:yyyyMMdd}_{filter.EndDate:yyyyMMdd}.json";
                return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting daily actions data");
                return StatusCode(500, new { message = "An error occurred while exporting daily actions data" });
            }
        }
    }
}
