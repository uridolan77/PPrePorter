
# Detailed Entity Extraction Process for NLP Integration

# Detailed Entity Extraction Process for NLP Integration

The entity extraction component is critical for transforming natural language queries into structured database operations. Here's a detailed breakdown of how we'll implement this for the ProgressPlay gaming analytics platform:

## Core Entity Types We'll Extract

For gaming analytics, we'll extract the following key entities:

1. **Time Periods**
   - Absolute dates: "May 5, 2025"
   - Relative dates: "yesterday", "last quarter" 
   - Custom ranges: "between March and April"
   - Time granularity: "hourly", "daily", "monthly"

2. **Metrics**
   - Financial metrics: "revenue", "GGR", "deposits"
   - User metrics: "registrations", "active players", "retention rate"
   - Game metrics: "rounds played", "average bet", "RTP"
   - Performance metrics: "conversion rate", "ARPU", "churn rate"

3. **Dimensions** (for grouping/segmentation)
   - Game properties: "game name", "game type", "provider"
   - User segments: "country", "acquisition source"
   - Business units: "white label", "brand", "partner"
   - Technical dimensions: "device type", "platform"

4. **Filters and Conditions**
   - Comparison operators: "greater than", "at least"
   - Ranking qualifiers: "top 10", "bottom 5"
   - Boolean conditions: "where deposits failed"
   - Text search: "games containing 'slots'"

## Technical Implementation

### 1. GPT-Powered Entity Extraction

```csharp
public async Task<QueryEntities> ExtractEntitiesAsync(string query)
{
    var prompt = $@"
Extract entities from this analytics query for a gaming platform:
Query: ""{query}""

Identify and extract the following entity types:
1. Time periods (today, yesterday, last week, Q1, etc.)
2. Metrics (revenue, registrations, deposits, GGR, etc.)
3. Dimensions (games, white labels, countries, etc.)
4. Filters and conditions (greater than, top 10, etc.)

Return the entities in JSON format with the following structure:
{{
  ""timeRange"": {{
    ""start"": ""YYYY-MM-DD"",
    ""end"": ""YYYY-MM-DD"",
    ""period"": ""daily/weekly/monthly/quarterly/yearly""
  }},
  ""metrics"": [""metric1"", ""metric2""],
  ""dimensions"": [""dimension1"", ""dimension2""],
  ""filters"": [
    {{
      ""dimension"": ""dimensionName"",
      ""operator"": ""equals/greater_than/less_than/contains"",
      ""value"": ""filterValue""
    }}
  ]
}}";

    var response = await CallOpenAiAsync(prompt);
    return ParseEntitiesFromResponse(response);
}
```

### 2. Domain-Specific Knowledge Integration

We'll maintain comprehensive mappings between natural language terms and database fields specifically for the gaming industry:

```csharp
private Dictionary<string, DbMetric> _metricMappings = new Dictionary<string, DbMetric>
{
    ["revenue"] = new DbMetric 
    { 
        Name = "Revenue", 
        DatabaseField = "Transactions.Amount", 
        DefaultAggregation = "sum",
        Synonyms = new[] { "earnings", "income", "money", "sales" }
    },
    
    ["ggr"] = new DbMetric 
    { 
        Name = "GGR", 
        DatabaseField = "Games.GrossGamingRevenue", 
        DefaultAggregation = "sum",
        Synonyms = new[] { "gross gaming revenue", "gross revenue" }
    },
    
    ["deposits"] = new DbMetric 
    { 
        Name = "Deposits", 
        DatabaseField = "Payments.DepositAmount", 
        DefaultAggregation = "sum",
        Synonyms = new[] { "deposit amount", "money in" }
    },
    
    ["active players"] = new DbMetric 
    { 
        Name = "Active Players", 
        DatabaseField = "Players.PlayerId", 
        DefaultAggregation = "count_distinct",
        Synonyms = new[] { "active users", "unique players" }
    },
    
    // Many more gaming-specific metrics...
};
```

