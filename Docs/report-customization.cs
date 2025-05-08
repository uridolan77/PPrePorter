// Report Customization and Scheduling Implementation

// --------------------------
// 1. Backend Report Configuration Services
// --------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using ProgressPlay.Reporting.Core.Data;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Security.Services;
using System.Text.Json;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface IReportConfigurationService
    {
        Task<List<ReportTemplate>> GetAvailableReportTemplatesAsync(User user);
        Task<List<ReportConfiguration>> GetSavedConfigurationsAsync(string userId);
        Task<ReportConfiguration> GetConfigurationByIdAsync(string configId);
        Task<ReportConfiguration> SaveConfigurationAsync(ReportConfiguration configuration);
        Task UpdateConfigurationAsync(ReportConfiguration configuration);
        Task DeleteConfigurationAsync(string configId, string userId);
        Task<List<ScheduledReport>> GetScheduledReportsAsync(string userId);
        Task<ScheduledReport> ScheduleReportAsync(ScheduledReport scheduledReport);
        Task UpdateScheduledReportAsync(ScheduledReport scheduledReport);
        Task DeleteScheduledReportAsync(string scheduleId, string userId);
        Task<List<ReportExecution>> GetReportExecutionsAsync(string scheduleId, int limit = 10);
    }

    public class ReportConfigurationService : IReportConfigurationService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IDataFilterService _dataFilterService;
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly ILogger<ReportConfigurationService> _logger;

        public ReportConfigurationService(
            ApplicationDbContext dbContext,
            IDataFilterService dataFilterService,
            ISchedulerFactory schedulerFactory,
            ILogger<ReportConfigurationService> logger)
        {
            _dbContext = dbContext;
            _dataFilterService = dataFilterService;
            _schedulerFactory = schedulerFactory;
            _logger = logger;
        }

        public async Task<List<ReportTemplate>> GetAvailableReportTemplatesAsync(User user)
        {
            try
            {
                // Get all templates
                var templates = await _dbContext.ReportTemplates
                    .Where(t => t.IsActive)
                    .OrderBy(t => t.DisplayOrder)
                    .AsNoTracking()
                    .ToListAsync();

                // Apply user role filtering if needed
                if (user.Role != Security.Models.Role.Admin)
                {
                    // Exclude admin-only templates for non-admin users
                    templates = templates.Where(t => !t.AdminOnly).ToList();
                }

                return templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates for user {UserId}", user.Id);
                throw;
            }
        }

        public async Task<List<ReportConfiguration>> GetSavedConfigurationsAsync(string userId)
        {
            try
            {
                return await _dbContext.ReportConfigurations
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.LastUsedAt ?? c.CreatedAt)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved configurations for user {UserId}", userId);
                throw;
            }
        }

        public async Task<ReportConfiguration> GetConfigurationByIdAsync(string configId)
        {
            try
            {
                return await _dbContext.ReportConfigurations
                    .FirstOrDefaultAsync(c => c.Id == configId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration {ConfigId}", configId);
                throw;
            }
        }

        public async Task<ReportConfiguration> SaveConfigurationAsync(ReportConfiguration configuration)
        {
            try
            {
                // Set creation date
                configuration.CreatedAt = DateTime.UtcNow;
                
                // Add to database
                _dbContext.ReportConfigurations.Add(configuration);
                await _dbContext.SaveChangesAsync();
                
                return configuration;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving report configuration for user {UserId}", configuration.UserId);
                throw;
            }
        }

        public async Task UpdateConfigurationAsync(ReportConfiguration configuration)
        {
            try
            {
                // Update last used time
                configuration.LastUsedAt = DateTime.UtcNow;
                
                // Update in database
                _dbContext.ReportConfigurations.Update(configuration);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating configuration {ConfigId}", configuration.Id);
                throw;
            }
        }

        public async Task DeleteConfigurationAsync(string configId, string userId)
        {
            try
            {
                var configuration = await _dbContext.ReportConfigurations
                    .FirstOrDefaultAsync(c => c.Id == configId && c.UserId == userId);
                
                if (configuration != null)
                {
                    _dbContext.ReportConfigurations.Remove(configuration);
                    await _dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {ConfigId} for user {UserId}", configId, userId);
                throw;
            }
        }

        public async Task<List<ScheduledReport>> GetScheduledReportsAsync(string userId)
        {
            try
            {
                return await _dbContext.ScheduledReports
                    .Where(s => s.UserId == userId)
                    .OrderByDescending(s => s.CreatedAt)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scheduled reports for user {UserId}", userId);
                throw;
            }
        }

        public async Task<ScheduledReport> ScheduleReportAsync(ScheduledReport scheduledReport)
        {
            try
            {
                // Set creation date
                scheduledReport.CreatedAt = DateTime.UtcNow;
                scheduledReport.IsActive = true;
                
                // Add to database
                _dbContext.ScheduledReports.Add(scheduledReport);
                await _dbContext.SaveChangesAsync();
                
                // Schedule job
                await ScheduleReportJobAsync(scheduledReport);
                
                return scheduledReport;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report for user {UserId}", scheduledReport.UserId);
                throw;
            }
        }

        public async Task UpdateScheduledReportAsync(ScheduledReport scheduledReport)
        {
            try
            {
                // Update in database
                _dbContext.ScheduledReports.Update(scheduledReport);
                await _dbContext.SaveChangesAsync();
                
                // Reschedule job
                await RescheduleReportJobAsync(scheduledReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating scheduled report {ScheduleId}", scheduledReport.Id);
                throw;
            }
        }

        public async Task DeleteScheduledReportAsync(string scheduleId, string userId)
        {
            try
            {
                var scheduledReport = await _dbContext.ScheduledReports
                    .FirstOrDefaultAsync(s => s.Id == scheduleId && s.UserId == userId);
                
                if (scheduledReport != null)
                {
                    // Delete from database
                    _dbContext.ScheduledReports.Remove(scheduledReport);
                    await _dbContext.SaveChangesAsync();
                    
                    // Unschedule job
                    await UnscheduleReportJobAsync(scheduleId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting scheduled report {ScheduleId} for user {UserId}", scheduleId, userId);
                throw;
            }
        }

        public async Task<List<ReportExecution>> GetReportExecutionsAsync(string scheduleId, int limit = 10)
        {
            try
            {
                return await _dbContext.ReportExecutions
                    .Where(e => e.ScheduledReportId == scheduleId)
                    .OrderByDescending(e => e.ExecutedAt)
                    .Take(limit)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report executions for schedule {ScheduleId}", scheduleId);
                throw;
            }
        }

        // Helper methods for scheduling
        private async Task ScheduleReportJobAsync(ScheduledReport scheduledReport)
        {
            try
            {
                if (!scheduledReport.IsActive)
                {
                    return;
                }
                
                var scheduler = await _schedulerFactory.GetScheduler();
                
                // Create job data map
                var jobDataMap = new JobDataMap
                {
                    { "scheduleId", scheduledReport.Id },
                    { "userId", scheduledReport.UserId },
                    { "configurationId", scheduledReport.ConfigurationId },
                    { "notificationType", scheduledReport.NotificationType },
                    { "notificationDestination", scheduledReport.NotificationDestination }
                };
                
                // Create job
                var job = JobBuilder.Create<ScheduledReportJob>()
                    .WithIdentity($"report-{scheduledReport.Id}")
                    .UsingJobData(jobDataMap)
                    .Build();
                
                // Create trigger based on schedule
                ITrigger trigger = CreateTriggerFromSchedule(scheduledReport);
                
                // Schedule job
                await scheduler.ScheduleJob(job, trigger);
                
                _logger.LogInformation("Scheduled report job for schedule {ScheduleId}", scheduledReport.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report job for schedule {ScheduleId}", scheduledReport.Id);
                throw;
            }
        }

        private async Task RescheduleReportJobAsync(ScheduledReport scheduledReport)
        {
            try
            {
                // Unschedule existing job
                await UnscheduleReportJobAsync(scheduledReport.Id);
                
                // Schedule new job if active
                if (scheduledReport.IsActive)
                {
                    await ScheduleReportJobAsync(scheduledReport);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rescheduling report job for schedule {ScheduleId}", scheduledReport.Id);
                throw;
            }
        }

        private async Task UnscheduleReportJobAsync(string scheduleId)
        {
            try
            {
                var scheduler = await _schedulerFactory.GetScheduler();
                
                // Delete job
                await scheduler.DeleteJob(new JobKey($"report-{scheduleId}"));
                
                _logger.LogInformation("Unscheduled report job for schedule {ScheduleId}", scheduleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unscheduling report job for schedule {ScheduleId}", scheduleId);
                throw;
            }
        }

        private ITrigger CreateTriggerFromSchedule(ScheduledReport scheduledReport)
        {
            var triggerBuilder = TriggerBuilder.Create()
                .WithIdentity($"trigger-{scheduledReport.Id}");
            
            // Set start time
            if (scheduledReport.StartDate.HasValue)
            {
                triggerBuilder.StartAt(scheduledReport.StartDate.Value);
            }
            else
            {
                triggerBuilder.StartNow();
            }
            
            // Set end time if specified
            if (scheduledReport.EndDate.HasValue)
            {
                triggerBuilder.EndAt(scheduledReport.EndDate.Value);
            }
            
            // Set schedule based on frequency
            switch (scheduledReport.Frequency)
            {
                case ScheduleFrequency.Daily:
                    triggerBuilder.WithSchedule(CronScheduleBuilder
                        .DailyAtHourAndMinute(scheduledReport.TimeOfDay.Hours, scheduledReport.TimeOfDay.Minutes));
                    break;
                
                case ScheduleFrequency.Weekly:
                    // Convert DayOfWeek to Quartz.DayOfWeek
                    var dayOfWeek = (DayOfWeek)((int)scheduledReport.DayOfWeek.Value);
                    triggerBuilder.WithSchedule(CronScheduleBuilder
                        .WeeklyOnDayAndHourAndMinute(dayOfWeek, scheduledReport.TimeOfDay.Hours, scheduledReport.TimeOfDay.Minutes));
                    break;
                
                case ScheduleFrequency.Monthly:
                    if (scheduledReport.DayOfMonth.HasValue)
                    {
                        triggerBuilder.WithSchedule(CronScheduleBuilder
                            .MonthlyOnDayAndHourAndMinute(
                                scheduledReport.DayOfMonth.Value, 
                                scheduledReport.TimeOfDay.Hours, 
                                scheduledReport.TimeOfDay.Minutes));
                    }
                    break;
                
                case ScheduleFrequency.Custom:
                    if (!string.IsNullOrEmpty(scheduledReport.CronExpression))
                    {
                        triggerBuilder.WithCronSchedule(scheduledReport.CronExpression);
                    }
                    break;
            }
            
            return triggerBuilder.Build();
        }
    }

    // Scheduled Report Job implementation
    [DisallowConcurrentExecution]
    public class ScheduledReportJob : IJob
    {
        private readonly IReportService _reportService;
        private readonly IReportConfigurationService _configService;
        private readonly INotificationService _notificationService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ScheduledReportJob> _logger;

        public ScheduledReportJob(
            IReportService reportService,
            IReportConfigurationService configService,
            INotificationService notificationService,
            ApplicationDbContext dbContext,
            ILogger<ScheduledReportJob> logger)
        {
            _reportService = reportService;
            _configService = configService;
            _notificationService = notificationService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                var dataMap = context.MergedJobDataMap;
                var scheduleId = dataMap.GetString("scheduleId");
                var userId = dataMap.GetString("userId");
                var configurationId = dataMap.GetString("configurationId");
                var notificationType = dataMap.GetString("notificationType");
                var notificationDestination = dataMap.GetString("notificationDestination");
                
                _logger.LogInformation(
                    "Starting scheduled report job for schedule {ScheduleId}, user {UserId}",
                    scheduleId,
                    userId);
                
                // Create execution record
                var execution = new ReportExecution
                {
                    Id = Guid.NewGuid().ToString(),
                    ScheduledReportId = scheduleId,
                    Status = "Running",
                    ExecutedAt = DateTime.UtcNow
                };
                
                _dbContext.ReportExecutions.Add(execution);
                await _dbContext.SaveChangesAsync();
                
                try
                {
                    // Get report configuration
                    var configuration = await _configService.GetConfigurationByIdAsync(configurationId);
                    if (configuration == null)
                    {
                        throw new Exception($"Configuration with ID {configurationId} not found");
                    }
                    
                    // Parse configuration
                    var reportRequest = JsonSerializer.Deserialize<ReportRequest>(configuration.ConfigurationJson);
                    
                    // Generate report
                    var result = await _reportService.GenerateReportAsync(reportRequest, userId);
                    
                    // Export report
                    var exportResult = await _reportService.ExportReportAsync(
                        result.ReportId,
                        "excel",
                        new Security.Models.User { Id = userId });
                    
                    // Send notification
                    await _notificationService.SendReportNotificationAsync(
                        userId,
                        result.ReportId,
                        notificationType,
                        notificationDestination,
                        exportResult);
                    
                    // Update execution record
                    execution.Status = "Completed";
                    execution.ReportId = result.ReportId;
                    execution.CompletedAt = DateTime.UtcNow;
                    
                    await _dbContext.SaveChangesAsync();
                    
                    _logger.LogInformation(
                        "Scheduled report job completed successfully for schedule {ScheduleId}, user {UserId}",
                        scheduleId,
                        userId);
                }
                catch (Exception ex)
                {
                    // Update execution record with error
                    execution.Status = "Failed";
                    execution.ErrorMessage = ex.Message;
                    execution.CompletedAt = DateTime.UtcNow;
                    
                    await _dbContext.SaveChangesAsync();
                    
                    _logger.LogError(
                        ex,
                        "Error executing scheduled report job for schedule {ScheduleId}, user {UserId}",
                        scheduleId,
                        userId);
                    
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in scheduled report job");
                throw;
            }
        }
    }
}

// --------------------------
// 2. Report Templates Models and Data Access
// --------------------------

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProgressPlay.Reporting.Core.Models
{
    public class ReportTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public bool AdminOnly { get; set; }
        
        public List<string> AvailableColumns { get; set; } = new List<string>();
        public List<string> AvailableFilters { get; set; } = new List<string>();
        public List<string> AvailableGroups { get; set; } = new List<string>();
        
        private string _availableColumnsJson;
        
        [JsonIgnore]
        public string AvailableColumnsJson
        {
            get => _availableColumnsJson;
            set
            {
                _availableColumnsJson = value;
                if (!string.IsNullOrEmpty(value))
                {
                    AvailableColumns = System.Text.Json.JsonSerializer.Deserialize<List<string>>(value);
                }
            }
        }
        
        private string _availableFiltersJson;
        
        [JsonIgnore]
        public string AvailableFiltersJson
        {
            get => _availableFiltersJson;
            set
            {
                _availableFiltersJson = value;
                if (!string.IsNullOrEmpty(value))
                {
                    AvailableFilters = System.Text.Json.JsonSerializer.Deserialize<List<string>>(value);
                }
            }
        }
        
        private string _availableGroupsJson;
        
        [JsonIgnore]
        public string AvailableGroupsJson
        {
            get => _availableGroupsJson;
            set
            {
                _availableGroupsJson = value;
                if (!string.IsNullOrEmpty(value))
                {
                    AvailableGroups = System.Text.Json.JsonSerializer.Deserialize<List<string>>(value);
                }
            }
        }
    }

    public class ReportConfiguration
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string TemplateId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        
        [JsonIgnore]
        public string ConfigurationJson { get; set; }
        
        [NotMapped]
        public ReportRequest Configuration { get; set; }
    }

    public class ScheduledReport
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string ConfigurationId { get; set; }
        public ScheduleFrequency Frequency { get; set; }
        public TimeSpan TimeOfDay { get; set; }
        public DayOfWeek? DayOfWeek { get; set; }
        public int? DayOfMonth { get; set; }
        public string CronExpression { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string NotificationType { get; set; } // email, sms, inapp
        public string NotificationDestination { get; set; } // email or phone number (optional)
        public string ExportFormat { get; set; } // excel, pdf, csv
    }

    public class ReportExecution
    {
        public string Id { get; set; }
        public string ScheduledReportId { get; set; }
        public string ReportId { get; set; }
        public DateTime ExecutedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } // Running, Completed, Failed
        public string ErrorMessage { get; set; }
    }

    public enum ScheduleFrequency
    {
        Daily,
        Weekly,
        Monthly,
        Custom
    }
}

// --------------------------
// 3. Report Customization Controller
// --------------------------

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Services;
using System.Text.Json;

namespace ProgressPlay.Reporting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportConfigController : ControllerBase
    {
        private readonly IReportConfigurationService _configService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<ReportConfigController> _logger;

        public ReportConfigController(
            IReportConfigurationService configService,
            IUserContextService userContextService,
            ILogger<ReportConfigController> logger)
        {
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
                return StatusCode(500, "An error occurred while retrieving report templates");
            }
        }

        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedConfigurations()
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var configurations = await _configService.GetSavedConfigurationsAsync(currentUser.Id);
                
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved configurations");
                return StatusCode(500, "An error occurred while retrieving saved configurations");
            }
        }

        [HttpGet("saved/{configId}")]
        public async Task<IActionResult> GetSavedConfiguration(string configId)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var configuration = await _configService.GetConfigurationByIdAsync(configId);
                
                if (configuration == null || configuration.UserId != currentUser.Id)
                {
                    return NotFound();
                }
                
                // Parse configuration
                if (!string.IsNullOrEmpty(configuration.ConfigurationJson))
                {
                    configuration.Configuration = JsonSerializer.Deserialize<ReportRequest>(configuration.ConfigurationJson);
                }
                
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved configuration {ConfigId}", configId);
                return StatusCode(500, "An error occurred while retrieving saved configuration");
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveConfiguration([FromBody] ReportConfiguration configuration)
        {
            try
            {
                if (string.IsNullOrEmpty(configuration.Name))
                {
                    return BadRequest("Configuration name is required");
                }
                
                var currentUser = _userContextService.GetCurrentUser();
                configuration.UserId = currentUser.Id;
                
                // Serialize configuration
                if (configuration.Configuration != null)
                {
                    configuration.ConfigurationJson = JsonSerializer.Serialize(configuration.Configuration);
                }
                
                // Generate ID if not provided
                if (string.IsNullOrEmpty(configuration.Id))
                {
                    configuration.Id = Guid.NewGuid().ToString();
                }
                
                var result = await _configService.SaveConfigurationAsync(configuration);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving report configuration");
                return StatusCode(500, "An error occurred while saving report configuration");
            }
        }

        [HttpPut("update/{configId}")]
        public async Task<IActionResult> UpdateConfiguration(string configId, [FromBody] ReportConfiguration configuration)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var existingConfig = await _configService.GetConfigurationByIdAsync(configId);
                
                if (existingConfig == null || existingConfig.UserId != currentUser.Id)
                {
                    return NotFound();
                }
                
                // Update properties
                existingConfig.Name = configuration.Name;
                existingConfig.Description = configuration.Description;
                
                // Serialize updated configuration
                if (configuration.Configuration != null)
                {
                    existingConfig.ConfigurationJson = JsonSerializer.Serialize(configuration.Configuration);
                }
                
                await _configService.UpdateConfigurationAsync(existingConfig);
                
                return Ok(existingConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating configuration {ConfigId}", configId);
                return StatusCode(500, "An error occurred while updating configuration");
            }
        }

        [HttpDelete("delete/{configId}")]
        public async Task<IActionResult> DeleteConfiguration(string configId)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                await _configService.DeleteConfigurationAsync(configId, currentUser.Id);
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {ConfigId}", configId);
                return StatusCode(500, "An error occurred while deleting configuration");
            }
        }
    }

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
                var currentUser = _userContextService.GetCurrentUser();
                var scheduledReports = await _configService.GetScheduledReportsAsync(currentUser.Id);
                
                return Ok(scheduledReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scheduled reports");
                return StatusCode(500, "An error occurred while retrieving scheduled reports");
            }
        }

        [HttpPost]
        public async Task<IActionResult> ScheduleReport([FromBody] ScheduledReport scheduledReport)
        {
            try
            {
                if (string.IsNullOrEmpty(scheduledReport.Name))
                {
                    return BadRequest("Schedule name is required");
                }
                
                if (string.IsNullOrEmpty(scheduledReport.ConfigurationId))
                {
                    return BadRequest("Report configuration ID is required");
                }
                
                var currentUser = _userContextService.GetCurrentUser();
                
                // Verify configuration exists and belongs to user
                var configuration = await _configService.GetConfigurationByIdAsync(scheduledReport.ConfigurationId);
                if (configuration == null || configuration.UserId != currentUser.Id)
                {
                    return BadRequest("Invalid configuration ID");
                }
                
                // Set user ID
                scheduledReport.UserId = currentUser.Id;
                
                // Generate ID if not provided
                if (string.IsNullOrEmpty(scheduledReport.Id))
                {
                    scheduledReport.Id = Guid.NewGuid().ToString();
                }
                
                var result = await _configService.ScheduleReportAsync(scheduledReport);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report");
                return StatusCode(500, "An error occurred while scheduling report");
            }
        }

        [HttpPut("{scheduleId}")]
        public async Task<IActionResult> UpdateScheduledReport(string scheduleId, [FromBody] ScheduledReport scheduledReport)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                
                // Verify schedule exists and belongs to user
                var existingSchedule = await _dbContext.ScheduledReports
                    .FirstOrDefaultAsync(s => s.Id == scheduleId && s.UserId == currentUser.Id);
                
                if (existingSchedule == null)
                {
                    return NotFound();
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
                return StatusCode(500, "An error occurred while updating scheduled report");
            }
        }

        [HttpDelete("{scheduleId}")]
        public async Task<IActionResult> DeleteScheduledReport(string scheduleId)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                await _configService.DeleteScheduledReportAsync(scheduleId, currentUser.Id);
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting scheduled report {ScheduleId}", scheduleId);
                return StatusCode(500, "An error occurred while deleting scheduled report");
            }
        }

        [HttpGet("{scheduleId}/executions")]
        public async Task<IActionResult> GetReportExecutions(string scheduleId, [FromQuery] int limit = 10)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                
                // Verify schedule exists and belongs to user
                var schedule = await _dbContext.ScheduledReports
                    .FirstOrDefaultAsync(s => s.Id == scheduleId && s.UserId == currentUser.Id);
                
                if (schedule == null)
                {
                    return NotFound();
                }
                
                var executions = await _configService.GetReportExecutionsAsync(scheduleId, limit);
                
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report executions for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, "An error occurred while retrieving report executions");
            }
        }
    }
}

