using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.API.Features.Reports.Models;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IReportConfigurationService _configService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(
            IReportService reportService,
            IReportConfigurationService configService,
            IUserContextService userContextService,
            ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _configService = configService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetReportTemplates()
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var templates = await _configService.GetAvailableReportTemplatesAsync(currentUser);
                
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates");
                return StatusCode(500, new { message = "An error occurred while retrieving report templates" });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateReport([FromBody] ReportRequestDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Invalid report request" });
                }

                var currentUser = _userContextService.GetCurrentUser();
                var result = await _reportService.GenerateReportAsync(request, currentUser.Id);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                return StatusCode(500, new { message = "An error occurred while generating the report" });
            }
        }

        [HttpGet("{reportId}")]
        public async Task<IActionResult> GetReport(string reportId)
        {
            try
            {
                if (string.IsNullOrEmpty(reportId))
                {
                    return BadRequest(new { message = "Report ID is required" });
                }

                var currentUser = _userContextService.GetCurrentUser();
                var report = await _reportService.GetReportAsync(reportId, currentUser.Id);
                
                if (report == null)
                {
                    return NotFound(new { message = "Report not found" });
                }
                
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report {ReportId}", reportId);
                return StatusCode(500, new { message = "An error occurred while retrieving the report" });
            }
        }

        [HttpPost("export/{reportId}")]
        public async Task<IActionResult> ExportReport(string reportId, [FromBody] ExportRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(reportId))
                {
                    return BadRequest(new { message = "Report ID is required" });
                }

                var currentUser = _userContextService.GetCurrentUser();
                var result = await _reportService.ExportReportAsync(reportId, request.Format, currentUser);
                
                if (result == null)
                {
                    return NotFound(new { message = "Report not found" });
                }
                
                // Return a temporary URL to the exported file
                return Ok(new { fileUrl = result.FileUrl, fileName = result.FileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report {ReportId}", reportId);
                return StatusCode(500, new { message = "An error occurred while exporting the report" });
            }
        }
        
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentReports([FromQuery] int limit = 10)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var reports = await _reportService.GetRecentReportsAsync(currentUser.Id, limit);
                
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent reports");
                return StatusCode(500, new { message = "An error occurred while retrieving recent reports" });
            }
        }
    }
}