using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Interfaces;

/// <summary>
/// Defines the core functionality for natural language processing entity extraction
/// </summary>
public interface IEntityExtractionService
{
    /// <summary>
    /// Extracts entities from a natural language query
    /// </summary>
    /// <param name="query">The natural language query text</param>
    /// <returns>A QueryEntities object containing all extracted entities</returns>
    Task<QueryEntities> ExtractEntitiesAsync(string query);
    
    /// <summary>
    /// Post-processes and resolves raw entities extracted from a query
    /// </summary>
    /// <param name="rawEntities">The raw entities extracted from NLP</param>
    /// <param name="originalQuery">The original query for context</param>
    /// <returns>A processed QueryEntities object with resolved database mappings</returns>
    Task<QueryEntities> PostProcessEntitiesAsync(QueryEntities rawEntities, string originalQuery);
    
    /// <summary>
    /// Checks for conflicts or ambiguities in the extracted entities
    /// </summary>
    /// <param name="entities">The processed entities to check</param>
    /// <returns>A list of entity conflicts that need resolution</returns>
    Task<List<EntityConflict>> CheckForEntityConflictsAsync(QueryEntities entities);
    
    /// <summary>
    /// Generates appropriate SQL based on the extracted and resolved entities
    /// </summary>
    /// <param name="entities">The processed and validated entities</param>
    /// <returns>A SQL query string that can be executed against the database</returns>
    Task<string> GenerateSqlFromEntitiesAsync(QueryEntities entities);
}