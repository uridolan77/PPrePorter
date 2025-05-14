using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an insight derived from dashboard data
    /// </summary>
    public class DataInsight
    {
        /// <summary>
        /// Unique identifier for the insight
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Title of the insight
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description of the insight
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Importance level of the insight (high, medium, low)
        /// </summary>
        public string Importance { get; set; } = "medium";

        /// <summary>
        /// Dimensions related to the insight
        /// </summary>
        public List<string> RelatedDimensions { get; set; } = new List<string>();

        /// <summary>
        /// Metrics related to the insight
        /// </summary>
        public List<string> RelatedMetrics { get; set; } = new List<string>();

        /// <summary>
        /// Supporting data for the insight
        /// </summary>
        public Dictionary<string, object> SupportingData { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Timestamp when the insight was generated
        /// </summary>
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Recommended actions based on the insight
        /// </summary>
        public List<string> RecommendedActions { get; set; } = new List<string>();

        /// <summary>
        /// Tags for categorizing the insight
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();
    }
}
