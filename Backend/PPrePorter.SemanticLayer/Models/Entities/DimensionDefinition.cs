using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Represents a dimension definition in the semantic layer
    /// </summary>
    public class DimensionDefinition
    {
        /// <summary>
        /// Gets or sets the name of the dimension
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the description of the dimension
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the database field that this dimension maps to
        /// </summary>
        public string DatabaseField { get; set; }

        /// <summary>
        /// Gets or sets the data type of the dimension
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Gets or sets the synonym terms that can be used to refer to this dimension
        /// </summary>
        public string[] Synonyms { get; set; }

        /// <summary>
        /// Gets or sets the category of the dimension (Time, User, Game, etc.)
        /// </summary>
        public string Category { get; set; }
    }
}