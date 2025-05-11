using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Text.Json;
using System.Linq;

namespace PPrePorter.API.Features.Reports.Controllers
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

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map data to response model
                var mappedData = result.Data.Select(da => new
                {
                    id = da.Id,
                    date = da.Date,
                    whiteLabelId = da.WhiteLabelId,
                    whiteLabelName = da.WhiteLabelName,
                    registrations = da.Registrations,
                    ftd = da.FTD,
                    deposits = da.Deposits,
                    paidCashouts = da.PaidCashouts,
                    // Casino metrics
                    betsCasino = da.BetsCasino,
                    winsCasino = da.WinsCasino,
                    // Sports metrics
                    betsSport = da.BetsSport,
                    winsSport = da.WinsSport,
                    // Live metrics
                    betsLive = da.BetsLive,
                    winsLive = da.WinsLive,
                    // Bingo metrics
                    betsBingo = da.BetsBingo,
                    winsBingo = da.WinsBingo,
                    // Calculated GGR metrics
                    ggrCasino = da.GGRCasino,
                    ggrSport = da.GGRSport,
                    ggrLive = da.GGRLive,
                    ggrBingo = da.GGRBingo,
                    totalGGR = da.TotalGGR
                }).ToList();

                // Get summary metrics
                var summary = await _dailyActionsService.GetSummaryMetricsAsync(
                    filter.StartDate.Value,
                    filter.EndDate.Value,
                    filter.WhiteLabelIds?.FirstOrDefault());

                return Ok(new
                {
                    data = mappedData,
                    summary = new
                    {
                        totalRegistrations = summary.TotalRegistrations,
                        totalFTD = summary.TotalFTD,
                        totalDeposits = summary.TotalDeposits,
                        totalCashouts = summary.TotalCashouts,
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
            try
            {
                // Validate filter
                if (filter == null)
                {
                    return BadRequest(new { message = "Filter is required" });
                }

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;

                // Remove pagination for grouping (we'll return all grouped results)
                // Set a large page size to get all records
                filter.PageSize = 1000;
                filter.PageNumber = 1;

                _logger.LogInformation("Removed pagination for grouping. Set PageSize={PageSize}, PageNumber={PageNumber}",
                    filter.PageSize, filter.PageNumber);

                // Get all filtered daily actions data
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Group data based on the groupBy parameter
                var groupedData = GroupDailyActionsData(result.Data, filter.GroupBy, whiteLabelDict);

                // Get summary metrics
                var summary = await _dailyActionsService.GetSummaryMetricsAsync(
                    filter.StartDate.Value,
                    filter.EndDate.Value,
                    filter.WhiteLabelIds?.FirstOrDefault());

                // Create the response
                var response = new
                {
                    data = groupedData,
                    summary = new
                    {
                        totalRegistrations = summary.TotalRegistrations,
                        totalFTD = summary.TotalFTD,
                        totalDeposits = summary.TotalDeposits,
                        totalCashouts = summary.TotalCashouts,
                        totalGGR = summary.TotalGGR
                    },
                    totalCount = groupedData.Count(),
                    groupBy = filter.GroupBy,
                    startDate = filter.StartDate,
                    endDate = filter.EndDate
                };

                // Log the response
                _logger.LogInformation("GetFilteredGroupedDailyActionsData: Returning response with {Count} grouped records",
                    groupedData.Count());

                // Return the grouped data with summary
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

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;

                // Remove pagination for export
                filter.PageSize = 0;
                filter.PageNumber = 0;

                // Get all filtered daily actions data
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map data to export model
                var exportData = result.Data.Select(da => new
                {
                    ID = da.Id,
                    Date = da.Date.ToString("yyyy-MM-dd"),
                    WhiteLabelID = da.WhiteLabelId,
                    WhiteLabelName = da.WhiteLabelName,
                    Registrations = da.Registrations,
                    FTD = da.FTD,
                    Deposits = da.Deposits,
                    PaidCashouts = da.PaidCashouts,
                    BetsCasino = da.BetsCasino,
                    WinsCasino = da.WinsCasino,
                    BetsSport = da.BetsSport,
                    WinsSport = da.WinsSport,
                    BetsLive = da.BetsLive,
                    WinsLive = da.WinsLive,
                    BetsBingo = da.BetsBingo,
                    WinsBingo = da.WinsBingo,
                    GGRCasino = da.GGRCasino,
                    GGRSport = da.GGRSport,
                    GGRLive = da.GGRLive,
                    GGRBingo = da.GGRBingo,
                    TotalGGR = da.TotalGGR
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

        /// <summary>
        /// Group daily actions data based on the specified groupBy parameter
        /// </summary>
        /// <param name="data">Raw daily actions data</param>
        /// <param name="groupBy">GroupBy option (Day=0, Month=1, Year=2, Label=3, etc.)</param>
        /// <param name="whiteLabelDict">Dictionary of white label IDs to names</param>
        /// <returns>Grouped data with summed metrics</returns>
        private IEnumerable<object> GroupDailyActionsData(IEnumerable<DailyActionDto> data, GroupByOption groupBy, Dictionary<int, string> whiteLabelDict)
        {
            if (data == null || !data.Any())
            {
                return Enumerable.Empty<object>();
            }

            // Define the grouping key selector based on the GroupBy option
            Func<DailyActionDto, object> keySelector;
            Func<DailyActionDto, object, object> resultSelector;

            switch (groupBy)
            {
                case GroupByOption.Day:
                    // Group by day (date)
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Day",
                        groupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        date = key,
                    };
                    // Log the grouping operation
                    _logger.LogInformation("Grouping data by Day. Total records before grouping: {Count}", data.Count());
                    break;

                case GroupByOption.Month:
                    // Group by month
                    keySelector = da => new { da.Date.Year, da.Date.Month };
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Month",
                        groupValue = $"{((dynamic)key).Year}-{((dynamic)key).Month:D2}",
                        date = new DateTime(((dynamic)key).Year, ((dynamic)key).Month, 1),
                    };
                    break;

                case GroupByOption.Year:
                    // Group by year
                    keySelector = da => da.Date.Year;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Year",
                        groupValue = key.ToString(),
                        date = new DateTime((int)key, 1, 1),
                    };
                    break;

                case GroupByOption.Label:
                    // Group by white label
                    keySelector = da => da.WhiteLabelId;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Label",
                        groupValue = whiteLabelDict.TryGetValue((int)key, out var name) ? name : $"Label {key}",
                        whiteLabelId = key,
                        whiteLabelName = whiteLabelDict.TryGetValue((int)key, out var wlName) ? wlName : $"Label {key}",
                    };
                    break;

                case GroupByOption.Country:
                    // Group by country - using GroupKey/GroupValue since Country property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Country",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Tracker:
                    // Group by tracker - using GroupKey/GroupValue since Tracker property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Tracker",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Currency:
                    // Group by currency - using GroupKey/GroupValue since Currency property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Currency",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Gender:
                    // Group by gender - using GroupKey/GroupValue since Gender property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Gender",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Platform:
                    // Group by platform - using GroupKey/GroupValue since Platform property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Platform",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Ranking:
                    // Group by ranking - using GroupKey/GroupValue since Ranking property doesn't exist
                    keySelector = da => da.GroupValue ?? "Unknown";
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Ranking",
                        groupValue = key.ToString(),
                    };
                    break;

                case GroupByOption.Player:
                    // Group by player - using PlayerId and PlayerName
                    keySelector = da => da.PlayerId ?? 0;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Player",
                        groupValue = da.PlayerName ?? $"Player {key}",
                        playerId = key,
                        playerName = da.PlayerName ?? $"Player {key}",
                    };
                    break;

                default:
                    // Default to day if unknown groupBy value
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Day",
                        groupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        date = key,
                    };
                    break;
            }

            // Log the data before grouping
            _logger.LogInformation("GroupDailyActionsData: About to group {Count} records by {GroupBy}",
                data.Count(), groupBy);

            // Perform the grouping and sum all numeric fields
            var groups = data.GroupBy(keySelector).ToList();

            // Log the number of groups
            _logger.LogInformation("GroupDailyActionsData: Created {Count} groups after grouping by {GroupBy}",
                groups.Count, groupBy);

            // Special handling for Day grouping with no label selected
            // If we have only one group for Day, it means we're not properly grouping by day
            if (groupBy == GroupByOption.Day && groups.Count == 1 && data.Count() > 1)
            {
                _logger.LogWarning("GroupDailyActionsData: Only one group for Day grouping with {Count} records. Forcing grouping by date.", data.Count());

                // Instead of trying to cast, let's create a new list of grouped data directly
                var forcedGroupedData = data
                    .GroupBy(da => da.Date.Date)
                    .Select(g => {
                        // Log each group
                        _logger.LogInformation("GroupDailyActionsData: Processing forced date group with key {Key}, containing {Count} records",
                            g.Key, g.Count());

                        // Create the base object with the group key
                        var baseObj = new
                        {
                            groupKey = "Day",
                            groupValue = g.Key.ToString("yyyy-MM-dd"),
                            date = g.Key,
                        };

                        // Add all the summed metrics
                        var metrics = new
                        {
                            // Basic metrics
                            registrations = g.Sum(da => da.Registrations),
                            ftd = g.Sum(da => da.FTD),
                            ftda = g.Sum(da => da.FTDA),
                            deposits = g.Sum(da => da.Deposits),
                            depositsCreditCard = g.Sum(da => da.DepositsCreditCard),
                            depositsNeteller = g.Sum(da => da.DepositsNeteller),
                            depositsMoneyBookers = g.Sum(da => da.DepositsMoneyBookers),
                            depositsOther = g.Sum(da => da.DepositsOther),
                            cashoutRequests = g.Sum(da => da.CashoutRequests),
                            paidCashouts = g.Sum(da => da.PaidCashouts),

                            // Casino metrics
                            betsCasino = g.Sum(da => da.BetsCasino),
                            winsCasino = g.Sum(da => da.WinsCasino),
                            ggrCasino = g.Sum(da => da.GGRCasino),

                            // Sport metrics
                            betsSport = g.Sum(da => da.BetsSport),
                            winsSport = g.Sum(da => da.WinsSport),
                            ggrSport = g.Sum(da => da.GGRSport),

                            // Live metrics
                            betsLive = g.Sum(da => da.BetsLive),
                            winsLive = g.Sum(da => da.WinsLive),
                            ggrLive = g.Sum(da => da.GGRLive),

                            // Bingo metrics
                            betsBingo = g.Sum(da => da.BetsBingo),
                            winsBingo = g.Sum(da => da.WinsBingo),
                            ggrBingo = g.Sum(da => da.GGRBingo),

                            // Total GGR
                            totalGGR = g.Sum(da => da.TotalGGR)
                        };

                        // Create a simplified structure for grouped data
                        return new
                        {
                            id = Guid.NewGuid().ToString(), // Generate a unique ID for the grouped record
                            groupKey = ((dynamic)baseObj).groupKey,
                            groupValue = ((dynamic)baseObj).groupValue,

                            // Include the most important metrics
                            registrations = ((dynamic)metrics).registrations,
                            ftd = ((dynamic)metrics).ftd,
                            deposits = ((dynamic)metrics).deposits,
                            paidCashouts = ((dynamic)metrics).paidCashouts,

                            // Casino metrics
                            betsCasino = ((dynamic)metrics).betsCasino,
                            winsCasino = ((dynamic)metrics).winsCasino,
                            ggrCasino = ((dynamic)metrics).ggrCasino,

                            // Sport metrics
                            betsSport = ((dynamic)metrics).betsSport,
                            winsSport = ((dynamic)metrics).winsSport,
                            ggrSport = ((dynamic)metrics).ggrSport,

                            // Live metrics
                            betsLive = ((dynamic)metrics).betsLive,
                            winsLive = ((dynamic)metrics).winsLive,
                            ggrLive = ((dynamic)metrics).ggrLive,

                            // Bingo metrics
                            betsBingo = ((dynamic)metrics).betsBingo,
                            winsBingo = ((dynamic)metrics).winsBingo,
                            ggrBingo = ((dynamic)metrics).ggrBingo,

                            // Total GGR
                            totalGGR = ((dynamic)metrics).totalGGR
                        };
                    })
                    .ToList();

                _logger.LogInformation("GroupDailyActionsData: Forced grouping by date created {Count} groups", forcedGroupedData.Count);

                // Return the forced grouped data directly
                return forcedGroupedData;
            }

            var groupedData = groups.Select(g => {
                // Log each group
                _logger.LogInformation("GroupDailyActionsData: Processing group with key {Key}, containing {Count} records",
                    g.Key, g.Count());
                    // Create the base object with the group key
                    var baseObj = resultSelector(g.First(), g.Key);

                    // Add all the summed metrics
                    var metrics = new
                    {
                        // Basic metrics
                        registrations = g.Sum(da => da.Registrations),
                        ftd = g.Sum(da => da.FTD),
                        ftda = g.Sum(da => da.FTDA),
                        deposits = g.Sum(da => da.Deposits),
                        depositsCreditCard = g.Sum(da => da.DepositsCreditCard),
                        depositsNeteller = g.Sum(da => da.DepositsNeteller),
                        depositsMoneyBookers = g.Sum(da => da.DepositsMoneyBookers),
                        depositsOther = g.Sum(da => da.DepositsOther),
                        cashoutRequests = g.Sum(da => da.CashoutRequests),
                        paidCashouts = g.Sum(da => da.PaidCashouts),
                        chargebacks = g.Sum(da => da.Chargebacks),
                        voids = g.Sum(da => da.Voids),
                        reverseChargebacks = g.Sum(da => da.ReverseChargebacks),
                        bonuses = g.Sum(da => da.Bonuses),
                        collectedBonuses = g.Sum(da => da.CollectedBonuses),
                        expiredBonuses = g.Sum(da => da.ExpiredBonuses),
                        clubPointsConversion = g.Sum(da => da.ClubPointsConversion),
                        bankRoll = g.Sum(da => da.BankRoll),

                        // Side games metrics
                        sideGamesBets = g.Sum(da => da.SideGamesBets),
                        sideGamesRefunds = g.Sum(da => da.SideGamesRefunds),
                        sideGamesWins = g.Sum(da => da.SideGamesWins),
                        sideGamesTableGamesBets = g.Sum(da => da.SideGamesTableGamesBets),
                        sideGamesTableGamesWins = g.Sum(da => da.SideGamesTableGamesWins),
                        sideGamesCasualGamesBets = g.Sum(da => da.SideGamesCasualGamesBets),
                        sideGamesCasualGamesWins = g.Sum(da => da.SideGamesCasualGamesWins),
                        sideGamesSlotsBets = g.Sum(da => da.SideGamesSlotsBets),
                        sideGamesSlotsWins = g.Sum(da => da.SideGamesSlotsWins),
                        sideGamesJackpotsBets = g.Sum(da => da.SideGamesJackpotsBets),
                        sideGamesJackpotsWins = g.Sum(da => da.SideGamesJackpotsWins),
                        sideGamesFeaturedBets = g.Sum(da => da.SideGamesFeaturedBets),
                        sideGamesFeaturedWins = g.Sum(da => da.SideGamesFeaturedWins),
                        jackpotContribution = g.Sum(da => da.JackpotContribution),

                        // Lotto metrics
                        lottoBets = g.Sum(da => da.LottoBets),
                        lottoAdvancedBets = g.Sum(da => da.LottoAdvancedBets),
                        lottoWins = g.Sum(da => da.LottoWins),
                        lottoAdvancedWins = g.Sum(da => da.LottoAdvancedWins),
                        insuranceContribution = g.Sum(da => da.InsuranceContribution),

                        // Adjustment metrics
                        adjustments = g.Sum(da => da.Adjustments),
                        adjustmentsAdd = g.Sum(da => da.AdjustmentsAdd),
                        clearedBalance = g.Sum(da => da.ClearedBalance),
                        revenueAdjustments = g.Sum(da => da.RevenueAdjustments),
                        revenueAdjustmentsAdd = g.Sum(da => da.RevenueAdjustmentsAdd),
                        administrativeFee = g.Sum(da => da.AdministrativeFee),
                        administrativeFeeReturn = g.Sum(da => da.AdministrativeFeeReturn),

                        // Bet metrics
                        betsReal = g.Sum(da => da.BetsReal),
                        betsBonus = g.Sum(da => da.BetsBonus),
                        refundsReal = g.Sum(da => da.RefundsReal),
                        refundsBonus = g.Sum(da => da.RefundsBonus),
                        winsReal = g.Sum(da => da.WinsReal),
                        winsBonus = g.Sum(da => da.WinsBonus),
                        bonusConverted = g.Sum(da => da.BonusConverted),
                        depositsFee = g.Sum(da => da.DepositsFee),

                        // Sport metrics
                        depositsSport = g.Sum(da => da.DepositsSport),
                        betsSport = g.Sum(da => da.BetsSport),
                        refundsSport = g.Sum(da => da.RefundsSport),
                        winsSport = g.Sum(da => da.WinsSport),
                        betsSportReal = g.Sum(da => da.BetsSportReal),
                        refundsSportReal = g.Sum(da => da.RefundsSportReal),
                        winsSportReal = g.Sum(da => da.WinsSportReal),
                        betsSportBonus = g.Sum(da => da.BetsSportBonus),
                        refundsSportBonus = g.Sum(da => da.RefundsSportBonus),
                        winsSportBonus = g.Sum(da => da.WinsSportBonus),
                        bonusesSport = g.Sum(da => da.BonusesSport),

                        // Casino metrics
                        betsCasino = g.Sum(da => da.BetsCasino),
                        refundsCasino = g.Sum(da => da.RefundsCasino),
                        winsCasino = g.Sum(da => da.WinsCasino),
                        betsCasinoReal = g.Sum(da => da.BetsCasinoReal),
                        refundsCasinoReal = g.Sum(da => da.RefundsCasinoReal),
                        winsCasinoReal = g.Sum(da => da.WinsCasinoReal),
                        betsCasinoBonus = g.Sum(da => da.BetsCasinoBonus),
                        refundsCasinoBonus = g.Sum(da => da.RefundsCasinoBonus),
                        winsCasinoBonus = g.Sum(da => da.WinsCasinoBonus),

                        // App metrics
                        appBets = g.Sum(da => da.AppBets),
                        appRefunds = g.Sum(da => da.AppRefunds),
                        appWins = g.Sum(da => da.AppWins),
                        appBetsCasino = g.Sum(da => da.AppBetsCasino),
                        appRefundsCasino = g.Sum(da => da.AppRefundsCasino),
                        appWinsCasino = g.Sum(da => da.AppWinsCasino),
                        appBetsSport = g.Sum(da => da.AppBetsSport),
                        appRefundsSport = g.Sum(da => da.AppRefundsSport),
                        appWinsSport = g.Sum(da => da.AppWinsSport),

                        // Live metrics
                        depositsLive = g.Sum(da => da.DepositsLive),
                        bonusesLive = g.Sum(da => da.BonusesLive),
                        betsLive = g.Sum(da => da.BetsLive),
                        refundsLive = g.Sum(da => da.RefundsLive),
                        winsLive = g.Sum(da => da.WinsLive),
                        betsLiveReal = g.Sum(da => da.BetsLiveReal),
                        refundsLiveReal = g.Sum(da => da.RefundsLiveReal),
                        winsLiveReal = g.Sum(da => da.WinsLiveReal),
                        betsLiveBonus = g.Sum(da => da.BetsLiveBonus),
                        refundsLiveBonus = g.Sum(da => da.RefundsLiveBonus),
                        winsLiveBonus = g.Sum(da => da.WinsLiveBonus),

                        // Bingo metrics
                        depositsBingo = g.Sum(da => da.DepositsBingo),
                        bonusesBingo = g.Sum(da => da.BonusesBingo),
                        betsBingo = g.Sum(da => da.BetsBingo),
                        refundsBingo = g.Sum(da => da.RefundsBingo),
                        winsBingo = g.Sum(da => da.WinsBingo),
                        betsBingoReal = g.Sum(da => da.BetsBingoReal),
                        refundsBingoReal = g.Sum(da => da.RefundsBingoReal),
                        winsBingoReal = g.Sum(da => da.WinsBingoReal),
                        betsBingoBonus = g.Sum(da => da.BetsBingoBonus),
                        refundsBingoBonus = g.Sum(da => da.RefundsBingoBonus),
                        winsBingoBonus = g.Sum(da => da.WinsBingoBonus),

                        // Calculated GGR metrics
                        ggrCasino = g.Sum(da => da.GGRCasino),
                        ggrSport = g.Sum(da => da.GGRSport),
                        ggrLive = g.Sum(da => da.GGRLive),
                        ggrBingo = g.Sum(da => da.GGRBingo),
                        totalGGR = g.Sum(da => da.TotalGGR)
                    };

                    // Create a simplified structure for grouped data
                    // This focuses on the group field and key metrics
                    return new
                    {
                        id = Guid.NewGuid().ToString(), // Generate a unique ID for the grouped record
                        groupKey = ((dynamic)baseObj).groupKey,
                        groupValue = ((dynamic)baseObj).groupValue,

                        // Include the most important metrics
                        registrations = ((dynamic)metrics).registrations,
                        ftd = ((dynamic)metrics).ftd,
                        deposits = ((dynamic)metrics).deposits,
                        paidCashouts = ((dynamic)metrics).paidCashouts,

                        // Casino metrics
                        betsCasino = ((dynamic)metrics).betsCasino,
                        winsCasino = ((dynamic)metrics).winsCasino,
                        ggrCasino = ((dynamic)metrics).ggrCasino,

                        // Sport metrics
                        betsSport = ((dynamic)metrics).betsSport,
                        winsSport = ((dynamic)metrics).winsSport,
                        ggrSport = ((dynamic)metrics).ggrSport,

                        // Live metrics
                        betsLive = ((dynamic)metrics).betsLive,
                        winsLive = ((dynamic)metrics).winsLive,
                        ggrLive = ((dynamic)metrics).ggrLive,

                        // Bingo metrics
                        betsBingo = ((dynamic)metrics).betsBingo,
                        winsBingo = ((dynamic)metrics).winsBingo,
                        ggrBingo = ((dynamic)metrics).ggrBingo,

                        // Total GGR
                        totalGGR = ((dynamic)metrics).totalGGR
                    };
                })
                .ToList();

            // Log the final result
            _logger.LogInformation("GroupDailyActionsData: Returning {Count} grouped records", groupedData.Count);

            return groupedData;
        }
    }
}
