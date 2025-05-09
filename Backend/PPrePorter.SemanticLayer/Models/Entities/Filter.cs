using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a filter in a query
    /// </summary>
    public class Filter : Entity
    {
        /// <summary>
        /// The field to filter on
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// The operator for the filter (equals, contains, etc.)
        /// </summary>
        public string Operator { get; set; } = "=";
        
        /// <summary>
        /// The value to filter by
        /// </summary>
        public object Value { get; set; } = string.Empty;
        
        /// <summary>
        /// The display value of the filter for user interfaces
        /// </summary>
        public string DisplayValue { get; set; } = string.Empty;
        
        /// <summary>
        /// Whether the filter is negated (e.g., "not equals")
        /// </summary>
        public bool IsNegated { get; set; }
    }
    
    /// <summary>
    /// Represents a mapped filter with database fields
    /// </summary>
    public class MappedFilter : Entity
    {
        /// <summary>
        /// The database field to filter on
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// The operator for the filter
        /// </summary>
        public string Operator { get; set; } = "=";
        
        /// <summary>
        /// The value to filter by
        /// </summary>
        public object Value { get; set; } = string.Empty;
        
        /// <summary>
        /// Whether the filter is negated
        /// </summary>
        public bool IsNegated { get; set; }
    }
}
