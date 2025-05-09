using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        /// </summary>        /// <param name="entities">The structured query entities</param>
        /// <param name="context">Optional translation context</param>
        /// <returns>SQL translation result</returns>
        Task<SqlTranslationResult> TranslateEntitiesToSqlAsync(
            Models.Entities.QueryEntities entities, 
            TranslationContext? context = null);
            
        /// <summary>
        /// Gets entity suggestions for a term
        /// </summary>
        Task<List<string>> GetSuggestionsAsync(string entityType, string term);
        
        /// <summary>
        /// Records user feedback about entity mappings
        /// </summary>
        Task RecordFeedbackAsync(string originalTerm, string mappedTerm, bool isCorrect);
        
        /// <summary>
        /// Gets the current data model
        /// </summary>
        Task<DataModel> GetDataModelAsync();
        
        /// <summary>
        /// Refreshes the data model from the database
        /// </summary>
        Task<DataModel> RefreshDataModelAsync();
        
        /// <summary>
        /// Clears the cache
        /// </summary>
        Task ClearCacheAsync();
    }
}