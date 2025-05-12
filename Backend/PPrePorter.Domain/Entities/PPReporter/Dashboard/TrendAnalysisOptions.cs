using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Options for trend analysis
    /// </summary>
    public class TrendAnalysisOptions
    {
        /// <summary>
        /// Start date
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// End date
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Dimension
        /// </summary>
        public string Dimension { get; set; }

        /// <summary>
        /// Include seasonality analysis
        /// </summary>
        public bool IncludeSeasonality { get; set; }

        /// <summary>
        /// Include anomaly detection
        /// </summary>
        public bool IncludeAnomalyDetection { get; set; }

        /// <summary>
        /// Detect outliers
        /// </summary>
        public bool DetectOutliers { get; set; }

        /// <summary>
        /// Include forecasting
        /// </summary>
        public bool IncludeForecasting { get; set; }

        /// <summary>
        /// Include segment analysis
        /// </summary>
        public bool IncludeSegmentAnalysis { get; set; }

        /// <summary>
        /// Forecast horizon (days)
        /// </summary>
        public int ForecastHorizon { get; set; }

        /// <summary>
        /// Confidence level (0-1)
        /// </summary>
        public double ConfidenceLevel { get; set; }

        /// <summary>
        /// Segments to analyze
        /// </summary>
        public List<string> Segments { get; set; }
    }
}
