using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a user interaction with the dashboard
    /// </summary>
    public class UserInteraction
    {
        /// <summary>
        /// ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// User ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Type of interaction (e.g., "click", "hover", "filter", "drill-down")
        /// </summary>
        public string InteractionType { get; set; }

        /// <summary>
        /// Key of the metric involved in the interaction
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// When the interaction occurred
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Additional data about the interaction (stored as JSON)
        /// </summary>
        public string AdditionalData { get; set; }
    }
}