### 3. Post-Processing and Entity Resolution

After receiving the raw entity extraction from GPT, we perform several critical steps:

```csharp
private QueryEntities PostProcessEntities(QueryEntities rawEntities, string originalQuery)
{
    var processedEntities = new QueryEntities();
    
    // 1. Resolve time periods to explicit date ranges
    processedEntities.TimeRange = ResolveTimeRange(rawEntities.TimeRange);
    
    // 2. Map metrics to known database fields
    processedEntities.Metrics = MapMetricsToDatabase(rawEntities.Metrics);
    
    // 3. Map dimensions to known database fields
    processedEntities.Dimensions = MapDimensionsToDatabase(rawEntities.Dimensions);
    
    // 4. Validate and format filters
    processedEntities.Filters = ValidateFilters(rawEntities.Filters);
    
    // 5. Handle missing but implied entities
    InferMissingEntities(processedEntities, originalQuery);
    
    return processedEntities;
}
```

## Handling Ambiguity with Clarification Dialogs

When entity extraction is uncertain or ambiguous, we implement clarification mechanisms:

```csharp
private List<EntityConflict> CheckForEntityConflicts(QueryEntities entities)
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
                EntityType = "Metrics",
                EntityName = metric.Name,
                Message = $"The metric '{metric.Name}' is ambiguous",
                Suggestions = GetPossibleMetricMatches(metric.Name, 3)
            });
        }
    }
    
    return conflicts;
}
```

When conflicts are detected, the UI presents clarification options to the user:

```jsx
{needsClarification && (
  <Dialog open={true} onClose={handleClarificationCancel}>
    <DialogTitle>Please clarify your query</DialogTitle>
    <DialogContent>
      {clarificationPrompts.map((prompt, index) => (
        <Box key={index} mb={2}>
          <Typography variant="subtitle1">{prompt.question}</Typography>
          <Box mt={1}>
            {prompt.options.map((option, optIndex) => (
              <Button
                key={optIndex}
                variant="outlined"
                size="small"
                onClick={() => handleClarificationOption(index, option)}
                sx={{ mr: 1, mb: 1 }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      ))}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClarificationCancel}>Cancel</Button>
    </DialogActions>
  </Dialog>
)}
```

## Example in Action

Let's see how this would process a real-world query:

**User query:** "Show me the top 10 games by revenue for UK players over the last month"

**1. Initial GPT extraction:**
```json
{
  "timeRange": {
    "period": "monthly",
    "isRelative": true,
    "relativePeriod": "last_month"
  },
  "metrics": [
    {
      "name": "revenue",
      "aggregation": "sum"
    }
  ],
  "dimensions": ["game", "country"],
  "filters": [
    {
      "dimension": "country",
      "operator": "equals",
      "value": "UK"
    }
  ],
  "limit": 10,
  "sortBy": {
    "field": "revenue",
    "direction": "desc"
  }
}
```

**2. Entity resolution:**
- Time range → Last calendar month (April 1-30, 2025)
- Metrics → Mapped to `Transactions.Amount`
- Dimensions → Mapped to `Games.GameName` and `Players.Country`
- Filters → Mapped to `Players.Country = 'UK'`
- Sort → By revenue descending
- Limit → Top 10 results

**3. Generated SQL:**
```sql
SELECT TOP 10 
    Games.GameName AS Game,
    SUM(Transactions.Amount) AS Revenue
FROM Transactions
JOIN Players ON Transactions.PlayerId = Players.PlayerId
JOIN Games ON Transactions.GameId = Games.GameId
WHERE 
    Players.Country = 'UK'
    AND Transactions.TransactionDate BETWEEN '2025-04-01' AND '2025-04-30'
GROUP BY Games.GameName
ORDER BY Revenue DESC
```

## Continuous Improvement Mechanism

The entity extraction system continuously improves through:

