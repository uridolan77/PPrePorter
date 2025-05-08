using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Service for sending email notifications about scheduled exports
    /// </summary>
    public class EmailNotificationService : INotificationService
    {
        private readonly IEmailSender _emailSender;
        private readonly ILogger<EmailNotificationService> _logger;
        
        public EmailNotificationService(
            IEmailSender emailSender,
            ILogger<EmailNotificationService> logger)
        {
            _emailSender = emailSender;
            _logger = logger;
        }
        
        public async Task SendNotificationAsync(
            NotificationConfiguration notification, 
            ScheduleConfiguration schedule, 
            byte[] reportData)
        {
            _logger.LogInformation("Sending email notification to {Email} for schedule {ScheduleId}", 
                notification.Recipient, schedule.Id);
            
            var subject = $"Report '{schedule.ReportName}' is ready";
            
            var message = string.IsNullOrEmpty(notification.Message)
                ? GetDefaultMessage(schedule)
                : notification.Message;
            
            if (notification.AttachReport)
            {
                var fileName = $"{schedule.ReportName}_{DateTime.Now:yyyyMMdd_HHmmss}";
                var fileExtension = GetFileExtension(schedule.Format);
                var contentType = GetContentType(schedule.Format);
                
                _logger.LogInformation("Attaching report data ({Size} bytes) to email notification", 
                    reportData.Length);
                
                await _emailSender.SendEmailWithAttachmentAsync(
                    notification.Recipient,
                    subject,
                    message,
                    reportData,
                    $"{fileName}{fileExtension}",
                    contentType);
            }
            else
            {
                await _emailSender.SendEmailAsync(
                    notification.Recipient,
                    subject,
                    message);
            }
            
            _logger.LogInformation("Email notification sent successfully to {Email}", notification.Recipient);
        }
        
        private string GetDefaultMessage(ScheduleConfiguration schedule)
        {
            return $@"
Hello,

Your scheduled report '{schedule.Name}' has been generated successfully.

Report Details:
- Report Name: {schedule.ReportName}
- Format: {schedule.Format}
- Generated At: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

This is an automated message.
            ".Trim();
        }
        
        private string GetFileExtension(ExportFormat format)
        {
            return format switch
            {
                ExportFormat.Excel => ".xlsx",
                ExportFormat.PDF => ".pdf",
                ExportFormat.CSV => ".csv",
                ExportFormat.JSON => ".json",
                _ => ".txt"
            };
        }
        
        private string GetContentType(ExportFormat format)
        {
            return format switch
            {
                ExportFormat.Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ExportFormat.PDF => "application/pdf",
                ExportFormat.CSV => "text/csv",
                ExportFormat.JSON => "application/json",
                _ => "text/plain"
            };
        }
    }
}