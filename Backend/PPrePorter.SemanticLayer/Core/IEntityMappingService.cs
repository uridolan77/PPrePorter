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
}