1. **Feedback collection:** Tracking query understanding accuracy and explicit user feedback
2. **Dictionary updates:** Adding new terms and synonyms based on user queries
3. **Analytics:** Monitoring extraction confidence and commonly unrecognized terms

This approach creates a robust, self-improving system that handles the specialized terminology of the gaming industry while providing intuitive clarification when needed.

Would you like me to further elaborate on any particular aspect of the entity extraction process?

# Entity Extraction Process for Analytics NLP

## Overview

Entity extraction is a critical component of our NLP integration, serving as the bridge between natural language queries and structured database operations. For the ProgressPlay reporting system, we need to accurately identify key elements like metrics, dimensions, time periods, and filters from user queries to generate appropriate SQL.

## Entity Types for Gaming Analytics

We'll extract the following entity categories essential for analytics in the gaming industry:

1. **Time Periods**
   - Absolute dates: "January 15, 2025", "05/08/2025"
   - Relative dates: "yesterday", "last week", "past quarter"
   - Custom ranges: "between March and April", "last 30 days"
   - Time parts: "by hour", "daily", "monthly aggregation"

2. **Metrics**
   - Financial metrics: "revenue", "GGR", "deposits", "withdrawals"
   - User metrics: "registrations", "active players", "retention rate"
   - Game metrics: "rounds played", "average bet", "RTP"
   - Performance metrics: "conversion rate", "ARPU", "churn rate"

3. **Dimensions**
   - Game properties: "game name", "game type", "provider"
   - User segments: "country", "age group", "acquisition source"
   - Business units: "white label", "brand", "partner"
   - Technical dimensions: "device type", "browser", "platform"

4. **Filters and Conditions**
   - Comparison operators: "greater than", "at least", "below"
   - Ranking qualifiers: "top 10", "bottom 5"
   - Boolean conditions: "where deposits failed", "successful transactions"
   - Text search: "games containing 'slots'", "users with email '*@gmail.com'"

5. **Complex Operations**
   - Aggregations: "total", "average", "maximum", "growth rate"
   - Comparisons: "compare with previous period", "versus last year"
   - Trend analysis: "trend over time", "month-over-month growth"
   - Anomaly detection: "unusual patterns", "outliers"

## Technical Implementation

### 1. Prompt Engineering for GPT Models

```csharp
public async Task<QueryEntities> ExtractEntitiesAsync(string query)
{
    // Create a specialized prompt that instructs the model
    // exactly how to identify and extract entities
    var prompt = $@"
Extract entities from this analytics query for a gaming platform:
Query: ""{query}""

Identify and extract the following entity types:
1. Time periods (today, yesterday, last week, Q1, specific dates, date ranges, etc.)
2. Metrics (revenue, registrations, deposits, GGR, etc.)
3. Dimensions (games, white labels, countries, etc.)
4. Filters and conditions (greater than, top 10, etc.)
5. Aggregations (total, average, max, etc.)
6. Comparison operations (compare with, versus, etc.)

Return the entities in JSON format with the following structure:
{{
  ""timeRange"": {{
    ""start"": ""YYYY-MM-DD"",
    ""end"": ""YYYY-MM-DD"",
    ""period"": ""daily/weekly/monthly/quarterly/yearly"",
    ""isRelative"": true/false,
    ""relativePeriod"": ""today/yesterday/this_week/last_week/etc""
  }},
  ""metrics"": [
    {{
      ""name"": ""metric1"",
      ""aggregation"": ""sum/avg/max/min/count""
    }}
  ],
  ""dimensions"": [""dimension1"", ""dimension2""],
  ""filters"": [
    {{
      ""dimension"": ""dimensionName"",
      ""operator"": ""equals/greater_than/less_than/contains/in"",
      ""value"": ""filterValue"",
      ""isNegated"": false
    }}
  ],
  ""comparisons"": [
    {{
      ""type"": ""previous_period/year_over_year"",
      ""timePeriod"": ""day/week/month/quarter/year""
    }}
  ],
  ""limit"": 10,
  ""sortBy"": {{
    ""field"": ""fieldName"",
    ""direction"": ""asc/desc""
  }}
}}

Use specific field names from the gaming industry where possible. If a specific entity type is not present in the query, omit that property or use an empty array.";

    var response = await CallOpenAiAsync(prompt);
    return ParseEntitiesFromResponse(response);
}
```

