using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    /// <summary>
    /// User preference entity
    /// </summary>
    public class UserPreference : BaseEntity
    {
        /// <summary>
        /// User ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// User
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// Preference key
        /// </summary>
        public string PreferenceKey { get; set; }

        /// <summary>
        /// Preference value
        /// </summary>
        public string PreferenceValue { get; set; }

        /// <summary>
        /// Preference type
        /// </summary>
        public string PreferenceType { get; set; }

        /// <summary>
        /// Base theme
        /// </summary>
        public string BaseTheme { get; set; }

        /// <summary>
        /// Color mode
        /// </summary>
        public string ColorMode { get; set; }

        /// <summary>
        /// Primary color
        /// </summary>
        public string PrimaryColor { get; set; }

        /// <summary>
        /// Secondary color
        /// </summary>
        public string SecondaryColor { get; set; }

        /// <summary>
        /// Positive color
        /// </summary>
        public string PositiveColor { get; set; }

        /// <summary>
        /// Negative color
        /// </summary>
        public string NegativeColor { get; set; }

        /// <summary>
        /// Neutral color
        /// </summary>
        public string NeutralColor { get; set; }

        /// <summary>
        /// Contrast level
        /// </summary>
        public int? ContrastLevel { get; set; }

        /// <summary>
        /// Information density
        /// </summary>
        public string InformationDensity { get; set; }

        /// <summary>
        /// Preferred chart types
        /// </summary>
        public string PreferredChartTypes { get; set; }

        /// <summary>
        /// Pinned metrics
        /// </summary>
        public string PinnedMetrics { get; set; }

        /// <summary>
        /// Show annotations
        /// </summary>
        public bool? ShowAnnotations { get; set; }

        /// <summary>
        /// Show insights
        /// </summary>
        public bool? ShowInsights { get; set; }

        /// <summary>
        /// Show anomalies
        /// </summary>
        public bool? ShowAnomalies { get; set; }

        /// <summary>
        /// Show forecasts
        /// </summary>
        public bool? ShowForecasts { get; set; }

        /// <summary>
        /// Default time range
        /// </summary>
        public string DefaultTimeRange { get; set; }

        /// <summary>
        /// Default data granularity
        /// </summary>
        public int? DefaultDataGranularity { get; set; }

        /// <summary>
        /// Insight importance threshold
        /// </summary>
        public int? InsightImportanceThreshold { get; set; }

        /// <summary>
        /// Component visibility
        /// </summary>
        public string ComponentVisibility { get; set; }

        /// <summary>
        /// Created at
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Updated at
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Last updated
        /// </summary>
        public DateTime? LastUpdated { get; set; }
    }
}