using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a time range in a query
    /// </summary>
    public class TimeRange
    {
        /// <summary>
        /// The relative time period (e.g., "last 30 days")
        /// </summary>
        public string RelativePeriod { get; set; } = string.Empty;
        
        /// <summary>
        /// The specific start date
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// The specific end date
        /// </summary>
        public DateTime? EndDate { get; set; }
    }
}
