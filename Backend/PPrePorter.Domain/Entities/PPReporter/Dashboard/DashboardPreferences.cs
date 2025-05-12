using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a user's dashboard preferences
    /// </summary>
    public class DashboardPreferences
    {
        /// <summary>
        /// ID of the user
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Color scheme preferences
        /// </summary>
        public ColorSchemePreference ColorScheme { get; set; }

        /// <summary>
        /// Information density preference (e.g., "low", "medium", "high")
        /// </summary>
        public string InformationDensity { get; set; }

        /// <summary>
        /// Preferred chart types for different metrics
        /// </summary>
        public Dictionary<string, string> PreferredChartTypes { get; set; }

        /// <summary>
        /// List of metrics pinned to the dashboard
        /// </summary>
        public List<string> PinnedMetrics { get; set; }

        /// <summary>
        /// Whether to show annotations on charts
        /// </summary>
        public bool ShowAnnotations { get; set; }

        /// <summary>
        /// Whether to show insights on the dashboard
        /// </summary>
        public bool ShowInsights { get; set; }

        /// <summary>
        /// Whether to show anomalies on charts
        /// </summary>
        public bool ShowAnomalies { get; set; }

        /// <summary>
        /// Whether to show forecasts on charts
        /// </summary>
        public bool ShowForecasts { get; set; }

        /// <summary>
        /// Default time range for charts (e.g., "day", "week", "month")
        /// </summary>
        public string DefaultTimeRange { get; set; }

        /// <summary>
        /// Default data granularity in days
        /// </summary>
        public int DefaultDataGranularity { get; set; }

        /// <summary>
        /// Minimum importance threshold for insights (1-10)
        /// </summary>
        public int InsightImportanceThreshold { get; set; }

        /// <summary>
        /// Visibility settings for dashboard components
        /// </summary>
        public Dictionary<string, bool> ComponentVisibility { get; set; }

        /// <summary>
        /// When the preferences were last updated
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// Color scheme preferences for the dashboard
    /// </summary>
    public class ColorSchemePreference
    {
        /// <summary>
        /// Base theme (e.g., "light", "dark")
        /// </summary>
        public string BaseTheme { get; set; }

        /// <summary>
        /// Color mode (e.g., "standard", "colorblind", "monochrome")
        /// </summary>
        public string ColorMode { get; set; }

        /// <summary>
        /// Primary color in hex format
        /// </summary>
        public string PrimaryColor { get; set; }

        /// <summary>
        /// Secondary color in hex format
        /// </summary>
        public string SecondaryColor { get; set; }

        /// <summary>
        /// Color for positive values in hex format
        /// </summary>
        public string PositiveColor { get; set; }

        /// <summary>
        /// Color for negative values in hex format
        /// </summary>
        public string NegativeColor { get; set; }

        /// <summary>
        /// Color for neutral values in hex format
        /// </summary>
        public string NeutralColor { get; set; }

        /// <summary>
        /// Contrast level (1-3)
        /// </summary>
        public int ContrastLevel { get; set; }
    }
}
