using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Reports
{
    public class ReportRequestDto
    {
        public string TemplateId { get; set; }
        public List<FilterCriteriaDto> Filters { get; set; } = new List<FilterCriteriaDto>();
        public List<string> SelectedColumns { get; set; } = new List<string>();
        public List<GroupingDto> Groupings { get; set; } = new List<GroupingDto>();
        public List<SortingDto> SortBy { get; set; } = new List<SortingDto>();
        public int? PageSize { get; set; }
        public int? PageNumber { get; set; }
    }

    public class FilterCriteriaDto
    {
        public string Field { get; set; }
        public string Operator { get; set; } // equals, notEquals, contains, greaterThan, lessThan, etc.
        public string Value { get; set; }
        public List<string> Values { get; set; } = new List<string>(); // For "in" operators
        public DateTime? DateValue { get; set; }
        public DateTime? DateEnd { get; set; } // For date range filters
    }

    public class GroupingDto
    {
        public string Field { get; set; }
        public string Function { get; set; } // sum, avg, count, etc.
    }

    public class SortingDto
    {
        public string Field { get; set; }
        public bool Descending { get; set; }
    }

    public class ReportResultDto
    {
        public string ReportId { get; set; }
        public string Name { get; set; }
        public string Status { get; set; } // Processing, Completed, Failed
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TotalRows { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public List<Dictionary<string, object>> Data { get; set; }
        public List<ColumnMetadataDto> Columns { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class ColumnMetadataDto
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

    public class ExportResultDto
    {
        public string FileUrl { get; set; }
        public string FileName { get; set; }
        public string Format { get; set; }
        public long FileSizeBytes { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
