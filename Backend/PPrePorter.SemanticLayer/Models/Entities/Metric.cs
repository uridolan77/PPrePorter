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
        public string? Aggregation { get; set; }
        
        /// <summary>
        /// Custom calculation expression if this is a calculated metric
        /// </summary>
        public string? Expression { get; set; }
    }
    
    /// <summary>
    /// Definition of a metric in the data model
    /// </summary>
    public class MetricDefinition : Entity
    {
        /// <summary>
        /// Field in the database that holds this metric
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Default aggregation to apply to this metric
        /// </summary>
        public string DefaultAggregation { get; set; } = "sum";
        
        /// <summary>
        /// Format to display this metric (e.g., currency, percentage, number)
        /// </summary>
        public string Format { get; set; } = "number";
        
        /// <summary>
        /// Whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }
        
        /// <summary>
        /// Formula for calculating this metric
        /// </summary>
        public string? CalculationFormula { get; set; }
    }
    
    /// <summary>
    /// Mapped metric with database fields and aggregations
    /// </summary>
    public class MappedMetric : Entity
    {
        /// <summary>
        /// Field in the database that holds this metric
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Aggregation function to apply
        /// </summary>
        public string Aggregation { get; set; } = "sum";
        
        /// <summary>
        /// Format for display
        /// </summary>
        public string Format { get; set; } = "number";
        
        /// <summary>
        /// Whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }
        
        /// <summary>
        /// Formula for calculation
        /// </summary>
        public string? CalculationFormula { get; set; }
        
        /// <summary>
        /// Whether this metric is part of a calculated metric
        /// </summary>
        public bool IsPartOfCalculation { get; set; }
    }
}