using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents the result of comparing metrics against industry benchmarks
    /// </summary>
    public class BenchmarkComparisonResult
    {
        /// <summary>
        /// Metric being compared
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Segment being compared (e.g., "casino", "sports", "poker")
        /// </summary>
        public string Segment { get; set; }

        /// <summary>
        /// Current value of the metric
        /// </summary>
        public decimal CurrentValue { get; set; }

        /// <summary>
        /// Benchmark value for the metric
        /// </summary>
        public decimal BenchmarkValue { get; set; }

        /// <summary>
        /// Percentage difference from the benchmark
        /// </summary>
        public decimal PercentageDifference { get; set; }

        /// <summary>
        /// Performance rating ("Excellent", "Good", "Average", "Below Average", "Poor")
        /// </summary>
        public string PerformanceRating { get; set; }

        /// <summary>
        /// Percentile ranking within the industry
        /// </summary>
        public int Percentile { get; set; }

        /// <summary>
        /// Historical comparison of the metric against benchmarks
        /// </summary>
        public List<BenchmarkComparisonPoint> HistoricalComparison { get; set; } = new List<BenchmarkComparisonPoint>();

        /// <summary>
        /// Recommendations for improvement
        /// </summary>
        public List<string> Recommendations { get; set; } = new List<string>();

        /// <summary>
        /// Source of the benchmark data
        /// </summary>
        public string BenchmarkSource { get; set; }

        /// <summary>
        /// Date when the benchmark data was last updated
        /// </summary>
        public System.DateTime BenchmarkLastUpdated { get; set; }
    }

    /// <summary>
    /// Represents a single point in a benchmark comparison
    /// </summary>
    public class BenchmarkComparisonPoint
    {
        /// <summary>
        /// Date of the comparison point
        /// </summary>
        public System.DateTime Date { get; set; }

        /// <summary>
        /// Actual value
        /// </summary>
        public decimal ActualValue { get; set; }

        /// <summary>
        /// Benchmark value
        /// </summary>
        public decimal BenchmarkValue { get; set; }

        /// <summary>
        /// Percentage difference from the benchmark
        /// </summary>
        public decimal PercentageDifference { get; set; }
    }
}
