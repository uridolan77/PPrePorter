using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a data point in a time series or other visualization
    /// </summary>
    public class DataPoint
    {
        /// <summary>
        /// X-value (typically a date)
        /// </summary>
        public DateTime X { get; set; }

        /// <summary>
        /// Y-value
        /// </summary>
        public decimal Y { get; set; }

        /// <summary>
        /// Label for the data point
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Category for the data point
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Series name for the data point
        /// </summary>
        public string Series { get; set; }

        /// <summary>
        /// Color for the data point
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Whether the data point is an anomaly
        /// </summary>
        public bool IsAnomaly { get; set; }

        /// <summary>
        /// Whether the data point is a forecast
        /// </summary>
        public bool IsForecast { get; set; }

        /// <summary>
        /// Lower bound of the confidence interval
        /// </summary>
        public decimal? LowerBound { get; set; }

        /// <summary>
        /// Upper bound of the confidence interval
        /// </summary>
        public decimal? UpperBound { get; set; }

        /// <summary>
        /// Additional data for the data point
        /// </summary>
        public object AdditionalData { get; set; }
    }
}
