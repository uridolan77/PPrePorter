using Microsoft.Extensions.Logging;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Services;

/// <summary>
/// Main facade service for Natural Language Processing in the PPrePorter application
/// </summary>
public class NaturalLanguageQueryService : INaturalLanguageQueryService
{
    private readonly ILogger<NaturalLanguageQueryService> _logger;
    private readonly IEntityExtractionService _entityExtractionService;
    private readonly IClarificationService _clarificationService;
    
    public NaturalLanguageQueryService(
        ILogger<NaturalLanguageQueryService> logger,
        IEntityExtractionService entityExtractionService,
        IClarificationService clarificationService)
    {
        _logger = logger;
        _entityExtractionService = entityExtractionService;
        _clarificationService = clarificationService;
    }
    
    /// <summary>
    /// Processes a natural language query and extracts structured entities
    /// </summary>
    /// <param name="query">The natural language query from the user</param>
    /// <returns>A result containing the extracted entities and clarification needs</returns>
    public async Task<NlpQueryResult> ProcessQueryAsync(string query)
    {
        try
        {
            _logger.LogInformation("Processing natural language query: {Query}", query);
            
            // Extract entities from the query
            var entities = await _entityExtractionService.ExtractEntitiesAsync(query);
            
            // Check if clarification is needed
            var clarificationResponse = await _clarificationService.RequestClarificationAsync(entities);
            
            if (clarificationResponse.NeedsClarification)
            {
                _logger.LogInformation("Query requires clarification: {Count} conflicts found", 
                    clarificationResponse.Conflicts?.Count ?? 0);
                
                return new NlpQueryResult
                {
                    IsSuccessful = true,
                    NeedsClarification = true,
                    Entities = entities,
                    ClarificationResponse = clarificationResponse
                };
            }
            
            // If no clarification is needed, generate SQL
            var sql = await _entityExtractionService.GenerateSqlFromEntitiesAsync(entities);
            
            return new NlpQueryResult
            {
                IsSuccessful = true,
                NeedsClarification = false,
                Entities = entities,
                Sql = sql
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing natural language query: {Query}", query);
            
            return new NlpQueryResult
            {
                IsSuccessful = false,
                ErrorMessage = $"Error processing query: {ex.Message}"
            };
        }
    }
    
    /// <summary>
    /// Applies user clarification responses and completes query processing
    /// </summary>
    /// <param name="originalEntities">The original entities from the first processing step</param>
    /// <param name="clarificationResponses">The user's responses to clarification prompts</param>
    /// <returns>A result containing the updated entities and generated SQL</returns>
    public async Task<NlpQueryResult> ApplyClarificationAsync(
        QueryEntities originalEntities, 
        Dictionary<string, string> clarificationResponses)
    {
        try
        {
            _logger.LogInformation("Applying clarification responses: {Count} responses received", 
                clarificationResponses?.Count ?? 0);
            
            // Apply the clarification responses
            var updatedEntities = await _clarificationService.ApplyClarificationResponsesAsync(
                originalEntities, clarificationResponses);
            
            // Check if any conflicts remain
            var clarificationResponse = await _clarificationService.RequestClarificationAsync(updatedEntities);
            
            if (clarificationResponse.NeedsClarification)
            {
                _logger.LogInformation("Additional clarification needed after applying responses");
                
                return new NlpQueryResult
                {
                    IsSuccessful = true,
                    NeedsClarification = true,
                    Entities = updatedEntities,
                    ClarificationResponse = clarificationResponse
                };
            }
            
            // If no further clarification is needed, generate SQL
            var sql = await _entityExtractionService.GenerateSqlFromEntitiesAsync(updatedEntities);
            
            return new NlpQueryResult
            {
                IsSuccessful = true,
                NeedsClarification = false,
                Entities = updatedEntities,
                Sql = sql
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying clarification responses");
            
            return new NlpQueryResult
            {
                IsSuccessful = false,
                ErrorMessage = $"Error applying clarification: {ex.Message}"
            };
        }
    }
}