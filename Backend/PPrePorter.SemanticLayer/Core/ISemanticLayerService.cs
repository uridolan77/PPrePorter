using PPrePorter.SemanticLayer.Models.Translation;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Defines the core functionality of the semantic layer service
    /// </summary>
    public interface ISemanticLayerService
    {
        /// <summary>
        /// Translates a natural language query into SQL
        /// </summary>
        /// <param name="query">The natural language query</param>
        /// <param name="userId">Optional user ID for context-aware queries</param>
        /// <returns>SQL translation result</returns>
        Task<SqlTranslationResult> TranslateToSqlAsync(string query, string? userId = null);
        
        /// <summary>
        /// Translates a structured query into SQL
        /// </summary>
        /// <param name="entities">The structured query entities</param>
        /// <param name="context">Optional translation context</param>
        /// <returns>SQL translation result</returns>
        Task<SqlTranslationResult> TranslateEntitiesToSqlAsync(
            QueryEntities entities, 
            TranslationContext? context = null);
    }
}