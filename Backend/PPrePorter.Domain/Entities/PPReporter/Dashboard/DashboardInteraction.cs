using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a user interaction with a dashboard component
    /// </summary>
    public class DashboardInteraction
    {
        /// <summary>
        /// ID of the component the user interacted with
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
        /// Additional data about the interaction
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; }
    }
}
