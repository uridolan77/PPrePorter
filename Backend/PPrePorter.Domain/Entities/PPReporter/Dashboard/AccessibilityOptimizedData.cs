using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents data optimized for accessibility
    /// </summary>
    public class AccessibilityOptimizedData
    {
        /// <summary>
        /// Title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Format
        /// </summary>
        public string Format { get; set; }

        /// <summary>
        /// Data
        /// </summary>
        public object Data { get; set; }

        /// <summary>
        /// Key insights
        /// </summary>
        public List<string> KeyInsights { get; set; } = new List<string>();

        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Visualization type
        /// </summary>
        public string VisualizationType { get; set; }

        /// <summary>
        /// Textual description of the data
        /// </summary>
        public string TextualDescription { get; set; }

        /// <summary>
        /// Tabular representation of the data
        /// </summary>
        public List<Dictionary<string, string>> TabularData { get; set; }

        /// <summary>
        /// Audio description of the data
        /// </summary>
        public string AudioDescription { get; set; }
    }
}