### 2. Entity Resolution and Validation

After receiving the raw entity extraction from the GPT model, we perform several post-processing steps:

```csharp
private QueryEntities PostProcessEntities(QueryEntities rawEntities, string originalQuery)
{
    // Create a new instance to hold the processed entities
    var processedEntities = new QueryEntities();
    
    // 1. Resolve and standardize time periods
    processedEntities.TimeRange = ResolveTimeRange(rawEntities.TimeRange);
    
    // 2. Map metrics to known database fields
    processedEntities.Metrics = MapMetricsToDatabase(rawEntities.Metrics);
    
    // 3. Map dimensions to known database fields
    processedEntities.Dimensions = MapDimensionsToDatabase(rawEntities.Dimensions);
    
    // 4. Validate and format filters
    processedEntities.Filters = ValidateFilters(rawEntities.Filters);
    
    // 5. Check for entity conflicts or contradictions
    CheckForEntityConflicts(processedEntities);
    
    // 6. Handle missing but implied entities
    InferMissingEntities(processedEntities, originalQuery);
    
    // 7. Set confidence levels for each extracted entity
    AssignConfidenceScores(processedEntities);
    
    return processedEntities;
}
```

### 3. Time Range Resolution

Time ranges are particularly complex to handle, as they can be specified in many different ways:

```csharp
private TimeRange ResolveTimeRange(TimeRange rawTimeRange)
{
    if (rawTimeRange == null)
    {
        // Default to last 30 days if no time range specified
        return new TimeRange
        {
            Start = DateTime.Today.AddDays(-30).ToString("yyyy-MM-dd"),
            End = DateTime.Today.ToString("yyyy-MM-dd"),
            Period = "daily",
            IsRelative = true,
            RelativePeriod = "last_30_days"
        };
    }
    
    // Handle relative time periods
    if (rawTimeRange.IsRelative && !string.IsNullOrEmpty(rawTimeRange.RelativePeriod))
    {
        switch (rawTimeRange.RelativePeriod.ToLowerInvariant())
        {
            case "today":
                return new TimeRange
                {
                    Start = DateTime.Today.ToString("yyyy-MM-dd"),
                    End = DateTime.Today.ToString("yyyy-MM-dd"),
                    Period = "hourly",
                    IsRelative = true,
                    RelativePeriod = "today"
                };
                
            case "yesterday":
                return new TimeRange
                {
                    Start = DateTime.Today.AddDays(-1).ToString("yyyy-MM-dd"),
                    End = DateTime.Today.AddDays(-1).ToString("yyyy-MM-dd"),
                    Period = "hourly",
                    IsRelative = true,
                    RelativePeriod = "yesterday"
                };
                
            case "this_week":
                var firstDayOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
                return new TimeRange
                {
                    Start = firstDayOfWeek.ToString("yyyy-MM-dd"),
                    End = DateTime.Today.ToString("yyyy-MM-dd"),
                    Period = "daily",
                    IsRelative = true,
                    RelativePeriod = "this_week"
                };
                
            case "last_week":
                var lastWeekStart = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek - 7);
                var lastWeekEnd = lastWeekStart.AddDays(6);
                return new TimeRange
                {
                    Start = lastWeekStart.ToString("yyyy-MM-dd"),
                    End = lastWeekEnd.ToString("yyyy-MM-dd"),
                    Period = "daily",
                    IsRelative = true,
                    RelativePeriod = "last_week"
                };
                
            // Handle other relative periods (this_month, last_month, this_quarter, etc.)
            // ...
        }
    }
    
    // Handle explicit date ranges
    if (!string.IsNullOrEmpty(rawTimeRange.Start) && !string.IsNullOrEmpty(rawTimeRange.End))
    {
        // Validate date formats
        if (DateTime.TryParse(rawTimeRange.Start, out var startDate) && 
            DateTime.TryParse(rawTimeRange.End, out var endDate))
        {
            // Determine appropriate period based on date range
            string period = DeterminePeriodForDateRange(startDate, endDate);
            
            return new TimeRange
            {
                Start = startDate.ToString("yyyy-MM-dd"),
                End = endDate.ToString("yyyy-MM-dd"),
                Period = period,
                IsRelative = false
            };
        }
    }
    
    // If we can't properly resolve the time range, return the default
    return new TimeRange
    {
        Start = DateTime.Today.AddDays(-30).ToString("yyyy-MM-dd"),
        End = DateTime.Today.ToString("yyyy-MM-dd"),
        Period = "daily",
        IsRelative = true,
        RelativePeriod = "last_30_days"
    };
}

private string DeterminePeriodForDateRange(DateTime start, DateTime end)
{
    var span = end - start;
    
    if (span.TotalDays <= 2)
        return "hourly";
    else if (span.TotalDays <= 60)
        return "daily";
    else if (span.TotalDays <= 365)
        return "weekly";
    else
        return "monthly";
}
```

