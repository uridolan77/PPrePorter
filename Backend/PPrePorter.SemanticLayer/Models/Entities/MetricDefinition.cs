using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a metric definition in the semantic layer
    /// </summary>
    public class MetricDefinition
    {
        /// <summary>
        /// Gets or sets the name of the metric
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the description of the metric
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the database field that this metric maps to
        /// </summary>
        public string DatabaseField { get; set; }

        /// <summary>
        /// Gets or sets the default aggregation function for this metric (SUM, AVG, COUNT, etc.)
        /// </summary>
        public string DefaultAggregation { get; set; }

        /// <summary>
        /// Gets or sets the data type of the metric
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Gets or sets the format string to use when displaying this metric
        /// </summary>
        public string FormatString { get; set; }

        /// <summary>
        /// Gets or sets the synonym terms that can be used to refer to this metric
        /// </summary>
        public string[] Synonyms { get; set; }

        /// <summary>
        /// Gets or sets the category of the metric (Financial, Engagement, Performance, etc.)
        /// </summary>
        public string Category { get; set; }
    }
}