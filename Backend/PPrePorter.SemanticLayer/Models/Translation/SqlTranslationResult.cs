using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
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
        public Dictionary<string, object>? Parameters { get; set; }
        
        /// <summary>
        /// Tables referenced in the query
        /// </summary>
        public List<string>? Tables { get; set; }
        
        /// <summary>
        /// Explanation of how the SQL was generated
        /// </summary>
        public string? Explanation { get; set; }
        
        /// <summary>
        /// Notes on optimization or performance
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
    
    /// <summary>
    /// Contextual information for a translation
    /// </summary>
    public class TranslationContext
    {
        /// <summary>
        /// ID of the user making the request
        /// </summary>
        public string? UserId { get; set; }
        
        /// <summary>
        /// User's role or permissions
        /// </summary>
        public string? UserRole { get; set; }
        
        /// <summary>
        /// Business context for the query
        /// </summary>
        public Dictionary<string, object>? BusinessContext { get; set; }
        
        /// <summary>
        /// Query-specific preferences
        /// </summary>
        public Dictionary<string, object>? QueryPreferences { get; set; }
    }
}