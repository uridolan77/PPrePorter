using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Models.Reports;
using Microsoft.EntityFrameworkCore;

namespace PPrePorter.API.Features.Reports
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ScheduledReportController : ControllerBase
    {
        private readonly IReportConfigurationService _configService;
        private readonly IUserContextService _userContextService;

        private readonly ILogger<ScheduledReportController> _logger;

        public ScheduledReportController(
            IReportConfigurationService configService,
            IUserContextService userContextService,
            ILogger<ScheduledReportController> logger)
        {
            _configService = configService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetScheduledReports()
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                var scheduledReports = await _configService.GetScheduledReportsAsync(currentUser.Id);

                return Ok(scheduledReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scheduled reports");
                return StatusCode(500, new { message = "An error occurred while retrieving scheduled reports" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ScheduleReport([FromBody] ScheduledReport scheduledReport)
        {
            try
            {
                if (string.IsNullOrEmpty(scheduledReport.Name))
                {
                    return BadRequest(new { message = "Schedule name is required" });
                }

                if (string.IsNullOrEmpty(scheduledReport.ConfigurationId))
                {
                    return BadRequest(new { message = "Report configuration ID is required" });
                }

                var currentUser = await _userContextService.GetCurrentUserAsync();

                // Verify configuration exists and belongs to user
                var configuration = await _configService.GetConfigurationByIdAsync(scheduledReport.ConfigurationId);
                if (configuration == null || configuration.UserId != currentUser.Id)
                {
                    return BadRequest(new { message = "Invalid configuration ID" });
                }

                // Set user ID
                scheduledReport.UserId = currentUser.Id;

                // Let the service handle ID generation

                var result = await _configService.ScheduleReportAsync(scheduledReport);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report");
                return StatusCode(500, new { message = "An error occurred while scheduling report" });
            }
        }

        [HttpPut("{scheduleId}")]
        public async Task<IActionResult> UpdateScheduledReport(string scheduleId, [FromBody] ScheduledReport scheduledReport)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();

                // Get the schedule from the service
                var schedules = await _configService.GetScheduledReportsAsync(currentUser.Id);
                var existingSchedule = schedules.FirstOrDefault(s => s.Id.ToString() == scheduleId);

                if (existingSchedule == null)
                {
                    return NotFound(new { message = "Scheduled report not found" });
                }

                // Update properties
                existingSchedule.Name = scheduledReport.Name;
                existingSchedule.Frequency = scheduledReport.Frequency;
                existingSchedule.TimeOfDay = scheduledReport.TimeOfDay;
                existingSchedule.DayOfWeek = scheduledReport.DayOfWeek;
                existingSchedule.DayOfMonth = scheduledReport.DayOfMonth;
                existingSchedule.CronExpression = scheduledReport.CronExpression;
                existingSchedule.StartDate = scheduledReport.StartDate;
                existingSchedule.EndDate = scheduledReport.EndDate;
                existingSchedule.IsActive = scheduledReport.IsActive;
                existingSchedule.NotificationType = scheduledReport.NotificationType;
                existingSchedule.NotificationDestination = scheduledReport.NotificationDestination;
                existingSchedule.ExportFormat = scheduledReport.ExportFormat;

                await _configService.UpdateScheduledReportAsync(existingSchedule);

                return Ok(existingSchedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating scheduled report {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "An error occurred while updating scheduled report" });
            }
        }

        [HttpDelete("{scheduleId}")]
        public async Task<IActionResult> DeleteScheduledReport(string scheduleId)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                await _configService.DeleteScheduledReportAsync(scheduleId, currentUser.Id);

                return Ok(new { message = "Scheduled report deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting scheduled report {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "An error occurred while deleting scheduled report" });
            }
        }

        [HttpGet("{scheduleId}/executions")]
        public async Task<IActionResult> GetReportExecutions(string scheduleId, [FromQuery] int limit = 10)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();

                // Get the schedule from the service
                var schedules = await _configService.GetScheduledReportsAsync(currentUser.Id);
                var schedule = schedules.FirstOrDefault(s => s.Id.ToString() == scheduleId);

                if (schedule == null)
                {
                    return NotFound(new { message = "Scheduled report not found" });
                }

                var executions = await _configService.GetReportExecutionsAsync(scheduleId, limit);

                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report executions for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "An error occurred while retrieving report executions" });
            }
        }
    }
}