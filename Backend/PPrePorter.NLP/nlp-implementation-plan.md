# NLP Integration Implementation Plan

## Architecture Overview

![Architecture Diagram](https://via.placeholder.com/800x400?text=NLP+Integration+Architecture)

We'll implement a hybrid architecture combining OpenAI's GPT models with a robust semantic layer to create a natural language interface for the ProgressPlay reporting platform:

### Key Components

1. **NLP Processing Layer**
   - GPT-powered intent recognition and entity extraction
   - Context management for conversational queries
   - Query refinement with clarification dialogs

2. **Semantic Layer**
   - SQLGlot for robust SQL translation
   - Entity mapping to database schema
   - Query optimization and validation

3. **Security Layer**
   - Policy enforcement with OPA
   - SQL injection prevention
   - Role-based data access control

4. **Backend Services**
   - Asynchronous query processing
   - Redis caching for frequent queries
   - Result summarization and visualization selection

5. **Frontend Components**
   - Chat-like natural language interface
   - Query autocompletion with type-ahead
   - Visual confirmation of query understanding
   - Interactive follow-up suggestions

## Detailed Implementation

### 1. NLP Processing with OpenAI GPT

```csharp
public class OpenAiNlpProcessor : INlpProcessor
{
    private readonly HttpClient _httpClient;
    private readonly IOptions<OpenAiSettings> _settings;
    private readonly ILogger<OpenAiNlpProcessor> _logger;
    private readonly IMemoryCache _cache;

    public OpenAiNlpProcessor(
        HttpClient httpClient,
        IOptions<OpenAiSettings> settings,
        ILogger<OpenAiNlpProcessor> logger,
        IMemoryCache cache)
    {
        _httpClient = httpClient;
        _settings = settings;
        _logger = logger;
        _cache = cache;
    }

    public async Task<QueryIntent> ExtractIntentAsync(string query)
    {
        var prompt = $@"
Extract the intent from this analytics query for a gaming platform:
Query: ""{query}""

Classify the intent as one of the following:
- DataRetrieval: Simple data lookup
- Comparison: Comparing metrics across time periods or dimensions
- TrendAnalysis: Analyzing changes over time
- AnomalyDetection: Finding unusual patterns
- Forecast: Predicting future values

Return only the intent type.";

        var response = await CallOpenAiAsync(prompt);
        return ParseIntentFromResponse(response);
    }

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

    private async Task<string> CallOpenAiAsync(string prompt)
    {
        // Check cache first
        if (_cache.TryGetValue(prompt, out string cachedResponse))
        {
            return cachedResponse;
        }

        try
        {
            var requestBody = new
            {
                model = _settings.Value.ModelName,
                messages = new[]
                {
                    new { role = "system", content = "You are a specialized NLP processor for a gaming analytics platform." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.1 // Low temperature for more deterministic responses
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", _settings.Value.ApiKey);

            var response = await _httpClient.PostAsync(_settings.Value.ApiEndpoint, content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var responseObject = JsonDocument.Parse(responseBody);
            var responseText = responseObject
                .RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            // Cache the result for 5 minutes
            _cache.Set(prompt, responseText, TimeSpan.FromMinutes(5));

            return responseText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI API: {Message}", ex.Message);
            throw new NlpProcessingException("Failed to process natural language query", ex);
        }
    }

    private QueryIntent ParseIntentFromResponse(string response)
    {
        // Parse the response to extract the intent type
        var intentString = response.Trim().ToLowerInvariant();
        
        return intentString switch
        {
            var i when i.Contains("dataretrieval") => QueryIntent.DataRetrieval,
            var i when i.Contains("comparison") => QueryIntent.Comparison,
            var i when i.Contains("trendanalysis") => QueryIntent.TrendAnalysis,
            var i when i.Contains("anomalydetection") => QueryIntent.AnomalyDetection,
            var i when i.Contains("forecast") => QueryIntent.Forecast,
            _ => QueryIntent.DataRetrieval // Default
        };
    }

    private QueryEntities ParseEntitiesFromResponse(string response)
    {
        try
        {
            // Extract JSON from the response
            var jsonMatch = Regex.Match(response, @"\{.*\}", RegexOptions.Singleline);
            if (!jsonMatch.Success)
            {
                _logger.LogWarning("Failed to extract JSON from OpenAI response");
                return new QueryEntities();
            }

            var jsonString = jsonMatch.Value;
            return JsonSerializer.Deserialize<QueryEntities>(jsonString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing entities from response: {Message}", ex.Message);
            return new QueryEntities();
        }
    }
}
```

### 2. Semantic Layer Implementation with SQLGlot

```python
from sqlglot import parse_one, transpile
import json
from datetime import datetime, timedelta
import re

class SemanticLayerProcessor:
    def __init__(self, schema_mapper, metrics_registry):
        self.schema_mapper = schema_mapper
        self.metrics_registry = metrics_registry
    
    def translate_to_sql(self, nlp_entities):
        """
        Translates NLP entities to an optimized SQL query using SQLGlot
        """
        # Map entities to database schema
        mapped_metrics = self._map_metrics(nlp_entities.get('metrics', []))
        mapped_dimensions = self._map_dimensions(nlp_entities.get('dimensions', []))
        mapped_filters = self._map_filters(nlp_entities.get('filters', []))
        dataset = self._determine_dataset(mapped_metrics, mapped_dimensions)
        
        # Build the SQL query
        time_range = nlp_entities.get('timeRange', {})
        time_filter = self._build_time_filter(time_range, dataset)
        
        metrics_expr = ", ".join(mapped_metrics) if mapped_metrics else "COUNT(*)"
        dimensions_expr = ", ".join(mapped_dimensions) if mapped_dimensions else ""
        where_conditions = " AND ".join([time_filter] + mapped_filters) if mapped_filters else time_filter
        group_by = f"GROUP BY {dimensions_expr}" if dimensions_expr else ""
        
        base_query = f"""
            SELECT {metrics_expr} 
            FROM {dataset}
            WHERE {where_conditions}
            {group_by}
        """
        
        # Optimize and transpile the query
        try:
            optimized = parse_one(base_query)
            final_sql = transpile(optimized, read="mssql", write="mssql")[0]
            return {
                "sql": final_sql,
                "dataset": dataset,
                "metrics": mapped_metrics,
                "dimensions": mapped_dimensions,
                "filters": mapped_filters
            }
        except Exception as e:
            raise Exception(f"Error translating to SQL: {str(e)}")
    
    def _map_metrics(self, metrics):
        """Maps natural language metrics to database expressions"""
        result = []
        for metric in metrics:
            if metric in self.metrics_registry:
                result.append(self.metrics_registry[metric])
            else:
                # Try fuzzy matching
                matched = self._fuzzy_match_metric(metric)
                if matched:
                    result.append(matched)
        return result
    
    def _map_dimensions(self, dimensions):
        """Maps natural language dimensions to database columns"""
        result = []
        for dimension in dimensions:
            mapped = self.schema_mapper.map_dimension(dimension)
            if mapped:
                result.append(mapped)
        return result
    
    def _map_filters(self, filters):
        """Maps natural language filters to SQL conditions"""
        result = []
        for filter_item in filters:
            dimension = filter_item.get('dimension')
            operator = filter_item.get('operator')
            value = filter_item.get('value')
            
            if not (dimension and operator and value):
                continue
                
            mapped_dimension = self.schema_mapper.map_dimension(dimension)
            if not mapped_dimension:
                continue
                
            sql_operator = self._map_operator(operator)
            sql_value = self._format_value(value)
            
            result.append(f"{mapped_dimension} {sql_operator} {sql_value}")
        
        return result
    
    def _determine_dataset(self, metrics, dimensions):
        """Determines the most appropriate dataset based on metrics and dimensions"""
        # Logic to select the right table or view
        if any("player" in m.lower() for m in metrics + dimensions):
            return "PlayerReports"
        elif any("game" in m.lower() for m in metrics + dimensions):
            return "GameReports"
        elif any("payment" in m.lower() or "deposit" in m.lower() for m in metrics + dimensions):
            return "PaymentReports"
        else:
            return "GameActivitySummary"  # Default table
    
    def _build_time_filter(self, time_range, dataset):
        """Builds SQL time filter based on the time range"""
        default_date_field = self.schema_mapper.get_default_date_field(dataset)
        
        if not time_range:
            # Default to last 30 days
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            return f"{default_date_field} BETWEEN '{start_date}' AND '{end_date}'"
        
        start = time_range.get('start')
        end = time_range.get('end')
        period = time_range.get('period')
        
        if start and end:
            return f"{default_date_field} BETWEEN '{start}' AND '{end}'"
        elif period:
            # Handle relative time periods
            today = datetime.now().strftime("%Y-%m-%d")
            if period == 'today':
                return f"{default_date_field} = '{today}'"
            elif period == 'yesterday':
                yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
                return f"{default_date_field} = '{yesterday}'"
            elif period == 'last7days':
                week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
                return f"{default_date_field} BETWEEN '{week_ago}' AND '{today}'"
            elif period == 'last30days':
                month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
                return f"{default_date_field} BETWEEN '{month_ago}' AND '{today}'"
            elif period == 'thismonth':
                first_day = datetime.now().replace(day=1).strftime("%Y-%m-%d")
                return f"{default_date_field} BETWEEN '{first_day}' AND '{today}'"
            # Add more period mappings as needed
        
        # Default fallback
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        return f"{default_date_field} BETWEEN '{start_date}' AND '{end_date}'"
    
    def _map_operator(self, operator):
        """Maps natural language operators to SQL operators"""
        operator_map = {
            'equals': '=',
            'equal': '=',
            'is': '=',
            'greater_than': '>',
            'greater than': '>',
            'more than': '>',
            'less_than': '<',
            'less than': '<',
            'fewer than': '<',
            'contains': 'LIKE',
            'like': 'LIKE',
            'in': 'IN'
        }
        
        normalized = operator.lower().strip()
        if normalized in operator_map:
            return operator_map[normalized]
        return '='  # Default operator
    
    def _format_value(self, value):
        """Formats value for SQL based on type"""
        if isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, list):
            formatted_values = [f"'{v}'" if isinstance(v, str) else str(v) for v in value]
            return f"({', '.join(formatted_values)})"
        elif value.lower() in ('true', 'false'):
            return '1' if value.lower() == 'true' else '0'
        else:
            # Handle LIKE operator special case
            if value.startswith('%') or value.endswith('%'):
                return f"'{value}'"
            return f"'%{value}%'" if 'LIKE' in value else f"'{value}'"
    
    def _fuzzy_match_metric(self, metric):
        """Attempts to fuzzy match a metric name with registered metrics"""
        metric = metric.lower()
        
        # Direct partial matches
        for key, value in self.metrics_registry.items():
            if metric in key.lower() or key.lower() in metric:
                return value
        
        # Try word-by-word matching
        metric_words = set(re.findall(r'\w+', metric))
        best_match = None
        best_score = 0
        
        for key, value in self.metrics_registry.items():
            key_words = set(re.findall(r'\w+', key.lower()))
            intersection = metric_words.intersection(key_words)
            score = len(intersection) / max(len(metric_words), len(key_words))
            
            if score > 0.5 and score > best_score:
                best_match = value
                best_score = score
        
        return best_match
```

### 3. Python-C# Integration via gRPC

To bridge the Python-based semantic layer with the C# backend, we'll implement a gRPC service:

```protobuf
syntax = "proto3";

package progressplay.nlp;

service SemanticLayerService {
  rpc TranslateToSql (NlpEntitiesRequest) returns (SqlTranslationResponse);
}

message NlpEntitiesRequest {
  string raw_query = 1;
  string entities_json = 2;
}

message SqlTranslationResponse {
  string sql = 1;
  string dataset = 2;
  repeated string metrics = 3;
  repeated string dimensions = 4;
  string error_message = 5;
  bool success = 6;
}
```

Python gRPC Server:

```python
import grpc
from concurrent import futures
import semantic_layer_pb2
import semantic_layer_pb2_grpc
import json
from semantic_layer_processor import SemanticLayerProcessor
from schema_mapper import SchemaMapper
from metrics_registry import get_metrics_registry

class SemanticLayerServicer(semantic_layer_pb2_grpc.SemanticLayerServiceServicer):
    def __init__(self):
        self.schema_mapper = SchemaMapper()
        self.metrics_registry = get_metrics_registry()
        self.processor = SemanticLayerProcessor(self.schema_mapper, self.metrics_registry)
    
    def TranslateToSql(self, request, context):
        try:
            entities = json.loads(request.entities_json)
            result = self.processor.translate_to_sql(entities)
            
            return semantic_layer_pb2.SqlTranslationResponse(
                sql=result["sql"],
                dataset=result["dataset"],
                metrics=result["metrics"],
                dimensions=result["dimensions"],
                success=True
            )
        except Exception as e:
            return semantic_layer_pb2.SqlTranslationResponse(
                error_message=str(e),
                success=False
            )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    semantic_layer_pb2_grpc.add_SemanticLayerServiceServicer_to_server(
        SemanticLayerServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

C# gRPC Client:

```csharp
public class GrpcSemanticLayerClient : ISemanticLayerClient
{
    private readonly SemanticLayerService.SemanticLayerServiceClient _client;
    private readonly ILogger<GrpcSemanticLayerClient> _logger;

    public GrpcSemanticLayerClient(
        SemanticLayerService.SemanticLayerServiceClient client,
        ILogger<GrpcSemanticLayerClient> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<SqlTranslationResult> TranslateToSqlAsync(
        string rawQuery, 
        QueryEntities entities)
    {
        try
        {
            var entitiesJson = JsonSerializer.Serialize(entities);
            
            var request = new NlpEntitiesRequest
            {
                RawQuery = rawQuery,
                EntitiesJson = entitiesJson
            };

            var response = await _client.TranslateToSqlAsync(request);
            
            if (!response.Success)
            {
                _logger.LogError("SQL translation failed: {ErrorMessage}", response.ErrorMessage);
                throw new SemanticTranslationException(response.ErrorMessage);
            }
            
            return new SqlTranslationResult
            {
                Sql = response.Sql,
                Dataset = response.Dataset,
                Metrics = response.Metrics.ToList(),
                Dimensions = response.Dimensions.ToList()
            };
        }
        catch (Exception ex) when (ex is RpcException || ex is JsonException)
        {
            _logger.LogError(ex, "Error in semantic layer client: {Message}", ex.Message);
            throw new SemanticTranslationException("Failed to translate query to SQL", ex);
        }
    }
}
```

### 4. Enhanced C# NLP Integration Service

```csharp
public class EnhancedNlpService : INlpService
{
    private readonly INlpProcessor _nlpProcessor;
    private readonly ISemanticLayerClient _semanticLayerClient;
    private readonly IDataExecutionService _dataExecutionService;
    private readonly IResultSummarizer _resultSummarizer;
    private readonly IFollowUpGenerator _followUpGenerator;
    private readonly IVisualizationSelector _visualizationSelector;
    private readonly ISecurityPolicyService _securityPolicyService;
    private readonly IDistributedCache _cache;
    private readonly ILogger<EnhancedNlpService> _logger;

    public EnhancedNlpService(
        INlpProcessor nlpProcessor,
        ISemanticLayerClient semanticLayerClient,
        IDataExecutionService dataExecutionService,
        IResultSummarizer resultSummarizer,
        IFollowUpGenerator followUpGenerator,
        IVisualizationSelector visualizationSelector,
        ISecurityPolicyService securityPolicyService,
        IDistributedCache cache,
        ILogger<EnhancedNlpService> logger)
    {
        _nlpProcessor = nlpProcessor;
        _semanticLayerClient = semanticLayerClient;
        _dataExecutionService = dataExecutionService;
        _resultSummarizer = resultSummarizer;
        _followUpGenerator = followUpGenerator;
        _visualizationSelector = visualizationSelector;
        _securityPolicyService = securityPolicyService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<QueryAnalysis> AnalyzeQueryAsync(string query, User user)
    {
        // Generate cache key based on query and user
        var cacheKey = $"analysis:{query}:{user.Id}";
        
        // Try to get from cache first
        var cachedResult = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedResult))
        {
            try
            {
                return JsonSerializer.Deserialize<QueryAnalysis>(cachedResult);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deserialize cached query analysis");
                // Continue with normal processing if cache retrieval fails
            }
        }
        
        // Extract intent and entities using the NLP processor
        var intent = await _nlpProcessor.ExtractIntentAsync(query);
        var entities = await _nlpProcessor.ExtractEntitiesAsync(query);
        
        // Apply security policies based on user permissions
        entities = _securityPolicyService.ApplySecurityPolicies(entities, user);
        
        var analysis = new QueryAnalysis
        {
            OriginalQuery = query,
            Intent = intent,
            Entities = entities,
            User = user,
            Timestamp = DateTime.UtcNow,
            ConfidenceScore = CalculateConfidenceScore(intent, entities)
        };
        
        // Store in cache for 5 minutes
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(analysis),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });
        
        return analysis;
    }

    public async Task<NlpQueryResult> GenerateResponseAsync(QueryAnalysis analysis, User user)
    {
        try
        {
            // Translate to SQL using the semantic layer
            var translationResult = await _semanticLayerClient.TranslateToSqlAsync(
                analysis.OriginalQuery,
                analysis.Entities);
            
            // If confidence is low, mark for human review
            bool needsReview = analysis.ConfidenceScore < 0.7;
            
            // Execute the query to get data
            var data = await _dataExecutionService.ExecuteQueryAsync(
                translationResult.Sql,
                translationResult.Dataset,
                user,
                needsReview);
            
            // Generate a natural language summary of the results
            var summary = await _resultSummarizer.SummarizeResultsAsync(
                data,
                analysis.Intent,
                translationResult.Metrics,
                translationResult.Dimensions);
            
            // Generate follow-up questions based on the current query and results
            var followUpQuestions = await _followUpGenerator.GenerateFollowUpQuestionsAsync(
                analysis,
                data);
            
            // Select appropriate visualizations
            var visualizations = _visualizationSelector.SelectVisualizations(
                data,
                analysis.Intent,
                translationResult.Metrics,
                translationResult.Dimensions);
            
            return new NlpQueryResult
            {
                OriginalQuery = analysis.OriginalQuery,
                StructuredQuery = translationResult.Sql,
                Dataset = translationResult.Dataset,
                Data = data,
                Summary = summary,
                FollowUpQuestions = followUpQuestions,
                Visualizations = visualizations,
                ConfidenceScore = analysis.ConfidenceScore,
                NeedsReview = needsReview,
                ProcessingTime = CalculateProcessingTime(analysis.Timestamp)
            };
        }
        catch (SecurityPolicyException ex)
        {
            _logger.LogWarning(ex, "Security policy violation for query: {Query}", analysis.OriginalQuery);
            return CreateErrorResult(analysis, "You don't have permission to access some of the requested data.");
        }
        catch (SemanticTranslationException ex)
        {
            _logger.LogError(ex, "Failed to translate query: {Query}", analysis.OriginalQuery);
            return CreateErrorResult(analysis, "I couldn't understand that query. Can you try rephrasing it?");
        }
        catch (DataExecutionException ex)
        {
            _logger.LogError(ex, "Failed to execute query: {Query}", analysis.OriginalQuery);
            return CreateErrorResult(analysis, "There was an error retrieving the data. Please try again later.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error processing query: {Query}", analysis.OriginalQuery);
            return CreateErrorResult(analysis, "An unexpected error occurred. Please try again later.");
        }
    }

    public async Task StoreQueryFeedbackAsync(NlpFeedbackRequest feedback)
    {
        // Implementation to store user feedback for model improvement
    }

    private double CalculateConfidenceScore(QueryIntent intent, QueryEntities entities)
    {
        // Logic to calculate confidence score based on intent recognition and entity extraction
        double score = 0.5; // Base score
        
        // Higher score if we successfully extracted entities
        if (entities.Metrics?.Any() == true)
            score += 0.2;
            
        if (entities.Dimensions?.Any() == true)
            score += 0.1;
            
        if (entities.TimeRange != null)
            score += 0.1;
            
        // Cap at 0.95 - never be 100% confident
        return Math.Min(0.95, score);
    }

    private TimeSpan CalculateProcessingTime(DateTime startTime)
    {
        return DateTime.UtcNow - startTime;
    }

    private NlpQueryResult CreateErrorResult(QueryAnalysis analysis, string errorMessage)
    {
        return new NlpQueryResult
        {
            OriginalQuery = analysis.OriginalQuery,
            Summary = errorMessage,
            Error = true,
            FollowUpQuestions = new List<string>
            {
                "Show me yesterday's revenue",
                "What were our top 10 games last week?",
                "Compare deposits between this month and last month"
            }
        };
    }
}
```

### 5. Improved React Frontend

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { 
  Send as SendIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import ResultVisualization from './ResultVisualization';
import QueryUnderstanding from './QueryUnderstanding';

const NaturalLanguageQueryInterface = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Fetch suggested queries on component mount
  useEffect(() => {
    fetchSuggestedQueries();
  }, []);
  
  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  // Fetch query suggestions based on current input
  useEffect(() => {
    if (query.length > 2) {
      fetchQueryAutocomplete(query);
    } else {
      setAutocompleteOptions([]);
    }
  }, [query]);
  
  const fetchSuggestedQueries = async () => {
    try {
      const response = await fetch('/api/naturalLanguage/suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error fetching suggested queries:', error);
    }
  };
  
  const fetchQueryAutocomplete = async (input) => {
    try {
      const response = await fetch(`/api/naturalLanguage/autocomplete?query=${encodeURIComponent(input)}`);
      const data = await response.json();
      setAutocompleteOptions(data.completions);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setQuery('');
    setIsProcessing(true);

    // Add user query to conversation
    setConversation(prev => [...prev, { 
      id: Date.now(), 
      type: 'user', 
      text: userQuery 
    }]);

    try {
      const response = await fetch('/api/naturalLanguage/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userQuery }),
      });

      const result = await response.json();
      
      if (result.error) {
        // Handle error response
        setConversation(prev => [...prev, { 
          id: Date.now(),
          type: 'system', 
          text: result.summary,
          isError: true,
          followUpQuestions: result.followUpQuestions
        }]);
      } else {
        // Add successful system response to conversation
        setConversation(prev => [...prev, { 
          id: Date.now(),
          type: 'system', 
          text: result.summary,
          data: result.data,
          structuredQuery: result.structuredQuery,
          visualizations: result.visualizations,
          followUpQuestions: result.followUpQuestions,
          confidenceScore: result.confidenceScore,
          processingTime: result.processingTime
        }]);
      }

    } catch (error) {
      console.error('Error processing query:', error);
      setConversation(prev => [...prev, { 
        id: Date.now(),
        type: 'system', 
        text: 'Sorry, I had trouble processing that query. Please try again.',
        isError: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFeedback = async (messageId, isPositive) => {
    try {
      const message = conversation.find(item => item.id === messageId);
      if (!message) return;
      
      await fetch('/api/naturalLanguage/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messageId: messageId,
          query: message.text,
          isPositive: isPositive,
          feedback: '' // Could add a modal for detailed feedback
        }),
      });
      
      // Update the conversation to show feedback was given
      setConversation(prev => 
        prev.map(item => 
          item.id === messageId 
            ? { ...item, feedbackGiven: isPositive ? 'positive' : 'negative' }
            : item
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
  const handleFollowUpQuestion = (question) => {
    setQuery(question);
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <Box className="nlp-interface" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" component="h2" sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        Ask a Question About Your Data
      </Typography>
      
      {conversation.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Get insights using natural language
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Ask questions in plain English about your gaming data
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Chip 
                key={index}
                label={suggestion}
                onClick={() => handleFollowUpQuestion(suggestion)}
                color="primary"
                variant="outlined"
                clickable
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      <Box className="conversation-container" sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {conversation.map((item) => (
          <Card 
            key={item.id} 
            className={`message ${item.type}`}
            elevation={1}
            sx={{ 
              maxWidth: item.type === 'user' ? '80%' : '100%',
              alignSelf: item.type === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.type === 'user' ? 'primary.light' : 'background.paper',
              color: item.type === 'user' ? 'primary.contrastText' : 'text.primary',
            }}
          >
            <CardContent>
              <Typography variant="body1">{item.text}</Typography>
              
              {item.type === 'system' && !item.isError && item.structuredQuery && (
                <Tooltip title={item.structuredQuery}>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {item.type === 'system' && !item.isError && (
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="This was helpful">
                    <IconButton 
                      size="small" 
                      onClick={() => handleFeedback(item.id, true)}
                      color={item.feedbackGiven === 'positive' ? 'success' : 'default'}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="This was not helpful">
                    <IconButton 
                      size="small" 
                      onClick={() => handleFeedback(item.id, false)}
                      color={item.feedbackGiven === 'negative' ? 'error' : 'default'}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {item.type === 'system' && item.data && (
                <Box className="result-data" sx={{ mt: 2 }}>
                  <ResultVisualization 
                    data={item.data} 
                    suggestions={item.visualizations} 
                  />
                </Box>
              )}
              
              {item.type === 'system' && item.followUpQuestions && item.followUpQuestions.length > 0 && (
                <Box className="follow-up-questions" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>You might also want to ask:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {item.followUpQuestions.map((question, qIndex) => (
                      <Chip
                        key={qIndex}
                        label={question}
                        onClick={() => handleFollowUpQuestion(question)}
                        variant="outlined"
                        clickable
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} className="query-form" sx={{ 
        p: 2, 
        borderTop: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Autocomplete
          freeSolo
          fullWidth
          options={autocompleteOptions}
          inputValue={query}
          onInputChange={(event, newInputValue) => {
            setQuery(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Ask a question about your data..."
              disabled={isProcessing}
              size="medium"
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isProcessing || !query.trim()}
          endIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Ask
        </Button>
      </Box>
    </Box>
  );
};

export default NaturalLanguageQueryInterface;
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- Set up OpenAI API integration and basic intent recognition
- Implement SQLGlot-based semantic layer foundation
- Create gRPC bridge between Python and C#
- Develop basic React UI for natural language input

### Phase 2: Core Functionality (Weeks 5-8)
- Enhance entity extraction with custom domain knowledge
- Implement security policy enforcement
- Develop result visualization selection
- Add Redis caching for performance optimization
- Build conversational UI with query understanding feedback

### Phase 3: Advanced Features (Weeks 9-12)
- Add context management for follow-up questions
- Implement query autocompletion with type-ahead
- Create advanced feedback collection mechanism
- Add async query processing for complex queries

### Phase 4: Optimization and Training (Weeks 13-16)
- Implement comprehensive monitoring
- Fine-tune models with collected feedback
- Optimize query performance
- Conduct user acceptance testing
- Create documentation and training materials

## Security and Monitoring

### Security Implementation

1. **Policy Enforcement**
   - Implement OPA for fine-grained access control
   - Apply user permissions before query execution
   - Sanitize all user inputs

2. **Query Validation**
   - Implement query sandboxing
   - Validate generated SQL for injection risks
   - Apply rate limiting for API calls

### Monitoring and Analytics

1. **Performance Metrics**
   - Query latency tracking
   - Cache hit rate monitoring
   - Resource utilization dashboards

2. **Quality Metrics**
   - Query understanding accuracy
   - User satisfaction tracking
   - Error rate monitoring

3. **Usage Analytics**
   - Most frequent query types
   - User adoption metrics
   - Feature utilization tracking

## Success Metrics

We'll track the following metrics to measure the success of the NLP integration:

1. **Adoption Metrics**
   - Percentage of users using NLP queries
   - Number of NLP queries per user
   - Reduction in traditional report creation

2. **Performance Metrics**
   - Average query response time
   - Query understanding accuracy
   - System uptime and reliability

3. **Business Impact**
   - Time saved vs. traditional reporting
   - Increase in data-driven decisions
   - User satisfaction scores
