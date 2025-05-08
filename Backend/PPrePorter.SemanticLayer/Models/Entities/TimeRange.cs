using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a time range for queries
    /// </summary>
    public class TimeRange : Entity
    {
        /// <summary>
        /// Start date of the time range
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// End date of the time range
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Time period description (e.g., last 7 days, current month)
        /// </summary>
        public string? Period { get; set; }
        
        /// <summary>
        /// Relative time period (e.g., last week, previous month)
        /// </summary>
        public string? RelativePeriod { get; set; }
        
        /// <summary>
        /// Whether to include the current period
        /// </summary>
        public bool IncludeCurrentPeriod { get; set; }
    }
}