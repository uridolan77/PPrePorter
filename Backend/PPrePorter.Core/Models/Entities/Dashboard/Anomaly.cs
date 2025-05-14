using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an anomaly detected in the data
    /// </summary>
    public class Anomaly
    {
        /// <summary>
        /// Dimension where the anomaly was detected
        /// </summary>
        public string Dimension { get; set; }

        /// <summary>
        /// Metric where the anomaly was detected
        /// </summary>
        public string Metric { get; set; }

        /// <summary>
        /// Actual value
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Expected value
        /// </summary>
        public decimal ExpectedValue { get; set; }

        /// <summary>
        /// Deviation from expected value
        /// </summary>
        public decimal Deviation { get; set; }

        /// <summary>
        /// Severity of the anomaly (high, medium, low)
        /// </summary>
        public string Severity { get; set; }

        /// <summary>
        /// Timestamp when the anomaly occurred
        /// </summary>
        public DateTime? Timestamp { get; set; }
    }
}
