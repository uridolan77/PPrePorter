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
        public string OriginalQuery { get; set; } = string.Empty;

        /// <summary>
        /// List of metrics extracted from the query
        /// </summary>
        public List<Metric> Metrics { get; set; } = new List<Metric>();

        /// <summary>
        /// List of dimensions extracted from the query
        /// </summary>
        public List<Dimension> Dimensions { get; set; } = new List<Dimension>();

        /// <summary>
        /// Time range extracted from the query
        /// </summary>
        public TimeRange TimeRange { get; set; } = new TimeRange();

        /// <summary>
        /// Filters extracted from the query
        /// </summary>
        public List<Filter> Filters { get; set; } = new List<Filter>();

        /// <summary>
        /// Sort order extracted from the query
        /// </summary>
        public Sort SortBy { get; set; } = new Sort();

        /// <summary>
        /// Limit on the number of results
        /// </summary>
        public int? Limit { get; set; }

        /// <summary>
        /// List of comparison types (e.g., year-over-year)
        /// </summary>
        public List<string> Comparisons { get; set; } = new List<string>();
    }


}