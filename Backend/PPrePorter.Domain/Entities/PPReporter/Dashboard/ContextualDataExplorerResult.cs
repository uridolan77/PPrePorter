using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Result of contextual data exploration
    /// </summary>
    public class ContextualDataExplorerResult
    {
        /// <summary>
        /// Context for exploration
        /// </summary>
        public string ExplorationContext { get; set; }

        /// <summary>
        /// Context for exploration (alias for ExplorationContext)
        /// </summary>
        public string Context {
            get => ExplorationContext;
            set => ExplorationContext = value;
        }

        /// <summary>
        /// The key to drill down on
        /// </summary>
        public string DrillDownKey { get; set; }

        /// <summary>
        /// How deep to drill down into the data
        /// </summary>
        public int? DrillDownLevel { get; set; }

        /// <summary>
        /// Dimension being explored
        /// </summary>
        public string Dimension { get; set; }

        /// <summary>
        /// Primary result data
        /// </summary>
        public List<ExplorerDataPoint> DataPoints { get; set; }

        /// <summary>
        /// Context-specific aggregations
        /// </summary>
        public Dictionary<string, decimal> Aggregations { get; set; }

        /// <summary>
        /// Trend analysis
        /// </summary>
        public TrendAnalysis TrendInfo { get; set; }

        /// <summary>
        /// Predictive modeling results (for "what-if" scenarios)
        /// </summary>
        public PredictiveModelingResult PredictiveResults { get; set; }

        /// <summary>
        /// Annotations
        /// </summary>
        public List<ExplorerDataAnnotation> Annotations { get; set; }

        /// <summary>
        /// Insights
        /// </summary>
        public List<DataInsight> Insights { get; set; }

        /// <summary>
        /// Related metrics
        /// </summary>
        public List<string> RelatedMetrics { get; set; } = new List<string>();
    }

    /// <summary>
    /// Data point for explorer results
    /// </summary>
    public class ExplorerDataPoint
    {
        public string Label { get; set; }
        public Dictionary<string, object> Dimensions { get; set; }
        public Dictionary<string, decimal> Metrics { get; set; }
        public DateTime? Timestamp { get; set; }
    }

    public class TrendAnalysis
    {
        public string PrimaryTrend { get; set; } // e.g., "increasing", "decreasing", "stable"
        public decimal? TrendMagnitude { get; set; } // e.g., percentage change
        public Dictionary<string, string> DimensionalTrends { get; set; }
        public List<Anomaly> Anomalies { get; set; }
    }

    public class Anomaly
    {
        public string Dimension { get; set; }
        public string Metric { get; set; }
        public decimal Value { get; set; }
        public decimal ExpectedValue { get; set; }
        public decimal Deviation { get; set; } // How much the actual value deviates from expected
        public string Severity { get; set; } // e.g., "low", "medium", "high"
        public DateTime? Timestamp { get; set; }
    }

    public class PredictiveModelingResult
    {
        public string ScenarioName { get; set; }
        public Dictionary<string, object> InputParameters { get; set; }
        public List<PredictedDataPoint> PredictedDataPoints { get; set; }
        public Dictionary<string, decimal> PredictedAggregations { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public Dictionary<string, decimal> SensitivityAnalysis { get; set; } // How results change when inputs vary
    }

    public class PredictedDataPoint
    {
        public DateTime? Timestamp { get; set; }
        public Dictionary<string, object> Dimensions { get; set; }
        public Dictionary<string, decimal> Metrics { get; set; }
        public decimal? ConfidenceInterval { get; set; }
    }

    /// <summary>
    /// Data annotation for explorer results
    /// </summary>
    public class ExplorerDataAnnotation
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } // e.g., "note", "alert", "insight"
        public string RelatedDimension { get; set; }
        public string RelatedMetric { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DataInsight
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Importance { get; set; } // e.g., "low", "medium", "high"
        public List<string> RelatedDimensions { get; set; }
        public List<string> RelatedMetrics { get; set; }
        public Dictionary<string, object> SupportingData { get; set; }
    }
}