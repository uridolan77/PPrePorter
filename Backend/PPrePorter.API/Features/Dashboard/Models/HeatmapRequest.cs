using System;

namespace PPrePorter.API.Features.Dashboard.Models
{
    /// <summary>
    /// Request model for heatmap data
    /// </summary>
    public class HeatmapRequest
    {
        /// <summary>
        /// The user ID (set automatically from authentication)
        /// </summary>
        public string UserId { get; set; }
        
        /// <summary>
        /// The primary dimension for the heatmap (x-axis)
        /// </summary>
        public string PrimaryDimension { get; set; }
        
        /// <summary>
        /// The secondary dimension for the heatmap (y-axis)
        /// </summary>
        public string SecondaryDimension { get; set; }
        
        /// <summary>
        /// The metric to display in the heatmap cells
        /// </summary>
        public string Metric { get; set; }
        
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
        /// Optional filter criteria
        /// </summary>
        public string Filter { get; set; }
    }
}