// --------------------------
// 4. Frontend Report Customization Components
// --------------------------

// src/components/reports/SaveReportDialog.js
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';

const SaveReportDialog = ({ open, onClose, onSave, initialData = {} }) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  
  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name,
      description
    });
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Report Configuration</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Save your current report configuration for quick access in the future.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Configuration Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={!name.trim()}
          helperText={!name.trim() ? 'Name is required' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description (Optional)"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained" 
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveReportDialog;

// src/components/reports/LoadReportDialog.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDateTime } from '../../utils/formatters';

const LoadReportDialog = ({ open, onClose, onLoad, onDelete, savedConfigurations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState(null);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectConfig = (config) => {
    setSelectedConfig(config);
  };
  
  const handleLoad = () => {
    if (selectedConfig) {
      onLoad(selectedConfig.id);
    }
  };
  
  const handleDelete = (configId, event) => {
    event.stopPropagation();
    onDelete(configId);
    
    if (selectedConfig && selectedConfig.id === configId) {
      setSelectedConfig(null);
    }
  };
  
  // Filter configurations based on search term
  const filteredConfigurations = savedConfigurations
    .filter(config => 
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.description && config.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Load Saved Report Configuration</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Box>
        
        {filteredConfigurations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="textSecondary">
              {searchTerm 
                ? 'No configurations match your search criteria' 
                : 'No saved configurations found'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredConfigurations.map((config) => (
              <React.Fragment key={config.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    selected={selectedConfig && selectedConfig.id === config.id}
                    onClick={() => handleSelectConfig(config)}
                  >
                    <ListItemText
                      primary={config.name}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="textSecondary">
                            {config.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            {config.lastUsedAt 
                              ? `Last used: ${formatDateTime(config.lastUsedAt)}` 
                              : `Created: ${formatDateTime(config.createdAt)}`}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => handleDelete(config.id, e)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleLoad} 
          color="primary" 
          variant="contained" 
          disabled={!selectedConfig}
        >
          Load
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadReportDialog;

// src/components/reports/ScheduleReportDialog.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatISO } from 'date-fns';

const ScheduleReportDialog = ({ open, onClose, onSchedule, savedConfigurations }) => {
  const [name, setName] = useState('');
  const [configId, setConfigId] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [timeOfDay, setTimeOfDay] = useState(new Date());
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [cronExpression, setCronExpression] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notificationType, setNotificationType] = useState('inapp');
  const [notificationDestination, setNotificationDestination] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  
  // Validation
  const isValid = () => {
    if (!name.trim() || !configId) return false;
    
    if (frequency === 'custom' && !cronExpression.trim()) return false;
    
    if (notificationType === 'email' && !notificationDestination.trim()) return false;
    if (notificationType === 'sms' && !notificationDestination.trim()) return false;
    
    return true;
  };
  
  const handleSchedule = () => {
    if (!isValid()) return;
    
    // Build schedule object
    const schedule = {
      name,
      configurationId: configId,
      frequency: frequency.toUpperCase(),
      timeOfDay: {
        hours: timeOfDay.getHours(),
        minutes: timeOfDay.getMinutes(),
        seconds: 0
      },
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      cronExpression: frequency === 'custom' ? cronExpression : null,
      startDate: startDate ? formatISO(startDate) : null,
      endDate: endDate ? formatISO(endDate) : null,
      notificationType,
      notificationDestination: notificationType !== 'inapp' ? notificationDestination : null,
      exportFormat
    };
    
    onSchedule(schedule);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Schedule Report</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Schedule your report to run automatically at specified intervals.
        </DialogContentText>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Schedule Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={!name.trim()}
              helperText={!name.trim() ? 'Name is required' : ''}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!configId}>
              <InputLabel>Report Configuration</InputLabel>
              <Select
                value={configId}
                onChange={(e) => setConfigId(e.target.value)}
                label="Report Configuration"
              >
                {savedConfigurations.map(config => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.name}
                  </MenuItem>
                ))}
              </Select>
              {!configId && (
                <FormHelperText>Report configuration is required</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Schedule Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Schedule Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <RadioGroup
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom (Cron Expression)" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {frequency === 'daily' && (
                <TimePicker
                  label="Time of Day"
                  value={timeOfDay}
                  onChange={setTimeOfDay}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
              
              {frequency === 'weekly' && (
                <Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      label="Day of Week"
                    >
                      <MenuItem value={1}>Monday</MenuItem>
                      <MenuItem value={2}>Tuesday</MenuItem>
                      <MenuItem value={3}>Wednesday</MenuItem>
                      <MenuItem value={4}>Thursday</MenuItem>
                      <MenuItem value={5}>Friday</MenuItem>
                      <MenuItem value={6}>Saturday</MenuItem>
                      <MenuItem value={0}>Sunday</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TimePicker
                    label="Time of Day"
                    value={timeOfDay}
                    onChange={setTimeOfDay}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              )}
              
              {frequency === 'monthly' && (
                <Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Day of Month</InputLabel>
                    <Select
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      label="Day of Month"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <MenuItem key={day} value={day}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TimePicker
                    label="Time of Day"
                    value={timeOfDay}
                    onChange={setTimeOfDay}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              )}
              
              {frequency === 'custom' && (
                <TextField
                  fullWidth
                  label="Cron Expression"
                  placeholder="0 0 12 * * ?"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  required
                  error={!cronExpression.trim()}
                  helperText={!cronExpression.trim() ? 'Cron expression is required' : ''}
                />
              )}
            </LocalizationProvider>
          </Grid>
          
          {/* Date Range */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Date Range (Optional)
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Notification Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Notification Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <RadioGroup
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                <FormControlLabel value="inapp" control={<Radio />} label="In-App Notification" />
                <FormControlLabel value="email" control={<Radio />} label="Email" />
                <FormControlLabel value="sms" control={<Radio />} label="SMS" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {notificationType === 'email' && (
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={notificationDestination}
                onChange={(e) => setNotificationDestination(e.target.value)}
                required
                error={!notificationDestination.trim()}
                helperText={!notificationDestination.trim() ? 'Email address is required' : ''}
              />
            )}
            
            {notificationType === 'sms' && (
              <TextField
                fullWidth
                label="Phone Number"
                value={notificationDestination}
                onChange={(e) => setNotificationDestination(e.target.value)}
                required
                error={!notificationDestination.trim()}
                helperText={!notificationDestination.trim() ? 'Phone number is required' : ''}
              />
            )}
          </Grid>
          
          {/* Export Format */}
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSchedule} 
          color="primary" 
          variant="contained" 
          disabled={!isValid()}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleReportDialog;

// --------------------------
// 5. Scheduled Reports Component
// --------------------------

// src/pages/reports/ScheduledReports.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SmsIcon from '@mui/icons-material/Sms';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

import { formatDateTime } from '../../utils/formatters';
import ScheduleReportDialog from '../../components/reports/ScheduleReportDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExecutionHistoryDialog from '../../components/reports/ExecutionHistoryDialog';

import {
  fetchScheduledReports,
  fetchReportExecutions,
  scheduleReport,
  updateScheduledReport,
  deleteScheduledReport
} from '../../redux/slices/reportsSlice';

const ScheduledReports = () => {
  const dispatch = useDispatch();
  const { 
    scheduledReports, 
    reportExecutions,
    savedConfigurations,
    isLoading 
  } = useSelector((state) => state.reports);
  
  // Component state
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  
  useEffect(() => {
    dispatch(fetchScheduledReports());
  }, [dispatch]);
  
  const handleCreateSchedule = () => {
    setEditSchedule(null);
    setOpenScheduleDialog(true);
  };
  
  const handleEditSchedule = (schedule) => {
    setEditSchedule(schedule);
    setOpenScheduleDialog(true);
  };
  
  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
    setEditSchedule(null);
  };
  
  const handleScheduleReport = (scheduleData) => {
    if (editSchedule) {
      dispatch(updateScheduledReport({
        ...scheduleData,
        id: editSchedule.id
      }));
    } else {
      dispatch(scheduleReport(scheduleData));
    }
    
    setOpenScheduleDialog(false);
  };
  
  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    if (scheduleToDelete) {
      dispatch(deleteScheduledReport(scheduleToDelete.id));
    }
    
    setOpenDeleteDialog(false);
    setScheduleToDelete(null);
  };
  
  const handleToggleActive = (schedule) => {
    dispatch(updateScheduledReport({
      ...schedule,
      isActive: !schedule.isActive
    }));
  };
  
  const handleViewHistory = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    dispatch(fetchReportExecutions(scheduleId));
    setOpenHistoryDialog(true);
  };
  
  const renderFrequencyText = (schedule) => {
    switch (schedule.frequency) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return `Weekly on ${getDayOfWeekName(schedule.dayOfWeek)}`;
      case 'MONTHLY':
        return `Monthly on day ${schedule.dayOfMonth}`;
      case 'CUSTOM':
        return `Custom (${schedule.cronExpression})`;
      default:
        return 'Unknown frequency';
    }
  };
  
  const getDayOfWeekName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || '?';
  };
  
  const renderNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <EmailIcon fontSize="small" />;
      case 'sms':
        return <SmsIcon fontSize="small" />;
      case 'inapp':
        return <NotificationsIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };
  
  if (isLoading && !scheduledReports.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Scheduled Reports
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSchedule}
        >
          Schedule New Report
        </Button>
      </Box>
      
      {scheduledReports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Scheduled Reports
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              You haven't scheduled any reports yet. Schedule a report to run automatically at specified intervals.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSchedule}
            >
              Schedule Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Notification</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="120">Active</TableCell>
                <TableCell width="120">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scheduledReports.map((schedule) => {
                // Find configuration
                const config = savedConfigurations.find(c => c.id === schedule.configurationId);
                
                // Format time
                const time = new Date();
                time.setHours(schedule.timeOfDay.hours);
                time.setMinutes(schedule.timeOfDay.minutes);
                time.setSeconds(0);
                
                return (
                  <TableRow key={schedule.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {schedule.name}
                      </Typography>
                      {config && (
                        <Typography variant="caption" color="textSecondary">
                          {config.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{renderFrequencyText(schedule)}</TableCell>
                    <TableCell>
                      {schedule.frequency !== 'CUSTOM' && (
                        time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={schedule.notificationType}>
                        <Chip
                          icon={renderNotificationIcon(schedule.notificationType)}
                          label={schedule.notificationType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {schedule.lastExecution ? (
                        formatDateTime(schedule.lastExecution)
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {schedule.lastStatus === 'Completed' && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Success"
                          size="small"
                          color="success"
                        />
                      )}
                      {schedule.lastStatus === 'Failed' && (
                        <Chip
                          icon={<WarningIcon />}
                          label="Failed"
                          size="small"
                          color="error"
                        />
                      )}
                      {schedule.lastStatus === 'Running' && (
                        <Chip
                          icon={<PendingIcon />}
                          label="Running"
                          size="small"
                          color="warning"
                        />
                      )}
                      {!schedule.lastStatus && (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={schedule.isActive}
                        onChange={() => handleToggleActive(schedule)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View History">
                          <IconButton
                            size="small"
                            onClick={() => handleViewHistory(schedule.id)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(schedule)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Dialogs */}
      <ScheduleReportDialog
        open={openScheduleDialog}
        onClose={handleCloseScheduleDialog}
        onSchedule={handleScheduleReport}
        savedConfigurations={savedConfigurations}
        initialData={editSchedule}
      />
      
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Scheduled Report"
        content="Are you sure you want to delete this scheduled report? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
      />
      
      <ExecutionHistoryDialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        executions={reportExecutions}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default ScheduledReports;

// src/components/reports/ExecutionHistoryDialog.js
import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { formatDateTime, formatDuration } from '../../utils/formatters';

const ExecutionHistoryDialog = ({ open, onClose, executions, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Execution History</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {executions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="textSecondary">
                  No execution history found for this schedule.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Execution Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Report ID</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {executions.map((execution) => {
                      // Calculate duration
                      const duration = execution.completedAt
                        ? new Date(execution.completedAt) - new Date(execution.executedAt)
                        : null;
                      
                      return (
                        <TableRow key={execution.id} hover>
                          <TableCell>{formatDateTime(execution.executedAt)}</TableCell>
                          <TableCell>
                            {execution.status === 'Completed' && (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Success"
                                size="small"
                                color="success"
                              />
                            )}
                            {execution.status === 'Failed' && (
                              <Chip
                                icon={<ErrorIcon />}
                                label="Failed"
                                size="small"
                                color="error"
                              />
                            )}
                            {execution.status === 'Running' && (
                              <Chip
                                icon={<HourglassEmptyIcon />}
                                label="Running"
                                size="small"
                                color="warning"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {duration ? formatDuration(duration) : '-'}
                          </TableCell>
                          <TableCell>
                            {execution.reportId || '-'}
                          </TableCell>
                          <TableCell>
                            {execution.errorMessage || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecutionHistoryDialog;