### 4. Metric and Dimension Mapping

We maintain a comprehensive mapping between natural language terms and database fields:

```csharp
private List<Metric> MapMetricsToDatabase(List<Metric> rawMetrics)
{
    if (rawMetrics == null || !rawMetrics.Any())
        return new List<Metric>();
        
    var mappedMetrics = new List<Metric>();
    
    foreach (var metric in rawMetrics)
    {
        // Try exact match first
        if (_metricMappings.TryGetValue(metric.Name.ToLowerInvariant(), out var dbMetric))
        {
            mappedMetrics.Add(new Metric
            {
                Name = dbMetric.Name,
                DatabaseField = dbMetric.DatabaseField,
                Aggregation = string.IsNullOrEmpty(metric.Aggregation) ? dbMetric.DefaultAggregation : metric.Aggregation
            });
            continue;
        }
        
        // Try fuzzy matching if exact match fails
        var bestMatch = FindBestMetricMatch(metric.Name);
        if (bestMatch != null)
        {
            mappedMetrics.Add(new Metric
            {
                Name = bestMatch.Name,
                DatabaseField = bestMatch.DatabaseField,
                Aggregation = string.IsNullOrEmpty(metric.Aggregation) ? bestMatch.DefaultAggregation : metric.Aggregation,
                MatchConfidence = 0.8 // Lower confidence for fuzzy matches
            });
        }
        else
        {
            // Keep the metric but mark it as unresolved
            mappedMetrics.Add(new Metric
            {
                Name = metric.Name,
                Aggregation = metric.Aggregation,
                IsUnresolved = true,
                MatchConfidence = 0.5
            });
        }
    }
    
    return mappedMetrics;
}

private DbMetric FindBestMetricMatch(string metricName)
{
    // Normalize input
    metricName = metricName.ToLowerInvariant();
    
    // Check for partial matches
    foreach (var mapping in _metricMappings)
    {
        // Check if the mapping key contains the metric name or vice versa
        if (mapping.Key.Contains(metricName) || metricName.Contains(mapping.Key))
        {
            return mapping.Value;
        }
        
        // Check for common synonyms
        foreach (var synonym in mapping.Value.Synonyms)
        {
            if (synonym.Contains(metricName) || metricName.Contains(synonym))
            {
                return mapping.Value;
            }
        }
    }
    
    // Check for word-level similarity
    var metricWords = metricName.Split(' ', '-', '_');
    var bestScore = 0.0;
    DbMetric bestMatch = null;
    
    foreach (var mapping in _metricMappings)
    {
        var mappingWords = mapping.Key.Split(' ', '-', '_');
        var commonWords = metricWords.Intersect(mappingWords, StringComparer.OrdinalIgnoreCase).Count();
        
        if (commonWords > 0)
        {
            var score = (double)commonWords / Math.Max(metricWords.Length, mappingWords.Length);
            if (score > bestScore && score > 0.3) // Threshold for considering a match
            {
                bestScore = score;
                bestMatch = mapping.Value;
            }
        }
    }
    
    return bestMatch;
}
```

