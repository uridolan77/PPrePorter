using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a dimension for data analysis
    /// </summary>
    public class Dimension : Entity
    {
    }
    
    /// <summary>
    /// Definition of a dimension in the data model
    /// </summary>
    public class DimensionDefinition : Entity
    {
        /// <summary>
        /// Field in the database that holds this dimension
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Whether this dimension is a date field
        /// </summary>
        public bool IsDate { get; set; }
        
        /// <summary>
        /// Whether this is a primary dimension for the category
        /// </summary>
        public bool IsPrimary { get; set; }
    }
    
    /// <summary>
    /// Mapped dimension with database fields
    /// </summary>
    public class MappedDimension : Entity
    {
        /// <summary>
        /// Field in the database that holds this dimension
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Whether this dimension is a date field
        /// </summary>
        public bool IsDate { get; set; }
        
        /// <summary>
        /// Whether this is a primary dimension for the category
        /// </summary>
        public bool IsPrimary { get; set; }
    }
}