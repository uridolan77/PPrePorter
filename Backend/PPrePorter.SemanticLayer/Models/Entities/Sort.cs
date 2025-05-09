using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a sort order in a query
    /// </summary>
    public class Sort
    {
        /// <summary>
        /// The field to sort by
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// The sort direction (asc or desc)
        /// </summary>
        public string Direction { get; set; } = "ASC";
    }
    
    /// <summary>
    /// Represents a mapped sort with database fields
    /// </summary>
    public class MappedSort
    {
        /// <summary>
        /// The field to sort by
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// The database field to sort by
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// The sort direction (asc or desc)
        /// </summary>
        public string Direction { get; set; } = "ASC";
    }
}
