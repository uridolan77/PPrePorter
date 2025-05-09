using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Complete dashboard data including all sections
    /// </summary>
    public class DashboardData
    {
        public DashboardSummary Summary { get; set; }
        public List<CasinoRevenueItem> CasinoRevenue { get; set; }
        public List<PlayerRegistrationItem> PlayerRegistrations { get; set; }
        public List<TopGameItem> TopGames { get; set; }
        public List<RecentTransactionItem> RecentTransactions { get; set; }
    }

    /// <summary>
    /// Data for player journey Sankey diagram
    /// </summary>
    public class PlayerJourneySankeyData
    {
        public string SourceNode { get; set; }
        public string TargetNode { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
    }

    /// <summary>
    /// Data for heatmap visualization
    /// </summary>
    public class HeatmapData
    {
        public string Title { get; set; }
        public List<string> XLabels { get; set; }
        public List<string> YLabels { get; set; }
        public List<List<decimal>> Values { get; set; }
        public string MetricName { get; set; }
    }

    /// <summary>
    /// Request for segment comparison
    /// </summary>
    public class SegmentComparisonRequest : DashboardRequest
    {
        public string SegmentType { get; set; }
        public List<string> SegmentValues { get; set; }
        public string MetricToCompare { get; set; }
    }

    /// <summary>
    /// Data for segment comparison
    /// </summary>
    public class SegmentComparisonData
    {
        public string SegmentType { get; set; }
        public List<SegmentMetricData> Segments { get; set; }
        public string MetricName { get; set; }
    }

    /// <summary>
    /// Data for a single segment in comparison
    /// </summary>
    public class SegmentMetricData
    {
        public string SegmentName { get; set; }
        public decimal Value { get; set; }
        public decimal PercentChange { get; set; }
    }

    /// <summary>
    /// Data for micro charts
    /// </summary>
    public class MicroChartData
    {
        public string Title { get; set; }
        public string ChartType { get; set; } // "sparkline", "bullet", "minibar"
        public List<decimal> Values { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal TargetValue { get; set; }
    }

    /// <summary>
    /// Request for accessibility optimized data
    /// </summary>
    public class AccessibilityDataRequest : DashboardRequest
    {
        public string VisualizationType { get; set; } // "table", "audio", "simplified"
        public string MetricKey { get; set; }
    }

    /// <summary>
    /// Accessibility optimized data
    /// </summary>
    public class AccessibilityOptimizedData
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Format { get; set; }
        public object Data { get; set; }
        public List<string> KeyInsights { get; set; }
    }


}