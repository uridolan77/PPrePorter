using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Complete dashboard data including all sections
    /// </summary>
    public class DashboardData
    {
        /// <summary>
        /// Dashboard summary
        /// </summary>
        public DashboardSummary Summary { get; set; }

        /// <summary>
        /// Casino revenue data
        /// </summary>
        public List<CasinoRevenueItem> CasinoRevenue { get; set; }

        /// <summary>
        /// Revenue data (alias for CasinoRevenue)
        /// </summary>
        public List<CasinoRevenueItem> RevenueData {
            get => CasinoRevenue;
            set => CasinoRevenue = value;
        }

        /// <summary>
        /// Player registrations data
        /// </summary>
        public List<PlayerRegistrationItem> PlayerRegistrations { get; set; }

        /// <summary>
        /// Registrations data (alias for PlayerRegistrations)
        /// </summary>
        public List<PlayerRegistrationItem> RegistrationsData {
            get => PlayerRegistrations;
            set => PlayerRegistrations = value;
        }

        /// <summary>
        /// Top games
        /// </summary>
        public List<TopGameItem> TopGames { get; set; }

        /// <summary>
        /// Recent transactions
        /// </summary>
        public List<RecentTransactionItem> RecentTransactions { get; set; }

        /// <summary>
        /// Insights
        /// </summary>
        public List<DashboardInsight> Insights { get; set; }

        /// <summary>
        /// Anomalies
        /// </summary>
        public List<DataAnomaly> Anomalies { get; set; }
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
        /// <summary>
        /// Segment type
        /// </summary>
        public string SegmentType { get; set; }

        /// <summary>
        /// Segments
        /// </summary>
        public List<SegmentMetricData> Segments { get; set; }

        /// <summary>
        /// Segments as strings (alias for Segments)
        /// </summary>
        public List<string> Segments_String {
            get => Segments?.ConvertAll(s => s.SegmentName);
            set {
                if (Segments == null)
                    Segments = new List<SegmentMetricData>();
                if (value != null) {
                    foreach (var segmentName in value) {
                        if (!Segments.Exists(s => s.SegmentName == segmentName)) {
                            Segments.Add(new SegmentMetricData { SegmentName = segmentName });
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Metric name
        /// </summary>
        public string MetricName { get; set; }

        /// <summary>
        /// Metrics (alias for MetricName)
        /// </summary>
        public List<string> Metrics {
            get => MetricName != null ? new List<string> { MetricName } : new List<string>();
            set => MetricName = value?.Count > 0 ? value[0] : null;
        }

        /// <summary>
        /// Values for each segment and metric
        /// </summary>
        public Dictionary<string, Dictionary<string, decimal>> Values { get; set; } = new Dictionary<string, Dictionary<string, decimal>>();
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



}