## Gaming Industry Domain Knowledge

To improve entity extraction accuracy, we integrate specialized domain knowledge for the gaming industry:

### 1. Gaming Metrics Dictionary

```csharp
private void InitializeMetricMappings()
{
    _metricMappings = new Dictionary<string, DbMetric>(StringComparer.OrdinalIgnoreCase)
    {
        ["revenue"] = new DbMetric 
        { 
            Name = "Revenue", 
            DatabaseField = "Transactions.Amount", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "earnings", "income", "money", "sales" }
        },
        
        ["ggr"] = new DbMetric 
        { 
            Name = "GGR", 
            DatabaseField = "Games.GrossGamingRevenue", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "gross gaming revenue", "gross revenue", "gaming revenue" }
        },
        
        ["ngr"] = new DbMetric 
        { 
            Name = "NGR", 
            DatabaseField = "Games.NetGamingRevenue", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "net gaming revenue", "net revenue" }
        },
        
        ["deposits"] = new DbMetric 
        { 
            Name = "Deposits", 
            DatabaseField = "Payments.DepositAmount", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "deposit amount", "money in", "funds added" }
        },
        
        ["withdrawals"] = new DbMetric 
        { 
            Name = "Withdrawals", 
            DatabaseField = "Payments.WithdrawalAmount", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "withdrawal amount", "money out", "cashouts" }
        },
        
        ["registrations"] = new DbMetric 
        { 
            Name = "Registrations", 
            DatabaseField = "Players.RegistrationDate", 
            DefaultAggregation = "count",
            Synonyms = new[] { "signups", "new players", "new users", "new accounts" }
        },
        
        ["active players"] = new DbMetric 
        { 
            Name = "Active Players", 
            DatabaseField = "Players.PlayerId", 
            DefaultAggregation = "count_distinct",
            Synonyms = new[] { "active users", "actives", "unique players", "unique users" }
        },
        
        ["rounds played"] = new DbMetric 
        { 
            Name = "Rounds Played", 
            DatabaseField = "GameActivity.RoundId", 
            DefaultAggregation = "count",
            Synonyms = new[] { "game rounds", "spins", "hands played", "bets placed" }
        },
        
        ["average bet"] = new DbMetric 
        { 
            Name = "Average Bet", 
            DatabaseField = "GameActivity.BetAmount", 
            DefaultAggregation = "avg",
            Synonyms = new[] { "avg bet", "mean bet", "bet average" }
        },
        
        ["rtp"] = new DbMetric 
        { 
            Name = "RTP", 
            DatabaseField = "Games.ReturnToPlayer", 
            DefaultAggregation = "avg",
            Synonyms = new[] { "return to player", "payback percentage", "payout percentage" }
        },
        
        ["wagering"] = new DbMetric 
        { 
            Name = "Wagering", 
            DatabaseField = "GameActivity.BetAmount", 
            DefaultAggregation = "sum",
            Synonyms = new[] { "total bets", "wagers", "bet amount", "turnover" }
        },
        
        // Add many more gaming-specific metrics...
    };
}
```

### 2. Gaming Dimensions Dictionary

