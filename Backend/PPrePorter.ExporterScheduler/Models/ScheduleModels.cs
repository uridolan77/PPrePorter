using System;
using System.Collections.Generic;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Models
{
    /// <summary>
    /// Frequency types for report schedules
    /// </summary>
    public enum ScheduleFrequency
    {
        Daily,
        Weekly,
        Monthly,
        Custom
    }

    /// <summary>
    /// Notification delivery channels
    /// </summary>
    public enum NotificationChannel
    {
        InApp,
        Email,
        SMS
    }

    /// <summary>
    /// Schedule configuration for automated report generation
    /// </summary>
    public class ScheduleConfiguration
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string ReportName { get; set; }
        public ScheduleFrequency Frequency { get; set; }
        public TimeSpan TimeOfDay { get; set; }
        public DayOfWeek? DayOfWeek { get; set; }
        public int? DayOfMonth { get; set; }
        public string CronExpression { get; set; }
        public ExportFormat Format { get; set; }
        public Dictionary<string, object> Filters { get; set; } = new Dictionary<string, object>();
        public List<string> SelectedColumns { get; set; } = new List<string>();
        public string GroupBy { get; set; }
        public string SortBy { get; set; }
        public bool IncludeHeaders { get; set; } = true;
        public string Locale { get; set; } = "en-US";
        public string TimeZone { get; set; } = "UTC";
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string LastModifiedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public List<NotificationConfiguration> Notifications { get; set; } = new List<NotificationConfiguration>();
    }

    /// <summary>
    /// Configuration for how schedule completion notifications should be delivered
    /// </summary>
    public class NotificationConfiguration
    {
        public Guid Id { get; set; }
        public NotificationChannel Channel { get; set; }
        public string Recipient { get; set; }
        public bool AttachReport { get; set; }
        public string Message { get; set; }
    }

    /// <summary>
    /// Execution history for scheduled reports
    /// </summary>
    public class ExecutionHistory
    {
        public Guid Id { get; set; }
        public Guid ScheduleId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public long? FileSizeBytes { get; set; }
        public TimeSpan? Duration => EndTime.HasValue ? EndTime.Value - StartTime : null;
        public List<NotificationHistory> Notifications { get; set; } = new List<NotificationHistory>();
    }

    /// <summary>
    /// History of notifications sent for report executions
    /// </summary>
    public class NotificationHistory
    {
        public Guid Id { get; set; }
        public Guid ExecutionId { get; set; }
        public NotificationChannel Channel { get; set; }
        public string Recipient { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
    }
}