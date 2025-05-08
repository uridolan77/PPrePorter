using PPrePorter.SemanticLayer.Models.Entities;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
    /// Represents the structured entities extracted from a query
    /// </summary>
    public class QueryEntities
    {
        /// <summary>
        /// Metrics to be calculated
        /// </summary>
        public List<Metric>? Metrics { get; set; }
        
        /// <summary>
        /// Dimensions to group by
        /// </summary>
        public List<string>? Dimensions { get; set; }
        
        /// <summary>
        /// Time range for the query
        /// </summary>
        public TimeRange? TimeRange { get; set; }
        
        /// <summary>
        /// Filters to apply
        /// </summary>
        public List<Filter>? Filters { get; set; }
        
        /// <summary>
        /// Field to sort by
        /// </summary>
        public Sort? SortBy { get; set; }
        
        /// <summary>
        /// Maximum number of rows to return
        /// </summary>
        public int? Limit { get; set; }
        
        /// <summary>
        /// Comparison to previous period
        /// </summary>
        public List<string>? Comparisons { get; set; }
    }
    
    /// <summary>
    /// Represents mapped query entities with database fields
    /// </summary>
    public class MappedQueryEntities
    {
        /// <summary>
        /// Metrics to be calculated
        /// </summary>
        public List<MappedMetric> Metrics { get; set; } = new List<MappedMetric>();
        
        /// <summary>
        /// Dimensions to group by
        /// </summary>
        public List<MappedDimension> Dimensions { get; set; } = new List<MappedDimension>();
        
        /// <summary>
        /// Time range for the query
        /// </summary>
        public TimeRange? TimeRange { get; set; }
        
        /// <summary>
        /// Filters to apply
        /// </summary>
        public List<MappedFilter> Filters { get; set; } = new List<MappedFilter>();
        
        /// <summary>
        /// Field to sort by
        /// </summary>
        public Sort? SortBy { get; set; }
        
        /// <summary>
        /// Maximum number of rows to return
        /// </summary>
        public int? Limit { get; set; }
        
        /// <summary>
        /// Comparison to previous period
        /// </summary>
        public List<string>? Comparisons { get; set; }
    }
}