```csharp
private void InitializeDimensionMappings()
{
    _dimensionMappings = new Dictionary<string, DbDimension>(StringComparer.OrdinalIgnoreCase)
    {
        ["game"] = new DbDimension 
        { 
            Name = "Game", 
            DatabaseField = "Games.GameName",
            Synonyms = new[] { "game name", "game title", "slot", "slot name" }
        },
        
        ["game type"] = new DbDimension 
        { 
            Name = "Game Type", 
            DatabaseField = "Games.GameType",
            Synonyms = new[] { "game category", "type of game", "genre" }
        },
        
        ["provider"] = new DbDimension 
        { 
            Name = "Provider", 
            DatabaseField = "Games.ProviderName",
            Synonyms = new[] { "game provider", "vendor", "supplier", "studio" }
        },
        
        ["country"] = new DbDimension 
        { 
            Name = "Country", 
            DatabaseField = "Players.Country",
            Synonyms = new[] { "player country", "location", "region", "geo" }
        },
        
        ["white label"] = new DbDimension 
        { 
            Name = "White Label", 
            DatabaseField = "WhiteLabels.Name",
            Synonyms = new[] { "brand", "site", "casino brand", "skin" }
        },
        
        ["partner"] = new DbDimension 
        { 
            Name = "Partner", 
            DatabaseField = "Partners.Name",
            Synonyms = new[] { "operator", "client", "b2b client" }
        },
        
        ["device"] = new DbDimension 
        { 
            Name = "Device", 
            DatabaseField = "Sessions.DeviceType",
            Synonyms = new[] { "device type", "platform", "mobile/desktop" }
        },
        
        ["payment method"] = new DbDimension 
        { 
            Name = "Payment Method", 
            DatabaseField = "Payments.MethodName",
            Synonyms = new[] { "payment type", "deposit method", "payment provider" }
        },
        
        ["campaign"] = new DbDimension 
        { 
            Name = "Campaign", 
            DatabaseField = "Marketing.CampaignName",
            Synonyms = new[] { "marketing campaign", "promotion", "offer" }
        },
        
        // Add many more gaming-specific dimensions...
    };
}
```

## Handling Ambiguity and Entity Conflicts

When entity extraction is uncertain or ambiguous, we implement clarification mechanisms:

```csharp
private QueryEntities CheckForEntityConflicts(QueryEntities entities)
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
                EntityType = "Metrics",
                EntityName = metric.Name,
                Message = $"The metric '{metric.Name}' is ambiguous",
                Suggestions = GetPossibleMetricMatches(metric.Name, 3)
            });
        }
    }
    
    // Check for incompatible combinations
    if (entities.TimeRange?.Period == "hourly" && entities.Dimensions?.Contains("country") == true)
    {
        conflicts.Add(new EntityConflict
        {
            ConflictType = EntityConflictType.IncompatibleCombination,
            EntityType = "TimeRange + Dimension",
            Message = "Hourly data is not available at the country level",
            Suggestions = new[] { "Change to daily period", "Remove country dimension" }
        });
    }
    
    // Set the conflicts in the entities object
    entities.Conflicts = conflicts;
    
    return entities;
}

private string[] GetPossibleMetricMatches(string metricName, int count)
{
    // Find the most similar metrics based on string similarity
    return _metricMappings.Keys
        .Select(k => new { Key = k, Similarity = CalculateSimilarity(metricName, k) })
        .OrderByDescending(x => x.Similarity)
        .Take(count)
        .Select(x => x.Key)
        .ToArray();
}

private double CalculateSimilarity(string s1, string s2)
{
    // Implement Levenshtein distance or another string similarity algorithm
    // This is a simplified version
    s1 = s1.ToLowerInvariant();
    s2 = s2.ToLowerInvariant();
    
    if (s1.Contains(s2) || s2.Contains(s1))
        return 0.8;
        
    var set1 = new HashSet<string>(s1.Split(' ', '-', '_'));
    var set2 = new HashSet<string>(s2.Split(' ', '-', '_'));
    
    var intersection = set1.Intersect(set2).Count();
    var union = set1.Union(set2).Count();
    
    return (double)intersection / union;
}
```

## Clarification Dialog Process

When entity conflicts or ambiguities are detected, we initiate a clarification dialog:

