using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Reports.Controllers
{
    [ApiController]
    [Route("api/reports/daily-actions")]
    [Authorize]
    public class DailyActionsController : ControllerBase
    {
        private readonly IDailyActionsService _dailyActionsService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly ILogger<DailyActionsController> _logger;

        public DailyActionsController(
            IDailyActionsService dailyActionsService,
            IWhiteLabelService whiteLabelService,
            ILogger<DailyActionsController> logger)
        {
            _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get daily actions data based on filters
        /// </summary>
        [HttpGet("data")]
        public async Task<IActionResult> GetDailyActionsData(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? whiteLabelId = null)
        {
            try
            {
                // Default date range to last 30 days if not specified
                var today = DateTime.UtcNow.Date;
                var start = startDate?.Date ?? today.AddDays(-30);
                var end = endDate?.Date ?? today;

                // Get daily actions data
                var dailyActions = await _dailyActionsService.GetDailyActionsAsync(start, end, whiteLabelId);

                var result = dailyActions.Select(da => new
                {
                    id = da.Id,
                    date = da.Date,
                    whiteLabelId = da.WhiteLabelID,
                    whiteLabelName = "Unknown", // WhiteLabel navigation property is not available
                    registrations = da.Registration,
                    ftd = da.FTD,
                    deposits = da.Deposits ?? 0,
                    paidCashouts = da.PaidCashouts ?? 0,
                    betsCasino = da.BetsCasino ?? 0,
                    winsCasino = da.WinsCasino ?? 0,
                    betsSport = da.BetsSport ?? 0,
                    winsSport = da.WinsSport ?? 0,
                    betsLive = da.BetsLive ?? 0,
                    winsLive = da.WinsLive ?? 0,
                    betsBingo = da.BetsBingo ?? 0,
                    winsBingo = da.WinsBingo ?? 0,
                    // GGR (Gross Gaming Revenue)
                    ggrCasino = da.GGRCasino,
                    ggrSport = da.GGRSport,
                    ggrLive = da.GGRLive,
                    ggrBingo = da.GGRBingo,
                    totalGGR = da.TotalGGR
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
                    totalCount = result.Count(),
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
        /// Get metadata for daily actions report (white labels, etc.)
        /// </summary>
        [HttpGet("metadata")]
        public async Task<IActionResult> GetDailyActionsMetadata()
        {
            try
            {
                // Get white labels
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync();

                var whiteLabelsResponse = whiteLabels.Select(wl => new
                {
                    id = wl.Id,
                    name = wl.Name,
                    description = wl.Description
                }).ToList();

                return Ok(new
                {
                    whiteLabels = whiteLabelsResponse
                });
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

                return Ok(new
                {
                    id = dailyAction.Id,
                    date = dailyAction.Date,
                    whiteLabelId = dailyAction.WhiteLabelID,
                    whiteLabelName = "Unknown", // WhiteLabel navigation property is not available
                    registrations = dailyAction.Registration,
                    ftd = dailyAction.FTD,
                    deposits = dailyAction.Deposits ?? 0,
                    paidCashouts = dailyAction.PaidCashouts ?? 0,
                    betsCasino = dailyAction.BetsCasino ?? 0,
                    winsCasino = dailyAction.WinsCasino ?? 0,
                    betsSport = dailyAction.BetsSport ?? 0,
                    winsSport = dailyAction.WinsSport ?? 0,
                    betsLive = dailyAction.BetsLive ?? 0,
                    winsLive = dailyAction.WinsLive ?? 0,
                    betsBingo = dailyAction.BetsBingo ?? 0,
                    winsBingo = dailyAction.WinsBingo ?? 0,
                    ggrCasino = dailyAction.GGRCasino,
                    ggrSport = dailyAction.GGRSport,
                    ggrLive = dailyAction.GGRLive,
                    ggrBingo = dailyAction.GGRBingo,
                    totalGGR = dailyAction.TotalGGR
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily action with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the daily action" });
            }
        }
    }
}
