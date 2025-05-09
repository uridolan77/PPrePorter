using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        ILogger<DailyActionsController> logger) : ControllerBase
    {
        private readonly IDailyActionsService _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
        private readonly IWhiteLabelService _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
        private readonly ILogger<DailyActionsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Get daily actions data with basic filters (legacy endpoint)
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

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                var result = dailyActions.Select(da => new
                {
                    id = da.Id,
                    date = da.Date,
                    whiteLabelId = da.WhiteLabelID,
                    whiteLabelName = whiteLabelDict.TryGetValue(da.WhiteLabelID, out var name) ? name : "Unknown",
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
                    totalCount = result.Count,
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
                var whiteLabel = await _whiteLabelService.GetWhiteLabelByIdAsync(dailyAction.WhiteLabelID);
                var whiteLabelName = whiteLabel?.Name ?? "Unknown";

                return Ok(new
                {
                    id = dailyAction.Id,
                    date = dailyAction.Date,
                    whiteLabelId = dailyAction.WhiteLabelID,
                    whiteLabelName = whiteLabelName,
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
                        description = wl.Description,
                        isActive = wl.IsActive
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing white labels");
                return StatusCode(500, new { message = "An error occurred while testing white labels", error = ex.Message });
            }
        }
    }
}
