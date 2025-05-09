using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
    /// Base class for all entity mappings
    /// </summary>
    public class EntityMappingBase
    {
        /// <summary>
        /// Gets or sets the name of the entity
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the display name of the entity
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the database table containing the entity
        /// </summary>
        public string Table { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the database field for the entity
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Represents a mapping between a semantic dimension and a database field
    /// </summary>
    public class DimensionMapping : EntityMappingBase
    {
        /// <summary>
        /// Gets or sets whether this is a date dimension
        /// </summary>
        public bool IsDate { get; set; }
        
        /// <summary>
        /// Gets or sets the date granularity if this is a date dimension
        /// </summary>
        public string? DateGranularity { get; set; }
    }
    
    /// <summary>
    /// Represents a mapping between a semantic metric and a database field with aggregation
    /// </summary>
    public class MetricMapping : EntityMappingBase
    {
        /// <summary>
        /// Gets or sets the aggregation function to apply (SUM, AVG, COUNT, etc.)
        /// </summary>
        public string Aggregation { get; set; } = "SUM";
        
        /// <summary>
        /// Gets or sets whether this is a calculated metric
        /// </summary>
        public bool IsCalculated { get; set; }
        
        /// <summary>
        /// Gets or sets the SQL calculation formula for calculated metrics
        /// </summary>
        public string? CalculationFormula { get; set; }
    }
    
    /// <summary>
    /// Represents a mapping between a semantic filter and a database condition
    /// </summary>
    public class FilterMapping : EntityMappingBase
    {
        /// <summary>
        /// Gets or sets the operator to use (=, >, <, LIKE, etc.)
        /// </summary>
        public string Operator { get; set; } = "=";
        
        /// <summary>
        /// Gets or sets the value to filter by
        /// </summary>
        public object Value { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets whether the filter is negated
        /// </summary>
        public bool IsNegated { get; set; }
        
        /// <summary>
        /// Gets or sets whether this is a date filter
        /// </summary>
        public bool IsDateFilter { get; set; }
    }
    
    /// <summary>
    /// For backward compatibility with older code
    /// </summary>
    public class MappedFilter : FilterMapping
    {
    }
    
    /// <summary>
    /// Represents a mapping for sorting data
    /// </summary>
    public class SortMapping : EntityMappingBase
    {
        /// <summary>
        /// Gets or sets the field to sort by
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the sort direction (ASC or DESC)
        /// </summary>
        public string Direction { get; set; } = "ASC";
    }
}
