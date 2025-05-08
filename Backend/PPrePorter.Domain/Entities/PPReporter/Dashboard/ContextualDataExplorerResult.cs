using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class ContextualDataExplorerResult
    {
        public string ExplorationContext { get; set; }
        public string DrillDownKey { get; set; }
        public int? DrillDownLevel { get; set; }
        
        // Primary result data
        public List<DataPoint> DataPoints { get; set; }
        
        // Context-specific aggregations
        public Dictionary<string, decimal> Aggregations { get; set; }
        
        // Trend analysis
        public TrendAnalysis TrendInfo { get; set; }
        
        // Predictive modeling results (for "what-if" scenarios)
        public PredictiveModelingResult PredictiveResults { get; set; }
        
        // Annotations and insights
        public List<DataAnnotation> Annotations { get; set; }
        public List<DataInsight> Insights { get; set; }
    }

    public class DataPoint
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

    public class DataAnnotation
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