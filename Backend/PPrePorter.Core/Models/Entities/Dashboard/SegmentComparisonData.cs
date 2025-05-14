using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{

    /// <summary>
    /// Represents data for segment comparison
    /// </summary>
    public class SegmentComparisonData
    {
        /// <summary>
        /// Dimension used for segmentation
        /// </summary>
        public string SegmentDimension { get; set; }

        /// <summary>
        /// Segment type (e.g., "Time", "WhiteLabel", "Country")
        /// </summary>
        public string SegmentType { get; set; }

        /// <summary>
        /// Metrics compared
        /// </summary>
        public List<string> Metrics { get; set; } = new List<string>();

        /// <summary>
        /// Segments compared
        /// </summary>
        public List<Segment> Segments { get; set; } = new List<Segment>();

        /// <summary>
        /// Segment names
        /// </summary>
        public List<string> SegmentNames { get; set; } = new List<string>();

        /// <summary>
        /// Metrics data
        /// </summary>
        public List<SegmentMetricData> MetricsData { get; set; } = new List<SegmentMetricData>();

        /// <summary>
        /// Insights derived from the comparison
        /// </summary>
        public List<DataInsight> Insights { get; set; } = new List<DataInsight>();

        /// <summary>
        /// Start date of the comparison period
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the comparison period
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Segment names as a comma-separated string
        /// </summary>
        public string Segments_String { get; set; }

        /// <summary>
        /// Values for the segments
        /// </summary>
        public Dictionary<string, decimal> Values { get; set; } = new Dictionary<string, decimal>();
    }

    /// <summary>
    /// Represents a segment in the comparison
    /// </summary>
    public class Segment
    {
        /// <summary>
        /// Segment name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Segment value
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Metric values for the segment
        /// </summary>
        public Dictionary<string, decimal> Metrics { get; set; } = new Dictionary<string, decimal>();

        /// <summary>
        /// Percentage differences from the average
        /// </summary>
        public Dictionary<string, decimal> DifferencesFromAverage { get; set; } = new Dictionary<string, decimal>();

        /// <summary>
        /// Rank of the segment for each metric (1 is best)
        /// </summary>
        public Dictionary<string, int> Ranks { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Time series data for the segment
        /// </summary>
        public Dictionary<string, List<DataPoint>> TimeSeries { get; set; } = new Dictionary<string, List<DataPoint>>();
    }

    /// <summary>
    /// Represents metric data for a segment
    /// </summary>
    public class SegmentMetricData
    {
        /// <summary>
        /// Metric name
        /// </summary>
        public string MetricName { get; set; }

        /// <summary>
        /// Values for each segment
        /// </summary>
        public List<decimal> Values { get; set; } = new List<decimal>();

        /// <summary>
        /// Percentage differences between segments
        /// </summary>
        public List<double> PercentageDifferences { get; set; } = new List<double>();

        /// <summary>
        /// Insights about the comparison
        /// </summary>
        public string Insight { get; set; }
    }
}
