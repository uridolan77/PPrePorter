using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class UserPreference : BaseEntity
    {
        public int UserId { get; set; }
        public virtual User User { get; set; }

        // Original properties
        public string PreferenceKey { get; set; }
        public string PreferenceValue { get; set; }

        // Dashboard preferences
        public string BaseTheme { get; set; }
        public string ColorMode { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string PositiveColor { get; set; }
        public string NegativeColor { get; set; }
        public string NeutralColor { get; set; }
        public int? ContrastLevel { get; set; }
        public string InformationDensity { get; set; }
        public string PreferredChartTypes { get; set; }
        public string PinnedMetrics { get; set; }
        public bool? ShowAnnotations { get; set; }
        public bool? ShowInsights { get; set; }
        public bool? ShowAnomalies { get; set; }
        public bool? ShowForecasts { get; set; }
        public string DefaultTimeRange { get; set; }
        public int? DefaultDataGranularity { get; set; }
        public int? InsightImportanceThreshold { get; set; }
        public string ComponentVisibility { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastUpdated { get; set; }
    }
}