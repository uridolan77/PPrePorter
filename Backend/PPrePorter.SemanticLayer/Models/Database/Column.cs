namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database column
    /// </summary>
    public class Column
    {
        /// <summary>
        /// Name of the column
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Data type of the column
        /// </summary>
        public string DataType { get; set; } = string.Empty;

        /// <summary>
        /// Description of the column
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Whether the column is a primary key
        /// </summary>
        public bool IsPrimaryKey { get; set; }

        /// <summary>
        /// Whether the column is a foreign key
        /// </summary>
        public bool IsForeignKey { get; set; }

        /// <summary>
        /// Reference to another table if this is a foreign key
        /// </summary>
        public string? ForeignKeyReference { get; set; }

        /// <summary>
        /// Whether the column allows null values
        /// </summary>
        public bool IsNullable { get; set; }

        /// <summary>
        /// Whether the column is a date/time column
        /// </summary>
        public bool IsDate { get; set; }

        /// <summary>
        /// Whether the column is a numeric column
        /// </summary>
        public bool IsNumeric { get; set; }

        /// <summary>
        /// Whether the column is a text column
        /// </summary>
        public bool IsText { get; set; }

        /// <summary>
        /// Maximum length for string columns
        /// </summary>
        public int? MaxLength { get; set; }

        /// <summary>
        /// Precision for numeric columns
        /// </summary>
        public int? Precision { get; set; }

        /// <summary>
        /// Scale for numeric columns
        /// </summary>
        public int? Scale { get; set; }
    }
}
