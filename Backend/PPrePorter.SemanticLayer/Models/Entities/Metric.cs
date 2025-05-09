using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a metric that can be measured or calculated
    /// </summary>
    public class Metric : Entity
    {
        /// <summary>
        /// Aggregation function to apply (e.g., sum, avg, count)
        /// </summary>
        public string Aggregation { get; set; } = "SUM";

        /// <summary>
        /// Custom calculation expression if this is a calculated metric
        /// </summary>
        public string Expression { get; set; } = string.Empty;

        /// <summary>
        /// The display name of the metric for user interfaces
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents a metric definition in the semantic layer
    /// </summary>
    public class MetricDefinition : Entity
    {
        /// <summary>
        /// The corresponding database field for the metric
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;

        /// <summary>
        /// The default aggregation function for the metric
        /// </summary>
        public string DefaultAggregation { get; set; } = "SUM";

        /// <summary>
        /// Whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }

        /// <summary>
        /// The SQL formula for calculating the metric
        /// </summary>
        public string CalculationFormula { get; set; } = string.Empty;

        /// <summary>
        /// The data type of the metric (number, currency, percentage, etc.)
        /// </summary>
        public string DataType { get; set; } = "number";

        /// <summary>
        /// The format string for displaying the metric
        /// </summary>
        public string FormatString { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents a mapped metric with database fields
    /// </summary>
    public class MappedMetric : Entity
    {
        /// <summary>
        /// The display name of the metric
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// The database field for the metric
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;

        /// <summary>
        /// The aggregation function to use
        /// </summary>
        public string Aggregation { get; set; } = "SUM";

        /// <summary>
        /// Whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }

        /// <summary>
        /// The SQL formula for calculating the metric
        /// </summary>
        public string CalculationFormula { get; set; } = string.Empty;
    }
}
