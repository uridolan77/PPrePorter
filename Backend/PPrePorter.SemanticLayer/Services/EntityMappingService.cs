using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Gaming;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// Service for mapping entities between semantic layer and database
    /// </summary>
    public class EntityMappingService : IEntityMappingService
    {
        private readonly ILogger<EntityMappingService> _logger;
        private readonly SemanticLayerConfig _config;
        private readonly List<MetricDefinition> _metricDefinitions;
        private readonly List<DimensionDefinition> _dimensionDefinitions;
        private readonly Dictionary<string, List<string>> _feedbackHistory;
        
        public EntityMappingService(
            ILogger<EntityMappingService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
            
            // Load default metrics and dimensions for gaming
            _metricDefinitions = GamingMetrics.GetAllMetrics();
            _dimensionDefinitions = GamingDimensions.GetAllDimensions();
            
            // Initialize feedback history dictionary
            _feedbackHistory = new Dictionary<string, List<string>>();
            
            // Load additional metrics and dimensions from configuration if specified
            LoadMetricsFromConfig();
            LoadDimensionsFromConfig();
        }
        
        /// <summary>
        /// Extracts structured entities from a natural language query
        /// </summary>
        public async Task<QueryEntities> ExtractEntitiesFromQueryAsync(string query)
        {
            _logger.LogInformation("Extracting entities from query: {Query}", query);
            
            try
            {
                // Initialize a new QueryEntities object
                var entities = new QueryEntities
                {
                    OriginalQuery = query
                };
                
                // Extract metrics using pattern matching and synonym lookups
                entities.Metrics = ExtractMetrics(query);
                
                // Extract dimensions using pattern matching and synonym lookups
                entities.Dimensions = ExtractDimensions(query);
                
                // Extract time range using date patterns and relative time expressions
                entities.TimeRange = ExtractTimeRange(query);
                
                // Extract filters using pattern matching
                entities.Filters = ExtractFilters(query);
                
                // Extract sort order using pattern matching
                entities.SortBy = ExtractSortBy(query);
                
                // Extract limit using pattern matching
                entities.Limit = ExtractLimit(query);
                
                // Extract comparisons (year-over-year, etc.)
                entities.Comparisons = ExtractComparisons(query);
                
                _logger.LogInformation("Extracted {MetricCount} metrics, {DimensionCount} dimensions, and {FilterCount} filters from query",
                    entities.Metrics?.Count ?? 0,
                    entities.Dimensions?.Count ?? 0,
                    entities.Filters?.Count ?? 0);
                
                return entities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting entities from query: {Query}", query);
                throw;
            }
        }
        
        /// <summary>
        /// Maps semantic entities to database fields
        /// </summary>
        public async Task<MappedQueryEntities> MapEntitiesToDatabaseFieldsAsync(QueryEntities entities)
        {
            _logger.LogInformation("Mapping entities to database fields");
            
            try
            {
                // Create a new MappedQueryEntities object
                var mappedEntities = new MappedQueryEntities
                {
                    OriginalQuery = entities.OriginalQuery
                };
                
                // Map metrics to database fields
                if (entities.Metrics != null)
                {
                    mappedEntities.Metrics = MapMetricsToDatabaseFields(entities.Metrics);
                }
                
                // Map dimensions to database fields
                if (entities.Dimensions != null)
                {
                    mappedEntities.Dimensions = MapDimensionsToDatabaseFields(entities.Dimensions);
                }
                
                // Map time range (this doesn't need further mapping)
                mappedEntities.TimeRange = entities.TimeRange;
                
                // Map filters to database fields
                if (entities.Filters != null)
                {
                    mappedEntities.Filters = MapFiltersToDatabaseFields(entities.Filters);
                }
                
                // Map sort by to database fields
                if (entities.SortBy != null)
                {
                    mappedEntities.SortBy = MapSortByToDatabaseFields(entities.SortBy);
                }
                
                // Map comparisons (this doesn't need further mapping)
                mappedEntities.Comparisons = entities.Comparisons;
                
                // Map limit (this doesn't need further mapping)
                mappedEntities.Limit = entities.Limit;
                
                _logger.LogInformation("Successfully mapped entities to database fields");
                
                return mappedEntities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error mapping entities to database fields");
                throw;
            }
        }
        
        /// <summary>
        /// Gets suggestions for an ambiguous entity
        /// </summary>
        public async Task<List<string>> GetSuggestionsAsync(string entityType, string term)
        {
            _logger.LogInformation("Getting suggestions for entity type: {EntityType}, term: {Term}", entityType, term);
            
            try
            {
                var suggestions = new List<string>();
                
                if (entityType.Equals("metric", StringComparison.OrdinalIgnoreCase))
                {
                    // Find metrics that partially match the term
                    suggestions = _metricDefinitions
                        .Where(m => m.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                                    m.Description.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                                    (m.Synonyms != null && m.Synonyms.Any(s => s.Contains(term, StringComparison.OrdinalIgnoreCase))))
                        .Select(m => m.Name)
                        .ToList();
                }
                else if (entityType.Equals("dimension", StringComparison.OrdinalIgnoreCase))
                {
                    // Find dimensions that partially match the term
                    suggestions = _dimensionDefinitions
                        .Where(d => d.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                                    d.Description.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                                    (d.Synonyms != null && d.Synonyms.Any(s => s.Contains(term, StringComparison.OrdinalIgnoreCase))))
                        .Select(d => d.Name)
                        .ToList();
                }
                
                // Limit the number of suggestions
                if (suggestions.Count > _config.Mapping.MaxSuggestions)
                {
                    suggestions = suggestions.Take(_config.Mapping.MaxSuggestions).ToList();
                }
                
                _logger.LogInformation("Found {SuggestionCount} suggestions for entity type: {EntityType}, term: {Term}",
                    suggestions.Count, entityType, term);
                
                return suggestions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting suggestions for entity type: {EntityType}, term: {Term}", entityType, term);
                throw;
            }
        }
        
        /// <summary>
        /// Records user feedback about entity mappings
        /// </summary>
        public async Task RecordFeedbackAsync(string originalTerm, string mappedTerm, bool isCorrect)
        {
            _logger.LogInformation("Recording feedback for mapping: {OriginalTerm} -> {MappedTerm}, isCorrect: {IsCorrect}",
                originalTerm, mappedTerm, isCorrect);
            
            try
            {
                // Initialize the feedback history for the original term if it doesn't exist
                if (!_feedbackHistory.ContainsKey(originalTerm))
                {
                    _feedbackHistory[originalTerm] = new List<string>();
                }
                
                // If the mapping is correct, add it to the feedback history
                if (isCorrect)
                {
                    // Add the mapping if it doesn't already exist
                    if (!_feedbackHistory[originalTerm].Contains(mappedTerm))
                    {
                        _feedbackHistory[originalTerm].Add(mappedTerm);
                    }
                }
                else
                {
                    // Remove the mapping if it exists
                    _feedbackHistory[originalTerm].Remove(mappedTerm);
                }
                
                // TODO: In a real implementation, persist the feedback to a database or file
                
                _logger.LogInformation("Successfully recorded feedback for mapping");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording feedback for mapping: {OriginalTerm} -> {MappedTerm}",
                    originalTerm, mappedTerm);
                throw;
            }
        }
        
        #region Entity Extraction Methods
        
        /// <summary>
        /// Extracts metrics from a query
        /// </summary>
        private List<Metric> ExtractMetrics(string query)
        {
            var metrics = new List<Metric>();
            
            // Look for metric patterns like "show me the revenue" or "calculate the total sales"
            var metricPatterns = new[]
            {
                @"(?:show|display|view|calculate|find|get|what\s+is\s+the|what\s+are\s+the)\s+(?:the\s+)?(?:total\s+|average\s+|sum\s+of\s+|avg\s+)?([a-zA-Z\s]+)",
                @"(?:analyze|report\s+on|report\s+by|report\s+for|measure|metric(?:s)?)[:\s]+([a-zA-Z\s]+)",
                @"(?:by|using|with|for)[:\s]+([a-zA-Z\s]+)(?: as)?(?:\s+(?:a|the|an|over))?(?:\s+metric)"
            };
            
            foreach (var pattern in metricPatterns)
            {
                var matches = Regex.Matches(query, pattern, RegexOptions.IgnoreCase);
                
                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 1)
                    {
                        string metricText = match.Groups[1].Value.Trim().ToLowerInvariant();
                        
                        // Skip common words that might be mistakenly extracted
                        if (ShouldSkipCommonWord(metricText))
                        {
                            continue;
                        }
                        
                        // Find the best match in our metric definitions
                        var bestMatch = FindBestMetricMatch(metricText);
                        
                        if (bestMatch != null)
                        {
                            // Avoid duplicates
                            if (!metrics.Any(m => m.Name == bestMatch.Name))
                            {
                                // Extract aggregation if present
                                string aggregation = ExtractAggregation(metricText);
                                
                                // Create a new metric
                                metrics.Add(new Metric
                                {
                                    Name = bestMatch.Name,
                                    DisplayName = bestMatch.Name,
                                    Aggregation = !string.IsNullOrEmpty(aggregation) ? aggregation : bestMatch.DefaultAggregation
                                });
                            }
                        }
                    }
                }
            }
            
            // If no metrics were found, look for individual metric names or synonyms
            if (metrics.Count == 0)
            {
                foreach (var metricDef in _metricDefinitions)
                {
                    if (ContainsWord(query, metricDef.Name))
                    {
                        // Avoid duplicates
                        if (!metrics.Any(m => m.Name == metricDef.Name))
                        {
                            // Create a new metric
                            metrics.Add(new Metric
                            {
                                Name = metricDef.Name,
                                DisplayName = metricDef.Name,
                                Aggregation = metricDef.DefaultAggregation
                            });
                        }
                    }
                    else if (metricDef.Synonyms != null)
                    {
                        foreach (var synonym in metricDef.Synonyms)
                        {
                            if (ContainsWord(query, synonym))
                            {
                                // Avoid duplicates
                                if (!metrics.Any(m => m.Name == metricDef.Name))
                                {
                                    // Create a new metric
                                    metrics.Add(new Metric
                                    {
                                        Name = metricDef.Name,
                                        DisplayName = metricDef.Name,
                                        Aggregation = metricDef.DefaultAggregation
                                    });
                                    
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            return metrics;
        }
        
        /// <summary>
        /// Extracts dimensions from a query
        /// </summary>
        private List<Dimension> ExtractDimensions(string query)
        {
            var dimensions = new List<Dimension>();
            
            // Look for dimension patterns like "by country" or "grouped by date"
            var dimensionPatterns = new[]
            {
                @"(?:by|grouped\s+by|group\s+by|split\s+by|broken\s+down\s+by|segmented\s+by|categorized\s+by|partition\s+by|partitioned\s+by)\s+([a-zA-Z\s]+)",
                @"(?:for\s+each|per|across|by)\s+([a-zA-Z\s]+)",
                @"(?:dimension(?:s)?)[:\s]+([a-zA-Z\s]+)"
            };
            
            foreach (var pattern in dimensionPatterns)
            {
                var matches = Regex.Matches(query, pattern, RegexOptions.IgnoreCase);
                
                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 1)
                    {
                        string dimensionText = match.Groups[1].Value.Trim().ToLowerInvariant();
                        
                        // Skip common words that might be mistakenly extracted
                        if (ShouldSkipCommonWord(dimensionText))
                        {
                            continue;
                        }
                        
                        // Find the best match in our dimension definitions
                        var bestMatch = FindBestDimensionMatch(dimensionText);
                        
                        if (bestMatch != null)
                        {
                            // Avoid duplicates
                            if (!dimensions.Any(d => d.Name == bestMatch.Name))
                            {
                                // Create a new dimension
                                dimensions.Add(new Dimension
                                {
                                    Name = bestMatch.Name,
                                    DisplayName = bestMatch.Name
                                });
                            }
                        }
                    }
                }
            }
            
            // If no dimensions were found, look for individual dimension names or synonyms
            if (dimensions.Count == 0)
            {
                foreach (var dimensionDef in _dimensionDefinitions)
                {
                    if (ContainsWord(query, dimensionDef.Name))
                    {
                        // Avoid duplicates
                        if (!dimensions.Any(d => d.Name == dimensionDef.Name))
                        {
                            // Create a new dimension
                            dimensions.Add(new Dimension
                            {
                                Name = dimensionDef.Name,
                                DisplayName = dimensionDef.Name
                            });
                        }
                    }
                    else if (dimensionDef.Synonyms != null)
                    {
                        foreach (var synonym in dimensionDef.Synonyms)
                        {
                            if (ContainsWord(query, synonym))
                            {
                                // Avoid duplicates
                                if (!dimensions.Any(d => d.Name == dimensionDef.Name))
                                {
                                    // Create a new dimension
                                    dimensions.Add(new Dimension
                                    {
                                        Name = dimensionDef.Name,
                                        DisplayName = dimensionDef.Name
                                    });
                                    
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            // Add date dimension by default if time range is specified but no other dimension
            if (dimensions.Count == 0 && query.Contains("last") && 
                (query.Contains("days") || query.Contains("weeks") || query.Contains("months") || query.Contains("years")))
            {
                var dateDimension = _dimensionDefinitions.FirstOrDefault(d => d.Name == "Date" || d.Name == "Day");
                
                if (dateDimension != null)
                {
                    dimensions.Add(new Dimension
                    {
                        Name = dateDimension.Name,
                        DisplayName = dateDimension.Name
                    });
                }
            }
            
            return dimensions;
        }
        
        /// <summary>
        /// Extracts time range from a query
        /// </summary>
        private TimeRange ExtractTimeRange(string query)
        {
            var timeRange = new TimeRange();
            
            // Look for relative time periods
            var relativePeriodPatterns = new Dictionary<string, string>
            {
                { @"(?:in|for|over)\s+(?:the\s+)?last\s+(\d+)\s+(day|days|week|weeks|month|months|quarter|quarters|year|years)", "last $1 $2" },
                { @"(?:today|yesterday|this\s+week|this\s+month|this\s+quarter|this\s+year)", "$0" },
                { @"(?:year\s+to\s+date|month\s+to\s+date|quarter\s+to\s+date|week\s+to\s+date|ytd|mtd|qtd|wtd)", "$0" }
            };
            
            foreach (var pattern in relativePeriodPatterns)
            {
                var match = Regex.Match(query, pattern.Key, RegexOptions.IgnoreCase);
                
                if (match.Success)
                {
                    timeRange.RelativePeriod = match.Groups[0].Value.Replace("in the ", "")
                                                    .Replace("in ", "")
                                                    .Replace("for the ", "")
                                                    .Replace("for ", "")
                                                    .Replace("over the ", "")
                                                    .Replace("over ", "")
                                                    .Trim();
                    
                    if (timeRange.RelativePeriod == "ytd")
                    {
                        timeRange.RelativePeriod = "year to date";
                    }
                    else if (timeRange.RelativePeriod == "mtd")
                    {
                        timeRange.RelativePeriod = "month to date";
                    }
                    else if (timeRange.RelativePeriod == "qtd")
                    {
                        timeRange.RelativePeriod = "quarter to date";
                    }
                    else if (timeRange.RelativePeriod == "wtd")
                    {
                        timeRange.RelativePeriod = "week to date";
                    }
                    
                    return timeRange;
                }
            }
            
            // Look for specific date range patterns
            var dateRangePattern = @"(?:from|between)\s+(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}/\d{2}/\d{2})\s+(?:to|and|through|until)\s+(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}/\d{2}/\d{2})";
            var dateRangeMatch = Regex.Match(query, dateRangePattern, RegexOptions.IgnoreCase);
            
            if (dateRangeMatch.Success && dateRangeMatch.Groups.Count > 2)
            {
                try
                {
                    var startDateStr = dateRangeMatch.Groups[1].Value;
                    var endDateStr = dateRangeMatch.Groups[2].Value;
                    
                    // Parse the dates
                    DateTime startDate, endDate;
                    
                    if (DateTime.TryParse(startDateStr, out startDate) &&
                        DateTime.TryParse(endDateStr, out endDate))
                    {
                        timeRange.StartDate = startDate;
                        timeRange.EndDate = endDate;
                        
                        return timeRange;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing date range: {StartDate} to {EndDate}",
                        dateRangeMatch.Groups[1].Value, dateRangeMatch.Groups[2].Value);
                }
            }
            
            // Look for single date patterns
            var singleDatePattern = @"(?:on|at|for)\s+(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}/\d{2}/\d{2})";
            var singleDateMatch = Regex.Match(query, singleDatePattern, RegexOptions.IgnoreCase);
            
            if (singleDateMatch.Success && singleDateMatch.Groups.Count > 1)
            {
                try
                {
                    var dateStr = singleDateMatch.Groups[1].Value;
                    
                    // Parse the date
                    DateTime date;
                    
                    if (DateTime.TryParse(dateStr, out date))
                    {
                        timeRange.StartDate = date;
                        timeRange.EndDate = date;
                        
                        return timeRange;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing single date: {Date}", singleDateMatch.Groups[1].Value);
                }
            }
            
            // Default to last 30 days if we couldn't extract a time range
            timeRange.RelativePeriod = "last 30 days";
            
            return timeRange;
        }
        
        /// <summary>
        /// Extracts filters from a query
        /// </summary>
        private List<Filter> ExtractFilters(string query)
        {
            var filters = new List<Filter>();
            
            // Look for filter patterns like "country equals USA" or "revenue greater than 1000"
            var filterPatterns = new[]
            {
                @"(?:where|with|having|for|when|and|if)\s+([a-zA-Z\s]+)\s+(equals|equal to|is|=|==|!=|<>|not equal to|greater than|>|>=|greater than or equal to|less than|<|<=|less than or equal to|contains|starts with|ends with|in|not in|between|is not|is null|is not null)\s+([\w\s\d.,]+)",
                @"([a-zA-Z\s]+)\s+(equals|equal to|is|=|==|!=|<>|not equal to|greater than|>|>=|greater than or equal to|less than|<|<=|less than or equal to|contains|starts with|ends with|in|not in|between|is not|is null|is not null)\s+([\w\s\d.,]+)"
            };
            
            foreach (var pattern in filterPatterns)
            {
                var matches = Regex.Matches(query, pattern, RegexOptions.IgnoreCase);
                
                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 3)
                    {
                        string fieldText = match.Groups[1].Value.Trim().ToLowerInvariant();
                        string operatorText = match.Groups[2].Value.Trim().ToLowerInvariant();
                        string valueText = match.Groups[3].Value.Trim();
                        
                        // Skip common words that might be mistakenly extracted
                        if (ShouldSkipCommonWord(fieldText))
                        {
                            continue;
                        }
                        
                        // Find the entity (metric or dimension) that matches the field text
                        var metricMatch = FindBestMetricMatch(fieldText);
                        var dimensionMatch = FindBestDimensionMatch(fieldText);
                        
                        // Determine which is the better match
                        string entityName = null;
                        bool isMetric = false;
                        
                        if (metricMatch != null && dimensionMatch != null)
                        {
                            // If both match, prefer the one with a higher confidence score
                            if (CalculateMatchConfidence(fieldText, metricMatch.Name, metricMatch.Synonyms) >
                                CalculateMatchConfidence(fieldText, dimensionMatch.Name, dimensionMatch.Synonyms))
                            {
                                entityName = metricMatch.Name;
                                isMetric = true;
                            }
                            else
                            {
                                entityName = dimensionMatch.Name;
                                isMetric = false;
                            }
                        }
                        else if (metricMatch != null)
                        {
                            entityName = metricMatch.Name;
                            isMetric = true;
                        }
                        else if (dimensionMatch != null)
                        {
                            entityName = dimensionMatch.Name;
                            isMetric = false;
                        }
                        
                        if (entityName != null)
                        {
                            // Skip common values that might be mistakenly extracted
                            if (ShouldSkipCommonWord(valueText))
                            {
                                continue;
                            }
                            
                            // Normalize the operator
                            string normalizedOperator = NormalizeOperator(operatorText);
                            
                            // Parse the value
                            object parsedValue = ParseFilterValue(valueText, isMetric);
                            
                            // Create a new filter
                            filters.Add(new Filter
                            {
                                Field = entityName,
                                Operator = normalizedOperator,
                                Value = parsedValue,
                                DisplayValue = valueText,
                                IsNegated = operatorText.Contains("not") || operatorText.Contains("!")
                            });
                        }
                    }
                }
            }
            
            return filters;
        }
        
        /// <summary>
        /// Extracts sort order from a query
        /// </summary>
        private Sort ExtractSortBy(string query)
        {
            // Look for sort patterns like "sort by revenue" or "order by date descending"
            var sortPatterns = new[]
            {
                @"(?:sort|order)\s+by\s+([a-zA-Z\s]+)(?:\s+(ascending|descending|asc|desc))?",
                @"(?:sorted|ordered)\s+by\s+([a-zA-Z\s]+)(?:\s+(ascending|descending|asc|desc))?"
            };
            
            foreach (var pattern in sortPatterns)
            {
                var match = Regex.Match(query, pattern, RegexOptions.IgnoreCase);
                
                if (match.Success && match.Groups.Count > 1)
                {
                    string fieldText = match.Groups[1].Value.Trim().ToLowerInvariant();
                    
                    // Skip common words that might be mistakenly extracted
                    if (ShouldSkipCommonWord(fieldText))
                    {
                        continue;
                    }
                    
                    // Find the entity (metric or dimension) that matches the field text
                    var metricMatch = FindBestMetricMatch(fieldText);
                    var dimensionMatch = FindBestDimensionMatch(fieldText);
                    
                    // Determine which is the better match
                    string entityName = null;
                    
                    if (metricMatch != null && dimensionMatch != null)
                    {
                        // If both match, prefer the one with a higher confidence score
                        if (CalculateMatchConfidence(fieldText, metricMatch.Name, metricMatch.Synonyms) >
                            CalculateMatchConfidence(fieldText, dimensionMatch.Name, dimensionMatch.Synonyms))
                        {
                            entityName = metricMatch.Name;
                        }
                        else
                        {
                            entityName = dimensionMatch.Name;
                        }
                    }
                    else if (metricMatch != null)
                    {
                        entityName = metricMatch.Name;
                    }
                    else if (dimensionMatch != null)
                    {
                        entityName = dimensionMatch.Name;
                    }
                    
                    if (entityName != null)
                    {
                        // Determine sort direction
                        string direction = "desc"; // Default to descending for metrics, ascending for dimensions
                        
                        if (match.Groups.Count > 2 && !string.IsNullOrEmpty(match.Groups[2].Value))
                        {
                            string directionText = match.Groups[2].Value.Trim().ToLowerInvariant();
                            
                            if (directionText == "ascending" || directionText == "asc")
                            {
                                direction = "asc";
                            }
                            else if (directionText == "descending" || directionText == "desc")
                            {
                                direction = "desc";
                            }
                        }
                        else if (dimensionMatch != null)
                        {
                            // Default to ascending for dimensions
                            direction = "asc";
                        }
                        
                        // Create a new sort object
                        return new Sort
                        {
                            Field = entityName,
                            Direction = direction
                        };
                    }
                }
            }
            
            return null;
        }
        
        /// <summary>
        /// Extracts limit from a query
        /// </summary>
        private int? ExtractLimit(string query)
        {
            // Look for limit patterns like "limit 10" or "top 5"
            var limitPatterns = new[]
            {
                @"(?:limit|top|first|restrict\s+to)\s+(\d+)",
                @"(?:show|display|get|return|find)\s+(?:the\s+)?(?:top|first)\s+(\d+)"
            };
            
            foreach (var pattern in limitPatterns)
            {
                var match = Regex.Match(query, pattern, RegexOptions.IgnoreCase);
                
                if (match.Success && match.Groups.Count > 1)
                {
                    if (int.TryParse(match.Groups[1].Value, out int limit))
                    {
                        return limit;
                    }
                }
            }
            
            return null;
        }
        
        /// <summary>
        /// Extracts comparisons from a query
        /// </summary>
        private List<string> ExtractComparisons(string query)
        {
            var comparisons = new List<string>();
            
            // Look for comparison patterns
            if (ContainsPhrase(query, "year over year") || 
                ContainsPhrase(query, "year-over-year") || 
                ContainsPhrase(query, "yoy"))
            {
                comparisons.Add("year-over-year");
            }
            
            if (ContainsPhrase(query, "month over month") || 
                ContainsPhrase(query, "month-over-month") || 
                ContainsPhrase(query, "mom"))
            {
                comparisons.Add("month-over-month");
            }
            
            if (ContainsPhrase(query, "quarter over quarter") || 
                ContainsPhrase(query, "quarter-over-quarter") || 
                ContainsPhrase(query, "qoq"))
            {
                comparisons.Add("quarter-over-quarter");
            }
            
            if (ContainsPhrase(query, "previous period") || 
                ContainsPhrase(query, "prior period") || 
                ContainsPhrase(query, "last period"))
            {
                comparisons.Add("previous-period");
            }
            
            return comparisons;
        }
        
        #endregion
        
        #region Entity Mapping Methods
        
        /// <summary>
        /// Maps metrics to database fields
        /// </summary>
        private List<MappedMetric> MapMetricsToDatabaseFields(List<Metric> metrics)
        {
            var mappedMetrics = new List<MappedMetric>();
            
            foreach (var metric in metrics)
            {
                // Find the metric definition
                var metricDef = _metricDefinitions.FirstOrDefault(m => 
                    m.Name.Equals(metric.Name, StringComparison.OrdinalIgnoreCase));
                
                if (metricDef != null)
                {
                    // Create a mapped metric
                    mappedMetrics.Add(new MappedMetric
                    {
                        Name = metricDef.Name,
                        DatabaseField = metricDef.DatabaseField,
                        Aggregation = metric.Aggregation ?? metricDef.DefaultAggregation,
                        IsCalculated = metricDef.IsCalculated,
                        CalculationFormula = metricDef.CalculationFormula
                    });
                }
            }
            
            return mappedMetrics;
        }
        
        /// <summary>
        /// Maps dimensions to database fields
        /// </summary>
        private List<MappedDimension> MapDimensionsToDatabaseFields(List<Dimension> dimensions)
        {
            var mappedDimensions = new List<MappedDimension>();
            
            foreach (var dimension in dimensions)
            {
                // Find the dimension definition
                var dimensionDef = _dimensionDefinitions.FirstOrDefault(d => 
                    d.Name.Equals(dimension.Name, StringComparison.OrdinalIgnoreCase));
                
                if (dimensionDef != null)
                {
                    // Create a mapped dimension
                    mappedDimensions.Add(new MappedDimension
                    {
                        Name = dimensionDef.Name,
                        DatabaseField = dimensionDef.DatabaseField,
                        IsDate = dimensionDef.IsDate
                    });
                }
            }
            
            return mappedDimensions;
        }
        
        /// <summary>
        /// Maps filters to database fields
        /// </summary>
        private List<MappedFilter> MapFiltersToDatabaseFields(List<Filter> filters)
        {
            var mappedFilters = new List<MappedFilter>();
            
            foreach (var filter in filters)
            {
                // Find the metric or dimension definition
                var metricDef = _metricDefinitions.FirstOrDefault(m => 
                    m.Name.Equals(filter.Field, StringComparison.OrdinalIgnoreCase));
                
                var dimensionDef = _dimensionDefinitions.FirstOrDefault(d => 
                    d.Name.Equals(filter.Field, StringComparison.OrdinalIgnoreCase));
                
                if (metricDef != null)
                {
                    // Create a mapped filter for a metric
                    mappedFilters.Add(new MappedFilter
                    {
                        Field = metricDef.Name,
                        DatabaseField = metricDef.DatabaseField,
                        Operator = filter.Operator,
                        Value = filter.Value,
                        IsNegated = filter.IsNegated
                    });
                }
                else if (dimensionDef != null)
                {
                    // Create a mapped filter for a dimension
                    mappedFilters.Add(new MappedFilter
                    {
                        Field = dimensionDef.Name,
                        DatabaseField = dimensionDef.DatabaseField,
                        Operator = filter.Operator,
                        Value = filter.Value,
                        IsNegated = filter.IsNegated
                    });
                }
            }
            
            return mappedFilters;
        }
        
        /// <summary>
        /// Maps sort by to database fields
        /// </summary>
        private MappedSort MapSortByToDatabaseFields(Sort sortBy)
        {
            // Find the metric or dimension definition
            var metricDef = _metricDefinitions.FirstOrDefault(m => 
                m.Name.Equals(sortBy.Field, StringComparison.OrdinalIgnoreCase));
            
            var dimensionDef = _dimensionDefinitions.FirstOrDefault(d => 
                d.Name.Equals(sortBy.Field, StringComparison.OrdinalIgnoreCase));
            
            if (metricDef != null)
            {
                // Create a mapped sort for a metric
                return new MappedSort
                {
                    Field = metricDef.Name,
                    DatabaseField = metricDef.DatabaseField,
                    Direction = sortBy.Direction
                };
            }
            else if (dimensionDef != null)
            {
                // Create a mapped sort for a dimension
                return new MappedSort
                {
                    Field = dimensionDef.Name,
                    DatabaseField = dimensionDef.DatabaseField,
                    Direction = sortBy.Direction
                };
            }
            
            return null;
        }
        
        #endregion
        
        #region Helper Methods
        
        /// <summary>
        /// Loads metric definitions from configuration
        /// </summary>
        private void LoadMetricsFromConfig()
        {
            // TODO: In a real implementation, load metrics from a configuration file or database
        }
        
        /// <summary>
        /// Loads dimension definitions from configuration
        /// </summary>
        private void LoadDimensionsFromConfig()
        {
            // TODO: In a real implementation, load dimensions from a configuration file or database
        }
        
        /// <summary>
        /// Finds the best match for a metric name or synonym
        /// </summary>
        private MetricDefinition FindBestMetricMatch(string text)
        {
            MetricDefinition bestMatch = null;
            double bestScore = 0;
            
            foreach (var metric in _metricDefinitions)
            {
                double score = CalculateMatchConfidence(text, metric.Name, metric.Synonyms);
                
                if (score > bestScore && score >= _config.Mapping.MinimumMatchConfidence)
                {
                    bestScore = score;
                    bestMatch = metric;
                }
            }
            
            return bestMatch;
        }
        
        /// <summary>
        /// Finds the best match for a dimension name or synonym
        /// </summary>
        private DimensionDefinition FindBestDimensionMatch(string text)
        {
            DimensionDefinition bestMatch = null;
            double bestScore = 0;
            
            foreach (var dimension in _dimensionDefinitions)
            {
                double score = CalculateMatchConfidence(text, dimension.Name, dimension.Synonyms);
                
                if (score > bestScore && score >= _config.Mapping.MinimumMatchConfidence)
                {
                    bestScore = score;
                    bestMatch = dimension;
                }
            }
            
            return bestMatch;
        }
        
        /// <summary>
        /// Calculates the confidence score for a match
        /// </summary>
        private double CalculateMatchConfidence(string text, string name, string[] synonyms)
        {
            // Check for exact match
            if (string.Equals(text, name, StringComparison.OrdinalIgnoreCase))
            {
                return 1.0;
            }
            
            // Check for exact synonym match
            if (synonyms != null)
            {
                foreach (var synonym in synonyms)
                {
                    if (string.Equals(text, synonym, StringComparison.OrdinalIgnoreCase))
                    {
                        return 0.9;
                    }
                }
            }
            
            // Check if text contains the name
            if (text.Contains(name, StringComparison.OrdinalIgnoreCase))
            {
                // If the name is a single word, ensure it matches a whole word
                if (!name.Contains(" "))
                {
                    if (ContainsWord(text, name))
                    {
                        return 0.8;
                    }
                }
                else
                {
                    return 0.8;
                }
            }
            
            // Check if text contains a synonym
            if (synonyms != null)
            {
                foreach (var synonym in synonyms)
                {
                    if (text.Contains(synonym, StringComparison.OrdinalIgnoreCase))
                    {
                        // If the synonym is a single word, ensure it matches a whole word
                        if (!synonym.Contains(" "))
                        {
                            if (ContainsWord(text, synonym))
                            {
                                return 0.7;
                            }
                        }
                        else
                        {
                            return 0.7;
                        }
                    }
                }
            }
            
            // Check if name contains the text
            if (name.Contains(text, StringComparison.OrdinalIgnoreCase))
            {
                return 0.6;
            }
            
            // Check if a synonym contains the text
            if (synonyms != null)
            {
                foreach (var synonym in synonyms)
                {
                    if (synonym.Contains(text, StringComparison.OrdinalIgnoreCase))
                    {
                        return 0.5;
                    }
                }
            }
            
            // Use Levenshtein distance for fuzzy matching
            if (_config.Mapping.UseFuzzyMatching)
            {
                // Calculate Levenshtein distance for the name
                int distance = LevenshteinDistance(text, name);
                double nameSimilarity = 1.0 - (double)distance / Math.Max(text.Length, name.Length);
                
                double bestSynonymSimilarity = 0;
                
                // Calculate Levenshtein distance for each synonym
                if (synonyms != null)
                {
                    foreach (var synonym in synonyms)
                    {
                        distance = LevenshteinDistance(text, synonym);
                        double synonymSimilarity = 1.0 - (double)distance / Math.Max(text.Length, synonym.Length);
                        
                        if (synonymSimilarity > bestSynonymSimilarity)
                        {
                            bestSynonymSimilarity = synonymSimilarity;
                        }
                    }
                }
                
                // Use the best similarity score
                double bestSimilarity = Math.Max(nameSimilarity, bestSynonymSimilarity);
                
                // Only return a score if it's above a threshold
                if (bestSimilarity >= 0.7)
                {
                    return bestSimilarity * 0.4; // Scale down fuzzy matches
                }
            }
            
            return 0;
        }
        
        /// <summary>
        /// Checks if a text contains a specific word
        /// </summary>
        private bool ContainsWord(string text, string word)
        {
            return Regex.IsMatch(text, $@"\b{Regex.Escape(word)}\b", RegexOptions.IgnoreCase);
        }
        
        /// <summary>
        /// Checks if a text contains a specific phrase
        /// </summary>
        private bool ContainsPhrase(string text, string phrase)
        {
            return text.Contains(phrase, StringComparison.OrdinalIgnoreCase);
        }
        
        /// <summary>
        /// Checks if a word should be skipped as a common word
        /// </summary>
        private bool ShouldSkipCommonWord(string word)
        {
            // List of common words to skip
            var commonWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "the", "a", "an", "and", "or", "but", "of", "for", "in", "on", "at", "to", "with",
                "by", "about", "as", "into", "like", "through", "after", "over", "between", "out",
                "against", "during", "without", "before", "under", "around", "among", "across", "along",
                "from", "above", "below", "near", "since", "within", "upon", "regarding", "concerning",
                "me", "you", "he", "she", "it", "we", "they", "them", "us", "him", "her", "his", "hers",
                "its", "their", "ours", "yours", "any", "all", "each", "every", "some", "my", "your",
                "this", "that", "these", "those", "who", "whom", "whose", "which", "what", "where",
                "when", "why", "how", "many", "much", "more", "most", "few", "little", "less", "least",
                "several", "enough", "other", "another", "such", "same", "both", "either", "neither",
                "show", "display", "view", "get", "find", "see", "calculate", "reveal", "report",
                "data", "results", "information", "stats", "statistics", "details", "summary",
                "total", "overall", "entire", "complete", "full"
            };
            
            return commonWords.Contains(word.Trim());
        }
        
        /// <summary>
        /// Extracts the aggregation from a metric text
        /// </summary>
        private string ExtractAggregation(string metricText)
        {
            if (metricText.StartsWith("total ", StringComparison.OrdinalIgnoreCase) ||
                metricText.StartsWith("sum of ", StringComparison.OrdinalIgnoreCase) ||
                metricText.StartsWith("sum ", StringComparison.OrdinalIgnoreCase))
            {
                return "sum";
            }
            else if (metricText.StartsWith("average ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("avg ", StringComparison.OrdinalIgnoreCase))
            {
                return "avg";
            }
            else if (metricText.StartsWith("count of ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("count ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("number of ", StringComparison.OrdinalIgnoreCase))
            {
                return "count";
            }
            else if (metricText.StartsWith("max ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("maximum ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("highest ", StringComparison.OrdinalIgnoreCase))
            {
                return "max";
            }
            else if (metricText.StartsWith("min ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("minimum ", StringComparison.OrdinalIgnoreCase) ||
                    metricText.StartsWith("lowest ", StringComparison.OrdinalIgnoreCase))
            {
                return "min";
            }
            
            return string.Empty;
        }
        
        /// <summary>
        /// Normalizes a filter operator
        /// </summary>
        private string NormalizeOperator(string operatorText)
        {
            switch (operatorText.ToLowerInvariant())
            {
                case "equals":
                case "equal to":
                case "is":
                case "=":
                case "==":
                    return "equals";
                
                case "!=":
                case "<>":
                case "not equal to":
                case "not equals":
                case "is not":
                    return "notequals";
                
                case "greater than":
                case ">":
                    return "greaterthan";
                
                case ">=":
                case "greater than or equal to":
                    return "greaterthanorequal";
                
                case "less than":
                case "<":
                    return "lessthan";
                
                case "<=":
                case "less than or equal to":
                    return "lessthanorequal";
                
                case "contains":
                    return "contains";
                
                case "starts with":
                    return "startswith";
                
                case "ends with":
                    return "endswith";
                
                case "in":
                    return "in";
                
                case "not in":
                    return "notin";
                
                case "between":
                    return "between";
                
                case "is null":
                    return "isnull";
                
                case "is not null":
                    return "isnotnull";
                
                default:
                    return "equals";
            }
        }
        
        /// <summary>
        /// Parses a filter value
        /// </summary>
        private object ParseFilterValue(string valueText, bool isMetric)
        {
            // Try to parse as an integer
            if (int.TryParse(valueText, out int intValue))
            {
                return intValue;
            }
            
            // Try to parse as a decimal
            if (decimal.TryParse(valueText, out decimal decimalValue))
            {
                return decimalValue;
            }
            
            // Try to parse as a date
            if (DateTime.TryParse(valueText, out DateTime dateValue))
            {
                return dateValue;
            }
            
            // Try to parse as a boolean
            if (bool.TryParse(valueText, out bool boolValue))
            {
                return boolValue;
            }
            
            // Try to parse as a comma-separated list
            if (valueText.Contains(','))
            {
                var values = valueText.Split(',')
                    .Select(v => v.Trim())
                    .ToArray();
                
                // Try to convert array elements to appropriate types
                var result = new object[values.Length];
                bool allIntegers = true;
                bool allDecimals = true;
                
                for (int i = 0; i < values.Length; i++)
                {
                    if (int.TryParse(values[i], out intValue))
                    {
                        result[i] = intValue;
                    }
                    else if (decimal.TryParse(values[i], out decimalValue))
                    {
                        result[i] = decimalValue;
                        allIntegers = false;
                    }
                    else
                    {
                        result[i] = values[i];
                        allIntegers = false;
                        allDecimals = false;
                    }
                }
                
                // If all values are numeric and it's a metric, return numeric array
                if (isMetric && (allIntegers || allDecimals))
                {
                    return result;
                }
                
                // Otherwise return the original strings
                return values;
            }
            
            // Return as a string
            return valueText;
        }
        
        /// <summary>
        /// Calculates the Levenshtein distance between two strings
        /// </summary>
        private int LevenshteinDistance(string s, string t)
        {
            int n = s.Length;
            int m = t.Length;
            int[,] d = new int[n + 1, m + 1];
            
            if (n == 0)
            {
                return m;
            }
            
            if (m == 0)
            {
                return n;
            }
            
            for (int i = 0; i <= n; i++)
            {
                d[i, 0] = i;
            }
            
            for (int j = 0; j <= m; j++)
            {
                d[0, j] = j;
            }
            
            for (int j = 1; j <= m; j++)
            {
                for (int i = 1; i <= n; i++)
                {
                    int cost = (s[i - 1] == t[j - 1]) ? 0 : 1;
                    
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost);
                }
            }
            
            return d[n, m];
        }
        
        #endregion
    }
}