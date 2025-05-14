using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a driver of change in a metric
    /// </summary>
    public class ChangeDriver
    {
        /// <summary>
        /// Driver name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Driver type (e.g., "dimension", "metric", "event")
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Dimension key (if applicable)
        /// </summary>
        public string DimensionKey { get; set; }

        /// <summary>
        /// Dimension value (if applicable)
        /// </summary>
        public string DimensionValue { get; set; }

        /// <summary>
        /// Metric key (if applicable)
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Impact on the target metric
        /// </summary>
        public decimal Impact { get; set; }

        /// <summary>
        /// Percentage contribution to the overall change
        /// </summary>
        public decimal ContributionPercentage { get; set; }

        /// <summary>
        /// Direction of the impact ("positive", "negative")
        /// </summary>
        public string Direction { get; set; }

        /// <summary>
        /// Confidence score for the driver (0-1)
        /// </summary>
        public double ConfidenceScore { get; set; }

        /// <summary>
        /// Start date of the change
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the change
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Value before the change
        /// </summary>
        public decimal BeforeValue { get; set; }

        /// <summary>
        /// Value after the change
        /// </summary>
        public decimal AfterValue { get; set; }

        /// <summary>
        /// Percentage change
        /// </summary>
        public decimal PercentageChange { get; set; }

        /// <summary>
        /// Explanation of the driver
        /// </summary>
        public string Explanation { get; set; }

        /// <summary>
        /// Recommended actions based on the driver
        /// </summary>
        public List<string> RecommendedActions { get; set; } = new List<string>();

        /// <summary>
        /// Related drivers
        /// </summary>
        public List<string> RelatedDrivers { get; set; } = new List<string>();

        /// <summary>
        /// Time series data showing the driver's impact over time
        /// </summary>
        public List<DataPoint> TimeSeries { get; set; } = new List<DataPoint>();
    }
}
