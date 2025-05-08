using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents an insight generated from dashboard data
    /// </summary>
    public class DashboardInsight
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; } // Summary, Revenue, Registration, Game, Transaction
        public int Importance { get; set; } // 1-10 scale, higher is more important
        public DateTime GeneratedAt { get; set; }
        public string MetricKey { get; set; } // Associated metric key if applicable
        public string TrendDirection { get; set; } // Positive, Negative, Neutral
        public string InsightType { get; set; } // Pattern, Anomaly, Forecast, Correlation
        public string DetailedExplanation { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; }
    }

    /// <summary>
    /// Represents a detected anomaly in dashboard data
    /// </summary>
    public class DataAnomaly
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public DateTime DetectedAt { get; set; }
        public DateTime AnomalyDate { get; set; }
        public string MetricKey { get; set; }
        public decimal ExpectedValue { get; set; }
        public decimal ActualValue { get; set; }
        public decimal DeviationPercentage { get; set; }
        public int Severity { get; set; } // 1-5 scale, 5 being most severe
        public string PotentialCause { get; set; }
        public bool IsPositive { get; set; } // Whether the anomaly is beneficial
        public Dictionary<string, object> AdditionalData { get; set; }
    }    /// <summary>
    /// Represents a user-created annotation on dashboard data
    /// </summary>
    public class InsightDataAnnotation
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public string DataType { get; set; } // Revenue, Registration, etc.
        public DateTime? AnnotationDate { get; set; } // For point annotations
        public DateTime? StartDate { get; set; } // For range annotations
        public DateTime? EndDate { get; set; } // For range annotations
        public string Color { get; set; }
        public bool IsPrivate { get; set; }
        public List<string> SharedWithUserIds { get; set; }
        public string MetricKey { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; }
    }

    /// <summary>
    /// Represents an explanation for a specific metric
    /// </summary>
    public class MetricExplanation
    {
        public string MetricKey { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Calculation { get; set; }
        public string BusinessImpact { get; set; }
        public string BestPractices { get; set; }
        public string InterpretationGuidance { get; set; }
        public List<string> RelatedMetrics { get; set; }
        public Dictionary<string, string> RoleSpecificExplanations { get; set; }
        public Dictionary<int, string> ExperienceLevelExplanations { get; set; }
    }

    /// <summary>
    /// Complete dashboard narrative that ties insights together
    /// </summary>
    public class DashboardStory
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Summary { get; set; }
        public DateTime GeneratedAt { get; set; }
        public List<DashboardInsight> KeyInsights { get; set; }
        public List<DataAnomaly> SignificantAnomalies { get; set; }
        public List<string> Highlights { get; set; }
        public string BusinessContext { get; set; }
        public string OpportunityAnalysis { get; set; }
        public string RiskAnalysis { get; set; }
        public List<string> RecommendedActions { get; set; }
    }
}