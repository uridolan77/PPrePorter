using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Translation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Interface for services that map entities between the semantic layer and database
    /// </summary>
    public interface IEntityMappingService
    {
        /// <summary>
        /// Extracts structured entities from a natural language query
        /// </summary>
        Task<QueryEntities> ExtractEntitiesFromQueryAsync(string query);
        
        /// <summary>
        /// Maps semantic entities to database fields
        /// </summary>
        Task<MappedQueryEntities> MapEntitiesToDatabaseFieldsAsync(QueryEntities entities);
        
        /// <summary>
        /// Gets suggestions for an ambiguous entity
        /// </summary>
        Task<List<string>> GetSuggestionsAsync(string entityType, string term);
        
        /// <summary>
        /// Records user feedback about entity mappings
        /// </summary>
        Task RecordFeedbackAsync(string originalTerm, string mappedTerm, bool isCorrect);
    }
    
    /// <summary>
    /// Interface for services that translate mapped entities to SQL
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
    
    /// <summary>
    /// Interface for services that provide data model information
    /// </summary>
    public interface IDataModelService
    {
        /// <summary>
        /// Gets the current data model
        /// </summary>
        Task<DataModel> GetDataModelAsync();
        
        /// <summary>
        /// Gets a table from the data model
        /// </summary>
        Task<Table?> GetTableAsync(string tableName);
        
        /// <summary>
        /// Gets a view from the data model
        /// </summary>
        Task<View?> GetViewAsync(string viewName);
        
        /// <summary>
        /// Gets relationships for a table
        /// </summary>
        Task<List<Relationship>> GetRelationshipsAsync(string tableName);
        
        /// <summary>
        /// Refreshes the data model from the database
        /// </summary>
        Task RefreshDataModelAsync();
    }
    
    /// <summary>
    /// Interface for cache services
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Gets a cached translation result
        /// </summary>
        Task<SqlTranslationResult?> GetCachedTranslationAsync(string cacheKey);
        
        /// <summary>
        /// Adds a translation result to the cache
        /// </summary>
        Task CacheTranslationAsync(string cacheKey, SqlTranslationResult result);
        
        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        Task<bool> ContainsKeyAsync(string cacheKey);
        
        /// <summary>
        /// Removes a specific key from the cache
        /// </summary>
        Task RemoveAsync(string cacheKey);
        
        /// <summary>
        /// Invalidates cache entries by pattern
        /// </summary>
        Task InvalidateByPatternAsync(string keyPattern);
        
        /// <summary>
        /// Clears all cache entries
        /// </summary>
        Task ClearAllAsync();
        
        /// <summary>
        /// Gets cache statistics
        /// </summary>
        Task<CacheStatistics> GetStatisticsAsync();
        
        /// <summary>
        /// Generates a cache key from the query entities
        /// </summary>
        string GenerateCacheKey(QueryEntities entities);
    }
}