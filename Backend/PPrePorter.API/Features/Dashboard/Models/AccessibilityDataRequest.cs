using System;

namespace PPrePorter.API.Features.Dashboard.Models
{
    /// <summary>
    /// Request model for accessibility-optimized data
    /// </summary>
    public class AccessibilityDataRequest
    {
        /// <summary>
        /// The user ID (set automatically from authentication)
        /// </summary>
        public string UserId { get; set; }
        
        /// <summary>
        /// The type of visualization to optimize (e.g., "table", "chart", "summary")
        /// </summary>
        public string VisualizationType { get; set; }
        
        /// <summary>
        /// The original visualization ID to convert
        /// </summary>
        public string OriginalVisualizationId { get; set; }
        
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
        /// Optional accessibility preferences
        /// </summary>
        public string[] AccessibilityPreferences { get; set; }
    }
}
