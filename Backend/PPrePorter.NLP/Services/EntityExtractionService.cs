using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Models;
using PPrePorter.NLP.Models.Dictionaries;

namespace PPrePorter.NLP.Services;

/// <summary>
/// Service that extracts and processes entities from natural language queries
/// </summary>
public class EntityExtractionService : IEntityExtractionService
{
    private readonly ILogger<EntityExtractionService> _logger;
    private readonly IDomainKnowledgeService _domainKnowledgeService;
    
    public EntityExtractionService(
        ILogger<EntityExtractionService> logger,
        IDomainKnowledgeService domainKnowledgeService)
    {
        _logger = logger;
        _domainKnowledgeService = domainKnowledgeService;
    }
    
    /// <summary>
    /// Extracts entities from a natural language query
    /// </summary>
    public async Task<QueryEntities> ExtractEntitiesAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            _logger.LogWarning("Empty or null query provided to entity extraction");
            return new QueryEntities();
        }
        
        try
        {
            _logger.LogInformation("Extracting entities from query: {Query}", query);
            
            // In a real implementation, this would call a language model API like GPT-4
            // For this example, we'll use a simulated response
            var rawEntities = SimulateEntityExtraction(query);
            
            // Post-process and resolve the extracted entities
            var processedEntities = await PostProcessEntitiesAsync(rawEntities, query);
            
            _logger.LogInformation("Entity extraction complete: Found {MetricCount} metrics, {DimensionCount} dimensions", 
                processedEntities.Metrics?.Count ?? 0, 
                processedEntities.Dimensions?.Count ?? 0);
            
            return processedEntities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting entities from query: {Query}", query);
            throw;
        }
    }
    
    /// <summary>
    /// Post-processes raw entities extracted from a query
    /// </summary>
    public async Task<QueryEntities> PostProcessEntitiesAsync(QueryEntities rawEntities, string originalQuery)
    {
        if (rawEntities == null)
            return new QueryEntities();
        
        try
        {
            var processedEntities = new QueryEntities
            {
                // Initialize lists if they're null
                Metrics = rawEntities.Metrics ?? new List<Metric>(),
                Dimensions = rawEntities.Dimensions ?? new List<Dimension>(),
                Filters = rawEntities.Filters ?? new List<Filter>(),
                Comparisons = rawEntities.Comparisons ?? new List<Comparison>(),
                SortBy = rawEntities.SortBy,
                Limit = rawEntities.Limit
            };
            
            // 1. Resolve and standardize time periods
            processedEntities.TimeRange = _domainKnowledgeService.ResolveTimeRange(rawEntities.TimeRange);
            
            // 2. Map metrics to known database fields
            MapMetricsToDatabase(processedEntities);
            
            // 3. Map dimensions to known database fields
            MapDimensionsToDatabase(processedEntities);
            
            // 4. Validate and format filters
            ValidateFilters(processedEntities);
            
            // 5. Handle missing but implied entities
            InferMissingEntities(processedEntities, originalQuery);
            
            // 6. Check for entity conflicts or contradictions
            processedEntities.Conflicts = await CheckForEntityConflictsAsync(processedEntities);
            
            // 7. Set confidence levels for each extracted entity
            AssignConfidenceScores(processedEntities);
            
            return processedEntities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error post-processing entities");
            throw;
        }
    }
    
    /// <summary>
    /// Checks for conflicts or ambiguities in the extracted entities
    /// </summary>
    public async Task<List<EntityConflict>> CheckForEntityConflictsAsync(QueryEntities entities)
    {
        var conflicts = new List<EntityConflict>();
        
        // Check for missing required entities
        if (entities.Metrics == null || !entities.Metrics.Any())
        {
            conflicts.Add(new EntityConflict
            {
                ConflictType = EntityConflictType.MissingRequired,
                EntityType = "Metrics",
                Message = "No metrics were specified in the query",
                Suggestions = new[] { "revenue", "deposits", "active players" }
            });
        }
        
        // Check for ambiguous metrics
        var ambiguousMetrics = entities.Metrics?.Where(m => m.MatchConfidence < 0.7).ToList();
        if (ambiguousMetrics != null && ambiguousMetrics.Any())
        {
            foreach (var metric in ambiguousMetrics)
            {
                conflicts.Add(new EntityConflict
                {
                    ConflictType = EntityConflictType.Ambiguous,
                    EntityType = "Metric",
                    OriginalTerm = metric.Name,
                    Message = $"The metric '{metric.Name}' is ambiguous",
                    Suggestions = _domainKnowledgeService.GetMetricMappings()
                        .Where(m => CalculateSimilarity(metric.Name.ToLower(), m.Key) > 0.5)
                        .Take(3)
                        .Select(m => m.Value.Name)
                        .ToArray()
                });
            }
        }
        
        // Check for unknown metrics
        var unknownMetrics = entities.Metrics?.Where(m => m.IsUnresolved).ToList();
        if (unknownMetrics != null && unknownMetrics.Any())
        {
            foreach (var metric in unknownMetrics)
            {
                conflicts.Add(new EntityConflict
                {
                    ConflictType = EntityConflictType.Unknown,
                    EntityType = "Metric",
                    OriginalTerm = metric.Name,
                    Message = $"The metric '{metric.Name}' is not recognized",
                    Suggestions = _domainKnowledgeService.GetMetricMappings()
                        .OrderBy(m => m.Key)
                        .Take(5)
                        .Select(m => m.Value.Name)
                        .ToArray()
                });
            }
        }
        
        // Check for ambiguous dimensions
        var ambiguousDimensions = entities.Dimensions?.Where(d => d.MatchConfidence < 0.7).ToList();
        if (ambiguousDimensions != null && ambiguousDimensions.Any())
        {
            foreach (var dimension in ambiguousDimensions)
            {
                conflicts.Add(new EntityConflict
                {
                    ConflictType = EntityConflictType.Ambiguous,
                    EntityType = "Dimension",
                    OriginalTerm = dimension.Name,
                    Message = $"The dimension '{dimension.Name}' is ambiguous",
                    Suggestions = _domainKnowledgeService.GetDimensionMappings()
                        .Where(d => CalculateSimilarity(dimension.Name.ToLower(), d.Key) > 0.5)
                        .Take(3)
                        .Select(d => d.Value.Name)
                        .ToArray()
                });
            }
        }
        
        // Check for unknown dimensions
        var unknownDimensions = entities.Dimensions?.Where(d => d.IsUnresolved).ToList();
        if (unknownDimensions != null && unknownDimensions.Any())
        {
            foreach (var dimension in unknownDimensions)
            {
                conflicts.Add(new EntityConflict
                {
                    ConflictType = EntityConflictType.Unknown,
                    EntityType = "Dimension",
                    OriginalTerm = dimension.Name,
                    Message = $"The dimension '{dimension.Name}' is not recognized",
                    Suggestions = _domainKnowledgeService.GetDimensionMappings()
                        .OrderBy(d => d.Key)
                        .Take(5)
                        .Select(d => d.Value.Name)
                        .ToArray()
                });
            }
        }
        
        // Check for invalid values in filters
        if (entities.Filters != null)
        {
            foreach (var filter in entities.Filters)
            {
                // Find the corresponding dimension
                var dimension = entities.Dimensions?.FirstOrDefault(d => 
                    d.Name.Equals(filter.Dimension, StringComparison.OrdinalIgnoreCase));
                
                if (dimension != null && !string.IsNullOrEmpty(dimension.DatabaseField))
                {
                    // Get the dimension mapping
                    var dbDimension = _domainKnowledgeService.GetDimensionMappings()
                        .Values
                        .FirstOrDefault(d => d.DatabaseField == dimension.DatabaseField);
                    
                    // If the dimension has allowed values, check if the filter value is valid
                    if (dbDimension?.AllowedValues != null && dbDimension.AllowedValues.Any())
                    {
                        bool isValidValue = dbDimension.AllowedValues.Any(v => 
                            v.Key.Equals(filter.Value, StringComparison.OrdinalIgnoreCase) || 
                            v.Value.Equals(filter.Value, StringComparison.OrdinalIgnoreCase));
                        
                        if (!isValidValue)
                        {
                            conflicts.Add(new EntityConflict
                            {
                                ConflictType = EntityConflictType.InvalidValue,
                                EntityType = "Filter",
                                OriginalTerm = filter.Value,
                                Message = $"The value '{filter.Value}' is not valid for dimension '{filter.Dimension}'",
                                Suggestions = dbDimension.AllowedValues.Values.ToArray()
                            });
                        }
                    }
                }
            }
        }
        
        return conflicts;
    }
    
    /// <summary>
    /// Generates appropriate SQL based on the extracted and resolved entities
    /// </summary>
    public async Task<string> GenerateSqlFromEntitiesAsync(QueryEntities entities)
    {
        if (entities == null)
            throw new ArgumentNullException(nameof(entities));
            
        if (entities.Metrics == null || !entities.Metrics.Any())
            throw new InvalidOperationException("At least one metric is required to generate SQL");
            
        try
        {
            var sb = new System.Text.StringBuilder();
            
            // Start building the SQL query
            sb.AppendLine("SELECT");
            
            // Add dimensions for grouping
            if (entities.Dimensions != null && entities.Dimensions.Any())
            {
                foreach (var dimension in entities.Dimensions)
                {
                    if (!string.IsNullOrEmpty(dimension.DatabaseField))
                    {
                        sb.AppendLine($"    {dimension.DatabaseField} AS {EscapeIdentifier(dimension.Name)},");
                    }
                }
            }
            
            // Add metrics with their aggregations
            if (entities.Metrics != null && entities.Metrics.Any())
            {
                for (int i = 0; i < entities.Metrics.Count; i++)
                {
                    var metric = entities.Metrics[i];
                    if (!string.IsNullOrEmpty(metric.DatabaseField))
                    {
                        var aggregation = !string.IsNullOrEmpty(metric.Aggregation) ? 
                            metric.Aggregation.ToUpper() : "SUM";
                            
                        // Handle special case for distinct count
                        if (aggregation.Equals("DISTINCT_COUNT", StringComparison.OrdinalIgnoreCase))
                        {
                            sb.AppendLine($"    COUNT(DISTINCT {metric.DatabaseField}) AS {EscapeIdentifier(metric.Name)}");
                        }
                        else
                        {
                            sb.AppendLine($"    {aggregation}({metric.DatabaseField}) AS {EscapeIdentifier(metric.Name)}");
                        }
                        
                        // Add comma if not the last metric
                        if (i < entities.Metrics.Count - 1)
                        {
                            sb.Append(",");
                        }
                    }
                }
            }
            
            // FROM clause - in a real implementation, this would be more sophisticated
            // to determine the proper tables and joins based on the metrics and dimensions
            sb.AppendLine("FROM Transactions");
            
            // Add necessary joins based on metrics and dimensions
            var joinedTables = new HashSet<string>();
            
            // Process all database fields to determine required joins
            var allFields = new List<string>();
            if (entities.Metrics != null)
                allFields.AddRange(entities.Metrics.Where(m => !string.IsNullOrEmpty(m.DatabaseField)).Select(m => m.DatabaseField));
            if (entities.Dimensions != null)
                allFields.AddRange(entities.Dimensions.Where(d => !string.IsNullOrEmpty(d.DatabaseField)).Select(d => d.DatabaseField));
            if (entities.Filters != null)
                allFields.AddRange(entities.Filters.Where(f => !string.IsNullOrEmpty(f.DatabaseField)).Select(f => f.DatabaseField));
            
            foreach (var field in allFields)
            {
                var tableName = field.Split('.')[0];
                
                if (tableName != "Transactions" && !joinedTables.Contains(tableName))
                {
                    // Add join - in a real implementation, this would use proper join logic
                    // based on known relationships between tables
                    switch (tableName)
                    {
                        case "Players":
                            sb.AppendLine("JOIN Players ON Transactions.PlayerId = Players.PlayerId");
                            break;
                        case "Games":
                            sb.AppendLine("JOIN Games ON Transactions.GameId = Games.GameId");
                            break;
                        case "Payments":
                            sb.AppendLine("JOIN Payments ON Transactions.TransactionId = Payments.TransactionId");
                            break;
                        case "WhiteLabels":
                            sb.AppendLine("JOIN WhiteLabels ON Transactions.WhitelabelId = WhiteLabels.WhitelabelId");
                            break;
                        case "Partners":
                            sb.AppendLine("JOIN Partners ON WhiteLabels.PartnerId = Partners.PartnerId");
                            break;
                        case "Sessions":
                            sb.AppendLine("JOIN Sessions ON Transactions.SessionId = Sessions.SessionId");
                            break;
                        case "Marketing":
                            sb.AppendLine("JOIN Marketing ON Players.PlayerId = Marketing.PlayerId");
                            break;
                        case "GameActivity":
                            sb.AppendLine("JOIN GameActivity ON Transactions.TransactionId = GameActivity.TransactionId");
                            break;
                        case "PlayerMetrics":
                            sb.AppendLine("JOIN PlayerMetrics ON Players.PlayerId = PlayerMetrics.PlayerId");
                            break;
                    }
                    
                    joinedTables.Add(tableName);
                }
            }
            
            // WHERE clause for filters
            if (entities.Filters != null && entities.Filters.Any())
            {
                sb.AppendLine("WHERE");
                
                for (int i = 0; i < entities.Filters.Count; i++)
                {
                    var filter = entities.Filters[i];
                    if (!string.IsNullOrEmpty(filter.DatabaseField))
                    {
                        string operatorStr;
                        switch (filter.Operator.ToLower())
                        {
                            case "equals":
                                operatorStr = "=";
                                break;
                            case "greater_than":
                                operatorStr = ">";
                                break;
                            case "less_than":
                                operatorStr = "<";
                                break;
                            case "contains":
                                operatorStr = "LIKE";
                                filter.Value = $"%{filter.Value}%";
                                break;
                            case "in":
                                operatorStr = "IN";
                                // Assuming the value is comma-separated
                                var values = filter.Value.Split(',').Select(v => $"'{v.Trim()}'");
                                filter.Value = $"({string.Join(", ", values)})";
                                break;
                            default:
                                operatorStr = "=";
                                break;
                        }
                        
                        string negationPrefix = filter.IsNegated ? "NOT " : "";
                        
                        // Special handling for NULL values
                        if (filter.Value.Equals("null", StringComparison.OrdinalIgnoreCase))
                        {
                            sb.AppendLine($"    {negationPrefix}({filter.DatabaseField} IS NULL)");
                        }
                        else
                        {
                            bool needsQuotes = !filter.Value.StartsWith("(") && !decimal.TryParse(filter.Value, out _);
                            string valueStr = needsQuotes ? $"'{filter.Value}'" : filter.Value;
                            
                            sb.AppendLine($"    {negationPrefix}({filter.DatabaseField} {operatorStr} {valueStr})");
                        }
                        
                        // Add AND if not the last filter
                        if (i < entities.Filters.Count - 1)
                        {
                            sb.AppendLine("    AND");
                        }
                    }
                }
            }
            
            // Add time range filter
            if (entities.TimeRange != null && !string.IsNullOrEmpty(entities.TimeRange.Start) && !string.IsNullOrEmpty(entities.TimeRange.End))
            {
                if (entities.Filters == null || !entities.Filters.Any())
                {
                    sb.AppendLine("WHERE");
                }
                else
                {
                    sb.AppendLine("    AND");
                }
                
                sb.AppendLine($"    Transactions.TransactionDate BETWEEN '{entities.TimeRange.Start}' AND '{entities.TimeRange.End}'");
            }
            
            // GROUP BY clause if there are dimensions
            if (entities.Dimensions != null && entities.Dimensions.Any())
            {
                sb.AppendLine("GROUP BY");
                
                for (int i = 0; i < entities.Dimensions.Count; i++)
                {
                    var dimension = entities.Dimensions[i];
                    if (!string.IsNullOrEmpty(dimension.DatabaseField))
                    {
                        sb.AppendLine($"    {dimension.DatabaseField}");
                        
                        // Add comma if not the last dimension
                        if (i < entities.Dimensions.Count - 1)
                        {
                            sb.Append(",");
                        }
                    }
                }
            }
            
            // ORDER BY clause
            if (entities.SortBy != null && !string.IsNullOrEmpty(entities.SortBy.Field))
            {
                sb.AppendLine("ORDER BY");
                
                // Find the corresponding metric or dimension for the sort field
                string sortField = entities.SortBy.Field;
                string direction = entities.SortBy.Direction.ToUpper() == "ASC" ? "ASC" : "DESC";
                
                // Try to find as a metric first
                var metric = entities.Metrics?.FirstOrDefault(m => 
                    m.Name.Equals(sortField, StringComparison.OrdinalIgnoreCase));
                    
                if (metric != null)
                {
                    sb.AppendLine($"    {EscapeIdentifier(metric.Name)} {direction}");
                }
                else
                {
                    // Try to find as a dimension
                    var dimension = entities.Dimensions?.FirstOrDefault(d => 
                        d.Name.Equals(sortField, StringComparison.OrdinalIgnoreCase));
                        
                    if (dimension != null)
                    {
                        sb.AppendLine($"    {EscapeIdentifier(dimension.Name)} {direction}");
                    }
                    else if (!string.IsNullOrEmpty(entities.SortBy.DatabaseField))
                    {
                        // Direct database field reference
                        sb.AppendLine($"    {entities.SortBy.DatabaseField} {direction}");
                    }
                    else
                    {
                        // Default to first metric
                        var firstMetric = entities.Metrics?.FirstOrDefault();
                        if (firstMetric != null)
                        {
                            sb.AppendLine($"    {EscapeIdentifier(firstMetric.Name)} {direction}");
                        }
                    }
                }
            }
            
            // LIMIT clause
            if (entities.Limit.HasValue && entities.Limit.Value > 0)
            {
                sb.AppendLine($"LIMIT {entities.Limit.Value}");
            }
            
            return sb.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating SQL from entities");
            throw;
        }
    }
    
    #region Private Helper Methods
    
    /// <summary>
    /// Simulates the NLP entity extraction process (in a real implementation, this would call an LLM)
    /// </summary>
    private QueryEntities SimulateEntityExtraction(string query)
    {
        // This is a simplified simulation of entity extraction
        // In a real implementation, this would use a language model API
        
        query = query.ToLower();
        var entities = new QueryEntities();
        
        // Extract time period
        if (query.Contains("today"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "today" };
        }
        else if (query.Contains("yesterday"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "yesterday" };
        }
        else if (query.Contains("this week"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "this_week" };
        }
        else if (query.Contains("last week"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_week" };
        }
        else if (query.Contains("this month"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "this_month" };
        }
        else if (query.Contains("last month"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_month" };
        }
        else if (query.Contains("last 30 days"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_30_days" };
        }
        else if (query.Contains("this quarter"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "this_quarter" };
        }
        else if (query.Contains("last quarter"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_quarter" };
        }
        else if (query.Contains("this year"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "this_year" };
        }
        else if (query.Contains("last year"))
        {
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_year" };
        }
        else
        {
            // Default to last 30 days
            entities.TimeRange = new TimeRange { IsRelative = true, RelativePeriod = "last_30_days" };
        }
        
        // Extract metrics
        entities.Metrics = new List<Metric>();
        
        if (query.Contains("revenue"))
        {
            entities.Metrics.Add(new Metric { Name = "revenue" });
        }
        if (query.Contains("ggr") || query.Contains("gross gaming revenue") || query.Contains("gross revenue"))
        {
            entities.Metrics.Add(new Metric { Name = "ggr" });
        }
        if (query.Contains("deposits") || query.Contains("deposit"))
        {
            entities.Metrics.Add(new Metric { Name = "deposits" });
        }
        if (query.Contains("withdrawals") || query.Contains("withdrawal"))
        {
            entities.Metrics.Add(new Metric { Name = "withdrawals" });
        }
        if (query.Contains("registrations") || query.Contains("new players") || query.Contains("signups"))
        {
            entities.Metrics.Add(new Metric { Name = "registrations" });
        }
        if (query.Contains("active players") || query.Contains("players") || query.Contains("active users"))
        {
            entities.Metrics.Add(new Metric { Name = "active players" });
        }
        if (query.Contains("average bet") || query.Contains("avg bet"))
        {
            entities.Metrics.Add(new Metric { Name = "average bet" });
        }
        if (query.Contains("rtp") || query.Contains("return to player"))
        {
            entities.Metrics.Add(new Metric { Name = "rtp" });
        }
        if (query.Contains("wagering") || query.Contains("wagers") || query.Contains("total bets"))
        {
            entities.Metrics.Add(new Metric { Name = "wagering" });
        }
        if (query.Contains("arpu") || query.Contains("average revenue per user"))
        {
            entities.Metrics.Add(new Metric { Name = "arpu" });
        }
        if (query.Contains("retention") || query.Contains("retention rate"))
        {
            entities.Metrics.Add(new Metric { Name = "retention rate" });
        }
        if (query.Contains("rounds") || query.Contains("rounds played") || query.Contains("spins"))
        {
            entities.Metrics.Add(new Metric { Name = "rounds played" });
        }
        
        // If no metrics were found, try to infer from the query
        if (!entities.Metrics.Any() && !string.IsNullOrEmpty(query))
        {
            // Add a default metric based on the context
            if (query.Contains("performance") || query.Contains("earnings") || query.Contains("money"))
            {
                entities.Metrics.Add(new Metric { Name = "revenue" });
            }
            else if (query.Contains("activity"))
            {
                entities.Metrics.Add(new Metric { Name = "active players" });
            }
        }
        
        // Extract dimensions
        entities.Dimensions = new List<Dimension>();
        
        if (query.Contains("game") || query.Contains("games"))
        {
            entities.Dimensions.Add(new Dimension { Name = "game" });
        }
        if (query.Contains("game type") || query.Contains("game category") || query.Contains("category"))
        {
            entities.Dimensions.Add(new Dimension { Name = "game type" });
        }
        if (query.Contains("provider") || query.Contains("vendor") || query.Contains("supplier"))
        {
            entities.Dimensions.Add(new Dimension { Name = "provider" });
        }
        if (query.Contains("country") || query.Contains("countries") || query.Contains("location"))
        {
            entities.Dimensions.Add(new Dimension { Name = "country" });
        }
        if (query.Contains("white label") || query.Contains("brand") || query.Contains("site"))
        {
            entities.Dimensions.Add(new Dimension { Name = "white label" });
        }
        if (query.Contains("partner") || query.Contains("operator") || query.Contains("client"))
        {
            entities.Dimensions.Add(new Dimension { Name = "partner" });
        }
        if (query.Contains("device") || query.Contains("platform") || query.Contains("mobile") || query.Contains("desktop"))
        {
            entities.Dimensions.Add(new Dimension { Name = "device" });
        }
        if (query.Contains("payment method") || query.Contains("payment type"))
        {
            entities.Dimensions.Add(new Dimension { Name = "payment method" });
        }
        if (query.Contains("campaign") || query.Contains("promotion") || query.Contains("marketing"))
        {
            entities.Dimensions.Add(new Dimension { Name = "campaign" });
        }
        if (query.Contains("segment") || query.Contains("player type") || query.Contains("player segment"))
        {
            entities.Dimensions.Add(new Dimension { Name = "player segment" });
        }
        
        // Extract filters
        entities.Filters = new List<Filter>();
        
        // Extract filter for specific country
        if (query.Contains("uk") || query.Contains("united kingdom"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "country", 
                Operator = "equals", 
                Value = "UK" 
            });
        }
        else if (query.Contains("germany") || query.Contains("german"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "country", 
                Operator = "equals", 
                Value = "Germany" 
            });
        }
        
        // Extract filter for game type
        if (query.Contains("slots"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "game type", 
                Operator = "equals", 
                Value = "Slots" 
            });
        }
        else if (query.Contains("table games") || query.Contains("table game"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "game type", 
                Operator = "equals", 
                Value = "Table Games" 
            });
        }
        else if (query.Contains("live dealer") || query.Contains("live casino"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "game type", 
                Operator = "equals", 
                Value = "Live Dealer" 
            });
        }
        
        // Extract filter for device
        if (query.Contains("mobile"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "device", 
                Operator = "equals", 
                Value = "Mobile" 
            });
        }
        else if (query.Contains("desktop"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "device", 
                Operator = "equals", 
                Value = "Desktop" 
            });
        }
        
        // Extract filter for player segment
        if (query.Contains("vip"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "player segment", 
                Operator = "equals", 
                Value = "VIP" 
            });
        }
        else if (query.Contains("high roller"))
        {
            entities.Filters.Add(new Filter 
            { 
                Dimension = "player segment", 
                Operator = "equals", 
                Value = "High Roller" 
            });
        }
        
        // Extract sorting criteria
        if (query.Contains("top"))
        {
            Regex topRegex = new Regex(@"top\s+(\d+)");
            var match = topRegex.Match(query);
            if (match.Success && int.TryParse(match.Groups[1].Value, out int limit))
            {
                entities.Limit = limit;
            }
            else
            {
                entities.Limit = 10; // Default limit
            }
            
            // Set default sort to first metric in descending order
            if (entities.Metrics.Any())
            {
                entities.SortBy = new SortOption
                {
                    Field = entities.Metrics[0].Name,
                    Direction = "desc"
                };
            }
        }
        else if (query.Contains("bottom"))
        {
            Regex bottomRegex = new Regex(@"bottom\s+(\d+)");
            var match = bottomRegex.Match(query);
            if (match.Success && int.TryParse(match.Groups[1].Value, out int limit))
            {
                entities.Limit = limit;
            }
            else
            {
                entities.Limit = 10; // Default limit
            }
            
            // Set sort to first metric in ascending order
            if (entities.Metrics.Any())
            {
                entities.SortBy = new SortOption
                {
                    Field = entities.Metrics[0].Name,
                    Direction = "asc"
                };
            }
        }
        
        return entities;
    }
    
    /// <summary>
    /// Maps metrics to database fields using the domain knowledge service
    /// </summary>
    private void MapMetricsToDatabase(QueryEntities entities)
    {
        if (entities.Metrics == null)
            return;
            
        for (int i = 0; i < entities.Metrics.Count; i++)
        {
            var metric = entities.Metrics[i];
            var dbMetric = _domainKnowledgeService.MapMetricToDatabaseField(metric.Name);
            
            if (dbMetric != null)
            {
                metric.DatabaseField = dbMetric.DatabaseField;
                
                // Use default aggregation if not specified
                if (string.IsNullOrEmpty(metric.Aggregation))
                {
                    metric.Aggregation = dbMetric.DefaultAggregation;
                }
                
                metric.IsUnresolved = false;
                metric.MatchConfidence = 1.0; // Exact match
            }
            else
            {
                metric.IsUnresolved = true;
                metric.MatchConfidence = 0.0;
            }
        }
    }
    
    /// <summary>
    /// Maps dimensions to database fields using the domain knowledge service
    /// </summary>
    private void MapDimensionsToDatabase(QueryEntities entities)
    {
        if (entities.Dimensions == null)
            return;
            
        for (int i = 0; i < entities.Dimensions.Count; i++)
        {
            var dimension = entities.Dimensions[i];
            var dbDimension = _domainKnowledgeService.MapDimensionToDatabaseField(dimension.Name);
            
            if (dbDimension != null)
            {
                dimension.DatabaseField = dbDimension.DatabaseField;
                dimension.IsUnresolved = false;
                dimension.MatchConfidence = 1.0; // Exact match
            }
            else
            {
                dimension.IsUnresolved = true;
                dimension.MatchConfidence = 0.0;
            }
        }
    }
    
    /// <summary>
    /// Validates and formats filters
    /// </summary>
    private void ValidateFilters(QueryEntities entities)
    {
        if (entities.Filters == null)
            return;
            
        for (int i = 0; i < entities.Filters.Count; i++)
        {
            var filter = entities.Filters[i];
            
            // Map the dimension in the filter to a database field
            var dbDimension = _domainKnowledgeService.MapDimensionToDatabaseField(filter.Dimension);
            
            if (dbDimension != null)
            {
                filter.DatabaseField = dbDimension.DatabaseField;
                
                // Validate the filter value against allowed values if applicable
                if (dbDimension.AllowedValues != null && dbDimension.AllowedValues.Any())
                {
                    // Check if the value matches any key or value in the allowed values
                    var matchedValue = dbDimension.AllowedValues
                        .FirstOrDefault(v => 
                            v.Key.Equals(filter.Value, StringComparison.OrdinalIgnoreCase) || 
                            v.Value.Equals(filter.Value, StringComparison.OrdinalIgnoreCase));
                            
                    if (!string.IsNullOrEmpty(matchedValue.Value))
                    {
                        // Use the standardized value
                        filter.Value = matchedValue.Value;
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// Infers missing but implied entities from the query context
    /// </summary>
    private void InferMissingEntities(QueryEntities entities, string originalQuery)
    {
        // If no metrics were found, add a default metric
        if (entities.Metrics == null || !entities.Metrics.Any())
        {
            entities.Metrics = new List<Metric> 
            { 
                new Metric { Name = "revenue" } 
            };
            
            // Map the default metric
            MapMetricsToDatabase(entities);
        }
        
        // If no sort order was specified but limit was, add default sort
        if (entities.SortBy == null && entities.Limit.HasValue && entities.Limit.Value > 0)
        {
            entities.SortBy = new SortOption
            {
                Field = entities.Metrics[0].Name,
                Direction = "desc"
            };
        }
        
        // Add implied dimensions if needed
        if (entities.Dimensions == null)
        {
            entities.Dimensions = new List<Dimension>();
        }
        
        // If filters reference dimensions that aren't in the dimensions list, add them
        if (entities.Filters != null)
        {
            foreach (var filter in entities.Filters)
            {
                if (!entities.Dimensions.Any(d => d.Name.Equals(filter.Dimension, StringComparison.OrdinalIgnoreCase)))
                {
                    entities.Dimensions.Add(new Dimension { Name = filter.Dimension });
                }
            }
            
            // Map any new dimensions
            MapDimensionsToDatabase(entities);
        }
    }
    
    /// <summary>
    /// Assigns confidence scores to the extracted entities
    /// </summary>
    private void AssignConfidenceScores(QueryEntities entities)
    {
        // For a real implementation, this would use more sophisticated algorithms
        // to calculate confidence scores based on multiple factors
        
        // Calculate overall confidence based on component confidences
        double metricConfidence = 1.0;
        double dimensionConfidence = 1.0;
        
        if (entities.Metrics != null && entities.Metrics.Any())
        {
            metricConfidence = entities.Metrics.Average(m => m.MatchConfidence);
        }
        
        if (entities.Dimensions != null && entities.Dimensions.Any())
        {
            dimensionConfidence = entities.Dimensions.Average(d => d.MatchConfidence);
        }
        
        // Overall confidence is the average of metrics and dimensions
        entities.OverallConfidence = (metricConfidence + dimensionConfidence) / 2;
    }
    
    /// <summary>
    /// Escapes an identifier for SQL use
    /// </summary>
    private string EscapeIdentifier(string identifier)
    {
        // Replace spaces with underscores
        identifier = identifier.Replace(" ", "_");
        
        // Remove any other invalid characters
        Regex rgx = new Regex("[^a-zA-Z0-9_]");
        identifier = rgx.Replace(identifier, "");
        
        return identifier;
    }
    
    /// <summary>
    /// Calculate similarity between two strings (simplified implementation)
    /// </summary>
    private double CalculateSimilarity(string source, string target)
    {
        // This is a very simplified implementation
        // In a real-world scenario, you would use a more sophisticated algorithm
        
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target))
            return 0;
            
        if (source == target)
            return 1;
            
        // Check if one is contained in the other
        if (source.Contains(target) || target.Contains(source))
            return 0.8;
            
        // Count matching words
        var sourceWords = source.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var targetWords = target.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        var matchingWords = sourceWords.Intersect(targetWords, StringComparer.OrdinalIgnoreCase).Count();
        var totalWords = Math.Max(sourceWords.Length, targetWords.Length);
        
        return totalWords > 0 ? (double)matchingWords / totalWords : 0;
    }
    
    #endregion
}