using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Translation
{    /// <summary>
    /// Represents the result of translating a query to SQL
    /// </summary>
    public class SqlTranslationResult
    {
        /// <summary>
        /// The generated SQL query
        /// </summary>
        public string Sql { get; set; } = string.Empty;

        /// <summary>
        /// Parameters for the SQL query
        /// </summary>
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Name of the main table in the query
        /// </summary>
        public string MainTable { get; set; } = string.Empty;

        /// <summary>
        /// Tables used in the query
        /// </summary>
        public List<string> UsedTables { get; set; } = new List<string>();

        /// <summary>
        /// Explanation of how the SQL was generated
        /// </summary>
        public string? Explanation { get; set; }

        /// <summary>
        /// Comparison queries for time-based comparisons
        /// </summary>
        public Dictionary<string, string>? ComparisonQueries { get; set; }
        /// </summary>
        public List<string>? OptimizationNotes { get; set; }

        /// <summary>
        /// Whether the translation was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Error message if translation failed
        /// </summary>
        public string? ErrorMessage { get; set; }
    }
}