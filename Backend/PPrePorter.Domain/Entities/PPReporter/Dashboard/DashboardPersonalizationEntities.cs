using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// User's dashboard preferences
    /// </summary>
    public class DashboardPreferences
    {
        public string UserId { get; set; }
        public ColorSchemePreference ColorScheme { get; set; }
        public string InformationDensity { get; set; } // Compact, Medium, Spacious
        public Dictionary<string, string> PreferredChartTypes { get; set; } // MetricKey -> ChartType
        public List<string> PinnedMetrics { get; set; } // Metrics to prioritize on dashboard
        public bool ShowAnnotations { get; set; } = true;
        public bool ShowInsights { get; set; } = true;
        public bool ShowAnomalies { get; set; } = true;
        public bool ShowForecasts { get; set; } = true;
        public string DefaultTimeRange { get; set; } // Today, Week, Month, Quarter, Year
        public int DefaultDataGranularity { get; set; } // Data points per view
        public int InsightImportanceThreshold { get; set; } // Only show insights above this importance
        public Dictionary<string, bool> ComponentVisibility { get; set; } // Component ID -> Visibility
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// User's color scheme preferences
    /// </summary>
    public class ColorSchemePreference
    {
        public string UserId { get; set; }
        public string BaseTheme { get; set; } // Light, Dark, System
        public string ColorMode { get; set; } // Standard, Colorblind, Monochrome, Custom
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string PositiveColor { get; set; }
        public string NegativeColor { get; set; }
        public string NeutralColor { get; set; }
        public Dictionary<string, string> CategoryColors { get; set; }
        public int ContrastLevel { get; set; } // 1-5, 5 being highest contrast
    }

    /// <summary>
    /// Record of user interaction with dashboard components
    /// </summary>
    public class DashboardInteraction
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string ComponentId { get; set; }
        public string InteractionType { get; set; } // View, Click, Hover, Drill, Export, Annotate
        public DateTime Timestamp { get; set; }
        public int DurationSeconds { get; set; }
        public string MetricKey { get; set; }
        public string SessionId { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; }
    }

    /// <summary>
    /// Recommended dashboard component based on user behavior
    /// </summary>
    public class DashboardComponentRecommendation
    {
        public string ComponentId { get; set; }
        public string ComponentType { get; set; } // Chart, KPI, Table, etc.
        public string Title { get; set; }
        public string Description { get; set; }
        public double RelevanceScore { get; set; } // 0-1 score of component relevance
        public string RecommendationReason { get; set; }
        public List<string> RelatedMetrics { get; set; }
        public string TargetUserRole { get; set; }
        public string VisualizationType { get; set; }
        public Dictionary<string, object> ConfigurationParams { get; set; }
    }
}