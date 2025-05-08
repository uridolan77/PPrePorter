using System;
using System.Collections.Generic;
using System.Linq;
using PPrePorter.SemanticLayer.Models.Entities;

namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
    /// Represents a mapped query with dimensions and metrics ready for execution
    /// </summary>
    public class MappedQueryEntities
    {
        /// <summary>
        /// Gets or sets the dimensions selected for the query
        /// </summary>
        public List<DimensionMapping> Dimensions { get; set; } = new List<DimensionMapping>();

        /// <summary>
        /// Gets or sets the metrics selected for the query
        /// </summary>
        public List<MetricMapping> Metrics { get; set; } = new List<MetricMapping>();

        /// <summary>
        /// Gets or sets the filters applied to the query
        /// </summary>
        public List<FilterMapping> Filters { get; set; } = new List<FilterMapping>();

        /// <summary>
        /// Gets or sets the sort order for the query results
        /// </summary>
        public List<SortMapping> SortOrder { get; set; } = new List<SortMapping>();

        /// <summary>
        /// Gets or sets the limit for the number of rows to return
        /// </summary>
        public int? RowLimit { get; set; }

        /// <summary>
        /// Gets or sets the SQL query generated from the mappings
        /// </summary>
        public string GeneratedSql { get; set; }

        /// <summary>
        /// Gets or sets the database connection string to use for this query
        /// </summary>
        public string ConnectionString { get; set; }

        /// <summary>
        /// Gets or sets the execution time of the query in milliseconds
        /// </summary>
        public long ExecutionTimeMs { get; set; }

        /// <summary>
        /// Gets or sets the timestamp when the query was executed
        /// </summary>
        public DateTime ExecutionTimestamp { get; set; }
    }

    /// <summary>
    /// Represents a mapping between a dimension name and its database field
    /// </summary>
    public class DimensionMapping
    {
        /// <summary>
        /// Gets or sets the dimension definition
        /// </summary>
        public DimensionDefinition Dimension { get; set; }

        /// <summary>
        /// Gets or sets the alias to use in the SQL query
        /// </summary>
        public string Alias { get; set; }

        /// <summary>
        /// Gets or sets the SQL expression for the dimension
        /// </summary>
        public string SqlExpression { get; set; }
    }

    /// <summary>
    /// Represents a mapping between a metric name and its database field and aggregation
    /// </summary>
    public class MetricMapping
    {
        /// <summary>
        /// Gets or sets the metric definition
        /// </summary>
        public MetricDefinition Metric { get; set; }

        /// <summary>
        /// Gets or sets the alias to use in the SQL query
        /// </summary>
        public string Alias { get; set; }

        /// <summary>
        /// Gets or sets the SQL expression for the metric, including the aggregation function
        /// </summary>
        public string SqlExpression { get; set; }
    }

    /// <summary>
    /// Represents a mapping for a filter applied to a dimension or metric
    /// </summary>
    public class FilterMapping
    {
        /// <summary>
        /// Gets or sets the dimension or metric being filtered
        /// </summary>
        public object Entity { get; set; }

        /// <summary>
        /// Gets or sets the operator for the filter (=, >, <, LIKE, etc.)
        /// </summary>
        public string Operator { get; set; }

        /// <summary>
        /// Gets or sets the value to filter by
        /// </summary>
        public object Value { get; set; }

        /// <summary>
        /// Gets or sets the SQL expression for the filter
        /// </summary>
        public string SqlExpression { get; set; }
    }

    /// <summary>
    /// Represents a mapping for sorting the query results
    /// </summary>
    public class SortMapping
    {
        /// <summary>
        /// Gets or sets the dimension or metric to sort by
        /// </summary>
        public object Entity { get; set; }

        /// <summary>
        /// Gets or sets the direction of the sort (ASC or DESC)
        /// </summary>
        public string Direction { get; set; }

        /// <summary>
        /// Gets or sets the SQL expression for the sort
        /// </summary>
        public string SqlExpression { get; set; }
    }
}