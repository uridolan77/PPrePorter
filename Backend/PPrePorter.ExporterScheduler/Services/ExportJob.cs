using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Exporters;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Job implementation for executing scheduled exports
    /// </summary>
    public class ExportJob : IExportJob
    {
        private readonly IReportDataService _reportDataService;
        private readonly ExporterFactory _exporterFactory;
        private readonly NotificationServiceFactory _notificationServiceFactory;
        private readonly IExecutionHistoryRepository _executionHistoryRepository;
        private readonly ILogger<ExportJob> _logger;
        
        public ExportJob(
            IReportDataService reportDataService,
            ExporterFactory exporterFactory,
            NotificationServiceFactory notificationServiceFactory,
            IExecutionHistoryRepository executionHistoryRepository,
            ILogger<ExportJob> logger)
        {
            _reportDataService = reportDataService;
            _exporterFactory = exporterFactory;
            _notificationServiceFactory = notificationServiceFactory;
            _executionHistoryRepository = executionHistoryRepository;
            _logger = logger;
        }
        
        public async Task ExecuteAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Starting export job for schedule {ScheduleId} ({ScheduleName})", 
                schedule.Id, schedule.Name);
            
            var executionHistory = new ExecutionHistory
            {
                Id = Guid.NewGuid(),
                ScheduleId = schedule.Id,
                StartTime = DateTime.UtcNow
            };
            
            try
            {
                // Create export parameters
                var parameters = new ExportParameters
                {
                    ReportName = schedule.ReportName,
                    Format = schedule.Format,
                    Filters = schedule.Filters,
                    SelectedColumns = schedule.SelectedColumns,
                    GroupBy = schedule.GroupBy,
                    SortBy = schedule.SortBy,
                    IncludeHeaders = schedule.IncludeHeaders,
                    Locale = schedule.Locale,
                    TimeZone = schedule.TimeZone
                };
                
                // Get data for report
                _logger.LogInformation("Fetching data for report {ReportName}", schedule.ReportName);
                var data = await _reportDataService.GetReportDataAsync(
                    schedule.ReportName, 
                    schedule.Filters,
                    schedule.GroupBy,
                    schedule.SortBy);
                
                // Get appropriate exporter
                var exporter = _exporterFactory.CreateExporter(schedule.Format);
                
                // Export data to specified format
                _logger.LogInformation("Exporting data to {Format} format", schedule.Format);
                var exportedData = await exporter.ExportAsync(data, parameters);
                
                executionHistory.FileSizeBytes = exportedData.Length;
                
                // Send notifications
                _logger.LogInformation("Sending notifications for schedule {ScheduleId}", schedule.Id);
                foreach (var notificationConfig in schedule.Notifications)
                {
                    try
                    {
                        var notificationService = _notificationServiceFactory.GetNotificationService(notificationConfig.Channel);
                        
                        await notificationService.SendNotificationAsync(notificationConfig, schedule, exportedData);
                        
                        var notificationHistory = new NotificationHistory
                        {
                            Id = Guid.NewGuid(),
                            ExecutionId = executionHistory.Id,
                            Channel = notificationConfig.Channel,
                            Recipient = notificationConfig.Recipient,
                            SentAt = DateTime.UtcNow,
                            IsSuccess = true
                        };
                        
                        executionHistory.Notifications.Add(notificationHistory);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send notification for schedule {ScheduleId} via {Channel} to {Recipient}",
                            schedule.Id, notificationConfig.Channel, notificationConfig.Recipient);
                        
                        var notificationHistory = new NotificationHistory
                        {
                            Id = Guid.NewGuid(),
                            ExecutionId = executionHistory.Id,
                            Channel = notificationConfig.Channel,
                            Recipient = notificationConfig.Recipient,
                            SentAt = DateTime.UtcNow,
                            IsSuccess = false,
                            ErrorMessage = ex.Message
                        };
                        
                        executionHistory.Notifications.Add(notificationHistory);
                    }
                }
                
                // Update execution history
                executionHistory.EndTime = DateTime.UtcNow;
                executionHistory.IsSuccess = true;
                
                _logger.LogInformation("Successfully completed export job for schedule {ScheduleId}", schedule.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute export job for schedule {ScheduleId} ({ScheduleName})", 
                    schedule.Id, schedule.Name);
                
                executionHistory.EndTime = DateTime.UtcNow;
                executionHistory.IsSuccess = false;
                executionHistory.ErrorMessage = ex.Message;
            }
            
            // Save execution history
            await _executionHistoryRepository.AddAsync(executionHistory);
        }
    }
}