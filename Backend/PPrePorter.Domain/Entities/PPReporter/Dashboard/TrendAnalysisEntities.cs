using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Result of a trend analysis on dashboard data
    /// </summary>
    public class TrendAnalysisResult
    {
        public string MetricKey { get; set; }
        public List<TrendPattern> IdentifiedPatterns { get; set; }
        public decimal OverallTrendSlope { get; set; }
        public string TrendDirection { get; set; } // Increasing, Decreasing, Stable
        public decimal? PercentageChange { get; set; }
        public Dictionary<string, decimal> SegmentGrowthRates { get; set; }
        public List<DataPoint> OutlierPoints { get; set; }
        public bool SeasonalityDetected { get; set; }
        public int? SeasonalCycleDays { get; set; }
        public Dictionary<string, object> AdditionalMetrics { get; set; }
    }

    /// <summary>
    /// Represents a pattern identified in time series data
    /// </summary>
    public class TrendPattern
    {
        public int Id { get; set; }
        public string PatternType { get; set; } // Linear, Cyclic, Spike, Dip, Step, etc.
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Magnitude { get; set; }
        public string Description { get; set; }
        public decimal Significance { get; set; } // 0-1 score of pattern significance
        public bool IsSignificant { get; set; }
    }    /// <summary>
    /// Represents a single data point in a time series
    /// </summary>
    public class TrendDataPoint
    {
        public DateTime Date { get; set; }
        public string MetricKey { get; set; }
        public decimal Value { get; set; }
        public Dictionary<string, object> Dimensions { get; set; }
        public bool IsEstimated { get; set; }
    }

    /// <summary>
    /// Represents a forecast data point
    /// </summary>
    public class ForecastPoint
    {
        public DateTime Date { get; set; }
        public string MetricKey { get; set; }
        public decimal ForecastValue { get; set; }
        public decimal LowerBound { get; set; }
        public decimal UpperBound { get; set; }
        public decimal ConfidenceLevel { get; set; }
    }

    /// <summary>
    /// Correlation between two metrics
    /// </summary>
    public class MetricCorrelation
    {
        public string MetricA { get; set; }
        public string MetricB { get; set; }
        public decimal CorrelationCoefficient { get; set; } // -1 to 1
        public string Strength { get; set; } // Very Strong, Strong, Moderate, Weak, Very Weak
        public string Direction { get; set; } // Positive, Negative
        public bool IsSignificant { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Result of comparing data to industry benchmarks
    /// </summary>
    public class BenchmarkComparisonResult
    {
        public string MetricKey { get; set; }
        public string Segment { get; set; }
        public decimal ActualValue { get; set; }
        public decimal BenchmarkValue { get; set; }
        public decimal PercentageDifference { get; set; }
        public decimal Percentile { get; set; }
        public string ComparisonResult { get; set; } // Above Average, Average, Below Average
        public string PerformanceCategory { get; set; } // Excellent, Good, Average, Poor, Critical
        public Dictionary<string, decimal> CompetitorValues { get; set; }
        public string Description { get; set; }
        public string Explanation { get; set; }
    }

    /// <summary>
    /// Result of seasonality analysis
    /// </summary>
    public class SeasonalityResult
    {
        public bool SeasonalityDetected { get; set; }
        public int? PrimaryCycleDays { get; set; }
        public decimal SeasonalityStrength { get; set; } // 0-1 score
        public Dictionary<string, double> DayOfWeekPatterns { get; set; }
        public Dictionary<string, double> MonthPatterns { get; set; }
        public List<SeasonalPeak> IdentifiedPeaks { get; set; }
        public string Explanation { get; set; }
    }

    /// <summary>
    /// Represents a seasonal peak in time series data
    /// </summary>
    public class SeasonalPeak
    {
        public string Description { get; set; }
        public string TimePeriod { get; set; }
        public double AverageIncrease { get; set; }
        public double Significance { get; set; }
    }

    /// <summary>
    /// Represents a key driver of change in a metric
    /// </summary>
    public class ChangeDriver
    {
        public string DriverMetric { get; set; }
        public decimal ContributionPercentage { get; set; }
        public string Direction { get; set; } // Positive, Negative
        public string Explanation { get; set; }
        public bool IsActionable { get; set; }
    }

    /// <summary>
    /// Options for trend analysis (simplified version)
    /// </summary>
    public class SimpleTrendAnalysisOptions
    {
        public bool IncludeSeasonality { get; set; } = true;
        public bool DetectOutliers { get; set; } = true;
        public int? TimeWindowDays { get; set; }
        public List<string> ComparisonSegments { get; set; }
        public double SignificanceThreshold { get; set; } = 0.05;
    }

    /// <summary>
    /// Options for seasonality detection
    /// </summary>
    public class SeasonalityOptions
    {
        public int MinimumDataPoints { get; set; } = 14;
        public double StrengthThreshold { get; set; } = 0.3;
        public bool DetectMultipleCycles { get; set; } = true;
        public List<int> ExpectedCycleLengths { get; set; }
    }
}