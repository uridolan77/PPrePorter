using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Record of user interaction with dashboard components
    /// </summary>
    public class DashboardInteraction
    {
        /// <summary>
        /// Interaction ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Interaction type (View, Click, Hover, Drill, Export, Annotate)
        /// </summary>
        public string InteractionType { get; set; }

        /// <summary>
        /// Timestamp of the interaction
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Duration in seconds
        /// </summary>
        public int DurationSeconds { get; set; }

        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Session ID
        /// </summary>
        public string SessionId { get; set; }

        /// <summary>
        /// Additional data
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; }
    }
}
