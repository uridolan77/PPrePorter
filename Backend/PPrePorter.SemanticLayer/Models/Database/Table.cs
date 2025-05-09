using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database table
    /// </summary>
    public class Table
    {
        /// <summary>
        /// Name of the table
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Schema of the table
        /// </summary>
        public string Schema { get; set; } = "dbo";
          /// <summary>
        /// Description of the table
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Type of the table (Fact, Dimension, Bridge, etc.)
        /// </summary>
        public string Type { get; set; } = "Dimension";

        /// <summary>
        /// Approximate row count for the table
        /// </summary>
        public long RowCount { get; set; }

        /// <summary>
        /// Columns in the table
        /// </summary>
        public List<Column> Columns { get; set; } = new List<Column>();

        /// <summary>
        /// Primary key column names
        /// </summary>
        public List<string> PrimaryKeys { get; set; } = new List<string>();

        /// <summary>
        /// Indexes on the table
        /// </summary>
        public List<Index> Indexes { get; set; } = new List<Index>();

        /// <summary>
        /// Type of table (fact, dimension, lookup, etc.)
        /// </summary>
        public string TableType { get; set; } = "Regular";

        /// <summary>
        /// Gets the fully qualified name of the table
        /// </summary>
        public string FullName => $"{Schema}.{Name}";

        /// <summary>
        /// Gets a column by name
        /// </summary>
        public Column? GetColumn(string columnName)
        {
            return Columns.Find(c => c.Name.Equals(columnName, System.StringComparison.OrdinalIgnoreCase));
        }
    }



    /// <summary>
    /// Represents a database index
    /// </summary>
    public class Index
    {
        /// <summary>
        /// Name of the index
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Columns in the index
        /// </summary>
        public List<string> Columns { get; set; } = new List<string>();

        /// <summary>
        /// Whether the index is unique
        /// </summary>
        public bool IsUnique { get; set; }

        /// <summary>
        /// Type of index (clustered, nonclustered, etc.)
        /// </summary>
        public string IndexType { get; set; } = "NONCLUSTERED";
    }
}