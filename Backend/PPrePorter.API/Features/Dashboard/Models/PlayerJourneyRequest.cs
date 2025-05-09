using System;

namespace PPrePorter.API.Features.Dashboard.Models
{
    /// <summary>
    /// Request model for player journey Sankey diagram data
    /// </summary>
    public class PlayerJourneyRequest
    {
        /// <summary>
        /// The user ID (set automatically from authentication)
        /// </summary>
        public string UserId { get; set; }
        
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
        /// Maximum number of steps to include in the journey
        /// </summary>
        public int MaxSteps { get; set; } = 5;
        
        /// <summary>
        /// Optional segment filter
        /// </summary>
        public string Segment { get; set; }
    }
}
