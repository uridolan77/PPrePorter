using System;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a dimension in a query
    /// </summary>
    public class Dimension : Entity
    {
        /// <summary>
        /// The display name of the dimension for user interfaces
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents a dimension definition in the semantic layer
    /// </summary>
    public class DimensionDefinition : Entity
    {
        /// <summary>
        /// The corresponding database field for the dimension
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;

        /// <summary>
        /// Whether this is a date dimension
        /// </summary>
        public bool IsDate { get; set; }

        /// <summary>
        /// The data type of the dimension (string, integer, date, etc.)
        /// </summary>
        public string DataType { get; set; } = "string";

        /// <summary>
        /// Whether this is a primary dimension
        /// </summary>
        public bool IsPrimary { get; set; }
    }

    /// <summary>
    /// Represents a mapped dimension with database fields
    /// </summary>
    public class MappedDimension : Entity
    {
        /// <summary>
        /// The display name of the dimension
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// The database field for the dimension
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;

        /// <summary>
        /// Whether this is a date dimension
        /// </summary>
        public bool IsDate { get; set; }
    }
}
