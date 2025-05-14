using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents user preferences for the dashboard
    /// </summary>
    public class DashboardPreferences
    {
        /// <summary>
        /// User ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Default date range type (e.g., "today", "yesterday", "last_7_days", "last_30_days", "custom")
        /// </summary>
        public string DefaultDateRangeType { get; set; } = "last_7_days";

        /// <summary>
        /// Default start date for custom date range
        /// </summary>
        public DateTime? DefaultStartDate { get; set; }

        /// <summary>
        /// Default end date for custom date range
        /// </summary>
        public DateTime? DefaultEndDate { get; set; }

        /// <summary>
        /// Default white label ID filter
        /// </summary>
        public int? DefaultWhiteLabelId { get; set; }

        /// <summary>
        /// Default game ID filter
        /// </summary>
        public int? DefaultGameId { get; set; }

        /// <summary>
        /// Default country code filter
        /// </summary>
        public string DefaultCountryCode { get; set; }

        /// <summary>
        /// Favorite metrics to display
        /// </summary>
        public List<string> FavoriteMetrics { get; set; } = new List<string>();

        /// <summary>
        /// Hidden metrics
        /// </summary>
        public List<string> HiddenMetrics { get; set; } = new List<string>();

        /// <summary>
        /// Dashboard component layout
        /// </summary>
        public List<DashboardComponentLayout> ComponentLayout { get; set; } = new List<DashboardComponentLayout>();

        /// <summary>
        /// Color scheme preference
        /// </summary>
        public ColorSchemePreference ColorScheme { get; set; } = new ColorSchemePreference();

        /// <summary>
        /// Whether to show anomalies
        /// </summary>
        public bool ShowAnomalies { get; set; } = true;

        /// <summary>
        /// Whether to show forecasts
        /// </summary>
        public bool ShowForecasts { get; set; } = false;

        /// <summary>
        /// Whether to show insights
        /// </summary>
        public bool ShowInsights { get; set; } = true;

        /// <summary>
        /// Preferred chart types
        /// </summary>
        public Dictionary<string, string> PreferredChartTypes { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Notification preferences
        /// </summary>
        public NotificationPreferences Notifications { get; set; } = new NotificationPreferences();

        /// <summary>
        /// Date and time when the preferences were last updated
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// Represents the layout of a dashboard component
    /// </summary>
    public class DashboardComponentLayout
    {
        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Component type
        /// </summary>
        public string ComponentType { get; set; }

        /// <summary>
        /// Grid position X
        /// </summary>
        public int GridX { get; set; }

        /// <summary>
        /// Grid position Y
        /// </summary>
        public int GridY { get; set; }

        /// <summary>
        /// Grid width
        /// </summary>
        public int GridWidth { get; set; }

        /// <summary>
        /// Grid height
        /// </summary>
        public int GridHeight { get; set; }

        /// <summary>
        /// Whether the component is visible
        /// </summary>
        public bool IsVisible { get; set; } = true;

        /// <summary>
        /// Component configuration
        /// </summary>
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Represents color scheme preferences for the dashboard
    /// </summary>
    public class ColorSchemePreference
    {
        /// <summary>
        /// Theme name
        /// </summary>
        public string ThemeName { get; set; } = "default";

        /// <summary>
        /// Primary color
        /// </summary>
        public string PrimaryColor { get; set; } = "#1976d2";

        /// <summary>
        /// Secondary color
        /// </summary>
        public string SecondaryColor { get; set; } = "#dc004e";

        /// <summary>
        /// Background color
        /// </summary>
        public string BackgroundColor { get; set; } = "#f5f5f5";

        /// <summary>
        /// Text color
        /// </summary>
        public string TextColor { get; set; } = "#333333";

        /// <summary>
        /// Chart colors
        /// </summary>
        public List<string> ChartColors { get; set; } = new List<string>();

        /// <summary>
        /// Whether to use dark mode
        /// </summary>
        public bool DarkMode { get; set; } = false;
    }

    /// <summary>
    /// Represents notification preferences for the dashboard
    /// </summary>
    public class NotificationPreferences
    {
        /// <summary>
        /// Whether to enable email notifications
        /// </summary>
        public bool EnableEmailNotifications { get; set; } = false;

        /// <summary>
        /// Whether to enable in-app notifications
        /// </summary>
        public bool EnableInAppNotifications { get; set; } = true;

        /// <summary>
        /// Notification frequency (e.g., "realtime", "daily", "weekly")
        /// </summary>
        public string NotificationFrequency { get; set; } = "daily";

        /// <summary>
        /// Minimum importance level for notifications (1-10)
        /// </summary>
        public int MinimumImportanceLevel { get; set; } = 5;

        /// <summary>
        /// Categories to notify about
        /// </summary>
        public List<string> NotificationCategories { get; set; } = new List<string>();
    }

    /// <summary>
    /// Represents a user interaction with the dashboard
    /// </summary>
    public class DashboardInteraction
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Interaction type (e.g., "view", "click", "hover", "filter", "drill_down")
        /// </summary>
        public string InteractionType { get; set; }

        /// <summary>
        /// Metric key (if applicable)
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Timestamp of the interaction
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Duration of the interaction in seconds (if applicable)
        /// </summary>
        public int? DurationSeconds { get; set; }

        /// <summary>
        /// Additional data about the interaction
        /// </summary>
        public string AdditionalData { get; set; }
    }

    /// <summary>
    /// Represents a recommended dashboard component for a user
    /// </summary>
    public class DashboardComponentRecommendation
    {
        /// <summary>
        /// Component ID
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Component type
        /// </summary>
        public string ComponentType { get; set; }

        /// <summary>
        /// Component title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Component description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Relevance score (0-1)
        /// </summary>
        public double RelevanceScore { get; set; }

        /// <summary>
        /// Reason for the recommendation
        /// </summary>
        public string RecommendationReason { get; set; }

        /// <summary>
        /// Suggested configuration for the component
        /// </summary>
        public Dictionary<string, object> SuggestedConfiguration { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Whether the recommendation has been applied
        /// </summary>
        public bool IsApplied { get; set; }

        /// <summary>
        /// Whether the recommendation has been dismissed
        /// </summary>
        public bool IsDismissed { get; set; }
    }
}
