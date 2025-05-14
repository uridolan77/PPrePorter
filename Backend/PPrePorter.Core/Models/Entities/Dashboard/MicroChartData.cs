using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents data for a micro chart
    /// </summary>
    public class MicroChartData
    {
        /// <summary>
        /// Chart ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Chart title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Chart type (e.g., "sparkline", "bullet", "mini_bar", "mini_pie")
        /// </summary>
        public string ChartType { get; set; }

        /// <summary>
        /// Metric being visualized
        /// </summary>
        public string Metric { get; set; }

        /// <summary>
        /// Current value of the metric
        /// </summary>
        public decimal CurrentValue { get; set; }

        /// <summary>
        /// Previous value of the metric
        /// </summary>
        public decimal PreviousValue { get; set; }

        /// <summary>
        /// Percentage change from previous value
        /// </summary>
        public decimal PercentageChange { get; set; }

        /// <summary>
        /// Target value for the metric
        /// </summary>
        public decimal? TargetValue { get; set; }

        /// <summary>
        /// Unit of measurement
        /// </summary>
        public string Unit { get; set; }

        /// <summary>
        /// Data points for the chart
        /// </summary>
        public List<MicroChartPoint> DataPoints { get; set; } = new List<MicroChartPoint>();

        /// <summary>
        /// Color for positive values
        /// </summary>
        public string PositiveColor { get; set; } = "#4caf50";

        /// <summary>
        /// Color for negative values
        /// </summary>
        public string NegativeColor { get; set; } = "#f44336";

        /// <summary>
        /// Color for neutral values
        /// </summary>
        public string NeutralColor { get; set; } = "#9e9e9e";

        /// <summary>
        /// Trend direction ("up", "down", "flat")
        /// </summary>
        public string TrendDirection { get; set; }
    }

    /// <summary>
    /// Represents a data point in a micro chart
    /// </summary>
    public class MicroChartPoint
    {
        /// <summary>
        /// X-value (typically a date)
        /// </summary>
        public DateTime? X { get; set; }

        /// <summary>
        /// Y-value
        /// </summary>
        public decimal Y { get; set; }

        /// <summary>
        /// Label for the point
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Color for the point
        /// </summary>
        public string Color { get; set; }
    }
}
