using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using PPrePorter.Domain.Common;

namespace PPrePorter.Core.Models.Reports
{
    public class ReportTemplate : BaseEntity
    {
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

    public class ReportConfiguration : BaseEntity
    {
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

    public class ScheduledReport : BaseEntity
    {
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

    public class ReportExecution : BaseEntity
    {
        public string ScheduledReportId { get; set; }
        public string ReportId { get; set; }
        public DateTime ExecutedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } // Running, Completed, Failed
        public string ErrorMessage { get; set; }
    }

    public class GeneratedReport : BaseEntity
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string TemplateId { get; set; }
        public string Status { get; set; } // Processing, Completed, Failed
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string RequestJson { get; set; }
        public string ErrorMessage { get; set; }
        public int TotalRows { get; set; }

        [NotMapped]
        public List<Dictionary<string, object>> Data { get; set; }
        
        [NotMapped]
        public List<ColumnMetadata> Columns { get; set; }
    }

    public class ReportExport : BaseEntity
    {
        public string ReportId { get; set; }
        public string UserId { get; set; }
        public string Format { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public long FileSizeBytes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class ColumnMetadata
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string DataType { get; set; } // string, number, date, etc.
        public string Format { get; set; } // For numbers and dates
        public bool IsNumeric { get; set; }
        public bool IsDate { get; set; }
        public bool IsGrouped { get; set; }
        public bool IsAggregated { get; set; }
        public string AggregateFunction { get; set; }
    }

    public class ReportRequest
    {
        public string TemplateId { get; set; }
        public List<FilterCriteria> Filters { get; set; } = new List<FilterCriteria>();
        public List<string> SelectedColumns { get; set; } = new List<string>();
        public List<Grouping> Groupings { get; set; } = new List<Grouping>();
        public List<Sorting> SortBy { get; set; } = new List<Sorting>();
        public int? PageSize { get; set; }
        public int? PageNumber { get; set; }
    }

    public class FilterCriteria
    {
        public string Field { get; set; }
        public string Operator { get; set; } // equals, notEquals, contains, greaterThan, lessThan, etc.
        public string Value { get; set; }
        public List<string> Values { get; set; } = new List<string>(); // For "in" operators
        public DateTime? DateValue { get; set; }
        public DateTime? DateEnd { get; set; } // For date range filters
    }

    public class Grouping
    {
        public string Field { get; set; }
        public string Function { get; set; } // sum, avg, count, etc.
    }

    public class Sorting
    {
        public string Field { get; set; }
        public bool Descending { get; set; }
    }

    public enum ScheduleFrequency
    {
        Daily,
        Weekly,
        Monthly,
        Custom
    }
}