```csharp
public async Task<ClarificationResponse> RequestClarificationAsync(QueryEntities entities)
{
    if (entities.Conflicts == null || !entities.Conflicts.Any())
        return new ClarificationResponse { NeedsClarification = false };
        
    var response = new ClarificationResponse
    {
        NeedsClarification = true,
        Conflicts = entities.Conflicts,
        ClarificationPrompts = GenerateClarificationPrompts(entities.Conflicts)
    };
    
    return response;
}

private List<ClarificationPrompt> GenerateClarificationPrompts(List<EntityConflict> conflicts)
{
    var prompts = new List<ClarificationPrompt>();
    
    foreach (var conflict in conflicts)
    {
        switch (conflict.ConflictType)
        {
            case EntityConflictType.MissingRequired:
                prompts.Add(new ClarificationPrompt
                {
                    Type = "selection",
                    Question = $"Which {conflict.EntityType.ToLowerInvariant()} would you like to see?",
                    Options = conflict.Suggestions
                });
                break;
                
            case EntityConflictType.Ambiguous:
                prompts.Add(new ClarificationPrompt
                {
                    Type = "selection",
                    Question = $"Did you mean one of these for '{conflict.EntityName}'?",
                    Options = conflict.Suggestions
                });
                break;
                
            case EntityConflictType.IncompatibleCombination:
                prompts.Add(new ClarificationPrompt
                {
                    Type = "selection",
                    Question = conflict.Message + ". What would you prefer to do?",
                    Options = conflict.Suggestions
                });
                break;
                
            case EntityConflictType.UnsupportedEntity:
                prompts.Add(new ClarificationPrompt
                {
                    Type = "information",
                    Message = conflict.Message
                });
                break;
        }
    }
    
    return prompts;
}
```

## Continuous Improvement Process

The entity extraction system continuously improves through feedback:

1. **Feedback Collection**
   - Track query understanding accuracy
   - Collect explicit user feedback on extraction correctness
   - Monitor unresolved entities and common disambiguation requests

2. **Extraction Enhancement**
   - Update domain dictionaries with new terms
   - Add synonyms based on user queries
   - Refine entity mappings based on feedback

3. **Entity Extraction Analytics**
   - Track the most common entities by type
   - Identify frequently unrecognized terms
   - Monitor extraction confidence scores over time

## Example Processing Flow

Here's how the entity extraction process would handle this query:

> "Show me the top 10 games by revenue for UK players over the last month"

1. **Initial GPT Extraction**:
   ```json
   {
     "timeRange": {
       "period": "monthly",
       "isRelative": true,
       "relativePeriod": "last_month"
     },
     "metrics": [
       {
         "name": "revenue",
         "aggregation": "sum"
       }
     ],
     "dimensions": ["game", "country"],
     "filters": [
       {
         "dimension": "country",
         "operator": "equals",
         "value": "UK"
       }
     ],
     "limit": 10,
     "sortBy": {
       "field": "revenue",
       "direction": "desc"
     }
   }
   ```

2. **Entity Resolution**:
   - Time range → Last calendar month (April 1-30, 2025)
   - Metrics → Mapped to `Transactions.Amount`
   - Dimensions → Mapped to `Games.GameName` and `Players.Country`
   - Filters → Mapped to `Players.Country = 'UK'`
   - Sort → By revenue descending
   - Limit → Top 10 results

3. **Generated SQL**:
   ```sql
   SELECT TOP 10 
       Games.GameName AS Game,
       SUM(Transactions.Amount) AS Revenue
   FROM Transactions
   JOIN Players ON Transactions.PlayerId = Players.PlayerId
   JOIN Games ON Transactions.GameId = Games.GameId
   WHERE 
       Players.Country = 'UK'
       AND Transactions.TransactionDate BETWEEN '2025-04-01' AND '2025-04-30'
   GROUP BY Games.GameName
   ORDER BY Revenue DESC
   ```

This end-to-end process transforms a natural language query into a structured database query, leveraging the specialized domain knowledge of the gaming industry while handling edge cases and ambiguities.