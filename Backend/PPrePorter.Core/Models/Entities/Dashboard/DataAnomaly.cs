using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an anomaly detected in dashboard data
    /// </summary>
    public class DataAnomaly
    {
        /// <summary>
        /// Unique identifier for the anomaly
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Title of the anomaly
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description of the anomaly
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Severity level (1-10, with 10 being most severe)
        /// </summary>
        public int Severity { get; set; }

        /// <summary>
        /// Type of anomaly (e.g., "spike", "drop", "outlier", "trend_change")
        /// </summary>
        public string AnomalyType { get; set; }

        /// <summary>
        /// Metric affected by the anomaly
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Dimension affected by the anomaly (if applicable)
        /// </summary>
        public string DimensionKey { get; set; }

        /// <summary>
        /// Dimension value affected by the anomaly (if applicable)
        /// </summary>
        public string DimensionValue { get; set; }

        /// <summary>
        /// Date and time when the anomaly occurred
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Expected value based on historical patterns
        /// </summary>
        public decimal? ExpectedValue { get; set; }

        /// <summary>
        /// Actual value observed
        /// </summary>
        public decimal? ActualValue { get; set; }

        /// <summary>
        /// Percentage deviation from expected value
        /// </summary>
        public decimal? DeviationPercentage { get; set; }

        /// <summary>
        /// Confidence score for the anomaly detection (0-1)
        /// </summary>
        public double ConfidenceScore { get; set; }

        /// <summary>
        /// Potential causes of the anomaly
        /// </summary>
        public string[] PotentialCauses { get; set; }

        /// <summary>
        /// Recommended actions to address the anomaly
        /// </summary>
        public string[] RecommendedActions { get; set; }

        /// <summary>
        /// Whether the anomaly has been acknowledged by a user
        /// </summary>
        public bool IsAcknowledged { get; set; }

        /// <summary>
        /// User who acknowledged the anomaly (if applicable)
        /// </summary>
        public string AcknowledgedBy { get; set; }

        /// <summary>
        /// Date and time when the anomaly was acknowledged
        /// </summary>
        public DateTime? AcknowledgedAt { get; set; }
    }
}
