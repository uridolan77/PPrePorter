using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Dashboard preferences for a user
    /// </summary>
    public class DashboardPreferences
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Color scheme preferences
        /// </summary>
        public ColorSchemePreference ColorScheme { get; set; }

        /// <summary>
        /// Information density (low, medium, high)
        /// </summary>
        public string InformationDensity { get; set; }

        /// <summary>
        /// Preferred chart types for different metrics
        /// </summary>
        public Dictionary<string, string> PreferredChartTypes { get; set; }

        /// <summary>
        /// Pinned metrics
        /// </summary>
        public List<string> PinnedMetrics { get; set; }

        /// <summary>
        /// Whether to show annotations
        /// </summary>
        public bool ShowAnnotations { get; set; }

        /// <summary>
        /// Whether to show insights
        /// </summary>
        public bool ShowInsights { get; set; }

        /// <summary>
        /// Whether to show anomalies
        /// </summary>
        public bool ShowAnomalies { get; set; }

        /// <summary>
        /// Whether to show forecasts
        /// </summary>
        public bool ShowForecasts { get; set; }

        /// <summary>
        /// Default time range (day, week, month, year)
        /// </summary>
        public string DefaultTimeRange { get; set; }

        /// <summary>
        /// Default data granularity in days
        /// </summary>
        public int DefaultDataGranularity { get; set; }

        /// <summary>
        /// Insight importance threshold (1-5)
        /// </summary>
        public int InsightImportanceThreshold { get; set; }

        /// <summary>
        /// Component visibility settings
        /// </summary>
        public Dictionary<string, bool> ComponentVisibility { get; set; }

        /// <summary>
        /// Last updated timestamp
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }
}
