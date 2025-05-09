using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Translation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Service for translating mapped entities to SQL
    /// </summary>
    public interface ISqlTranslationService
    {
        /// <summary>
        /// Translates mapped entities to SQL
        /// </summary>
        Task<SqlTranslationResult> TranslateToSqlAsync(
            MappedQueryEntities entities, 
            DataModel dataModel, 
            TranslationContext? context = null);
        
        /// <summary>
        /// Applies optimizations to a SQL translation result
        /// </summary>
        Task<SqlTranslationResult> ApplyOptimizationsAsync(
            SqlTranslationResult result, 
            DataModel dataModel);
        
        /// <summary>
        /// Validates a SQL query before execution
        /// </summary>
        Task<bool> ValidateSqlAsync(string sql, Dictionary<string, object>? parameters = null);
        
        /// <summary>
        /// Explains how a SQL query will be executed
        /// </summary>
        Task<string> ExplainSqlAsync(string sql, Dictionary<string, object>? parameters = null);
    }
}
