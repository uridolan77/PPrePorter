using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Text.Json;

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
    }
}
