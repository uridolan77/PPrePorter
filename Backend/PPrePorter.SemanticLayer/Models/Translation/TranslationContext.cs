using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
    /// Provides context for SQL translation operations
    /// </summary>
    public class TranslationContext
    {
        /// <summary>
        /// Gets or sets the prefix to use for SQL parameters
        /// </summary>
        public string ParameterPrefix { get; set; } = "@p";
        
        /// <summary>
        /// Gets or sets the counter for generating unique parameter names
        /// </summary>
        public int ParameterCounter { get; set; } = 0;
        
        /// <summary>
        /// Gets or sets the mapping of table names to aliases
        /// </summary>
        public Dictionary<string, string> TableAliases { get; set; } = new Dictionary<string, string>();
        
        /// <summary>
        /// Gets or sets the parameters for the SQL query
        /// </summary>
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Gets or sets the user ID for context-aware queries
        /// </summary>
        public string? UserId { get; set; }
    }
}
