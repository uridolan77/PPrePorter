using System;
using System.Collections.Generic;
using System.Linq;
using PPrePorter.SemanticLayer.Models.Entities;

namespace PPrePorter.SemanticLayer.Models.Translation
{    /// <summary>
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
        /// Gets or sets the time range for the query
        /// </summary>
        public Models.Entities.TimeRange? TimeRange { get; set; }

        /// <summary>
        /// Gets or sets the sort by field configuration
        /// </summary>
        public SortMapping? SortBy { get; set; }

        /// <summary>
        /// Gets or sets the row limit
        /// </summary>
        public int? Limit { get; set; }

        /// <summary>
        /// Gets or sets the comparison options for the query
        /// </summary>
        public List<string> Comparisons { get; set; } = new List<string>();

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


}