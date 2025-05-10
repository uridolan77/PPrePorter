using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Partial class for DailyActionsController containing data retrieval endpoints
    /// </summary>
    public partial class DailyActionsController
    {

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
        /// Get a specific daily action by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDailyActionById(long id)
        {
            try
            {
                // Convert long to int if necessary for the service method
                var dailyAction = await _dailyActionsService.GetDailyActionByIdAsync((int)id);

                if (dailyAction == null)
                {
                    return NotFound(new { message = $"Daily action with ID {id} not found" });
                }

                // Get white label name
                var whiteLabelId = dailyAction.WhiteLabelID.HasValue ? (int)dailyAction.WhiteLabelID.Value : 0;
                var whiteLabel = whiteLabelId > 0 ? await _whiteLabelService.GetWhiteLabelByIdAsync(whiteLabelId) : null;
                var whiteLabelName = whiteLabel?.Name ?? "Unknown";

                // Create a dynamic object with all properties from DailyAction
                var obj = new ExpandoObject() as IDictionary<string, object>;

                // Add basic properties
                obj["id"] = dailyAction.Id;
                obj["date"] = dailyAction.Date;
                obj["whiteLabelId"] = whiteLabelId;
                obj["whiteLabelName"] = whiteLabelName;
                obj["playerId"] = dailyAction.PlayerID;

                // Add calculated GGR properties
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
    }
}
