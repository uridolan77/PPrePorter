using PPrePorter.NLP.Models;
using PPrePorter.NLP.Models.Dictionaries;

namespace PPrePorter.NLP.Interfaces;

/// <summary>
/// Defines functionality for managing domain-specific knowledge for NLP entity resolution
/// </summary>
public interface IDomainKnowledgeService
{
    /// <summary>
    /// Gets all known metrics in the gaming domain
    /// </summary>
    /// <returns>A dictionary of metric keys to DbMetric objects</returns>
    Dictionary<string, DbMetric> GetMetricMappings();
    
    /// <summary>
    /// Gets all known dimensions in the gaming domain
    /// </summary>
    /// <returns>A dictionary of dimension keys to DbDimension objects</returns>
    Dictionary<string, DbDimension> GetDimensionMappings();
    
    /// <summary>
    /// Maps a natural language metric term to a known database field
    /// </summary>
    /// <param name="metricTerm">The natural language term for the metric</param>
    /// <returns>The mapped DbMetric if found, or null if not matched</returns>
    DbMetric? MapMetricToDatabaseField(string metricTerm);
    
    /// <summary>
    /// Maps a natural language dimension term to a known database field
    /// </summary>
    /// <param name="dimensionTerm">The natural language term for the dimension</param>
    /// <returns>The mapped DbDimension if found, or null if not matched</returns>
    DbDimension? MapDimensionToDatabaseField(string dimensionTerm);
    
    /// <summary>
    /// Resolves a time expression to an actual date range
    /// </summary>
    /// <param name="timeRange">The time range entity to resolve</param>
    /// <returns>A resolved TimeRange with explicit start and end dates</returns>
    TimeRange ResolveTimeRange(TimeRange timeRange);
    
    /// <summary>
    /// Records feedback about entity mappings to improve future performance
    /// </summary>
    /// <param name="term">The original term from the query</param>
    /// <param name="mappedEntity">The entity it was mapped to</param>
    /// <param name="isCorrect">Whether the mapping was correct</param>
    /// <param name="correction">Optional correction if the mapping was wrong</param>
    Task RecordMappingFeedbackAsync(string term, string mappedEntity, bool isCorrect, string? correction = null);
}