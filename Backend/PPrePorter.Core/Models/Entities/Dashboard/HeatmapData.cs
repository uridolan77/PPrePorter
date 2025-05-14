using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents data for a heatmap visualization
    /// </summary>
    public class HeatmapData
    {
        /// <summary>
        /// X-axis labels
        /// </summary>
        public List<string> XLabels { get; set; } = new List<string>();

        /// <summary>
        /// Y-axis labels
        /// </summary>
        public List<string> YLabels { get; set; } = new List<string>();

        /// <summary>
        /// Data values for the heatmap
        /// </summary>
        public List<List<decimal>> Values { get; set; } = new List<List<decimal>>();

        /// <summary>
        /// Minimum value in the data
        /// </summary>
        public decimal MinValue { get; set; }

        /// <summary>
        /// Maximum value in the data
        /// </summary>
        public decimal MaxValue { get; set; }

        /// <summary>
        /// Title of the heatmap
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Subtitle of the heatmap
        /// </summary>
        public string Subtitle { get; set; }

        /// <summary>
        /// X-axis title
        /// </summary>
        public string XAxisTitle { get; set; }

        /// <summary>
        /// Y-axis title
        /// </summary>
        public string YAxisTitle { get; set; }

        /// <summary>
        /// Color scale for the heatmap
        /// </summary>
        public List<string> ColorScale { get; set; } = new List<string>();

        /// <summary>
        /// Metric being visualized
        /// </summary>
        public string Metric { get; set; }

        /// <summary>
        /// Unit of measurement
        /// </summary>
        public string Unit { get; set; }
    }
}
