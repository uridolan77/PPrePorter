using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Service for sending SMS notifications about scheduled exports
    /// </summary>
    public class SmsNotificationService : INotificationService
    {
        private readonly ISmsProvider _smsProvider;
        private readonly ILogger<SmsNotificationService> _logger;
        
        public SmsNotificationService(
            ISmsProvider smsProvider,
            ILogger<SmsNotificationService> logger)
        {
            _smsProvider = smsProvider;
            _logger = logger;
        }
        
        public async Task SendNotificationAsync(
            NotificationConfiguration notification, 
            ScheduleConfiguration schedule, 
            byte[] reportData)
        {
            _logger.LogInformation("Sending SMS notification to {PhoneNumber} for schedule {ScheduleId}", 
                notification.Recipient, schedule.Id);
            
            var message = string.IsNullOrEmpty(notification.Message)
                ? GetDefaultMessage(schedule)
                : notification.Message;
            
            await _smsProvider.SendSmsAsync(notification.Recipient, message);
            
            _logger.LogInformation("SMS notification sent successfully to {PhoneNumber}", notification.Recipient);
        }
        
        private string GetDefaultMessage(ScheduleConfiguration schedule)
        {
            // Keep SMS messages concise
            return $"Your scheduled report '{schedule.ReportName}' has been generated and is ready for viewing.";
        }
    }
}