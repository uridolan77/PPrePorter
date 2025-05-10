using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System.Drawing;
using System.Text;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers
{
    [ApiController]
    [Route("api/reports/daily-actions")]
    [Authorize]
    public class DailyActionsController(
        IDailyActionsService dailyActionsService,
        IWhiteLabelService whiteLabelService,
        ILogger<DailyActionsController> logger,
        Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache) : ControllerBase
    {
        private readonly IDailyActionsService _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
        private readonly IWhiteLabelService _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
        private readonly ILogger<DailyActionsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Get daily actions data with basic filters (legacy endpoint)
        /// </summary>
        /// <param name="startDate">Start date (defaults to yesterday)</param>
        /// <param name="endDate">End date (defaults to today)</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        [HttpGet("data")]
        public async Task<IActionResult> GetDailyActionsData(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? whiteLabelId = null)
        {
            try
            {
                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var start = startDate?.Date ?? yesterday;
                var end = endDate?.Date ?? today;

                // Get daily actions data
                var dailyActions = await _dailyActionsService.GetDailyActionsAsync(start, end, whiteLabelId);

                // Limit the number of records to prevent Swagger UI from crashing
                var limitedDailyActions = dailyActions.Take(100).ToList();
                _logger.LogInformation("Retrieved {TotalCount} daily actions, limiting to {LimitedCount} for the response",
                    dailyActions.Count(), limitedDailyActions.Count);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Create a dynamic object with all properties from DailyAction
                var result = limitedDailyActions.Select(da =>
                {
                    // Create a dynamic object to hold all properties
                    var obj = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;

                    // Add basic properties
                    obj["id"] = da.Id;
                    obj["date"] = da.Date;
                    obj["whiteLabelId"] = da.WhiteLabelID.HasValue ? (int)da.WhiteLabelID.Value : 0;
                    obj["whiteLabelName"] = da.WhiteLabelID.HasValue && whiteLabelDict.TryGetValue((int)da.WhiteLabelID.Value, out var name) ? name : "Unknown";

                    // Add all other properties from DailyAction
                    obj["playerId"] = da.PlayerID;
                    obj["registrations"] = da.Registration.HasValue ? (int)da.Registration.Value : 0;
                    obj["ftd"] = da.FTD.HasValue ? (int)da.FTD.Value : 0;
                    obj["ftda"] = da.FTDA.HasValue ? (int)da.FTDA.Value : 0;
                    obj["deposits"] = da.Deposits ?? 0;
                    obj["depositsCreditCard"] = da.DepositsCreditCard ?? 0;
                    obj["depositsNeteller"] = da.DepositsNeteller ?? 0;
                    obj["depositsMoneyBookers"] = da.DepositsMoneyBookers ?? 0;
                    obj["depositsOther"] = da.DepositsOther ?? 0;
                    obj["cashoutRequests"] = da.CashoutRequests ?? 0;
                    obj["paidCashouts"] = da.PaidCashouts ?? 0;
                    obj["chargebacks"] = da.Chargebacks ?? 0;
                    obj["voids"] = da.Voids ?? 0;
                    obj["reverseChargebacks"] = da.ReverseChargebacks ?? 0;
                    obj["bonuses"] = da.Bonuses ?? 0;
                    obj["collectedBonuses"] = da.CollectedBonuses ?? 0;
                    obj["expiredBonuses"] = da.ExpiredBonuses ?? 0;
                    obj["clubPointsConversion"] = da.ClubPointsConversion ?? 0;
                    obj["bankRoll"] = da.BankRoll ?? 0;
                    obj["sideGamesBets"] = da.SideGamesBets ?? 0;
                    obj["sideGamesRefunds"] = da.SideGamesRefunds ?? 0;
                    obj["sideGamesWins"] = da.SideGamesWins ?? 0;
                    obj["sideGamesTableGamesBets"] = da.SideGamesTableGamesBets ?? 0;
                    obj["sideGamesTableGamesWins"] = da.SideGamesTableGamesWins ?? 0;
                    obj["sideGamesCasualGamesBets"] = da.SideGamesCasualGamesBets ?? 0;
                    obj["sideGamesCasualGamesWins"] = da.SideGamesCasualGamesWins ?? 0;
                    obj["sideGamesSlotsBets"] = da.SideGamesSlotsBets ?? 0;
                    obj["sideGamesSlotsWins"] = da.SideGamesSlotsWins ?? 0;
                    obj["sideGamesJackpotsBets"] = da.SideGamesJackpotsBets ?? 0;
                    obj["sideGamesJackpotsWins"] = da.SideGamesJackpotsWins ?? 0;
                    obj["sideGamesFeaturedBets"] = da.SideGamesFeaturedBets ?? 0;
                    obj["sideGamesFeaturedWins"] = da.SideGamesFeaturedWins ?? 0;
                    obj["jackpotContribution"] = da.JackpotContribution ?? 0;
                    obj["lottoBets"] = da.LottoBets ?? 0;
                    obj["lottoAdvancedBets"] = da.LottoAdvancedBets ?? 0;
                    obj["lottoWins"] = da.LottoWins ?? 0;
                    obj["lottoAdvancedWins"] = da.LottoAdvancedWins ?? 0;
                    obj["insuranceContribution"] = da.InsuranceContribution ?? 0;
                    obj["adjustments"] = da.Adjustments ?? 0;
                    obj["adjustmentsAdd"] = da.AdjustmentsAdd ?? 0;
                    obj["clearedBalance"] = da.ClearedBalance ?? 0;
                    obj["revenueAdjustments"] = da.RevenueAdjustments ?? 0;
                    obj["revenueAdjustmentsAdd"] = da.RevenueAdjustmentsAdd ?? 0;
                    obj["updatedDate"] = da.UpdatedDate;
                    obj["administrativeFee"] = da.AdministrativeFee ?? 0;
                    obj["administrativeFeeReturn"] = da.AdministrativeFeeReturn ?? 0;
                    obj["betsReal"] = da.BetsReal ?? 0;
                    obj["betsBonus"] = da.BetsBonus ?? 0;
                    obj["refundsReal"] = da.RefundsReal ?? 0;
                    obj["refundsBonus"] = da.RefundsBonus ?? 0;
                    obj["winsReal"] = da.WinsReal ?? 0;
                    obj["winsBonus"] = da.WinsBonus ?? 0;
                    obj["bonusConverted"] = da.BonusConverted ?? 0;
                    obj["depositsFee"] = da.DepositsFee ?? 0;
                    obj["depositsSport"] = da.DepositsSport ?? 0;
                    obj["betsSport"] = da.BetsSport ?? 0;
                    obj["refundsSport"] = da.RefundsSport ?? 0;
                    obj["winsSport"] = da.WinsSport ?? 0;
                    obj["betsSportReal"] = da.BetsSportReal ?? 0;
                    obj["refundsSportReal"] = da.RefundsSportReal ?? 0;
                    obj["winsSportReal"] = da.WinsSportReal ?? 0;
                    obj["betsSportBonus"] = da.BetsSportBonus ?? 0;
                    obj["refundsSportBonus"] = da.RefundsSportBonus ?? 0;
                    obj["winsSportBonus"] = da.WinsSportBonus ?? 0;
                    obj["bonusesSport"] = da.BonusesSport ?? 0;
                    obj["betsCasino"] = da.BetsCasino ?? 0;
                    obj["refundsCasino"] = da.RefundsCasino ?? 0;
                    obj["winsCasino"] = da.WinsCasino ?? 0;
                    obj["betsCasinoReal"] = da.BetsCasinoReal ?? 0;
                    obj["refundsCasinoReal"] = da.RefundsCasinoReal ?? 0;
                    obj["winsCasinoReal"] = da.WinsCasinoReal ?? 0;
                    obj["betsCasinoBonus"] = da.BetsCasinoBonus ?? 0;
                    obj["refundsCasinoBonus"] = da.RefundsCasinoBonus ?? 0;
                    obj["winsCasinoBonus"] = da.WinsCasinoBonus ?? 0;
                    obj["eur2gbp"] = da.EUR2GBP ?? 0;
                    obj["appBets"] = da.AppBets ?? 0;
                    obj["appRefunds"] = da.AppRefunds ?? 0;
                    obj["appWins"] = da.AppWins ?? 0;
                    obj["appBetsCasino"] = da.AppBetsCasino ?? 0;
                    obj["appRefundsCasino"] = da.AppRefundsCasino ?? 0;
                    obj["appWinsCasino"] = da.AppWinsCasino ?? 0;
                    obj["appBetsSport"] = da.AppBetsSport ?? 0;
                    obj["appRefundsSport"] = da.AppRefundsSport ?? 0;
                    obj["appWinsSport"] = da.AppWinsSport ?? 0;
                    obj["depositsLive"] = da.DepositsLive ?? 0;
                    obj["bonusesLive"] = da.BonusesLive ?? 0;
                    obj["betsLive"] = da.BetsLive ?? 0;
                    obj["refundsLive"] = da.RefundsLive ?? 0;
                    obj["winsLive"] = da.WinsLive ?? 0;
                    obj["betsLiveReal"] = da.BetsLiveReal ?? 0;
                    obj["refundsLiveReal"] = da.RefundsLiveReal ?? 0;
                    obj["winsLiveReal"] = da.WinsLiveReal ?? 0;
                    obj["betsLiveBonus"] = da.BetsLiveBonus ?? 0;
                    obj["refundsLiveBonus"] = da.RefundsLiveBonus ?? 0;
                    obj["winsLiveBonus"] = da.WinsLiveBonus ?? 0;
                    obj["depositsBingo"] = da.DepositsBingo ?? 0;
                    obj["bonusesBingo"] = da.BonusesBingo ?? 0;
                    obj["betsBingo"] = da.BetsBingo ?? 0;
                    obj["refundsBingo"] = da.RefundsBingo ?? 0;
                    obj["winsBingo"] = da.WinsBingo ?? 0;
                    obj["betsBingoReal"] = da.BetsBingoReal ?? 0;
                    obj["refundsBingoReal"] = da.RefundsBingoReal ?? 0;
                    obj["winsBingoReal"] = da.WinsBingoReal ?? 0;
                    obj["betsBingoBonus"] = da.BetsBingoBonus ?? 0;
                    obj["refundsBingoBonus"] = da.RefundsBingoBonus ?? 0;
                    obj["winsBingoBonus"] = da.WinsBingoBonus ?? 0;

                    // Add calculated properties
                    obj["ggrCasino"] = da.GGRCasino;
                    obj["ggrSport"] = da.GGRSport;
                    obj["ggrLive"] = da.GGRLive;
                    obj["ggrBingo"] = da.GGRBingo;
                    obj["totalGGR"] = da.TotalGGR;

                    return obj;
                }).ToList();

                // Get summary metrics
                var summary = await _dailyActionsService.GetSummaryMetricsAsync(start, end, whiteLabelId);

                return Ok(new
                {
                    data = result,
                    summary = new
                    {
                        totalRegistrations = summary.TotalRegistrations,
                        totalFTD = summary.TotalFTD,
                        totalDeposits = summary.TotalDeposits,
                        totalCashouts = summary.TotalCashouts,
                        totalGGR = summary.TotalGGR
                    },
                    totalCount = dailyActions.Count(),
                    startDate = start,
                    endDate = end
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily actions data");
                return StatusCode(500, new { message = "An error occurred while retrieving daily actions data" });
            }
        }

        /// <summary>
        /// Get daily actions data with comprehensive filtering
        /// </summary>
        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredDailyActions([FromBody] DailyActionFilterDto filter)
        {
            try
            {
                filter ??= new DailyActionFilterDto();

                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filtered daily actions data");
                return StatusCode(500, new { message = "An error occurred while retrieving filtered daily actions data" });
            }
        }

        /// <summary>
        /// Get metadata for daily actions report (white labels, countries, currencies, etc.)
        /// </summary>
        [HttpGet("metadata")]
        public async Task<IActionResult> GetDailyActionsMetadata()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily actions metadata");
                return StatusCode(500, new { message = "An error occurred while retrieving daily actions metadata" });
            }
        }

        /// <summary>
        /// Get a specific daily action by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDailyActionById(int id)
        {
            try
            {
                var dailyAction = await _dailyActionsService.GetDailyActionByIdAsync(id);

                if (dailyAction == null)
                {
                    return NotFound(new { message = $"Daily action with ID {id} not found" });
                }

                // Get white label name
                var whiteLabelId = dailyAction.WhiteLabelID.HasValue ? (int)dailyAction.WhiteLabelID.Value : 0;
                var whiteLabel = whiteLabelId > 0 ? await _whiteLabelService.GetWhiteLabelByIdAsync(whiteLabelId) : null;
                var whiteLabelName = whiteLabel?.Name ?? "Unknown";

                // Create a dynamic object with all properties from DailyAction
                var obj = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;

                // Add basic properties
                obj["id"] = dailyAction.Id;
                obj["date"] = dailyAction.Date;
                obj["whiteLabelId"] = whiteLabelId;
                obj["whiteLabelName"] = whiteLabelName;

                // Add all other properties from DailyAction
                obj["playerId"] = dailyAction.PlayerID;
                obj["registrations"] = dailyAction.Registration.HasValue ? (int)dailyAction.Registration.Value : 0;
                obj["ftd"] = dailyAction.FTD.HasValue ? (int)dailyAction.FTD.Value : 0;
                obj["ftda"] = dailyAction.FTDA.HasValue ? (int)dailyAction.FTDA.Value : 0;
                obj["deposits"] = dailyAction.Deposits ?? 0;
                obj["depositsCreditCard"] = dailyAction.DepositsCreditCard ?? 0;
                obj["depositsNeteller"] = dailyAction.DepositsNeteller ?? 0;
                obj["depositsMoneyBookers"] = dailyAction.DepositsMoneyBookers ?? 0;
                obj["depositsOther"] = dailyAction.DepositsOther ?? 0;
                obj["cashoutRequests"] = dailyAction.CashoutRequests ?? 0;
                obj["paidCashouts"] = dailyAction.PaidCashouts ?? 0;
                obj["chargebacks"] = dailyAction.Chargebacks ?? 0;
                obj["voids"] = dailyAction.Voids ?? 0;
                obj["reverseChargebacks"] = dailyAction.ReverseChargebacks ?? 0;
                obj["bonuses"] = dailyAction.Bonuses ?? 0;
                obj["collectedBonuses"] = dailyAction.CollectedBonuses ?? 0;
                obj["expiredBonuses"] = dailyAction.ExpiredBonuses ?? 0;
                obj["clubPointsConversion"] = dailyAction.ClubPointsConversion ?? 0;
                obj["bankRoll"] = dailyAction.BankRoll ?? 0;
                obj["sideGamesBets"] = dailyAction.SideGamesBets ?? 0;
                obj["sideGamesRefunds"] = dailyAction.SideGamesRefunds ?? 0;
                obj["sideGamesWins"] = dailyAction.SideGamesWins ?? 0;
                obj["sideGamesTableGamesBets"] = dailyAction.SideGamesTableGamesBets ?? 0;
                obj["sideGamesTableGamesWins"] = dailyAction.SideGamesTableGamesWins ?? 0;
                obj["sideGamesCasualGamesBets"] = dailyAction.SideGamesCasualGamesBets ?? 0;
                obj["sideGamesCasualGamesWins"] = dailyAction.SideGamesCasualGamesWins ?? 0;
                obj["sideGamesSlotsBets"] = dailyAction.SideGamesSlotsBets ?? 0;
                obj["sideGamesSlotsWins"] = dailyAction.SideGamesSlotsWins ?? 0;
                obj["sideGamesJackpotsBets"] = dailyAction.SideGamesJackpotsBets ?? 0;
                obj["sideGamesJackpotsWins"] = dailyAction.SideGamesJackpotsWins ?? 0;
                obj["sideGamesFeaturedBets"] = dailyAction.SideGamesFeaturedBets ?? 0;
                obj["sideGamesFeaturedWins"] = dailyAction.SideGamesFeaturedWins ?? 0;
                obj["jackpotContribution"] = dailyAction.JackpotContribution ?? 0;
                obj["lottoBets"] = dailyAction.LottoBets ?? 0;
                obj["lottoAdvancedBets"] = dailyAction.LottoAdvancedBets ?? 0;
                obj["lottoWins"] = dailyAction.LottoWins ?? 0;
                obj["lottoAdvancedWins"] = dailyAction.LottoAdvancedWins ?? 0;
                obj["insuranceContribution"] = dailyAction.InsuranceContribution ?? 0;
                obj["adjustments"] = dailyAction.Adjustments ?? 0;
                obj["adjustmentsAdd"] = dailyAction.AdjustmentsAdd ?? 0;
                obj["clearedBalance"] = dailyAction.ClearedBalance ?? 0;
                obj["revenueAdjustments"] = dailyAction.RevenueAdjustments ?? 0;
                obj["revenueAdjustmentsAdd"] = dailyAction.RevenueAdjustmentsAdd ?? 0;
                obj["updatedDate"] = dailyAction.UpdatedDate;
                obj["administrativeFee"] = dailyAction.AdministrativeFee ?? 0;
                obj["administrativeFeeReturn"] = dailyAction.AdministrativeFeeReturn ?? 0;
                obj["betsReal"] = dailyAction.BetsReal ?? 0;
                obj["betsBonus"] = dailyAction.BetsBonus ?? 0;
                obj["refundsReal"] = dailyAction.RefundsReal ?? 0;
                obj["refundsBonus"] = dailyAction.RefundsBonus ?? 0;
                obj["winsReal"] = dailyAction.WinsReal ?? 0;
                obj["winsBonus"] = dailyAction.WinsBonus ?? 0;
                obj["bonusConverted"] = dailyAction.BonusConverted ?? 0;
                obj["depositsFee"] = dailyAction.DepositsFee ?? 0;
                obj["depositsSport"] = dailyAction.DepositsSport ?? 0;
                obj["betsSport"] = dailyAction.BetsSport ?? 0;
                obj["refundsSport"] = dailyAction.RefundsSport ?? 0;
                obj["winsSport"] = dailyAction.WinsSport ?? 0;
                obj["betsSportReal"] = dailyAction.BetsSportReal ?? 0;
                obj["refundsSportReal"] = dailyAction.RefundsSportReal ?? 0;
                obj["winsSportReal"] = dailyAction.WinsSportReal ?? 0;
                obj["betsSportBonus"] = dailyAction.BetsSportBonus ?? 0;
                obj["refundsSportBonus"] = dailyAction.RefundsSportBonus ?? 0;
                obj["winsSportBonus"] = dailyAction.WinsSportBonus ?? 0;
                obj["bonusesSport"] = dailyAction.BonusesSport ?? 0;
                obj["betsCasino"] = dailyAction.BetsCasino ?? 0;
                obj["refundsCasino"] = dailyAction.RefundsCasino ?? 0;
                obj["winsCasino"] = dailyAction.WinsCasino ?? 0;
                obj["betsCasinoReal"] = dailyAction.BetsCasinoReal ?? 0;
                obj["refundsCasinoReal"] = dailyAction.RefundsCasinoReal ?? 0;
                obj["winsCasinoReal"] = dailyAction.WinsCasinoReal ?? 0;
                obj["betsCasinoBonus"] = dailyAction.BetsCasinoBonus ?? 0;
                obj["refundsCasinoBonus"] = dailyAction.RefundsCasinoBonus ?? 0;
                obj["winsCasinoBonus"] = dailyAction.WinsCasinoBonus ?? 0;
                obj["eur2gbp"] = dailyAction.EUR2GBP ?? 0;
                obj["appBets"] = dailyAction.AppBets ?? 0;
                obj["appRefunds"] = dailyAction.AppRefunds ?? 0;
                obj["appWins"] = dailyAction.AppWins ?? 0;
                obj["appBetsCasino"] = dailyAction.AppBetsCasino ?? 0;
                obj["appRefundsCasino"] = dailyAction.AppRefundsCasino ?? 0;
                obj["appWinsCasino"] = dailyAction.AppWinsCasino ?? 0;
                obj["appBetsSport"] = dailyAction.AppBetsSport ?? 0;
                obj["appRefundsSport"] = dailyAction.AppRefundsSport ?? 0;
                obj["appWinsSport"] = dailyAction.AppWinsSport ?? 0;
                obj["depositsLive"] = dailyAction.DepositsLive ?? 0;
                obj["bonusesLive"] = dailyAction.BonusesLive ?? 0;
                obj["betsLive"] = dailyAction.BetsLive ?? 0;
                obj["refundsLive"] = dailyAction.RefundsLive ?? 0;
                obj["winsLive"] = dailyAction.WinsLive ?? 0;
                obj["betsLiveReal"] = dailyAction.BetsLiveReal ?? 0;
                obj["refundsLiveReal"] = dailyAction.RefundsLiveReal ?? 0;
                obj["winsLiveReal"] = dailyAction.WinsLiveReal ?? 0;
                obj["betsLiveBonus"] = dailyAction.BetsLiveBonus ?? 0;
                obj["refundsLiveBonus"] = dailyAction.RefundsLiveBonus ?? 0;
                obj["winsLiveBonus"] = dailyAction.WinsLiveBonus ?? 0;
                obj["depositsBingo"] = dailyAction.DepositsBingo ?? 0;
                obj["bonusesBingo"] = dailyAction.BonusesBingo ?? 0;
                obj["betsBingo"] = dailyAction.BetsBingo ?? 0;
                obj["refundsBingo"] = dailyAction.RefundsBingo ?? 0;
                obj["winsBingo"] = dailyAction.WinsBingo ?? 0;
                obj["betsBingoReal"] = dailyAction.BetsBingoReal ?? 0;
                obj["refundsBingoReal"] = dailyAction.RefundsBingoReal ?? 0;
                obj["winsBingoReal"] = dailyAction.WinsBingoReal ?? 0;
                obj["betsBingoBonus"] = dailyAction.BetsBingoBonus ?? 0;
                obj["refundsBingoBonus"] = dailyAction.RefundsBingoBonus ?? 0;
                obj["winsBingoBonus"] = dailyAction.WinsBingoBonus ?? 0;

                // Add calculated properties
                obj["ggrCasino"] = dailyAction.GGRCasino;
                obj["ggrSport"] = dailyAction.GGRSport;
                obj["ggrLive"] = dailyAction.GGRLive;
                obj["ggrBingo"] = dailyAction.GGRBingo;
                obj["totalGGR"] = dailyAction.TotalGGR;

                return Ok(obj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily action with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the daily action" });
            }
        }

        /// <summary>
        /// Export daily actions data with comprehensive filtering
        /// </summary>
        [HttpPost("filter/export")]
        public async Task<IActionResult> ExportFilteredDailyActions([FromBody] DailyActionFilterDto? filter, [FromQuery] string format = "csv")
        {
            try
            {
                filter ??= new DailyActionFilterDto();

                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Default to CSV if format is not specified or not supported
                format = format?.ToLower() ?? "csv";

                if (format != "csv" && format != "xlsx" && format != "json")
                {
                    format = "csv";
                }

                // Generate file name
                string fileName = $"daily-actions-report-{DateTime.Now:yyyyMMdd-HHmmss}.{format}";

                // Export based on format
                return format switch
                {
                    "csv" => ExportToCsv(result, fileName),
                    "xlsx" => ExportToExcel(result, fileName),
                    "json" => ExportToJson(result, fileName),
                    _ => ExportToCsv(result, fileName)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting filtered daily actions data");
                return StatusCode(500, new { message = "An error occurred while exporting filtered daily actions data" });
            }
        }

        /// <summary>
        /// Export data to CSV format
        /// </summary>
        private FileContentResult ExportToCsv(DailyActionResponseDto data, string fileName)
        {
            var builder = new StringBuilder();

            // Add header
            builder.AppendLine("Date,WhiteLabel,Registrations,FTD,Deposits,Cashouts,BetsCasino,WinsCasino,BetsSport,WinsSport,BetsLive,WinsLive,BetsBingo,WinsBingo,GGRCasino,GGRSport,GGRLive,GGRBingo,TotalGGR");

            // Add data rows
            foreach (var item in data.Data)
            {
                builder.AppendLine($"{item.Date:yyyy-MM-dd},{EscapeCsvField(item.WhiteLabelName)},{item.Registrations},{item.FTD},{item.Deposits:F2},{item.PaidCashouts:F2},{item.BetsCasino:F2},{item.WinsCasino:F2},{item.BetsSport:F2},{item.WinsSport:F2},{item.BetsLive:F2},{item.WinsLive:F2},{item.BetsBingo:F2},{item.WinsBingo:F2},{item.GGRCasino:F2},{item.GGRSport:F2},{item.GGRLive:F2},{item.GGRBingo:F2},{item.TotalGGR:F2}");
            }

            // Add summary row
            builder.AppendLine($"TOTAL,{data.Data.Count} records,{data.Summary.TotalRegistrations},{data.Summary.TotalFTD},{data.Summary.TotalDeposits:F2},{data.Summary.TotalCashouts:F2},{data.Summary.TotalBetsCasino:F2},{data.Summary.TotalWinsCasino:F2},{data.Summary.TotalBetsSport:F2},{data.Summary.TotalWinsSport:F2},{data.Summary.TotalBetsLive:F2},{data.Summary.TotalWinsLive:F2},{data.Summary.TotalBetsBingo:F2},{data.Summary.TotalWinsBingo:F2},,,,,{data.Summary.TotalGGR:F2}");

            byte[] bytes = Encoding.UTF8.GetBytes(builder.ToString());
            return File(bytes, "text/csv", fileName);
        }

        /// <summary>
        /// Export data to Excel format using EPPlus
        /// </summary>
        private FileContentResult ExportToExcel(DailyActionResponseDto data, string fileName)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Daily Actions");

            // Add header with styling
            string[] headers =
            [
                "Date", "White Label", "Registrations", "FTD", "Deposits", "Cashouts",
                "Bets Casino", "Wins Casino", "Bets Sport", "Wins Sport",
                "Bets Live", "Wins Live", "Bets Bingo", "Wins Bingo",
                "GGR Casino", "GGR Sport", "GGR Live", "GGR Bingo", "Total GGR"
            ];

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
            }

            // Style the header row
            using (var range = worksheet.Cells[1, 1, 1, headers.Length])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
            }

            // Add data rows
            int row = 2;
            foreach (var item in data.Data)
            {
                worksheet.Cells[row, 1].Value = item.Date.ToString("yyyy-MM-dd");
                worksheet.Cells[row, 2].Value = item.WhiteLabelName;
                worksheet.Cells[row, 3].Value = item.Registrations;
                worksheet.Cells[row, 4].Value = item.FTD;
                worksheet.Cells[row, 5].Value = item.Deposits;
                worksheet.Cells[row, 6].Value = item.PaidCashouts;
                worksheet.Cells[row, 7].Value = item.BetsCasino;
                worksheet.Cells[row, 8].Value = item.WinsCasino;
                worksheet.Cells[row, 9].Value = item.BetsSport;
                worksheet.Cells[row, 10].Value = item.WinsSport;
                worksheet.Cells[row, 11].Value = item.BetsLive;
                worksheet.Cells[row, 12].Value = item.WinsLive;
                worksheet.Cells[row, 13].Value = item.BetsBingo;
                worksheet.Cells[row, 14].Value = item.WinsBingo;
                worksheet.Cells[row, 15].Value = item.GGRCasino;
                worksheet.Cells[row, 16].Value = item.GGRSport;
                worksheet.Cells[row, 17].Value = item.GGRLive;
                worksheet.Cells[row, 18].Value = item.GGRBingo;
                worksheet.Cells[row, 19].Value = item.TotalGGR;

                row++;
            }

            // Add summary row
            worksheet.Cells[row, 1].Value = "TOTAL";
            worksheet.Cells[row, 2].Value = $"{data.Data.Count} records";
            worksheet.Cells[row, 3].Value = data.Summary.TotalRegistrations;
            worksheet.Cells[row, 4].Value = data.Summary.TotalFTD;
            worksheet.Cells[row, 5].Value = data.Summary.TotalDeposits;
            worksheet.Cells[row, 6].Value = data.Summary.TotalCashouts;
            worksheet.Cells[row, 7].Value = data.Summary.TotalBetsCasino;
            worksheet.Cells[row, 8].Value = data.Summary.TotalWinsCasino;
            worksheet.Cells[row, 9].Value = data.Summary.TotalBetsSport;
            worksheet.Cells[row, 10].Value = data.Summary.TotalWinsSport;
            worksheet.Cells[row, 11].Value = data.Summary.TotalBetsLive;
            worksheet.Cells[row, 12].Value = data.Summary.TotalWinsLive;
            worksheet.Cells[row, 13].Value = data.Summary.TotalBetsBingo;
            worksheet.Cells[row, 14].Value = data.Summary.TotalWinsBingo;
            worksheet.Cells[row, 19].Value = data.Summary.TotalGGR;

            // Style the summary row
            using (var range = worksheet.Cells[row, 1, row, headers.Length])
            {
                range.Style.Font.Bold = true;
                range.Style.Border.Top.Style = ExcelBorderStyle.Medium;
            }

            // Format numeric columns
            using (var range = worksheet.Cells[2, 5, row, 19])
            {
                range.Style.Numberformat.Format = "#,##0.00";
            }

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();

            // Convert to byte array
            var excelData = package.GetAsByteArray();

            return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        /// <summary>
        /// Export data to JSON format
        /// </summary>
        private FileContentResult ExportToJson(DailyActionResponseDto data, string fileName)
        {
            string json = JsonSerializer.Serialize(data, _jsonOptions);

            byte[] bytes = Encoding.UTF8.GetBytes(json);
            return File(bytes, "application/json", fileName);
        }

        /// <summary>
        /// Escape CSV field to handle commas and quotes
        /// </summary>
        private static string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;

            if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
            {
                // Escape quotes by doubling them and wrap in quotes
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }

        /// <summary>
        /// Test endpoint to verify that the WhiteLabelService is working correctly
        /// </summary>
        [HttpGet("test-white-labels")]
        public async Task<IActionResult> TestWhiteLabels()
        {
            try
            {
                // Get all white labels
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);

                // Return the white labels
                return Ok(new
                {
                    count = whiteLabels.Count(),
                    whiteLabels = whiteLabels.Select(wl => new
                    {
                        id = wl.Id,
                        name = wl.Name,
                        code = wl.Code,
                        isActive = wl.IsActive ?? false
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing white labels");
                return StatusCode(500, new { message = "An error occurred while testing white labels", error = ex.Message });
            }
        }

        /// <summary>
        /// Test endpoint to check cache status
        /// </summary>
        [HttpGet("cache-test")]
        [AllowAnonymous] // Allow anonymous access for testing
        public IActionResult TestCache()
        {
            // Get the memory cache instance hash code
            var cacheHashCode = _memoryCache.GetHashCode();

            // Get the service instance hash code
            var serviceHashCode = _dailyActionsService.GetHashCode();

            // Create a test cache entry
            string testKey = "DailyActions_CacheTest";
            var testValue = DateTime.UtcNow;

            // Set the test value in cache
            _memoryCache.Set(testKey, testValue, TimeSpan.FromMinutes(5));

            // Try to retrieve it immediately
            bool retrievedSuccessfully = _memoryCache.TryGetValue(testKey, out DateTime? retrievedValue);

            return Ok(new
            {
                cacheStatus = "Active",
                cacheHashCode,
                serviceHashCode,
                testKey,
                testValue,
                retrievedSuccessfully,
                retrievedValue,
                timeDifference = retrievedSuccessfully && retrievedValue.HasValue ? (DateTime.UtcNow - retrievedValue.Value).TotalMilliseconds : 0,
                message = "If retrievedSuccessfully is true and timeDifference is small, the cache is working correctly."
            });
        }

        /// <summary>
        /// Clear all caches related to daily actions
        /// </summary>
        [HttpPost("clear-cache")]
        [AllowAnonymous] // Allow anonymous access for testing
        public IActionResult ClearCache()
        {
            try
            {
                // Get the memory cache instance hash code before clearing
                var cacheHashCode = _memoryCache.GetHashCode();

                // Get the service instance hash code
                var serviceHashCode = _dailyActionsService.GetHashCode();

                // Clear all caches
                _dailyActionsService.ClearAllCaches();

                // Create a test cache entry to verify the cache is still working
                string testKey = "DailyActions_CacheTest_AfterClear";
                var testValue = DateTime.UtcNow;

                // Set the test value in cache
                _memoryCache.Set(testKey, testValue, TimeSpan.FromMinutes(5));

                // Try to retrieve it immediately
                bool retrievedSuccessfully = _memoryCache.TryGetValue(testKey, out DateTime? retrievedValue);

                return Ok(new
                {
                    message = "All daily actions caches cleared successfully",
                    cacheHashCode,
                    serviceHashCode,
                    cacheStillWorking = retrievedSuccessfully,
                    testValue,
                    retrievedValue
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache");
                return StatusCode(500, new { message = "An error occurred while clearing the cache", error = ex.Message });
            }
        }

        /// <summary>
        /// Clear cache for a specific date range
        /// </summary>
        [HttpPost("clear-cache-range")]
        [AllowAnonymous]
        public IActionResult ClearCacheRange([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] int? whiteLabelId = null)
        {
            try
            {
                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var start = startDate?.Date ?? yesterday;
                var end = endDate?.Date ?? today;

                _logger.LogInformation("Clearing cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    start, end, whiteLabelId);

                bool result = _dailyActionsService.ClearCacheForDateRange(start, end, whiteLabelId);

                return Ok(new
                {
                    success = result,
                    message = result ? "Cache cleared successfully" : "Failed to clear cache",
                    startDate = start,
                    endDate = end,
                    whiteLabelId = whiteLabelId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    startDate, endDate, whiteLabelId);
                return StatusCode(500, new { message = "An error occurred while clearing the cache", error = ex.Message });
            }
        }

        /// <summary>
        /// Test endpoint to diagnose caching issues
        /// </summary>
        [HttpGet("test-cache")]
        [AllowAnonymous]
        public async Task<IActionResult> TestCache([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var start = startDate?.Date ?? yesterday;
                var end = endDate?.Date ?? today;

                // Create the cache key that will be used
                string cacheKey = $"DailyActions_Data_{start:yyyyMMdd}_{end:yyyyMMdd}_all";

                _logger.LogInformation("TEST CACHE: Starting cache test for date range {StartDate} to {EndDate}, cache key: {CacheKey}",
                    start, end, cacheKey);

                // Check if the data is already in the cache before the first call
                bool initialCacheCheck = false;
                IEnumerable<DailyAction>? initialCachedResult = null;

                if (_memoryCache is PPrePorter.Core.Interfaces.IGlobalCacheService globalCache)
                {
                    initialCacheCheck = globalCache.TryGetValue(cacheKey, out initialCachedResult);
                    _logger.LogInformation("TEST CACHE: Initial cache check - key exists: {Exists}, value is null: {IsNull}",
                        initialCacheCheck, initialCachedResult == null);
                }

                // First call - should be a cache miss if not already in cache
                _logger.LogInformation("TEST CACHE: First call - should be a cache miss if not already in cache");
                var stopwatch1 = System.Diagnostics.Stopwatch.StartNew();
                var result1 = await _dailyActionsService.GetDailyActionsAsync(start, end);
                stopwatch1.Stop();
                _logger.LogInformation("TEST CACHE: First call completed in {ElapsedMs}ms, retrieved {Count} items",
                    stopwatch1.ElapsedMilliseconds, result1.Count());

                // Check if the data is in the cache after the first call
                bool afterFirstCallCheck = false;
                IEnumerable<DailyAction>? afterFirstCallResult = null;

                if (_memoryCache is PPrePorter.Core.Interfaces.IGlobalCacheService globalCache2)
                {
                    afterFirstCallCheck = globalCache2.TryGetValue(cacheKey, out afterFirstCallResult);
                    _logger.LogInformation("TEST CACHE: After first call - key exists: {Exists}, value is null: {IsNull}, count: {Count}",
                        afterFirstCallCheck, afterFirstCallResult == null, afterFirstCallResult?.Count() ?? 0);
                }

                // Second call - should be a cache hit
                _logger.LogInformation("TEST CACHE: Second call - should be a cache hit");
                var stopwatch2 = System.Diagnostics.Stopwatch.StartNew();
                var result2 = await _dailyActionsService.GetDailyActionsAsync(start, end);
                stopwatch2.Stop();
                _logger.LogInformation("TEST CACHE: Second call completed in {ElapsedMs}ms, retrieved {Count} items",
                    stopwatch2.ElapsedMilliseconds, result2.Count());

                // Check if the results are the same objects (reference equality)
                bool sameReference = Object.ReferenceEquals(result1, result2);
                _logger.LogInformation("TEST CACHE: Results have same reference: {SameReference}", sameReference);

                // Check if the first items have the same IDs
                var firstItem1 = result1.FirstOrDefault();
                var firstItem2 = result2.FirstOrDefault();
                bool sameFirstItemId = firstItem1 != null && firstItem2 != null && firstItem1.Id == firstItem2.Id;
                _logger.LogInformation("TEST CACHE: First items have same ID: {SameFirstItemId}, ID1: {Id1}, ID2: {Id2}",
                    sameFirstItemId, firstItem1?.Id, firstItem2?.Id);

                // Get cache statistics
                var cacheService = _memoryCache as PPrePorter.Core.Interfaces.IGlobalCacheService;
                var cacheStats = cacheService?.GetStatistics() ?? new Dictionary<string, object>();

                // Get all cache keys for debugging
                var cacheKeys = cacheService?.GetAllKeys() ?? new List<string>();

                // Filter keys to find any related to DailyActions
                var dailyActionsKeys = cacheKeys.Where(k => k.Contains("DailyActions")).ToList();

                _logger.LogInformation("TEST CACHE: Found {TotalCount} total cache keys, {DailyActionsCount} related to DailyActions",
                    cacheKeys.Count, dailyActionsKeys.Count);

                // Calculate time difference and determine if cache is working
                var timeDifference = stopwatch1.ElapsedMilliseconds - stopwatch2.ElapsedMilliseconds;
                var cacheStatus = "inactive";

                if (afterFirstCallCheck && timeDifference > 100)
                {
                    cacheStatus = "active";
                }
                else if (afterFirstCallCheck && timeDifference <= 100)
                {
                    cacheStatus = "suspicious";
                }

                return Ok(new
                {
                    cacheStatus = cacheStatus,
                    secondCallMs = $"{stopwatch2.ElapsedMilliseconds}ms",
                    firstCallMs = $"{stopwatch1.ElapsedMilliseconds}ms",
                    testKey = cacheKey,
                    testValue = start.ToString("o"),
                    retrievedSuccessfully = afterFirstCallCheck,
                    startDate = start.ToString("o"),
                    timeDifference = $"{timeDifference}ms",
                    sameReference = sameReference,
                    sameFirstItemId = sameFirstItemId,
                    initialCacheCheck = initialCacheCheck,
                    afterFirstCallCheck = afterFirstCallCheck,
                    itemCount = result1.Count(),
                    cacheCount = cacheService?.GetCount() ?? 0,
                    dailyActionsCacheKeys = dailyActionsKeys,
                    totalCacheKeys = cacheKeys.Count,
                    message = "If retrievedSuccessfully is true and timeDifference is large, the cache is working correctly."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test cache endpoint");
                return StatusCode(500, new { message = "An error occurred in test cache endpoint", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all cache keys for debugging
        /// </summary>
        [HttpGet("cache-keys")]
        [AllowAnonymous]
        public IActionResult GetCacheKeys()
        {
            try
            {
                var cacheService = _memoryCache as PPrePorter.Core.Interfaces.IGlobalCacheService;
                if (cacheService == null)
                {
                    return BadRequest("Memory cache is not an IGlobalCacheService");
                }

                var allKeys = cacheService.GetAllKeys();
                var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();
                var cacheStats = cacheService.GetStatistics();

                return Ok(new
                {
                    totalCacheKeys = allKeys.Count,
                    dailyActionsCacheKeys = dailyActionsKeys,
                    cacheStats = cacheStats,
                    cacheServiceHashCode = cacheService.GetHashCode()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache keys");
                return StatusCode(500, new { message = "An error occurred while getting cache keys", error = ex.Message });
            }
        }

        /// <summary>
        /// Prewarm the cache with commonly accessed data
        /// </summary>
        [HttpPost("prewarm-cache")]
        [AllowAnonymous]
        public async Task<IActionResult> PrewarmCache()
        {
            try
            {
                _logger.LogInformation("Starting cache prewarming...");

                // Get the cache service hash code for debugging
                var cacheService = _memoryCache as PPrePorter.Core.Interfaces.IGlobalCacheService;
                var cacheServiceHashCode = cacheService?.GetHashCode() ?? 0;

                // Get cache statistics before prewarming
                var statsBefore = cacheService?.GetStatistics() ?? new Dictionary<string, object>();

                // Start the stopwatch
                var stopwatch = System.Diagnostics.Stopwatch.StartNew();

                // Call the prewarm method
                await _dailyActionsService.PrewarmCacheAsync();

                // Stop the stopwatch
                stopwatch.Stop();

                // Get cache statistics after prewarming
                var statsAfter = cacheService?.GetStatistics() ?? new Dictionary<string, object>();

                // Get all cache keys after prewarming
                var allKeys = cacheService?.GetAllKeys() ?? new List<string>();
                var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();

                return Ok(new
                {
                    message = "Cache prewarming completed successfully",
                    elapsedMs = stopwatch.ElapsedMilliseconds,
                    cacheServiceHashCode,
                    statsBefore,
                    statsAfter,
                    totalCacheKeys = allKeys.Count,
                    dailyActionsCacheKeys = dailyActionsKeys
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming cache");
                return StatusCode(500, new { message = "An error occurred while prewarming cache", error = ex.Message });
            }
        }

        /// <summary>
        /// Test endpoint to diagnose caching issues with a specific date range
        /// </summary>
        [HttpGet("test-cache-dates")]
        [AllowAnonymous]
        public async Task<IActionResult> TestCacheWithDates([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                _logger.LogInformation("TEST CACHE DATES: Starting cache test for specific date range {StartDate} to {EndDate}",
                    startDate, endDate);

                // Create the cache key that will be used
                string cacheKey = $"DailyActions_Data_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_all";

                // First, clear the cache for this date range
                bool clearResult = _dailyActionsService.ClearCacheForDateRange(startDate, endDate);
                _logger.LogInformation("TEST CACHE DATES: Cleared cache for date range {StartDate} to {EndDate}, cache key: {CacheKey}, result: {Result}",
                    startDate, endDate, cacheKey, clearResult);

                // First call - should be a cache miss
                _logger.LogInformation("TEST CACHE DATES: First call - should be a cache miss");
                var stopwatch1 = System.Diagnostics.Stopwatch.StartNew();
                var result1 = await _dailyActionsService.GetDailyActionsAsync(startDate, endDate);
                stopwatch1.Stop();
                _logger.LogInformation("TEST CACHE DATES: First call completed in {ElapsedMs}ms, retrieved {Count} items",
                    stopwatch1.ElapsedMilliseconds, result1.Count());

                // Check if the data is in the cache after the first call
                var cacheService = _memoryCache as PPrePorter.Core.Interfaces.IGlobalCacheService;
                bool afterFirstCallCheck = false;
                IEnumerable<DailyAction>? afterFirstCallResult = null;

                if (cacheService != null)
                {
                    afterFirstCallCheck = cacheService.TryGetValue(cacheKey, out afterFirstCallResult);
                    _logger.LogInformation("TEST CACHE DATES: After first call - key exists: {Exists}, value is null: {IsNull}, count: {Count}",
                        afterFirstCallCheck, afterFirstCallResult == null, afterFirstCallResult?.Count() ?? 0);

                    // Get all cache keys
                    var allKeys = cacheService.GetAllKeys();
                    var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();
                    _logger.LogInformation("TEST CACHE DATES: Found {TotalCount} total cache keys, {DailyActionsCount} related to DailyActions",
                        allKeys.Count, dailyActionsKeys.Count);
                }

                // Second call - should be a cache hit
                _logger.LogInformation("TEST CACHE DATES: Second call - should be a cache hit");
                var stopwatch2 = System.Diagnostics.Stopwatch.StartNew();
                var result2 = await _dailyActionsService.GetDailyActionsAsync(startDate, endDate);
                stopwatch2.Stop();
                _logger.LogInformation("TEST CACHE DATES: Second call completed in {ElapsedMs}ms, retrieved {Count} items",
                    stopwatch2.ElapsedMilliseconds, result2.Count());

                // Calculate time difference and determine if cache is working
                var timeDifference = stopwatch1.ElapsedMilliseconds - stopwatch2.ElapsedMilliseconds;
                var cacheStatus = "inactive";

                if (afterFirstCallCheck && timeDifference > 100)
                {
                    cacheStatus = "active";
                }
                else if (afterFirstCallCheck && timeDifference <= 100)
                {
                    cacheStatus = "suspicious";
                }

                return Ok(new
                {
                    cacheStatus = cacheStatus,
                    secondCallMs = $"{stopwatch2.ElapsedMilliseconds}ms",
                    firstCallMs = $"{stopwatch1.ElapsedMilliseconds}ms",
                    testKey = cacheKey,
                    startDate = startDate.ToString("o"),
                    endDate = endDate.ToString("o"),
                    timeDifference = $"{timeDifference}ms",
                    retrievedSuccessfully = afterFirstCallCheck,
                    itemCount = result1.Count(),
                    message = "If retrievedSuccessfully is true and timeDifference is large, the cache is working correctly."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test cache dates endpoint");
                return StatusCode(500, new { message = "An error occurred in test cache dates endpoint", error = ex.Message });
            }
        }
    }
}
