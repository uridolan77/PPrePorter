using System;

namespace PPrePorter.API.Features.Dashboard.Models
{
    /// <summary>
    /// Request model for micro-chart data
    /// </summary>
    public class MicroChartRequest
    {
        /// <summary>
        /// The user ID (set automatically from authentication)
        /// </summary>
        public string UserId { get; set; }
        
        /// <summary>
        /// The type of chart to generate (e.g., "sparkline", "bullet", "minibar")
        /// </summary>
        public string ChartType { get; set; }
        
        /// <summary>
        /// The metric to display in the chart
        /// </summary>
        public string Metric { get; set; }
        
        /// <summary>
        /// Optional dimension to group by
        /// </summary>
        public string Dimension { get; set; }
        
        /// <summary>
        /// Optional entity IDs to filter by
        /// </summary>
        public string[] EntityIds { get; set; }
        
        /// <summary>
        /// The time frame for the data (e.g., "last7days", "last30days", "last90days")
        /// </summary>
        public string TimeFrame { get; set; } = "last30days";
        
        /// <summary>
        /// Optional start date for custom time range
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// Optional end date for custom time range
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Optional comparison period (e.g., "previousPeriod", "samePerioLastYear")
        /// </summary>
        public string ComparisonPeriod { get; set; }
    }
}
