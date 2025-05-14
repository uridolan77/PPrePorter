using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents options for seasonality detection
    /// </summary>
    public class SeasonalityOptions
    {
        /// <summary>
        /// Minimum period to consider (e.g., 2 for bi-daily patterns)
        /// </summary>
        public int MinPeriod { get; set; } = 2;

        /// <summary>
        /// Maximum period to consider (e.g., 365 for yearly patterns)
        /// </summary>
        public int MaxPeriod { get; set; } = 365;

        /// <summary>
        /// Significance threshold for detecting seasonality (0-1)
        /// </summary>
        public double SignificanceThreshold { get; set; } = 0.05;

        /// <summary>
        /// Whether to detect multiple seasonality patterns
        /// </summary>
        public bool DetectMultiplePatterns { get; set; } = true;

        /// <summary>
        /// Maximum number of patterns to detect
        /// </summary>
        public int MaxPatterns { get; set; } = 3;

        /// <summary>
        /// Whether to adjust for trend before detecting seasonality
        /// </summary>
        public bool AdjustForTrend { get; set; } = true;
    }

    /// <summary>
    /// Represents the result of seasonality detection
    /// </summary>
    public class SeasonalityResult
    {
        /// <summary>
        /// Whether seasonality was detected
        /// </summary>
        public bool HasSeasonality { get; set; }

        /// <summary>
        /// Detected seasonality patterns
        /// </summary>
        public List<SeasonalityPattern> Patterns { get; set; } = new List<SeasonalityPattern>();

        /// <summary>
        /// Strength of the seasonality (0-1)
        /// </summary>
        public double SeasonalityStrength { get; set; }

        /// <summary>
        /// Seasonal component of the time series
        /// </summary>
        public List<DataPoint> SeasonalComponent { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Trend component of the time series
        /// </summary>
        public List<DataPoint> TrendComponent { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Residual component of the time series
        /// </summary>
        public List<DataPoint> ResidualComponent { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Narrative description of the seasonality
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// Represents a seasonality pattern
    /// </summary>
    public class SeasonalityPattern
    {
        /// <summary>
        /// Period of the pattern (e.g., 7 for weekly, 30 for monthly)
        /// </summary>
        public int Period { get; set; }

        /// <summary>
        /// Type of the pattern (e.g., "daily", "weekly", "monthly", "quarterly", "yearly")
        /// </summary>
        public string PatternType { get; set; }

        /// <summary>
        /// Strength of the pattern (0-1)
        /// </summary>
        public double Strength { get; set; }

        /// <summary>
        /// P-value for the pattern
        /// </summary>
        public double PValue { get; set; }

        /// <summary>
        /// Peak points in the pattern
        /// </summary>
        public List<int> PeakPoints { get; set; } = new List<int>();

        /// <summary>
        /// Trough points in the pattern
        /// </summary>
        public List<int> TroughPoints { get; set; } = new List<int>();

        /// <summary>
        /// Amplitude of the pattern
        /// </summary>
        public double Amplitude { get; set; }

        /// <summary>
        /// Phase of the pattern
        /// </summary>
        public double Phase { get; set; }
    }
}
