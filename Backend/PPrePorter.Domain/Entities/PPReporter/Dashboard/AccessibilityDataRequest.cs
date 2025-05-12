using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Request for accessibility optimized data
    /// </summary>
    public class AccessibilityDataRequest
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Visualization type
        /// </summary>
        public string VisualizationType { get; set; }

        /// <summary>
        /// Start date
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// End date
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Accessibility preferences
        /// </summary>
        public string AccessibilityPreferences { get; set; }

        /// <summary>
        /// Play mode
        /// </summary>
        public string PlayMode { get; set; }

        /// <summary>
        /// White label ID
        /// </summary>
        public int? WhiteLabelId { get; set; }
    }
}
