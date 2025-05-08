using System;
using System.Collections.Generic;

namespace PPrePorter.ExporterScheduler.Models
{
    /// <summary>
    /// Supported export formats for reports
    /// </summary>
    public enum ExportFormat
    {
        Excel,
        PDF,
        CSV,
        JSON
    }

    /// <summary>
    /// Parameters for configuring report exports
    /// </summary>
    public class ExportParameters
    {
        public string ReportName { get; set; }
        public ExportFormat Format { get; set; }
        public Dictionary<string, object> Filters { get; set; } = new Dictionary<string, object>();
        public List<string> SelectedColumns { get; set; } = new List<string>();
        public string GroupBy { get; set; }
        public string SortBy { get; set; }
        public bool IncludeHeaders { get; set; } = true;
        public string Locale { get; set; } = "en-US";
        public string TimeZone { get; set; } = "UTC";
    }
}