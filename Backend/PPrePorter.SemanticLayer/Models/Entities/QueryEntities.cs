using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a query with extracted semantic entities
    /// </summary>
    public class QueryEntities
    {
        /// <summary>
        /// The original natural language query
        /// </summary>
        public string OriginalQuery { get; set; }
        
        /// <summary>
        /// List of metrics extracted from the query
        /// </summary>
        public List<Metric> Metrics { get; set; }
        
        /// <summary>
        /// List of dimensions extracted from the query
        /// </summary>
        public List<Dimension> Dimensions { get; set; }
        
        /// <summary>
        /// Time range extracted from the query
        /// </summary>
        public TimeRange TimeRange { get; set; }
        
        /// <summary>
        /// List of filters extracted from the query
        /// </summary>
        public List<Filter> Filters { get; set; }
        
        /// <summary>
        /// Sort order extracted from the query
        /// </summary>
        public Sort SortBy { get; set; }
        
        /// <summary>
        /// Limit number extracted from the query
        /// </summary>
        public int? Limit { get; set; }
        
        /// <summary>
        /// List of comparison types (e.g., year-over-year)
        /// </summary>
        public List<string> Comparisons { get; set; }
    }
    
    /// <summary>
    /// Represents a metric in a query
    /// </summary>
    public class Metric
    {
        /// <summary>
        /// The name of the metric
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// The display name of the metric for user interfaces
        /// </summary>
        public string DisplayName { get; set; }
        
        /// <summary>
        /// The aggregation function for the metric (SUM, AVG, etc.)
        /// </summary>
        public string Aggregation { get; set; }
    }
    
    /// <summary>
    /// Represents a dimension in a query
    /// </summary>
    public class Dimension
    {
        /// <summary>
        /// The name of the dimension
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// The display name of the dimension for user interfaces
        /// </summary>
        public string DisplayName { get; set; }
    }
    
    /// <summary>
    /// Represents a time range in a query
    /// </summary>
    public class TimeRange
    {
        /// <summary>
        /// The relative time period (e.g., "last 30 days")
        /// </summary>
        public string RelativePeriod { get; set; }
        
        /// <summary>
        /// The specific start date
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// The specific end date
        /// </summary>
        public DateTime? EndDate { get; set; }
    }
    
    /// <summary>
    /// Represents a filter in a query
    /// </summary>
    public class Filter
    {
        /// <summary>
        /// The field to filter on
        /// </summary>
        public string Field { get; set; }
        
        /// <summary>
        /// The operator for the filter (equals, contains, etc.)
        /// </summary>
        public string Operator { get; set; }
        
        /// <summary>
        /// The value to filter by
        /// </summary>
        public object Value { get; set; }
        
        /// <summary>
        /// The display value of the filter for user interfaces
        /// </summary>
        public string DisplayValue { get; set; }
        
        /// <summary>
        /// Whether the filter is negated (e.g., "not equals")
        /// </summary>
        public bool IsNegated { get; set; }
    }
    
    /// <summary>
    /// Represents a sort order in a query
    /// </summary>
    public class Sort
    {
        /// <summary>
        /// The field to sort by
        /// </summary>
        public string Field { get; set; }
        
        /// <summary>
        /// The sort direction (asc or desc)
        /// </summary>
        public string Direction { get; set; }
    }
    
    /// <summary>
    /// Represents a metric definition in the semantic layer
    /// </summary>
    public class MetricDefinition
    {
        /// <summary>
        /// The name of the metric
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// The description of the metric
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// The corresponding database field for the metric
        /// </summary>
        public string DatabaseField { get; set; }
        
        /// <summary>
        /// The default aggregation function for the metric
        /// </summary>
        public string DefaultAggregation { get; set; }
        
        /// <summary>
        /// Whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }
        
        /// <summary>
        /// The SQL formula for calculating the metric
        /// </summary>
        public string CalculationFormula { get; set; }
        
        /// <summary>
        /// The synonyms for the metric name
        /// </summary>
        public string[] Synonyms { get; set; }
    }
    
    /// <summary>
    /// Represents a dimension definition in the semantic layer
    /// </summary>
    public class DimensionDefinition
    {
        /// <summary>
        /// The name of the dimension
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// The description of the dimension
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// The corresponding database field for the dimension
        /// </summary>
        public string DatabaseField { get; set; }
        
        /// <summary>
        /// Whether this is a date dimension
        /// </summary>
        public bool IsDate { get; set; }
        
        /// <summary>
        /// The synonyms for the dimension name
        /// </summary>
        public string[] Synonyms { get; set; }
    }
}