using System.Collections.Generic;
using PPrePorter.SemanticLayer.Models.Entities;

namespace PPrePorter.SemanticLayer.Models.Translation
{    /// <summary>
    /// Represents the structured entities extracted from a query for translation
    /// </summary>
    public class TranslationQueryEntities
    {
        /// <summary>
        /// Metrics to be calculated
        /// </summary>
        public List<Models.Entities.Metric>? Metrics { get; set; }
        
        /// <summary>
        /// Dimensions to group by
        /// </summary>
        public List<string>? Dimensions { get; set; }
        
        /// <summary>
        /// Time range for the query
        /// </summary>
        public Models.Entities.TimeRange? TimeRange { get; set; }
        
        /// <summary>
        /// Filters to apply
        /// </summary>
        public List<Models.Entities.Filter>? Filters { get; set; }
        
        /// <summary>
        /// Field to sort by
        /// </summary>
        public Models.Entities.Sort? SortBy { get; set; }
        
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