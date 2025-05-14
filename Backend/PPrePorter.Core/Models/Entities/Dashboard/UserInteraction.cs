using PPrePorter.Core.Common;
using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a user interaction with the dashboard
    /// </summary>
    public class UserInteraction : BaseEntity
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Interaction type
        /// </summary>
        public string InteractionType { get; set; }

        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Interaction timestamp
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Additional data
        /// </summary>
        public string AdditionalData { get; set; }
    }
}
