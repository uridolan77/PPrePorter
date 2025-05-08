using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a sort order for queries
    /// </summary>
    public class Sort : Entity
    {
        /// <summary>
        /// Field to sort by (metric or dimension name)
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// Direction of sorting (asc or desc)
        /// </summary>
        public string Direction { get; set; } = "asc";
    }
}