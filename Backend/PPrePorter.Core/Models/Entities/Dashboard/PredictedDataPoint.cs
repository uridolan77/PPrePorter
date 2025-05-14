using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a predicted data point
    /// </summary>
    public class PredictedDataPoint
    {
        /// <summary>
        /// Timestamp for the predicted data point
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Metrics associated with the predicted data point
        /// </summary>
        public Dictionary<string, decimal> Metrics { get; set; } = new Dictionary<string, decimal>();

        /// <summary>
        /// Dimensions associated with the predicted data point
        /// </summary>
        public Dictionary<string, object> Dimensions { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Confidence interval for the prediction (0-1)
        /// </summary>
        public decimal ConfidenceInterval { get; set; }
    }
}
