using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a filter for queries
    /// </summary>
    public class Filter : Entity
    {
        /// <summary>
        /// Dimension to filter on
        /// </summary>
        public string Dimension { get; set; } = string.Empty;
        
        /// <summary>
        /// Operator for the filter (e.g., equals, contains, greater than)
        /// </summary>
        public string? Operator { get; set; }
        
        /// <summary>
        /// Value for the filter
        /// </summary>
        public object? Value { get; set; }
        
        /// <summary>
        /// Whether the filter is negated
        /// </summary>
        public bool IsNegated { get; set; }
    }
    
    /// <summary>
    /// Mapped filter with database fields
    /// </summary>
    public class MappedFilter
    {
        /// <summary>
        /// Database field to filter on
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Operator for the filter
        /// </summary>
        public string? Operator { get; set; }
        
        /// <summary>
        /// Value for the filter
        /// </summary>
        public object? Value { get; set; }
        
        /// <summary>
        /// Whether the filter is negated
        /// </summary>
        public bool IsNegated { get; set; }
    }
}