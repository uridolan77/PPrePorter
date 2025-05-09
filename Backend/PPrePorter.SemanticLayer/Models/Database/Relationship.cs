using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a relationship between tables
    /// </summary>
    public class Relationship
    {
        /// <summary>
        /// Name of the relationship
        /// </summary>
        public string Name { get; set; } = string.Empty;
          /// <summary>
        /// Source table of the relationship
        /// </summary>
        public string FromTable { get; set; } = string.Empty;

        /// <summary>
        /// Source table of the relationship (alias for FromTable)
        /// </summary>
        public string SourceTable {
            get => FromTable;
            set => FromTable = value;
        }

        /// <summary>
        /// Source column of the relationship
        /// </summary>
        public string FromColumn { get; set; } = string.Empty;

        /// <summary>
        /// Source column of the relationship (alias for FromColumn)
        /// </summary>
        public string SourceColumn {
            get => FromColumn;
            set => FromColumn = value;
        }

        /// <summary>
        /// Target table of the relationship
        /// </summary>
        public string ToTable { get; set; } = string.Empty;

        /// <summary>
        /// Target table of the relationship (alias for ToTable)
        /// </summary>
        public string TargetTable {
            get => ToTable;
            set => ToTable = value;
        }

        /// <summary>
        /// Target column of the relationship
        /// </summary>
        public string ToColumn { get; set; } = string.Empty;

        /// <summary>
        /// Target column of the relationship (alias for ToColumn)
        /// </summary>
        public string TargetColumn {
            get => ToColumn;
            set => ToColumn = value;
        }

        /// <summary>
        /// Type of relationship (One-to-One, One-to-Many, etc.)
        /// </summary>
        public string RelationshipType { get; set; } = "OneToMany";

        /// <summary>
        /// Cardinality of the relationship (1:1, 1:N, N:N)
        /// </summary>
        public string Cardinality { get; set; } = "1:N";
    }
}