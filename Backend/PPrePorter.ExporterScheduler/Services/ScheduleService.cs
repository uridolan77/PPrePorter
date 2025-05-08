using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Service for managing report schedules
    /// </summary>
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IExecutionHistoryRepository _executionHistoryRepository;
        private readonly IExportJob _exportJob;
        private readonly ILogger<ScheduleService> _logger;
        
        public ScheduleService(
            IScheduleRepository scheduleRepository,
            IExecutionHistoryRepository executionHistoryRepository,
            IExportJob exportJob,
            ILogger<ScheduleService> logger)
        {
            _scheduleRepository = scheduleRepository;
            _executionHistoryRepository = executionHistoryRepository;
            _exportJob = exportJob;
            _logger = logger;
        }
        
        public async Task<Guid> CreateScheduleAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Creating new schedule for report {ReportName}", schedule.ReportName);
            
            schedule.Id = Guid.NewGuid();
            schedule.CreatedAt = DateTime.UtcNow;
            
            // Validate schedule configuration
            ValidateScheduleConfiguration(schedule);
            
            await _scheduleRepository.AddAsync(schedule);
            
            _logger.LogInformation("Created schedule {ScheduleId} for report {ReportName}", 
                schedule.Id, schedule.ReportName);
            
            return schedule.Id;
        }
        
        public async Task UpdateScheduleAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Updating schedule {ScheduleId} for report {ReportName}", 
                schedule.Id, schedule.ReportName);
            
            schedule.LastModifiedAt = DateTime.UtcNow;
            
            // Validate schedule configuration
            ValidateScheduleConfiguration(schedule);
            
            await _scheduleRepository.UpdateAsync(schedule);
            
            _logger.LogInformation("Updated schedule {ScheduleId} for report {ReportName}", 
                schedule.Id, schedule.ReportName);
        }
        
        public async Task DeleteScheduleAsync(Guid id)
        {
            _logger.LogInformation("Deleting schedule {ScheduleId}", id);
            
            await _scheduleRepository.DeleteAsync(id);
            
            _logger.LogInformation("Deleted schedule {ScheduleId}", id);
        }
        
        public async Task<ScheduleConfiguration> GetScheduleAsync(Guid id)
        {
            return await _scheduleRepository.GetByIdAsync(id);
        }
        
        public async Task<IEnumerable<ScheduleConfiguration>> GetAllSchedulesAsync()
        {
            return await _scheduleRepository.GetAllAsync();
        }
        
        public async Task<IEnumerable<ScheduleConfiguration>> GetUserSchedulesAsync(string userId)
        {
            _logger.LogInformation("Retrieving schedules for user {UserId}", userId);
            
            var allSchedules = await _scheduleRepository.GetAllAsync();
            return allSchedules.Where(s => s.CreatedBy == userId).ToList();
        }
        
        public async Task TriggerScheduleAsync(Guid id)
        {
            _logger.LogInformation("Manually triggering schedule {ScheduleId}", id);
            
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            
            if (schedule == null)
            {
                _logger.LogWarning("Schedule {ScheduleId} not found for triggering", id);
                throw new ArgumentException($"Schedule with ID {id} not found");
            }
            
            await _exportJob.ExecuteAsync(schedule);
            
            _logger.LogInformation("Successfully triggered schedule {ScheduleId} for report {ReportName}", 
                id, schedule.ReportName);
        }
        
        private void ValidateScheduleConfiguration(ScheduleConfiguration schedule)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(schedule.Name))
            {
                throw new ArgumentException("Schedule name is required");
            }
            
            if (string.IsNullOrWhiteSpace(schedule.ReportName))
            {
                throw new ArgumentException("Report name is required");
            }
            
            // Frequency-specific validation
            switch (schedule.Frequency)
            {
                case ScheduleFrequency.Weekly:
                    if (!schedule.DayOfWeek.HasValue)
                    {
                        throw new ArgumentException("Day of week is required for weekly schedules");
                    }
                    break;
                    
                case ScheduleFrequency.Monthly:
                    if (!schedule.DayOfMonth.HasValue)
                    {
                        throw new ArgumentException("Day of month is required for monthly schedules");
                    }
                    if (schedule.DayOfMonth < 1 || schedule.DayOfMonth > 31)
                    {
                        throw new ArgumentException("Day of month must be between 1 and 31");
                    }
                    break;
                    
                case ScheduleFrequency.Custom:
                    if (string.IsNullOrWhiteSpace(schedule.CronExpression))
                    {
                        throw new ArgumentException("Cron expression is required for custom schedules");
                    }
                    // Validate cron expression
                    try
                    {
                        Quartz.CronExpression.ValidateExpression(schedule.CronExpression);
                    }
                    catch (Exception ex)
                    {
                        throw new ArgumentException($"Invalid cron expression: {ex.Message}");
                    }
                    break;
            }
            
            // Validate notifications
            if (schedule.Notifications == null || !schedule.Notifications.Any())
            {
                throw new ArgumentException("At least one notification method is required");
            }
            
            foreach (var notification in schedule.Notifications)
            {
                if (string.IsNullOrWhiteSpace(notification.Recipient))
                {
                    throw new ArgumentException($"Recipient is required for {notification.Channel} notification");
                }
                
                // Channel-specific validation
                switch (notification.Channel)
                {
                    case NotificationChannel.Email:
                        if (!IsValidEmail(notification.Recipient))
                        {
                            throw new ArgumentException($"Invalid email address: {notification.Recipient}");
                        }
                        break;
                        
                    case NotificationChannel.SMS:
                        if (!IsValidPhoneNumber(notification.Recipient))
                        {
                            throw new ArgumentException($"Invalid phone number: {notification.Recipient}");
                        }
                        break;
                }
            }
        }
        
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
        
        private bool IsValidPhoneNumber(string phoneNumber)
        {
            // Simple validation - could be enhanced
            return !string.IsNullOrWhiteSpace(phoneNumber) && 
                   phoneNumber.Length >= 10 && 
                   phoneNumber.All(c => char.IsDigit(c) || c == '+' || c == '-' || c == ' ');
        }
    }
}