using System;

namespace PPrePorter.API.Features.Dashboard.Models
{
    /// <summary>
    /// Request model for segment comparison data
    /// </summary>
    public class SegmentComparisonRequest
    {
        /// <summary>
        /// The user ID (set automatically from authentication)
        /// </summary>
        public string UserId { get; set; }
        
        /// <summary>
        /// The segments to compare
        /// </summary>
        public string[] Segments { get; set; }
        
        /// <summary>
        /// The metrics to compare across segments
        /// </summary>
        public string[] Metrics { get; set; }
        
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
        /// Optional normalization method (e.g., "percent", "absolute", "indexed")
        /// </summary>
        public string NormalizationMethod { get; set; } = "percent";
    }
}
