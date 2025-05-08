using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Interface for mapping entities between semantic layer and database
    /// </summary>
    public interface IEntityMappingService
    {
        /// <summary>
        /// Extracts structured entities from a natural language query
        /// </summary>
        /// <param name="query">The natural language query</param>
        /// <returns>A QueryEntities object containing all extracted entities</returns>
        Task<QueryEntities> ExtractEntitiesFromQueryAsync(string query);
        
        /// <summary>
        /// Maps semantic entities to database fields
        /// </summary>
        /// <param name="entities">The extracted query entities</param>
        /// <returns>A MappedQueryEntities object with database mappings</returns>
        Task<MappedQueryEntities> MapEntitiesToDatabaseFieldsAsync(QueryEntities entities);
        
        /// <summary>
        /// Gets suggestions for an ambiguous entity
        /// </summary>
        /// <param name="entityType">The type of entity (metric, dimension, etc.)</param>
        /// <param name="term">The search term</param>
        /// <returns>A list of suggestion strings</returns>
        Task<List<string>> GetSuggestionsAsync(string entityType, string term);
        
        /// <summary>
        /// Records user feedback about entity mappings
        /// </summary>
        /// <param name="originalTerm">The original term from the query</param>
        /// <param name="mappedTerm">The term it was mapped to</param>
        /// <param name="isCorrect">Whether the mapping was correct</param>
        Task RecordFeedbackAsync(string originalTerm, string mappedTerm, bool isCorrect);
    }
}