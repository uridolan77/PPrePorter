using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Interfaces
{
    /// <summary>
    /// Interface for exporting data to various formats
    /// </summary>
    public interface IExporter
    {
        Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters);
        string ContentType { get; }
        string FileExtension { get; }
    }

    /// <summary>
    /// Interface for retrieving and managing schedule configurations
    /// </summary>
    public interface IScheduleRepository
    {
        Task<ScheduleConfiguration> GetByIdAsync(Guid id);
        Task<IEnumerable<ScheduleConfiguration>> GetAllAsync();
        Task<IEnumerable<ScheduleConfiguration>> GetDueSchedulesAsync(DateTime dueDate);
        Task AddAsync(ScheduleConfiguration schedule);
        Task UpdateAsync(ScheduleConfiguration schedule);
        Task DeleteAsync(Guid id);
    }

    /// <summary>
    /// Interface for schedule management operations
    /// </summary>
    public interface IScheduleService
    {
        Task<Guid> CreateScheduleAsync(ScheduleConfiguration schedule);
        Task UpdateScheduleAsync(ScheduleConfiguration schedule);
        Task DeleteScheduleAsync(Guid id);
        Task<ScheduleConfiguration> GetScheduleAsync(Guid id);
        Task<IEnumerable<ScheduleConfiguration>> GetAllSchedulesAsync();
        Task<IEnumerable<ScheduleConfiguration>> GetUserSchedulesAsync(string userId);
        Task TriggerScheduleAsync(Guid id);
    }

    /// <summary>
    /// Interface for executing export jobs
    /// </summary>
    public interface IExportJob
    {
        Task ExecuteAsync(ScheduleConfiguration schedule);
    }

    /// <summary>
    /// Interface for managing execution history
    /// </summary>
    public interface IExecutionHistoryRepository
    {
        Task AddAsync(ExecutionHistory history);
        Task UpdateAsync(ExecutionHistory history);
        Task<ExecutionHistory> GetByIdAsync(Guid id);
        Task<IEnumerable<ExecutionHistory>> GetByScheduleIdAsync(Guid scheduleId);
        Task<IEnumerable<ExecutionHistory>> GetRecentExecutionsAsync(int limit = 100);
    }

    /// <summary>
    /// Interface for sending notifications via different channels
    /// </summary>
    public interface INotificationService
    {
        Task SendNotificationAsync(NotificationConfiguration notification, ScheduleConfiguration schedule, byte[] reportData);
    }

    /// <summary>
    /// Interface for retrieving report data
    /// </summary>
    public interface IReportDataService
    {
        Task<IEnumerable<dynamic>> GetReportDataAsync(
            string reportName,
            Dictionary<string, object> filters,
            string groupBy,
            string sortBy);
    }

    /// <summary>
    /// Interface for sending emails
    /// </summary>
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
        Task SendEmailWithAttachmentAsync(
            string email, 
            string subject, 
            string message, 
            byte[] attachmentData, 
            string attachmentFileName, 
            string attachmentContentType);
    }

    /// <summary>
    /// Interface for sending SMS
    /// </summary>
    public interface ISmsProvider
    {
        Task SendSmsAsync(string phoneNumber, string message);
    }

    /// <summary>
    /// Interface for retrieving user connection information
    /// </summary>
    public interface IUserRepository
    {
        Task<string> GetUserConnectionIdAsync(string userId);
    }
}