using Microsoft.Extensions.Logging;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Services;

/// <summary>
/// Service that handles ambiguity and clarification dialogs for entity extraction
/// </summary>
public class ClarificationService : IClarificationService
{
    private readonly ILogger<ClarificationService> _logger;
    private readonly IDomainKnowledgeService _domainKnowledgeService;
    
    public ClarificationService(
        ILogger<ClarificationService> logger,
        IDomainKnowledgeService domainKnowledgeService)
    {
        _logger = logger;
        _domainKnowledgeService = domainKnowledgeService;
    }
    
    /// <summary>
    /// Determines if a query needs clarification based on detected conflicts
    /// </summary>
    public async Task<ClarificationResponse> RequestClarificationAsync(QueryEntities entities)
    {
        if (entities == null)
            return new ClarificationResponse { NeedsClarification = false };
        
        try
        {
            // If there are no conflicts, no clarification is needed
            if (entities.Conflicts == null || !entities.Conflicts.Any())
            {
                return new ClarificationResponse { NeedsClarification = false };
            }
            
            // Generate clarification prompts based on the conflicts
            var clarificationPrompts = GenerateClarificationPrompts(entities.Conflicts);
            
            return new ClarificationResponse
            {
                NeedsClarification = true,
                Conflicts = entities.Conflicts,
                ClarificationPrompts = clarificationPrompts
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting clarification for query entities");
            throw;
        }
    }
    
    /// <summary>
    /// Processes user responses to clarification prompts
    /// </summary>
    public async Task<QueryEntities> ApplyClarificationResponsesAsync(
        QueryEntities originalEntities, 
        Dictionary<string, string> clarificationResponses)
    {
        if (originalEntities == null)
            throw new ArgumentNullException(nameof(originalEntities));
            
        if (clarificationResponses == null || !clarificationResponses.Any())
            return originalEntities;
        
        try
        {
            var updatedEntities = new QueryEntities
            {
                TimeRange = originalEntities.TimeRange,
                Metrics = originalEntities.Metrics != null ? new List<Metric>(originalEntities.Metrics) : new List<Metric>(),
                Dimensions = originalEntities.Dimensions != null ? new List<Dimension>(originalEntities.Dimensions) : new List<Dimension>(),
                Filters = originalEntities.Filters != null ? new List<Filter>(originalEntities.Filters) : new List<Filter>(),
                Comparisons = originalEntities.Comparisons != null ? new List<Comparison>(originalEntities.Comparisons) : new List<Comparison>(),
                SortBy = originalEntities.SortBy,
                Limit = originalEntities.Limit
            };
            
            // Process each clarification response
            foreach (var response in clarificationResponses)
            {
                // Parse the conflict ID to determine the conflict type and original term
                var conflictParts = response.Key.Split('|');
                if (conflictParts.Length < 2)
                    continue;
                
                var conflictType = conflictParts[0];
                var originalTerm = conflictParts[1];
                var userResponse = response.Value;
                
                switch (conflictType)
                {
                    case "MissingMetric":
                        // Add the specified metric
                        ApplyMetricClarification(updatedEntities, userResponse);
                        break;
                        
                    case "AmbiguousMetric":
                        // Replace the ambiguous metric with the clarified one
                        ReplaceAmbiguousMetric(updatedEntities, originalTerm, userResponse);
                        break;
                        
                    case "UnknownMetric":
                        // Replace the unknown metric with the selected known one
                        ReplaceUnknownMetric(updatedEntities, originalTerm, userResponse);
                        break;
                        
                    case "AmbiguousDimension":
                        // Replace the ambiguous dimension with the clarified one
                        ReplaceAmbiguousDimension(updatedEntities, originalTerm, userResponse);
                        break;
                        
                    case "UnknownDimension":
                        // Replace the unknown dimension with the selected known one
                        ReplaceUnknownDimension(updatedEntities, originalTerm, userResponse);
                        break;
                        
                    case "InvalidFilterValue":
                        // Update the filter with the corrected value
                        UpdateFilterValue(updatedEntities, originalTerm, userResponse);
                        break;
                }
            }
            
            // Clear the conflicts since they've been addressed
            updatedEntities.Conflicts = null;
            
            return updatedEntities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying clarification responses");
            throw;
        }
    }
    
    /// <summary>
    /// Generates appropriate clarification prompts based on entity conflicts
    /// </summary>
    public List<ClarificationPrompt> GenerateClarificationPrompts(List<EntityConflict> conflicts)
    {
        var prompts = new List<ClarificationPrompt>();
        
        foreach (var conflict in conflicts)
        {
            switch (conflict.ConflictType)
            {
                case EntityConflictType.MissingRequired:
                    if (conflict.EntityType == "Metrics")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = "Which metric would you like to see?",
                            Options = conflict.Suggestions,
                            ConflictId = $"MissingMetric|required"
                        });
                    }
                    break;
                    
                case EntityConflictType.Ambiguous:
                    if (conflict.EntityType == "Metric")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = $"Did you mean one of these metrics when you specified '{conflict.OriginalTerm}'?",
                            Options = conflict.Suggestions,
                            ConflictId = $"AmbiguousMetric|{conflict.OriginalTerm}"
                        });
                    }
                    else if (conflict.EntityType == "Dimension")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = $"Did you mean one of these dimensions when you specified '{conflict.OriginalTerm}'?",
                            Options = conflict.Suggestions,
                            ConflictId = $"AmbiguousDimension|{conflict.OriginalTerm}"
                        });
                    }
                    break;
                    
                case EntityConflictType.Unknown:
                    if (conflict.EntityType == "Metric")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = $"The metric '{conflict.OriginalTerm}' is not recognized. Which of these metrics would you like to use instead?",
                            Options = conflict.Suggestions,
                            ConflictId = $"UnknownMetric|{conflict.OriginalTerm}"
                        });
                    }
                    else if (conflict.EntityType == "Dimension")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = $"The dimension '{conflict.OriginalTerm}' is not recognized. Which of these dimensions would you like to use instead?",
                            Options = conflict.Suggestions,
                            ConflictId = $"UnknownDimension|{conflict.OriginalTerm}"
                        });
                    }
                    break;
                    
                case EntityConflictType.InvalidValue:
                    if (conflict.EntityType == "Filter")
                    {
                        prompts.Add(new ClarificationPrompt
                        {
                            Type = "selection",
                            Question = $"The value '{conflict.OriginalTerm}' is not valid. Please select a valid value:",
                            Options = conflict.Suggestions,
                            ConflictId = $"InvalidFilterValue|{conflict.OriginalTerm}"
                        });
                    }
                    break;
            }
        }
        
        return prompts;
    }
    
    #region Private Helper Methods
    
    /// <summary>
    /// Applies a new metric based on user clarification
    /// </summary>
    private void ApplyMetricClarification(QueryEntities entities, string metricName)
    {
        if (entities.Metrics == null)
        {
            entities.Metrics = new List<Metric>();
        }
        
        // Add the metric if it doesn't already exist
        if (!entities.Metrics.Any(m => m.Name.Equals(metricName, StringComparison.OrdinalIgnoreCase)))
        {
            var metric = new Metric { Name = metricName };
            entities.Metrics.Add(metric);
            
            // Map to database field
            var dbMetric = _domainKnowledgeService.MapMetricToDatabaseField(metricName);
            if (dbMetric != null)
            {
                metric.DatabaseField = dbMetric.DatabaseField;
                metric.Aggregation = dbMetric.DefaultAggregation;
                metric.IsUnresolved = false;
                metric.MatchConfidence = 1.0;
            }
        }
    }
    
    /// <summary>
    /// Replaces an ambiguous metric with a clarified one
    /// </summary>
    private void ReplaceAmbiguousMetric(QueryEntities entities, string originalTerm, string clarifiedMetric)
    {
        if (entities.Metrics == null)
            return;
            
        // Find the ambiguous metric
        var metricToReplace = entities.Metrics.FirstOrDefault(m => 
            m.Name.Equals(originalTerm, StringComparison.OrdinalIgnoreCase) && 
            m.MatchConfidence < 0.7);
            
        if (metricToReplace != null)
        {
            // Update the metric
            metricToReplace.Name = clarifiedMetric;
            
            // Map to database field
            var dbMetric = _domainKnowledgeService.MapMetricToDatabaseField(clarifiedMetric);
            if (dbMetric != null)
            {
                metricToReplace.DatabaseField = dbMetric.DatabaseField;
                metricToReplace.Aggregation = dbMetric.DefaultAggregation;
                metricToReplace.IsUnresolved = false;
                metricToReplace.MatchConfidence = 1.0;
            }
            
            // Record feedback
            _domainKnowledgeService.RecordMappingFeedbackAsync(
                originalTerm, clarifiedMetric, true);
        }
    }
    
    /// <summary>
    /// Replaces an unknown metric with a known one
    /// </summary>
    private void ReplaceUnknownMetric(QueryEntities entities, string originalTerm, string knownMetric)
    {
        if (entities.Metrics == null)
            return;
            
        // Find the unknown metric
        var metricToReplace = entities.Metrics.FirstOrDefault(m => 
            m.Name.Equals(originalTerm, StringComparison.OrdinalIgnoreCase) && 
            m.IsUnresolved);
            
        if (metricToReplace != null)
        {
            // Update the metric
            metricToReplace.Name = knownMetric;
            
            // Map to database field
            var dbMetric = _domainKnowledgeService.MapMetricToDatabaseField(knownMetric);
            if (dbMetric != null)
            {
                metricToReplace.DatabaseField = dbMetric.DatabaseField;
                metricToReplace.Aggregation = dbMetric.DefaultAggregation;
                metricToReplace.IsUnresolved = false;
                metricToReplace.MatchConfidence = 1.0;
            }
            
            // Record feedback
            _domainKnowledgeService.RecordMappingFeedbackAsync(
                originalTerm, knownMetric, true);
        }
    }
    
    /// <summary>
    /// Replaces an ambiguous dimension with a clarified one
    /// </summary>
    private void ReplaceAmbiguousDimension(QueryEntities entities, string originalTerm, string clarifiedDimension)
    {
        if (entities.Dimensions == null)
            return;
            
        // Find the ambiguous dimension
        var dimensionToReplace = entities.Dimensions.FirstOrDefault(d => 
            d.Name.Equals(originalTerm, StringComparison.OrdinalIgnoreCase) && 
            d.MatchConfidence < 0.7);
            
        if (dimensionToReplace != null)
        {
            // Update the dimension
            dimensionToReplace.Name = clarifiedDimension;
            
            // Map to database field
            var dbDimension = _domainKnowledgeService.MapDimensionToDatabaseField(clarifiedDimension);
            if (dbDimension != null)
            {
                dimensionToReplace.DatabaseField = dbDimension.DatabaseField;
                dimensionToReplace.IsUnresolved = false;
                dimensionToReplace.MatchConfidence = 1.0;
            }
            
            // Also update any filters that use this dimension
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters.Where(f => 
                    f.Dimension.Equals(originalTerm, StringComparison.OrdinalIgnoreCase)))
                {
                    filter.Dimension = clarifiedDimension;
                    if (dbDimension != null)
                    {
                        filter.DatabaseField = dbDimension.DatabaseField;
                    }
                }
            }
            
            // Record feedback
            _domainKnowledgeService.RecordMappingFeedbackAsync(
                originalTerm, clarifiedDimension, true);
        }
    }
    
    /// <summary>
    /// Replaces an unknown dimension with a known one
    /// </summary>
    private void ReplaceUnknownDimension(QueryEntities entities, string originalTerm, string knownDimension)
    {
        if (entities.Dimensions == null)
            return;
            
        // Find the unknown dimension
        var dimensionToReplace = entities.Dimensions.FirstOrDefault(d => 
            d.Name.Equals(originalTerm, StringComparison.OrdinalIgnoreCase) && 
            d.IsUnresolved);
            
        if (dimensionToReplace != null)
        {
            // Update the dimension
            dimensionToReplace.Name = knownDimension;
            
            // Map to database field
            var dbDimension = _domainKnowledgeService.MapDimensionToDatabaseField(knownDimension);
            if (dbDimension != null)
            {
                dimensionToReplace.DatabaseField = dbDimension.DatabaseField;
                dimensionToReplace.IsUnresolved = false;
                dimensionToReplace.MatchConfidence = 1.0;
            }
            
            // Also update any filters that use this dimension
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters.Where(f => 
                    f.Dimension.Equals(originalTerm, StringComparison.OrdinalIgnoreCase)))
                {
                    filter.Dimension = knownDimension;
                    if (dbDimension != null)
                    {
                        filter.DatabaseField = dbDimension.DatabaseField;
                    }
                }
            }
            
            // Record feedback
            _domainKnowledgeService.RecordMappingFeedbackAsync(
                originalTerm, knownDimension, true);
        }
    }
    
    /// <summary>
    /// Updates a filter with a corrected value
    /// </summary>
    private void UpdateFilterValue(QueryEntities entities, string originalValue, string correctedValue)
    {
        if (entities.Filters == null)
            return;
            
        // Find the filter with the invalid value
        var filterToUpdate = entities.Filters.FirstOrDefault(f => 
            f.Value.Equals(originalValue, StringComparison.OrdinalIgnoreCase));
            
        if (filterToUpdate != null)
        {
            // Update the filter value
            filterToUpdate.Value = correctedValue;
        }
    }
    
    #endregion
}