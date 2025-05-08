# Semantic Layer Implementation with SQLGlot for Gaming Analytics

Below is a comprehensive C# class library project that implements a robust semantic layer using SQLGlot for gaming analytics. The project wraps SQLGlot's Python functionality and provides a complete foundation for translating natural language queries to optimized SQL.

## Overview

This semantic layer serves as the bridge between natural language processing and database access for the ProgressPlay gaming analytics platform. It takes extracted entities from NLP queries and translates them into optimized SQL, with special focus on gaming-specific metrics and dimensions.

### Key Features

1. **Gaming-Specific Domain Model** - Comprehensive mapping of gaming industry metrics and dimensions
2. **SQLGlot Integration** - Leverages SQLGlot's powerful SQL generation and optimization capabilities
3. **Intelligent Query Building** - Automatically determines required tables and joins
4. **Performance Optimization** - Applies gaming-specific query optimizations
5. **Security Integration** - Enforces user permissions and access controls
6. **Extensible Architecture** - Easy to add new metrics, dimensions, and optimization rules

### How It Works

1. The NLP layer extracts entities from natural language queries
2. The semantic layer maps these entities to database fields using gaming-specific knowledge
3. The query builder constructs a logical query structure with tables, joins, and conditions
4. The SQLGlot bridge generates optimized SQL from this structure
5. The resulting SQL is executed against the database

This approach provides a flexible, maintainable way to bridge the gap between natural language and database queries, making analytics accessible to non-technical users.

## Project Structure

```
ProgressPlay.SemanticLayer/
├── ProgressPlay.SemanticLayer.csproj
├── Properties/
│   └── AssemblyInfo.cs
├── Core/
│   ├── ISemanticLayerService.cs
│   ├── SemanticLayerService.cs
│   ├── SQLGlotBridge.cs
│   ├── QueryBuilder.cs
│   └── QueryOptimizer.cs
├── Models/
│   ├── Entities/
│   │   ├── Entity.cs
│   │   ├── Metric.cs
│   │   ├── Dimension.cs
│   │   ├── TimeRange.cs
│   │   ├── Filter.cs
│   │   └── Sort.cs
│   ├── Database/
│   │   ├── DataModel.cs
│   │   ├── Table.cs
│   │   ├── Column.cs
│   │   ├── Relationship.cs
│   │   └── View.cs
│   ├── Configuration/
│   │   ├── SemanticLayerOptions.cs
│   │   ├── PythonOptions.cs
│   │   └── DatabaseOptions.cs
│   └── Translation/
│       ├── QueryAnalysis.cs
│       ├── QueryEntities.cs
│       ├── EntityMap.cs
│       ├── SqlTranslationResult.cs
│       └── TranslationContext.cs
├── Gaming/
│   ├── GamingDataModel.cs
│   ├── GamingMetrics.cs
│   ├── GamingDimensions.cs
│   ├── GamingEntityMapper.cs
│   └── CommonGamingQueries.cs
├── Python/
│   ├── SQLGlotTranslator.py
│   ├── QueryOptimizer.py
│   ├── SchemaMapper.py
│   └── requirements.txt
├── Services/
│   ├── MetricMappingService.cs
│   ├── DimensionMappingService.cs
│   ├── EntityResolutionService.cs
│   ├── TimeResolutionService.cs
│   └── SqlGenerationService.cs
├── Extensions/
│   ├── QueryBuilderExtensions.cs
│   ├── StringExtensions.cs
│   ├── EntityExtensions.cs
│   └── SqlExtensions.cs
└── Utils/
    ├── PythonProcessRunner.cs
    ├── SqlFormatter.cs
    ├── MetricRegistry.cs
    └── DateTimeHelper.cs
```

## Core Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RootNamespace>ProgressPlay.SemanticLayer</RootNamespace>
    <AssemblyName>ProgressPlay.SemanticLayer</AssemblyName>
    <Version>1.0.0</Version>
    <Authors>ProgressPlay</Authors>
    <Company>ProgressPlay</Company>
    <Description>A robust semantic layer for translating natural language queries to SQL for gaming analytics</Description>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="6.0.0" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="6.0.0" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="6.0.1" />
    <PackageReference Include="Microsoft.Extensions.Options" Version="6.0.0" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
    <PackageReference Include="pythonnet" Version="3.0.1" />
    <PackageReference Include="System.Text.Json" Version="6.0.5" />
  </ItemGroup>

  <ItemGroup>
    <None Update="Python\**\*.*">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>
```

## Core Components

### ISemanticLayerService.cs

```csharp
using ProgressPlay.SemanticLayer.Models.Translation;

namespace ProgressPlay.SemanticLayer.Core
{
    /// <summary>
    /// Main interface for the semantic layer service that translates high-level query entities to SQL
    /// </summary>
    public interface ISemanticLayerService
    {
        /// <summary>
        /// Translates query entities extracted from natural language to optimized SQL
        /// </summary>
        /// <param name="entities">The parsed entities from the NLP layer</param>
        /// <param name="context">Optional context data to influence translation</param>
        /// <returns>A structured SQL translation result</returns>
        Task<SqlTranslationResult> TranslateToSqlAsync(QueryEntities entities, TranslationContext? context = null);
        
        /// <summary>
        /// Validates if the provided entities can be translated to valid SQL
        /// </summary>
        /// <param name="entities">The entities to validate</param>
        /// <returns>Validation result with any issues found</returns>
        Task<EntityValidationResult> ValidateEntitiesAsync(QueryEntities entities);
        
        /// <summary>
        /// Generates example SQL for the provided query pattern
        /// </summary>
        /// <param name="queryPattern">The query pattern identifier</param>
        /// <returns>Example SQL for the pattern</returns>
        string GetExampleSql(string queryPattern);
        
        /// <summary>
        /// Gets all supported metrics in the semantic layer
        /// </summary>
        /// <returns>Collection of supported metrics</returns>
        IReadOnlyCollection<MetricDefinition> GetSupportedMetrics();
        
        /// <summary>
        /// Gets all supported dimensions in the semantic layer
        /// </summary>
        /// <returns>Collection of supported dimensions</returns>
        IReadOnlyCollection<DimensionDefinition> GetSupportedDimensions();
    }
}
```

### SemanticLayerService.cs

```csharp
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProgressPlay.SemanticLayer.Gaming;
using ProgressPlay.SemanticLayer.Models.Configuration;
using ProgressPlay.SemanticLayer.Models.Translation;
using ProgressPlay.SemanticLayer.Services;
using System.Diagnostics;

namespace ProgressPlay.SemanticLayer.Core
{
    /// <summary>
    /// Implementation of the semantic layer service for translating NLP entities to SQL
    /// </summary>
    public class SemanticLayerService : ISemanticLayerService
    {
        private readonly SQLGlotBridge _sqlGlotBridge;
        private readonly QueryBuilder _queryBuilder;
        private readonly QueryOptimizer _queryOptimizer;
        private readonly MetricMappingService _metricMappingService;
        private readonly DimensionMappingService _dimensionMappingService;
        private readonly TimeResolutionService _timeResolutionService;
        private readonly GamingEntityMapper _gamingEntityMapper;
        private readonly ILogger<SemanticLayerService> _logger;
        private readonly SemanticLayerOptions _options;

        public SemanticLayerService(
            SQLGlotBridge sqlGlotBridge,
            QueryBuilder queryBuilder,
            QueryOptimizer queryOptimizer,
            MetricMappingService metricMappingService,
            DimensionMappingService dimensionMappingService,
            TimeResolutionService timeResolutionService,
            GamingEntityMapper gamingEntityMapper,
            IOptions<SemanticLayerOptions> options,
            ILogger<SemanticLayerService> logger)
        {
            _sqlGlotBridge = sqlGlotBridge;
            _queryBuilder = queryBuilder;
            _queryOptimizer = queryOptimizer;
            _metricMappingService = metricMappingService;
            _dimensionMappingService = dimensionMappingService;
            _timeResolutionService = timeResolutionService;
            _gamingEntityMapper = gamingEntityMapper;
            _options = options.Value;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<SqlTranslationResult> TranslateToSqlAsync(QueryEntities entities, TranslationContext? context = null)
        {
            try
            {
                _logger.LogInformation("Beginning translation to SQL for query: {OriginalQuery}", 
                    context?.OriginalQuery ?? "No query provided");
                
                var sw = Stopwatch.StartNew();
                
                // Map entities to data model
                var mappedEntities = _gamingEntityMapper.MapToDataModel(entities);
                
                // Resolve time range to specific dates
                if (mappedEntities.TimeRange != null)
                {
                    mappedEntities.TimeRange = _timeResolutionService.ResolveTimeRange(mappedEntities.TimeRange);
                }
                
                // Build the query
                var queryStructure = _queryBuilder.BuildQueryFromEntities(mappedEntities, context);
                
                // Optimize the query
                var optimizedQueryStructure = _queryOptimizer.OptimizeQuery(queryStructure);
                
                // Generate SQL using SQLGlot
                var sqlResult = await _sqlGlotBridge.GenerateSqlAsync(optimizedQueryStructure);
                
                sw.Stop();
                
                _logger.LogInformation("SQL translation completed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
                
                return new SqlTranslationResult
                {
                    Sql = sqlResult.Sql,
                    Parameters = sqlResult.Parameters,
                    TargetTables = sqlResult.TargetTables,
                    MappedMetrics = mappedEntities.Metrics.Select(m => m.DatabaseField).ToList(),
                    MappedDimensions = mappedEntities.Dimensions.Select(d => d.DatabaseField).ToList(),
                    ProcessingTimeMs = sw.ElapsedMilliseconds,
                    QueryComplexity = CalculateQueryComplexity(optimizedQueryStructure)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating to SQL: {Message}", ex.Message);
                throw new SemanticTranslationException("Failed to translate query to SQL", ex);
            }
        }

        /// <inheritdoc />
        public async Task<EntityValidationResult> ValidateEntitiesAsync(QueryEntities entities)
        {
            var result = new EntityValidationResult
            {
                IsValid = true,
                ValidationIssues = new List<ValidationIssue>()
            };
            
            // Validate metrics
            if (entities.Metrics == null || !entities.Metrics.Any())
            {
                result.IsValid = false;
                result.ValidationIssues.Add(new ValidationIssue
                {
                    IssueType = ValidationIssueType.MissingRequiredEntity,
                    EntityType = "Metric",
                    Message = "At least one metric is required"
                });
            }
            else
            {
                foreach (var metric in entities.Metrics)
                {
                    if (!_metricMappingService.IsValidMetric(metric.Name))
                    {
                        result.IsValid = false;
                        result.ValidationIssues.Add(new ValidationIssue
                        {
                            IssueType = ValidationIssueType.UnknownEntity,
                            EntityType = "Metric",
                            EntityValue = metric.Name,
                            Message = $"Unknown metric: {metric.Name}",
                            Suggestions = _metricMappingService.GetSimilarMetrics(metric.Name, 3)
                        });
                    }
                }
            }
            
            // Validate dimensions
            if (entities.Dimensions != null)
            {
                foreach (var dimension in entities.Dimensions)
                {
                    if (!_dimensionMappingService.IsValidDimension(dimension))
                    {
                        result.IsValid = false;
                        result.ValidationIssues.Add(new ValidationIssue
                        {
                            IssueType = ValidationIssueType.UnknownEntity,
                            EntityType = "Dimension",
                            EntityValue = dimension,
                            Message = $"Unknown dimension: {dimension}",
                            Suggestions = _dimensionMappingService.GetSimilarDimensions(dimension, 3)
                        });
                    }
                }
            }
            
            // Validate time range
            if (entities.TimeRange == null)
            {
                // No time range is acceptable, will use defaults
            }
            else
            {
                try
                {
                    _timeResolutionService.ValidateTimeRange(entities.TimeRange);
                }
                catch (Exception ex)
                {
                    result.IsValid = false;
                    result.ValidationIssues.Add(new ValidationIssue
                    {
                        IssueType = ValidationIssueType.InvalidEntity,
                        EntityType = "TimeRange",
                        Message = ex.Message
                    });
                }
            }
            
            // Validate filters
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters)
                {
                    if (!_dimensionMappingService.IsValidDimension(filter.Dimension))
                    {
                        result.IsValid = false;
                        result.ValidationIssues.Add(new ValidationIssue
                        {
                            IssueType = ValidationIssueType.UnknownEntity,
                            EntityType = "Filter.Dimension",
                            EntityValue = filter.Dimension,
                            Message = $"Unknown dimension in filter: {filter.Dimension}",
                            Suggestions = _dimensionMappingService.GetSimilarDimensions(filter.Dimension, 3)
                        });
                    }
                }
            }
            
            return result;
        }

        /// <inheritdoc />
        public string GetExampleSql(string queryPattern)
        {
            return CommonGamingQueries.GetExampleSql(queryPattern);
        }

        /// <inheritdoc />
        public IReadOnlyCollection<MetricDefinition> GetSupportedMetrics()
        {
            return _metricMappingService.GetAllMetrics();
        }

        /// <inheritdoc />
        public IReadOnlyCollection<DimensionDefinition> GetSupportedDimensions()
        {
            return _dimensionMappingService.GetAllDimensions();
        }
        
        private int CalculateQueryComplexity(QueryStructure query)
        {
            // Calculate complexity based on:
            // - Number of tables/joins
            // - Number of conditions
            // - Aggregation complexity
            // - Sorting/grouping
            
            int complexity = 1; // Base complexity
            
            complexity += query.Tables.Count;
            complexity += query.Joins.Count * 2;
            complexity += query.Conditions.Count;
            complexity += query.GroupBy.Count;
            complexity += query.OrderBy.Count;
            
            if (query.HasSubqueries)
                complexity *= 2;
                
            if (query.HasWindowFunctions)
                complexity *= 2;
                
            return Math.Min(complexity, 10); // Cap at 10
        }
    }
}
```

### SQLGlotBridge.cs

```csharp
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using ProgressPlay.SemanticLayer.Models.Configuration;
using ProgressPlay.SemanticLayer.Utils;
using System.Diagnostics;
using System.Text;

namespace ProgressPlay.SemanticLayer.Core
{
    /// <summary>
    /// Bridge between C# and Python SQLGlot for SQL generation and optimization
    /// </summary>
    public class SQLGlotBridge
    {
        private readonly PythonProcessRunner _pythonRunner;
        private readonly ILogger<SQLGlotBridge> _logger;
        private readonly PythonOptions _options;
        
        public SQLGlotBridge(
            PythonProcessRunner pythonRunner,
            IOptions<PythonOptions> options,
            ILogger<SQLGlotBridge> logger)
        {
            _pythonRunner = pythonRunner;
            _options = options.Value;
            _logger = logger;
        }
        
        /// <summary>
        /// Generates SQL from a query structure using SQLGlot
        /// </summary>
        public async Task<SqlResult> GenerateSqlAsync(QueryStructure queryStructure)
        {
            try
            {
                // Serialize query structure to JSON
                var queryJson = JsonConvert.SerializeObject(queryStructure);
                
                // Prepare Python script execution
                var scriptPath = Path.Combine(_options.ScriptsDirectory, "SQLGlotTranslator.py");
                
                if (!File.Exists(scriptPath))
                {
                    throw new FileNotFoundException($"SQLGlot translator script not found at: {scriptPath}");
                }
                
                // Execute Python script
                var result = await _pythonRunner.RunScriptAsync(
                    scriptPath,
                    new[] { "--query-structure", queryJson, "--dialect", "mssql" }
                );
                
                if (result.ExitCode != 0)
                {
                    _logger.LogError("SQLGlot translator script failed: {ErrorOutput}", result.StandardError);
                    throw new SemanticTranslationException($"SQLGlot translation failed: {result.StandardError}");
                }
                
                // Parse JSON result
                var sqlResult = JsonConvert.DeserializeObject<SqlResult>(result.StandardOutput);
                
                if (sqlResult == null)
                {
                    throw new SemanticTranslationException("Failed to parse SQL result JSON");
                }
                
                return sqlResult;
            }
            catch (Exception ex) when (!(ex is SemanticTranslationException))
            {
                _logger.LogError(ex, "Error generating SQL with SQLGlot: {Message}", ex.Message);
                throw new SemanticTranslationException("Failed to generate SQL", ex);
            }
        }
        
        /// <summary>
        /// Optimizes an SQL query using SQLGlot's optimization capabilities
        /// </summary>
        public async Task<string> OptimizeSqlAsync(string sql, string dialect = "mssql")
        {
            try
            {
                // Prepare Python script execution
                var scriptPath = Path.Combine(_options.ScriptsDirectory, "QueryOptimizer.py");
                
                if (!File.Exists(scriptPath))
                {
                    throw new FileNotFoundException($"Query optimizer script not found at: {scriptPath}");
                }
                
                // Execute Python script
                var result = await _pythonRunner.RunScriptAsync(
                    scriptPath,
                    new[] { "--sql", sql, "--dialect", dialect }
                );
                
                if (result.ExitCode != 0)
                {
                    _logger.LogError("Query optimizer script failed: {ErrorOutput}", result.StandardError);
                    throw new SemanticTranslationException($"SQL optimization failed: {result.StandardError}");
                }
                
                return result.StandardOutput.Trim();
            }
            catch (Exception ex) when (!(ex is SemanticTranslationException))
            {
                _logger.LogError(ex, "Error optimizing SQL with SQLGlot: {Message}", ex.Message);
                throw new SemanticTranslationException("Failed to optimize SQL", ex);
            }
        }
        
        /// <summary>
        /// Validates SQL syntax using SQLGlot
        /// </summary>
        public async Task<bool> ValidateSqlSyntaxAsync(string sql, string dialect = "mssql")
        {
            try
            {
                // Prepare Python script execution
                var scriptPath = Path.Combine(_options.ScriptsDirectory, "SQLGlotTranslator.py");
                
                if (!File.Exists(scriptPath))
                {
                    throw new FileNotFoundException($"SQLGlot translator script not found at: {scriptPath}");
                }
                
                // Execute Python script
                var result = await _pythonRunner.RunScriptAsync(
                    scriptPath,
                    new[] { "--validate", "--sql", sql, "--dialect", dialect }
                );
                
                return result.ExitCode == 0 && result.StandardOutput.Trim().Equals("valid", StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating SQL syntax: {Message}", ex.Message);
                return false;
            }
        }
    }
    
    /// <summary>
    /// Result of SQL generation from SQLGlot
    /// </summary>
    public class SqlResult
    {
        /// <summary>
        /// The generated SQL query
        /// </summary>
        public string Sql { get; set; } = string.Empty;
        
        /// <summary>
        /// Parameters for the query (for parameterized queries)
        /// </summary>
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Tables referenced in the query
        /// </summary>
        public List<string> TargetTables { get; set; } = new List<string>();
        
        /// <summary>
        /// Optimization notes for the query
        /// </summary>
        public List<string> OptimizationNotes { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Exception thrown during semantic translation
    /// </summary>
    public class SemanticTranslationException : Exception
    {
        public SemanticTranslationException(string message) : base(message) { }
        
        public SemanticTranslationException(string message, Exception innerException) 
            : base(message, innerException) { }
    }
}
```

### QueryBuilder.cs

```csharp
using Microsoft.Extensions.Logging;
using ProgressPlay.SemanticLayer.Extensions;
using ProgressPlay.SemanticLayer.Models.Database;
using ProgressPlay.SemanticLayer.Models.Entities;
using ProgressPlay.SemanticLayer.Models.Translation;
using ProgressPlay.SemanticLayer.Services;
using System.Collections.Generic;
using System.Linq;

namespace ProgressPlay.SemanticLayer.Core
{
    /// <summary>
    /// Builds structured queries from mapped entities
    /// </summary>
    public class QueryBuilder
    {
        private readonly DataModel _dataModel;
        private readonly ILogger<QueryBuilder> _logger;
        private readonly SqlGenerationService _sqlGenerationService;
        
        public QueryBuilder(
            DataModel dataModel,
            SqlGenerationService sqlGenerationService,
            ILogger<QueryBuilder> logger)
        {
            _dataModel = dataModel;
            _sqlGenerationService = sqlGenerationService;
            _logger = logger;
        }
        
        /// <summary>
        /// Builds a structured query from mapped entities
        /// </summary>
        public QueryStructure BuildQueryFromEntities(MappedQueryEntities entities, TranslationContext? context = null)
        {
            _logger.LogInformation("Building query from entities with {MetricCount} metrics, {DimensionCount} dimensions", 
                entities.Metrics?.Count ?? 0, entities.Dimensions?.Count ?? 0);
            
            var queryStructure = new QueryStructure
            {
                QueryType = DetermineQueryType(entities),
                SelectColumns = BuildSelectColumns(entities),
                Tables = DetermineRequiredTables(entities),
                Joins = BuildJoins(entities),
                Conditions = BuildConditions(entities),
                GroupBy = BuildGroupBy(entities),
                OrderBy = BuildOrderBy(entities),
                Limit = entities.Limit
            };
            
            // Apply context-specific modifications if needed
            if (context != null)
            {
                ApplyContextSpecificModifications(queryStructure, context);
            }
            
            return queryStructure;
        }
        
        private QueryType DetermineQueryType(MappedQueryEntities entities)
        {
            // Determine the most appropriate query type based on entities
            if (entities.Comparisons?.Any() == true)
            {
                return QueryType.Comparison;
            }
            
            if (entities.Metrics?.Count > 1 && entities.Dimensions?.Any() == true)
            {
                return QueryType.MultiMetricGrouped;
            }
            
            if (entities.Dimensions?.Any() == true)
            {
                return QueryType.GroupBy;
            }
            
            return QueryType.Aggregate;
        }
        
        private List<SelectColumn> BuildSelectColumns(MappedQueryEntities entities)
        {
            var columns = new List<SelectColumn>();
            
            // Add dimensions to select
            if (entities.Dimensions != null)
            {
                foreach (var dimension in entities.Dimensions)
                {
                    columns.Add(new SelectColumn
                    {
                        Source = dimension.DatabaseField,
                        Alias = dimension.Name,
                        IsAggregation = false
                    });
                }
            }
            
            // Add metrics to select with appropriate aggregation
            if (entities.Metrics != null)
            {
                foreach (var metric in entities.Metrics)
                {
                    columns.Add(new SelectColumn
                    {
                        Source = metric.DatabaseField,
                        Alias = metric.Name,
                        IsAggregation = true,
                        AggregationType = metric.Aggregation ?? "SUM"
                    });
                }
            }
            
            return columns;
        }
        
        private List<string> DetermineRequiredTables(MappedQueryEntities entities)
        {
            var tables = new HashSet<string>();
            
            // Add tables for dimensions
            if (entities.Dimensions != null)
            {
                foreach (var dimension in entities.Dimensions)
                {
                    var tableName = GetTableFromField(dimension.DatabaseField);
                    if (!string.IsNullOrEmpty(tableName))
                    {
                        tables.Add(tableName);
                    }
                }
            }
            
            // Add tables for metrics
            if (entities.Metrics != null)
            {
                foreach (var metric in entities.Metrics)
                {
                    var tableName = GetTableFromField(metric.DatabaseField);
                    if (!string.IsNullOrEmpty(tableName))
                    {
                        tables.Add(tableName);
                    }
                }
            }
            
            // Add tables for filters
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters)
                {
                    var tableName = GetTableFromField(filter.DatabaseField);
                    if (!string.IsNullOrEmpty(tableName))
                    {
                        tables.Add(tableName);
                    }
                }
            }
            
            // Ensure all required tables are joined properly
            var allRequiredTables = ResolveTableDependencies(tables);
            
            return allRequiredTables.ToList();
        }
        
        private List<JoinInfo> BuildJoins(MappedQueryEntities entities)
        {
            var joins = new List<JoinInfo>();
            var tables = DetermineRequiredTables(entities);
            
            if (tables.Count <= 1)
            {
                return joins; // No joins needed
            }
            
            // Find the primary table (fact table) to start from
            var primaryTable = FindPrimaryTable(tables);
            var tablesToJoin = new HashSet<string>(tables);
            tablesToJoin.Remove(primaryTable);
            
            // Build the join tree
            BuildJoinTree(primaryTable, tablesToJoin, joins);
            
            return joins;
        }
        
        private List<Condition> BuildConditions(MappedQueryEntities entities)
        {
            var conditions = new List<Condition>();
            
            // Add time range conditions
            if (entities.TimeRange != null)
            {
                var dateField = _dataModel.GetDefaultDateField();
                
                if (!string.IsNullOrEmpty(entities.TimeRange.Start))
                {
                    conditions.Add(new Condition
                    {
                        Field = dateField,
                        Operator = ">=",
                        Value = entities.TimeRange.Start
                    });
                }
                
                if (!string.IsNullOrEmpty(entities.TimeRange.End))
                {
                    conditions.Add(new Condition
                    {
                        Field = dateField,
                        Operator = "<=",
                        Value = entities.TimeRange.End
                    });
                }
            }
            
            // Add filter conditions
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters)
                {
                    conditions.Add(new Condition
                    {
                        Field = filter.DatabaseField,
                        Operator = MapFilterOperator(filter.Operator),
                        Value = filter.Value,
                        IsNegated = filter.IsNegated
                    });
                }
            }
            
            return conditions;
        }
        
        private List<string> BuildGroupBy(MappedQueryEntities entities)
        {
            var groupBy = new List<string>();
            
            // Add dimensions to group by
            if (entities.Dimensions != null)
            {
                foreach (var dimension in entities.Dimensions)
                {
                    groupBy.Add(dimension.DatabaseField);
                }
            }
            
            return groupBy;
        }
        
        private List<OrderByInfo> BuildOrderBy(MappedQueryEntities entities)
        {
            var orderBy = new List<OrderByInfo>();
            
            // Add explicit sort options
            if (entities.SortBy != null)
            {
                // If sorting by a metric or dimension
                var field = entities.SortBy.Field;
                var direction = entities.SortBy.Direction?.ToUpper() == "DESC" ? "DESC" : "ASC";
                
                // Try to find the field in metrics or dimensions
                var metric = entities.Metrics?.FirstOrDefault(m => m.Name.Equals(field, StringComparison.OrdinalIgnoreCase));
                var dimension = entities.Dimensions?.FirstOrDefault(d => d.Name.Equals(field, StringComparison.OrdinalIgnoreCase));
                
                string? databaseField = null;
                bool isAggregation = false;
                string? aggregationType = null;
                
                if (metric != null)
                {
                    databaseField = metric.DatabaseField;
                    isAggregation = true;
                    aggregationType = metric.Aggregation;
                }
                else if (dimension != null)
                {
                    databaseField = dimension.DatabaseField;
                    isAggregation = false;
                }
                
                if (!string.IsNullOrEmpty(databaseField))
                {
                    orderBy.Add(new OrderByInfo
                    {
                        Field = databaseField,
                        Direction = direction,
                        IsAggregation = isAggregation,
                        AggregationType = aggregationType
                    });
                }
            }
            // If no explicit sort, default to first metric descending
            else if (entities.Metrics?.Any() == true)
            {
                var firstMetric = entities.Metrics.First();
                
                orderBy.Add(new OrderByInfo
                {
                    Field = firstMetric.DatabaseField,
                    Direction = "DESC",
                    IsAggregation = true,
                    AggregationType = firstMetric.Aggregation
                });
            }
            
            return orderBy;
        }
        
        private string GetTableFromField(string? field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;
                
            var parts = field.Split('.');
            return parts.Length > 1 ? parts[0] : string.Empty;
        }
        
        private HashSet<string> ResolveTableDependencies(HashSet<string> initialTables)
        {
            var allTables = new HashSet<string>(initialTables);
            bool added;
            
            do
            {
                added = false;
                var tablesToAdd = new HashSet<string>();
                
                foreach (var table in allTables)
                {
                    var dependencies = _dataModel.GetTableDependencies(table);
                    
                    foreach (var dependency in dependencies)
                    {
                        if (!allTables.Contains(dependency))
                        {
                            tablesToAdd.Add(dependency);
                            added = true;
                        }
                    }
                }
                
                allTables.UnionWith(tablesToAdd);
            } while (added);
            
            return allTables;
        }
        
        private string FindPrimaryTable(List<string> tables)
        {
            // Find the fact table (usually has the most foreign keys/relationships)
            var factTables = _dataModel.GetFactTables();
            
            foreach (var factTable in factTables)
            {
                if (tables.Contains(factTable))
                {
                    return factTable;
                }
            }
            
            // Default to first table if no fact table is found
            return tables.First();
        }
        
        private void BuildJoinTree(string baseTable, HashSet<string> tablesToJoin, List<JoinInfo> joins)
        {
            if (tablesToJoin.Count == 0)
                return;
                
            var directlyJoinableTables = new HashSet<string>();
            
            // Find tables that can be directly joined to the base table
            foreach (var table in tablesToJoin)
            {
                var relationship = _dataModel.GetRelationship(baseTable, table);
                
                if (relationship != null)
                {
                    joins.Add(new JoinInfo
                    {
                        FromTable = baseTable,
                        ToTable = table,
                        FromColumn = relationship.FromColumn,
                        ToColumn = relationship.ToColumn,
                        JoinType = "INNER"
                    });
                    
                    directlyJoinableTables.Add(table);
                }
            }
            
            // Remove joined tables
            foreach (var table in directlyJoinableTables)
            {
                tablesToJoin.Remove(table);
            }
            
            // If there are still tables to join, use the first joined table as the new base
            if (tablesToJoin.Count > 0 && directlyJoinableTables.Count > 0)
            {
                BuildJoinTree(directlyJoinableTables.First(), tablesToJoin, joins);
            }
            // If we can't join any more tables but have tables left, we need to find indirect paths
            else if (tablesToJoin.Count > 0)
            {
                var nextTable = tablesToJoin.First();
                var path = _dataModel.FindJoinPath(baseTable, nextTable);
                
                if (path != null)
                {
                    for (int i = 0; i < path.Count - 1; i++)
                    {
                        var fromTable = path[i];
                        var toTable = path[i + 1];
                        var relationship = _dataModel.GetRelationship(fromTable, toTable);
                        
                        if (relationship != null)
                        {
                            joins.Add(new JoinInfo
                            {
                                FromTable = fromTable,
                                ToTable = toTable,
                                FromColumn = relationship.FromColumn,
                                ToColumn = relationship.ToColumn,
                                JoinType = "INNER"
                            });
                            
                            if (tablesToJoin.Contains(toTable))
                            {
                                tablesToJoin.Remove(toTable);
                            }
                        }
                    }
                    
                    // Continue with remaining tables
                    BuildJoinTree(nextTable, tablesToJoin, joins);
                }
            }
        }
        
        private string MapFilterOperator(string? operatorName)
        {
            if (string.IsNullOrEmpty(operatorName))
                return "=";
                
            switch (operatorName.ToLowerInvariant())
            {
                case "equals":
                case "is":
                case "equal":
                    return "=";
                case "not_equals":
                case "is_not":
                case "not_equal":
                    return "<>";
                case "greater_than":
                    return ">";
                case "greater_than_or_equal":
                    return ">=";
                case "less_than":
                    return "<";
                case "less_than_or_equal":
                    return "<=";
                case "contains":
                    return "LIKE";
                case "not_contains":
                    return "NOT LIKE";
                case "in":
                    return "IN";
                case "not_in":
                    return "NOT IN";
                case "between":
                    return "BETWEEN";
                case "not_between":
                    return "NOT BETWEEN";
                case "is_null":
                    return "IS NULL";
                case "is_not_null":
                    return "IS NOT NULL";
                default:
                    return "=";
            }
        }
        
        private void ApplyContextSpecificModifications(QueryStructure queryStructure, TranslationContext context)
        {
            // Apply any context-specific modifications to the query structure
            // This could include user-specific filters, custom joins, etc.
            
            // Example: Add user-specific security filter
            if (context.UserId != null)
            {
                queryStructure.Conditions.Add(new Condition
                {
                    Field = "Security.UserId",
                    Operator = "=",
                    Value = context.UserId
                });
                
                // Add the security join if needed
                if (!queryStructure.Tables.Contains("Security"))
                {
                    queryStructure.Tables.Add("Security");
                    
                    // Add appropriate join - this would depend on your data model
                    var securityJoin = _dataModel.GetSecurityJoin(context.UserId);
                    if (securityJoin != null)
                    {
                        queryStructure.Joins.Add(securityJoin);
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// Structure for building a query
    /// </summary>
    public class QueryStructure
    {
        /// <summary>
        /// Type of query to build
        /// </summary>
        public QueryType QueryType { get; set; }
        
        /// <summary>
        /// Columns to select
        /// </summary>
        public List<SelectColumn> SelectColumns { get; set; } = new List<SelectColumn>();
        
        /// <summary>
        /// Tables required for the query
        /// </summary>
        public List<string> Tables { get; set; } = new List<string>();
        
        /// <summary>
        /// Join information
        /// </summary>
        public List<JoinInfo> Joins { get; set; } = new List<JoinInfo>();
        
        /// <summary>
        /// Conditions for WHERE clause
        /// </summary>
        public List<Condition> Conditions { get; set; } = new List<Condition>();
        
        /// <summary>
        /// Fields to group by
        /// </summary>
        public List<string> GroupBy { get; set; } = new List<string>();
        
        /// <summary>
        /// Fields to order by
        /// </summary>
        public List<OrderByInfo> OrderBy { get; set; } = new List<OrderByInfo>();
        
        /// <summary>
        /// Limit the number of rows returned
        /// </summary>
        public int? Limit { get; set; }
        
        /// <summary>
        /// Whether the query has subqueries
        /// </summary>
        public bool HasSubqueries { get; set; }
        
        /// <summary>
        /// Whether the query has window functions
        /// </summary>
        public bool HasWindowFunctions { get; set; }
    }
    
    /// <summary>
    /// Types of queries that can be built
    /// </summary>
    public enum QueryType
    {
        /// <summary>
        /// Simple aggregate query (e.g., sum, count)
        /// </summary>
        Aggregate,
        
        /// <summary>
        /// Query with grouping
        /// </summary>
        GroupBy,
        
        /// <summary>
        /// Query with multiple metrics and grouping
        /// </summary>
        MultiMetricGrouped,
        
        /// <summary>
        /// Comparison query (e.g., this period vs last period)
        /// </summary>
        Comparison,
        
        /// <summary>
        /// Time series analysis
        /// </summary>
        TimeSeries,
        
        /// <summary>
        /// Cohort analysis
        /// </summary>
        Cohort
    }
    
    /// <summary>
    /// Information about a column to select
    /// </summary>
    public class SelectColumn
    {
        /// <summary>
        /// Source field or expression
        /// </summary>
        public string Source { get; set; } = string.Empty;
        
        /// <summary>
        /// Alias for the column
        /// </summary>
        public string? Alias { get; set; }
        
        /// <summary>
        /// Whether this is an aggregation
        /// </summary>
        public bool IsAggregation { get; set; }
        
        /// <summary>
        /// Type of aggregation (SUM, AVG, COUNT, etc.)
        /// </summary>
        public string? AggregationType { get; set; }
    }
    
    /// <summary>
    /// Information about a join
    /// </summary>
    public class JoinInfo
    {
        /// <summary>
        /// Table to join from
        /// </summary>
        public string FromTable { get; set; } = string.Empty;
        
        /// <summary>
        /// Table to join to
        /// </summary>
        public string ToTable { get; set; } = string.Empty;
        
        /// <summary>
        /// Column in the from table
        /// </summary>
        public string FromColumn { get; set; } = string.Empty;
        
        /// <summary>
        /// Column in the to table
        /// </summary>
        public string ToColumn { get; set; } = string.Empty;
        
        /// <summary>
        /// Type of join (INNER, LEFT, RIGHT, FULL)
        /// </summary>
        public string JoinType { get; set; } = "INNER";
    }
    
    /// <summary>
    /// Information about a condition
    /// </summary>
    public class Condition
    {
        /// <summary>
        /// Field to apply condition to
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// Operator for the condition
        /// </summary>
        public string Operator { get; set; } = "=";
        
        /// <summary>
        /// Value for the condition
        /// </summary>
        public object? Value { get; set; }
        
        /// <summary>
        /// Whether the condition is negated
        /// </summary>
        public bool IsNegated { get; set; }
    }
    
    /// <summary>
    /// Information about ordering
    /// </summary>
    public class OrderByInfo
    {
        /// <summary>
        /// Field to order by
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// Direction of ordering (ASC, DESC)
        /// </summary>
        public string Direction { get; set; } = "ASC";
        
        /// <summary>
        /// Whether this is an aggregation
        /// </summary>
        public bool IsAggregation { get; set; }
        
        /// <summary>
        /// Type of aggregation (SUM, AVG, COUNT, etc.)
        /// </summary>
        public string? AggregationType { get; set; }
    }
}
```

### QueryOptimizer.cs

```csharp
using Microsoft.Extensions.Logging;
using ProgressPlay.SemanticLayer.Models.Database;

namespace ProgressPlay.SemanticLayer.Core
{
    /// <summary>
    /// Optimizes queries for better performance
    /// </summary>
    public class QueryOptimizer
    {
        private readonly DataModel _dataModel;
        private readonly ILogger<QueryOptimizer> _logger;
        
        public QueryOptimizer(
            DataModel dataModel,
            ILogger<QueryOptimizer> logger)
        {
            _dataModel = dataModel;
            _logger = logger;
        }
        
        /// <summary>
        /// Optimizes a query structure for better performance
        /// </summary>
        public QueryStructure OptimizeQuery(QueryStructure query)
        {
            _logger.LogInformation("Optimizing query of type {QueryType}", query.QueryType);
            
            // Clone the query structure to avoid modifying the original
            var optimizedQuery = CloneQueryStructure(query);
            
            // Apply various optimizations
            OptimizeJoins(optimizedQuery);
            OptimizeConditions(optimizedQuery);
            OptimizeGroupBy(optimizedQuery);
            OptimizeOrderBy(optimizedQuery);
            OptimizeSelections(optimizedQuery);
            
            // Consider using materialized views or pre-aggregated tables
            ConsiderMaterializedViews(optimizedQuery);
            
            return optimizedQuery;
        }
        
        private QueryStructure CloneQueryStructure(QueryStructure original)
        {
            // Deep clone the query structure
            return new QueryStructure
            {
                QueryType = original.QueryType,
                SelectColumns = original.SelectColumns.Select(c => new SelectColumn
                {
                    Source = c.Source,
                    Alias = c.Alias,
                    IsAggregation = c.IsAggregation,
                    AggregationType = c.AggregationType
                }).ToList(),
                Tables = original.Tables.ToList(),
                Joins = original.Joins.Select(j => new JoinInfo
                {
                    FromTable = j.FromTable,
                    ToTable = j.ToTable,
                    FromColumn = j.FromColumn,
                    ToColumn = j.ToColumn,
                    JoinType = j.JoinType
                }).ToList(),
                Conditions = original.Conditions.Select(c => new Condition
                {
                    Field = c.Field,
                    Operator = c.Operator,
                    Value = c.Value,
                    IsNegated = c.IsNegated
                }).ToList(),
                GroupBy = original.GroupBy.ToList(),
                OrderBy = original.OrderBy.Select(o => new OrderByInfo
                {
                    Field = o.Field,
                    Direction = o.Direction,
                    IsAggregation = o.IsAggregation,
                    AggregationType = o.AggregationType
                }).ToList(),
                Limit = original.Limit,
                HasSubqueries = original.HasSubqueries,
                HasWindowFunctions = original.HasWindowFunctions
            };
        }
        
        private void OptimizeJoins(QueryStructure query)
        {
            // Remove unnecessary tables and joins
            var referencedTables = new HashSet<string>();
            
            // Collect tables referenced in select columns
            foreach (var column in query.SelectColumns)
            {
                var tableName = GetTableFromField(column.Source);
                if (!string.IsNullOrEmpty(tableName))
                {
                    referencedTables.Add(tableName);
                }
            }
            
            // Collect tables referenced in conditions
            foreach (var condition in query.Conditions)
            {
                var tableName = GetTableFromField(condition.Field);
                if (!string.IsNullOrEmpty(tableName))
                {
                    referencedTables.Add(tableName);
                }
            }
            
            // Collect tables referenced in group by
            foreach (var field in query.GroupBy)
            {
                var tableName = GetTableFromField(field);
                if (!string.IsNullOrEmpty(tableName))
                {
                    referencedTables.Add(tableName);
                }
            }
            
            // Collect tables referenced in order by
            foreach (var orderBy in query.OrderBy)
            {
                var tableName = GetTableFromField(orderBy.Field);
                if (!string.IsNullOrEmpty(tableName))
                {
                    referencedTables.Add(tableName);
                }
            }
            
            // Find all tables required to join the referenced tables
            var requiredTables = new HashSet<string>(referencedTables);
            var requiredJoins = new List<JoinInfo>();
            
            // Build the join tree using only necessary tables
            if (referencedTables.Count > 1)
            {
                var primaryTable = FindPrimaryTable(referencedTables.ToList());
                requiredTables.Add(primaryTable);
                
                var tablesToJoin = new HashSet<string>(referencedTables);
                tablesToJoin.Remove(primaryTable);
                
                BuildOptimizedJoinTree(primaryTable, tablesToJoin, requiredJoins, requiredTables);
            }
            
            // Update the query with optimized tables and joins
            query.Tables = requiredTables.ToList();
            query.Joins = requiredJoins;
            
            // Convert INNER joins to LEFT joins where appropriate
            OptimizeJoinTypes(query);
        }
        
        private void OptimizeConditions(QueryStructure query)
        {
            // Push down conditions to appropriate joins
            // For example, if we have a condition on a dimension table,
            // we can add it to the join condition rather than the WHERE clause
            
            var conditionsToKeep = new List<Condition>();
            
            foreach (var condition in query.Conditions)
            {
                var tableName = GetTableFromField(condition.Field);
                
                // If the condition is on a dimension table and it's an equi-join condition,
                // we might be able to push it down to the join
                var join = query.Joins.FirstOrDefault(j => 
                    j.ToTable.Equals(tableName, StringComparison.OrdinalIgnoreCase) &&
                    condition.Operator == "=");
                
                if (join != null && _dataModel.IsDimensionTable(tableName))
                {
                    // This would require adding support for join conditions
                    // For now, we'll keep it in the WHERE clause
                    conditionsToKeep.Add(condition);
                }
                else
                {
                    conditionsToKeep.Add(condition);
                }
            }
            
            query.Conditions = conditionsToKeep;
        }
        
        private void OptimizeGroupBy(QueryStructure query)
        {
            // Remove unnecessary group by columns
            // For example, if we're grouping by a foreign key and its primary key,
            // we can remove the foreign key from the group by
            
            var necessaryGroupBy = new HashSet<string>();
            
            foreach (var groupByField in query.GroupBy)
            {
                bool isRedundant = false;
                
                foreach (var otherField in query.GroupBy)
                {
                    if (groupByField != otherField && IsRedundantGroupBy(groupByField, otherField))
                    {
                        isRedundant = true;
                        break;
                    }
                }
                
                if (!isRedundant)
                {
                    necessaryGroupBy.Add(groupByField);
                }
            }
            
            query.GroupBy = necessaryGroupBy.ToList();
        }
        
        private void OptimizeOrderBy(QueryStructure query)
        {
            // Optimize order by to leverage indexes
            // For example, if we're ordering by a column that's also in the group by,
            // we might be able to use an index for both operations
            
            if (query.OrderBy.Count == 0)
                return;
                
            // Check if we can leverage existing indexes
            foreach (var orderBy in query.OrderBy)
            {
                var tableName = GetTableFromField(orderBy.Field);
                var columnName = GetColumnFromField(orderBy.Field);
                
                if (!string.IsNullOrEmpty(tableName) && !string.IsNullOrEmpty(columnName))
                {
                    var table = _dataModel.GetTable(tableName);
                    
                    if (table != null)
                    {
                        var indexes = table.Indexes.Where(i => i.Columns.Contains(columnName)).ToList();
                        
                        if (indexes.Count > 0)
                        {
                            // We found an index that includes this column
                            // We might want to reorder our ORDER BY to leverage this index better
                            // For now, we'll just log this information
                            _logger.LogInformation("Found index for ORDER BY column {Field}: {Indexes}", 
                                orderBy.Field, string.Join(", ", indexes.Select(i => i.Name)));
                        }
                    }
                }
            }
        }
        
        private void OptimizeSelections(QueryStructure query)
        {
            // Remove unnecessary columns from select
            // For example, if we're selecting a column that's not being grouped by or aggregated,
            // and it's not in the ORDER BY, we might want to remove it
            
            var necessarySelections = new List<SelectColumn>();
            
            foreach (var column in query.SelectColumns)
            {
                // Keep all aggregated columns
                if (column.IsAggregation)
                {
                    necessarySelections.Add(column);
                    continue;
                }
                
                // Keep columns that are in the GROUP BY
                if (query.GroupBy.Contains(column.Source))
                {
                    necessarySelections.Add(column);
                    continue;
                }
                
                // Keep columns that are in the ORDER BY
                if (query.OrderBy.Any(o => o.Field == column.Source))
                {
                    necessarySelections.Add(column);
                    continue;
                }
                
                // For other columns, ensure they're needed
                // For now, we'll keep all columns to maintain the expected output
                necessarySelections.Add(column);
            }
            
            query.SelectColumns = necessarySelections;
        }
        
        private void ConsiderMaterializedViews(QueryStructure query)
        {
            // Check if we can use a materialized view or pre-aggregated table
            // This would be a more complex operation in a real implementation
            
            if (query.QueryType == QueryType.GroupBy || query.QueryType == QueryType.MultiMetricGrouped)
            {
                var tablesToCheck = query.Tables.ToList();
                
                foreach (var tableName in tablesToCheck)
                {
                    var materializedViews = _dataModel.GetMaterializedViewsForTable(tableName);
                    
                    foreach (var view in materializedViews)
                    {
                        if (CanUseMaterializedView(query, view))
                        {
                            // Replace the tables and joins with the materialized view
                            ReplaceWithMaterializedView(query, view);
                            break;
                        }
                    }
                }
            }
        }
        
        private void OptimizeJoinTypes(QueryStructure query)
        {
            // Convert INNER joins to LEFT joins where appropriate
            // This can be useful when we want to include all rows from the fact table
            // even if there are no matching rows in dimension tables
            
            for (int i = 0; i < query.Joins.Count; i++)
            {
                var join = query.Joins[i];
                
                // If this is a join to a dimension table and we're not filtering on it,
                // we might want to convert it to a LEFT join
                if (_dataModel.IsDimensionTable(join.ToTable) && join.JoinType == "INNER")
                {
                    bool hasFilter = query.Conditions.Any(c => 
                        c.Field.StartsWith(join.ToTable + ".", StringComparison.OrdinalIgnoreCase));
                        
                    if (!hasFilter)
                    {
                        // If we're not filtering on this dimension, we can use LEFT JOIN
                        query.Joins[i] = new JoinInfo
                        {
                            FromTable = join.FromTable,
                            ToTable = join.ToTable,
                            FromColumn = join.FromColumn,
                            ToColumn = join.ToColumn,
                            JoinType = "LEFT"
                        };
                    }
                }
            }
        }
        
        private string GetTableFromField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;
                
            var parts = field.Split('.');
            return parts.Length > 1 ? parts[0] : string.Empty;
        }
        
        private string GetColumnFromField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;
                
            var parts = field.Split('.');
            return parts.Length > 1 ? parts[1] : field;
        }
        
        private string FindPrimaryTable(List<string> tables)
        {
            // Find the fact table (usually has the most foreign keys/relationships)
            var factTables = _dataModel.GetFactTables();
            
            foreach (var factTable in factTables)
            {
                if (tables.Contains(factTable))
                {
                    return factTable;
                }
            }
            
            // Default to first table if no fact table is found
            return tables.First();
        }
        
        private void BuildOptimizedJoinTree(string baseTable, HashSet<string> tablesToJoin, List<JoinInfo> joins, HashSet<string> requiredTables)
        {
            if (tablesToJoin.Count == 0)
                return;
                
            var directlyJoinableTables = new HashSet<string>();
            
            // Find tables that can be directly joined to the base table
            foreach (var table in tablesToJoin)
            {
                var relationship = _dataModel.GetRelationship(baseTable, table);
                
                if (relationship != null)
                {
                    joins.Add(new JoinInfo
                    {
                        FromTable = baseTable,
                        ToTable = table,
                        FromColumn = relationship.FromColumn,
                        ToColumn = relationship.ToColumn,
                        JoinType = "INNER"
                    });
                    
                    directlyJoinableTables.Add(table);
                }
            }
            
            // Remove joined tables
            foreach (var table in directlyJoinableTables)
            {
                tablesToJoin.Remove(table);
            }
            
            // If there are still tables to join, use the first joined table as the new base
            if (tablesToJoin.Count > 0 && directlyJoinableTables.Count > 0)
            {
                BuildOptimizedJoinTree(directlyJoinableTables.First(), tablesToJoin, joins, requiredTables);
            }
            // If we can't join any more tables but have tables left, we need to find indirect paths
            else if (tablesToJoin.Count > 0)
            {
                var nextTable = tablesToJoin.First();
                var path = _dataModel.FindJoinPath(baseTable, nextTable);
                
                if (path != null)
                {
                    for (int i = 0; i < path.Count - 1; i++)
                    {
                        var fromTable = path[i];
                        var toTable = path[i + 1];
                        
                        // Add intermediate tables to requiredTables
                        requiredTables.Add(fromTable);
                        requiredTables.Add(toTable);
                        
                        var relationship = _dataModel.GetRelationship(fromTable, toTable);
                        
                        if (relationship != null)
                        {
                            joins.Add(new JoinInfo
                            {
                                FromTable = fromTable,
                                ToTable = toTable,
                                FromColumn = relationship.FromColumn,
                                ToColumn = relationship.ToColumn,
                                JoinType = "INNER"
                            });
                            
                            if (tablesToJoin.Contains(toTable))
                            {
                                tablesToJoin.Remove(toTable);
                            }
                        }
                    }
                    
                    // Continue with remaining tables
                    BuildOptimizedJoinTree(nextTable, tablesToJoin, joins, requiredTables);
                }
            }
        }
        
        private bool IsRedundantGroupBy(string field1, string field2)
        {
            // Check if one group by field is redundant with another
            // For example, if field1 is a foreign key to field2
            
            var table1 = GetTableFromField(field1);
            var column1 = GetColumnFromField(field1);
            
            var table2 = GetTableFromField(field2);
            var column2 = GetColumnFromField(field2);
            
            if (string.IsNullOrEmpty(table1) || string.IsNullOrEmpty(column1) || 
                string.IsNullOrEmpty(table2) || string.IsNullOrEmpty(column2))
            {
                return false;
            }
            
            // Check if there's a relationship where one is a foreign key to the other
            var relationship = _dataModel.GetRelationship(table1, table2);
            
            if (relationship != null)
            {
                // If field1 is a foreign key pointing to field2
                if (relationship.FromColumn == column1 && relationship.ToColumn == column2)
                {
                    return true;
                }
            }
            
            return false;
        }
        
        private bool CanUseMaterializedView(QueryStructure query, View view)
        {
            // Check if the materialized view can be used for this query
            // This would involve checking if all required columns, filters, etc. are available
            // For simplicity, we'll just return false for now
            
            return false;
        }
        
        private void ReplaceWithMaterializedView(QueryStructure query, View view)
        {
            // Replace the tables and joins with the materialized view
            // This would involve updating the query to use the view instead
            // For simplicity, we'll just log this operation for now
            
            _logger.LogInformation("Using materialized view {ViewName} for query", view.Name);
        }
    }
}
```

## Gaming-Specific Implementation

### GamingMetrics.cs

```csharp
using ProgressPlay.SemanticLayer.Models.Entities;
using System.Collections.Generic;

namespace ProgressPlay.SemanticLayer.Gaming
{
    /// <summary>
    /// Defines all gaming-specific metrics for analytics
    /// </summary>
    public static class GamingMetrics
    {
        /// <summary>
        /// Gets all gaming metrics with their definitions
        /// </summary>
        public static Dictionary<string, MetricDefinition> GetAllMetrics()
        {
            return new Dictionary<string, MetricDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                // Financial Metrics
                ["revenue"] = new MetricDefinition 
                { 
                    Name = "Revenue", 
                    DatabaseField = "Transactions.Amount", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Total monetary value of transactions",
                    Format = "currency",
                    Synonyms = new[] { "earnings", "income", "money", "sales" }
                },
                
                ["ggr"] = new MetricDefinition 
                { 
                    Name = "GGR", 
                    DatabaseField = "Games.GrossGamingRevenue", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Gross Gaming Revenue (bets minus wins)",
                    Format = "currency",
                    Synonyms = new[] { "gross gaming revenue", "gross revenue", "gaming revenue" }
                },
                
                ["ngr"] = new MetricDefinition 
                { 
                    Name = "NGR", 
                    DatabaseField = "Games.NetGamingRevenue", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Net Gaming Revenue (GGR minus bonuses)",
                    Format = "currency",
                    Synonyms = new[] { "net gaming revenue", "net revenue" }
                },
                
                ["deposits"] = new MetricDefinition 
                { 
                    Name = "Deposits", 
                    DatabaseField = "Payments.DepositAmount", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Total amount deposited by players",
                    Format = "currency",
                    Synonyms = new[] { "deposit amount", "money in", "funds added" }
                },
                
                ["withdrawals"] = new MetricDefinition 
                { 
                    Name = "Withdrawals", 
                    DatabaseField = "Payments.WithdrawalAmount", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Total amount withdrawn by players",
                    Format = "currency",
                    Synonyms = new[] { "withdrawal amount", "money out", "cashouts" }
                },
                
                ["bonus_cost"] = new MetricDefinition 
                { 
                    Name = "Bonus Cost", 
                    DatabaseField = "Bonuses.Amount", 
                    DefaultAggregation = "sum",
                    Category = "Financial",
                    Description = "Total cost of bonuses awarded",
                    Format = "currency",
                    Synonyms = new[] { "bonus amount", "promotion cost", "bonus expense" }
                },
                
                // Player Metrics
                ["registrations"] = new MetricDefinition 
                { 
                    Name = "Registrations", 
                    DatabaseField = "Players.RegistrationDate", 
                    DefaultAggregation = "count",
                    Category = "Player",
                    Description = "Number of new player registrations",
                    Format = "number",
                    Synonyms = new[] { "signups", "new players", "new users", "new accounts" }
                },
                
                ["active_players"] = new MetricDefinition 
                { 
                    Name = "Active Players", 
                    DatabaseField = "Players.PlayerId", 
                    DefaultAggregation = "count_distinct",
                    Category = "Player",
                    Description = "Number of unique players with activity",
                    Format = "number",
                    Synonyms = new[] { "active users", "actives", "unique players", "unique users" }
                },
                
                ["first_time_depositors"] = new MetricDefinition 
                { 
                    Name = "First Time Depositors", 
                    DatabaseField = "Payments.IsFirstDeposit", 
                    DefaultAggregation = "count",
                    Category = "Player",
                    Description = "Number of players making their first deposit",
                    Format = "number",
                    Synonyms = new[] { "ftd", "new depositors", "first deposits" }
                },
                
                ["returning_players"] = new MetricDefinition 
                { 
                    Name = "Returning Players", 
                    DatabaseField = "Players.IsReturning", 
                    DefaultAggregation = "count",
                    Category = "Player",
                    Description = "Number of players returning after inactivity",
                    Format = "number",
                    Synonyms = new[] { "returning users", "reactivated accounts" }
                },
                
                ["churn_rate"] = new MetricDefinition 
                { 
                    Name = "Churn Rate", 
                    DatabaseField = "Players.ChurnRate", 
                    DefaultAggregation = "avg",
                    Category = "Player",
                    Description = "Percentage of players who stopped activity",
                    Format = "percentage",
                    Synonyms = new[] { "attrition rate", "player loss rate" }
                },
                
                // Game Metrics
                ["rounds_played"] = new MetricDefinition 
                { 
                    Name = "Rounds Played", 
                    DatabaseField = "GameActivity.RoundId", 
                    DefaultAggregation = "count",
                    Category = "Game",
                    Description = "Number of game rounds played",
                    Format = "number",
                    Synonyms = new[] { "game rounds", "spins", "hands played", "bets placed" }
                },
                
                ["average_bet"] = new MetricDefinition 
                { 
                    Name = "Average Bet", 
                    DatabaseField = "GameActivity.BetAmount", 
                    DefaultAggregation = "avg",
                    Category = "Game",
                    Description = "Average bet amount per round",
                    Format = "currency",
                    Synonyms = new[] { "avg bet", "mean bet", "bet average" }
                },
                
                ["rtp"] = new MetricDefinition 
                { 
                    Name = "RTP", 
                    DatabaseField = "Games.ReturnToPlayer", 
                    DefaultAggregation = "avg",
                    Category = "Game",
                    Description = "Return to Player percentage",
                    Format = "percentage",
                    Synonyms = new[] { "return to player", "payback percentage", "payout percentage" }
                },
                
                ["wagering"] = new MetricDefinition 
                { 
                    Name = "Wagering", 
                    DatabaseField = "GameActivity.BetAmount", 
                    DefaultAggregation = "sum",
                    Category = "Game",
                    Description = "Total amount wagered in bets",
                    Format = "currency",
                    Synonyms = new[] { "total bets", "wagers", "bet amount", "turnover" }
                },
                
                ["unique_game_players"] = new MetricDefinition 
                { 
                    Name = "Unique Game Players", 
                    DatabaseField = "GameActivity.PlayerId", 
                    DefaultAggregation = "count_distinct",
                    Category = "Game",
                    Description = "Number of unique players per game",
                    Format = "number",
                    Synonyms = new[] { "game uniques", "distinct game players" }
                },
                
                // Performance Metrics
                ["arpu"] = new MetricDefinition 
                { 
                    Name = "ARPU", 
                    DatabaseField = "Players.ARPU", 
                    DefaultAggregation = "avg",
                    Category = "Performance",
                    Description = "Average Revenue Per User",
                    Format = "currency",
                    Synonyms = new[] { "average revenue per user", "revenue per player" }
                },
                
                ["conversion_rate"] = new MetricDefinition 
                { 
                    Name = "Conversion Rate", 
                    DatabaseField = "Players.ConversionRate", 
                    DefaultAggregation = "avg",
                    Category = "Performance",
                    Description = "Percentage of registrations converting to deposits",
                    Format = "percentage",
                    Synonyms = new[] { "reg to dep", "registration to deposit", "deposit conversion" }
                },
                
                ["session_duration"] = new MetricDefinition 
                { 
                    Name = "Session Duration", 
                    DatabaseField = "Sessions.Duration", 
                    DefaultAggregation = "avg",
                    Category = "Performance",
                    Description = "Average length of player sessions",
                    Format = "time",
                    Synonyms = new[] { "play time", "average session length", "time on site" }
                },
                
                ["retention_rate"] = new MetricDefinition 
                { 
                    Name = "Retention Rate", 
                    DatabaseField = "Players.RetentionRate", 
                    DefaultAggregation = "avg",
                    Category = "Performance",
                    Description = "Percentage of players returning in a period",
                    Format = "percentage",
                    Synonyms = new[] { "player retention", "return rate" }
                },
                
                // Compliance Metrics
                ["responsible_gaming_alerts"] = new MetricDefinition 
                { 
                    Name = "Responsible Gaming Alerts", 
                    DatabaseField = "Compliance.AlertCount", 
                    DefaultAggregation = "sum",
                    Category = "Compliance",
                    Description = "Number of responsible gaming alerts triggered",
                    Format = "number",
                    Synonyms = new[] { "rg alerts", "compliance alerts", "responsible gambling flags" }
                },
                
                ["self_exclusions"] = new MetricDefinition 
                { 
                    Name = "Self Exclusions", 
                    DatabaseField = "Compliance.SelfExclusionCount", 
                    DefaultAggregation = "sum",
                    Category = "Compliance",
                    Description = "Number of self exclusions activated",
                    Format = "number",
                    Synonyms = new[] { "player self exclusions", "gambling blocks" }
                },
                
                ["deposit_limits"] = new MetricDefinition 
                { 
                    Name = "Deposit Limits", 
                    DatabaseField = "Compliance.DepositLimitCount", 
                    DefaultAggregation = "sum",
                    Category = "Compliance",
                    Description = "Number of deposit limits set",
                    Format = "number",
                    Synonyms = new[] { "player deposit limits", "spending limits" }
                }
            };
        }
    }
}
```

### GamingDimensions.cs

```csharp
using ProgressPlay.SemanticLayer.Models.Entities;
using System.Collections.Generic;

namespace ProgressPlay.SemanticLayer.Gaming
{
    /// <summary>
    /// Defines all gaming-specific dimensions for analytics
    /// </summary>
    public static class GamingDimensions
    {
        /// <summary>
        /// Gets all gaming dimensions with their definitions
        /// </summary>
        public static Dictionary<string, DimensionDefinition> GetAllDimensions()
        {
            return new Dictionary<string, DimensionDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                // Game Dimensions
                ["game"] = new DimensionDefinition 
                { 
                    Name = "Game", 
                    DatabaseField = "Games.GameName",
                    Category = "Game",
                    Description = "Name of the game",
                    IsPrimary = true,
                    Synonyms = new[] { "game name", "game title", "slot", "slot name" }
                },
                
                ["game_type"] = new DimensionDefinition 
                { 
                    Name = "Game Type", 
                    DatabaseField = "Games.GameType",
                    Category = "Game",
                    Description = "Type or category of game",
                    Synonyms = new[] { "game category", "type of game", "genre" }
                },
                
                ["provider"] = new DimensionDefinition 
                { 
                    Name = "Provider", 
                    DatabaseField = "Games.ProviderName",
                    Category = "Game",
                    Description = "Game provider or supplier",
                    Synonyms = new[] { "game provider", "vendor", "supplier", "studio" }
                },
                
                ["release_date"] = new DimensionDefinition 
                { 
                    Name = "Release Date", 
                    DatabaseField = "Games.ReleaseDate",
                    Category = "Game",
                    Description = "Date when the game was released",
                    IsDate = true,
                    Synonyms = new[] { "game release date", "launch date" }
                },
                
                // Player Dimensions
                ["country"] = new DimensionDefinition 
                { 
                    Name = "Country", 
                    DatabaseField = "Players.Country",
                    Category = "Player",
                    Description = "Player's country",
                    IsPrimary = true,
                    Synonyms = new[] { "player country", "location", "region", "geo" }
                },
                
                ["age_group"] = new DimensionDefinition 
                { 
                    Name = "Age Group", 
                    DatabaseField = "Players.AgeGroup",
                    Category = "Player",
                    Description = "Player's age group",
                    Synonyms = new[] { "age bracket", "age range", "age" }
                },
                
                ["player_segment"] = new DimensionDefinition 
                { 
                    Name = "Player Segment", 
                    DatabaseField = "Players.Segment",
                    Category = "Player",
                    Description = "Player segment or classification",
                    Synonyms = new[] { "segment", "player type", "player category", "player classification" }
                },
                
                ["registration_date"] = new DimensionDefinition 
                { 
                    Name = "Registration Date", 
                    DatabaseField = "Players.RegistrationDate",
                    Category = "Player",
                    Description = "Date when the player registered",
                    IsDate = true,
                    Synonyms = new[] { "signup date", "join date", "registration" }
                },
                
                ["acquisition_source"] = new DimensionDefinition 
                { 
                    Name = "Acquisition Source", 
                    DatabaseField = "Players.AcquisitionSource",
                    Category = "Player",
                    Description = "Source of player acquisition",
                    Synonyms = new[] { "traffic source", "acquisition channel", "source" }
                },
                
                // Business Dimensions
                ["white_label"] = new DimensionDefinition 
                { 
                    Name = "White Label", 
                    DatabaseField = "WhiteLabels.Name",
                    Category = "Business",
                    Description = "White label or brand name",
                    IsPrimary = true,
                    Synonyms = new[] { "brand", "site", "casino brand", "skin" }
                },
                
                ["partner"] = new DimensionDefinition 
                { 
                    Name = "Partner", 
                    DatabaseField = "Partners.Name",
                    Category = "Business",
                    Description = "Partner or operator name",
                    IsPrimary = true,
                    Synonyms = new[] { "operator", "client", "b2b client" }
                },
                
                ["currency"] = new DimensionDefinition 
                { 
                    Name = "Currency", 
                    DatabaseField = "Transactions.Currency",
                    Category = "Business",
                    Description = "Transaction currency",
                    Synonyms = new[] { "money currency", "transaction currency" }
                },
                
                // Technical Dimensions
                ["device"] = new DimensionDefinition 
                { 
                    Name = "Device", 
                    DatabaseField = "Sessions.DeviceType",
                    Category = "Technical",
                    Description = "Type of device used",
                    Synonyms = new[] { "device type", "platform", "mobile/desktop" }
                },
                
                ["browser"] = new DimensionDefinition 
                { 
                    Name = "Browser", 
                    DatabaseField = "Sessions.Browser",
                    Category = "Technical",
                    Description = "Browser used by player",
                    Synonyms = new[] { "web browser", "browser type" }
                },
                
                ["operating_system"] = new DimensionDefinition 
                { 
                    Name = "Operating System", 
                    DatabaseField = "Sessions.OS",
                    Category = "Technical",
                    Description = "Operating system used by player",
                    Synonyms = new[] { "os", "platform" }
                },
                
                // Time Dimensions
                ["date"] = new DimensionDefinition 
                { 
                    Name = "Date", 
                    DatabaseField = "Calendar.Date",
                    Category = "Time",
                    Description = "Calendar date",
                    IsDate = true,
                    IsPrimary = true,
                    Synonyms = new[] { "day", "calendar date" }
                },
                
                ["month"] = new DimensionDefinition 
                { 
                    Name = "Month", 
                    DatabaseField = "Calendar.Month",
                    Category = "Time",
                    Description = "Calendar month",
                    IsDate = true,
                    Synonyms = new[] { "calendar month" }
                },
                
                ["quarter"] = new DimensionDefinition 
                { 
                    Name = "Quarter", 
                    DatabaseField = "Calendar.Quarter",
                    Category = "Time",
                    Description = "Calendar quarter",
                    IsDate = true,
                    Synonyms = new[] { "calendar quarter", "q1", "q2", "q3", "q4" }
                },
                
                ["year"] = new DimensionDefinition 
                { 
                    Name = "Year", 
                    DatabaseField = "Calendar.Year",
                    Category = "Time",
                    Description = "Calendar year",
                    IsDate = true,
                    Synonyms = new[] { "calendar year" }
                },
                
                ["day_of_week"] = new DimensionDefinition 
                { 
                    Name = "Day of Week", 
                    DatabaseField = "Calendar.DayOfWeek",
                    Category = "Time",
                    Description = "Day of the week",
                    Synonyms = new[] { "weekday", "day" }
                },
                
                ["hour_of_day"] = new DimensionDefinition 
                { 
                    Name = "Hour of Day", 
                    DatabaseField = "Calendar.Hour",
                    Category = "Time",
                    Description = "Hour of the day",
                    Synonyms = new[] { "hour", "time of day" }
                },
                
                // Transaction Dimensions
                ["payment_method"] = new DimensionDefinition 
                { 
                    Name = "Payment Method", 
                    DatabaseField = "Payments.MethodName",
                    Category = "Transaction",
                    Description = "Method used for payment",
                    Synonyms = new[] { "payment type", "deposit method", "payment provider" }
                },
                
                ["transaction_type"] = new DimensionDefinition 
                { 
                    Name = "Transaction Type", 
                    DatabaseField = "Transactions.Type",
                    Category = "Transaction",
                    Description = "Type of transaction",
                    Synonyms = new[] { "transaction category", "payment type" }
                },
                
                ["transaction_status"] = new DimensionDefinition 
                { 
                    Name = "Transaction Status", 
                    DatabaseField = "Transactions.Status",
                    Category = "Transaction",
                    Description = "Status of transaction",
                    Synonyms = new[] { "payment status", "transaction state" }
                },
                
                // Marketing Dimensions
                ["campaign"] = new DimensionDefinition 
                { 
                    Name = "Campaign", 
                    DatabaseField = "Marketing.CampaignName",
                    Category = "Marketing",
                    Description = "Marketing campaign name",
                    Synonyms = new[] { "marketing campaign", "promotion", "offer" }
                },
                
                ["promo_code"] = new DimensionDefinition 
                { 
                    Name = "Promo Code", 
                    DatabaseField = "Marketing.PromoCode",
                    Category = "Marketing",
                    Description = "Promotional code used",
                    Synonyms = new[] { "coupon code", "bonus code", "promotional code" }
                },
                
                ["affiliate"] = new DimensionDefinition 
                { 
                    Name = "Affiliate", 
                    DatabaseField = "Marketing.AffiliateName",
                    Category = "Marketing",
                    Description = "Affiliate name or ID",
                    Synonyms = new[] { "referrer", "referring site", "affiliate partner" }
                }
            };
        }
    }
}
```

### GamingEntityMapper.cs

```csharp
using Microsoft.Extensions.Logging;
using ProgressPlay.SemanticLayer.Models.Entities;
using ProgressPlay.SemanticLayer.Models.Translation;
using ProgressPlay.SemanticLayer.Services;
using System.Collections.Generic;
using System.Linq;

namespace ProgressPlay.SemanticLayer.Gaming
{
    /// <summary>
    /// Maps query entities to gaming-specific database fields
    /// </summary>
    public class GamingEntityMapper
    {
        private readonly MetricMappingService _metricMappingService;
        private readonly DimensionMappingService _dimensionMappingService;
        private readonly TimeResolutionService _timeResolutionService;
        private readonly ILogger<GamingEntityMapper> _logger;
        
        public GamingEntityMapper(
            MetricMappingService metricMappingService,
            DimensionMappingService dimensionMappingService,
            TimeResolutionService timeResolutionService,
            ILogger<GamingEntityMapper> logger)
        {
            _metricMappingService = metricMappingService;
            _dimensionMappingService = dimensionMappingService;
            _timeResolutionService = timeResolutionService;
            _logger = logger;
        }
        
        /// <summary>
        /// Maps raw query entities to data model-specific entities
        /// </summary>
        public MappedQueryEntities MapToDataModel(QueryEntities entities)
        {
            _logger.LogInformation("Mapping query entities to data model");
            
            var mappedEntities = new MappedQueryEntities
            {
                // Map metrics
                Metrics = MapMetrics(entities.Metrics),
                
                // Map dimensions
                Dimensions = MapDimensions(entities.Dimensions),
                
                // Map time range
                TimeRange = entities.TimeRange != null 
                    ? _timeResolutionService.NormalizeTimeRange(entities.TimeRange) 
                    : null,
                
                // Map filters
                Filters = MapFilters(entities.Filters),
                
                // Map sorting
                SortBy = entities.SortBy,
                
                // Map limit
                Limit = entities.Limit,
                
                // Map comparisons
                Comparisons = entities.Comparisons
            };
            
            // Add implicit time dimension if needed
            AddImplicitTimeDimension(mappedEntities);
            
            // Handle calculated metrics
            HandleCalculatedMetrics(mappedEntities);
            
            // Ensure metrics have aggregations
            EnsureMetricAggregations(mappedEntities);
            
            return mappedEntities;
        }
        
        private List<MappedMetric> MapMetrics(List<Metric>? rawMetrics)
        {
            if (rawMetrics == null || !rawMetrics.Any())
                return new List<MappedMetric>();
                
            var mappedMetrics = new List<MappedMetric>();
            
            foreach (var metric in rawMetrics)
            {
                var mappedMetric = _metricMappingService.MapMetric(metric.Name);
                
                if (mappedMetric != null)
                {
                    // Preserve the original aggregation if specified
                    if (!string.IsNullOrEmpty(metric.Aggregation))
                    {
                        mappedMetric.Aggregation = metric.Aggregation;
                    }
                    
                    mappedMetrics.Add(mappedMetric);
                }
                else
                {
                    _logger.LogWarning("Unable to map metric: {MetricName}", metric.Name);
                }
            }
            
            return mappedMetrics;
        }
        
        private List<MappedDimension> MapDimensions(List<string>? rawDimensions)
        {
            if (rawDimensions == null || !rawDimensions.Any())
                return new List<MappedDimension>();
                
            var mappedDimensions = new List<MappedDimension>();
            
            foreach (var dimension in rawDimensions)
            {
                var mappedDimension = _dimensionMappingService.MapDimension(dimension);
                
                if (mappedDimension != null)
                {
                    mappedDimensions.Add(mappedDimension);
                }
                else
                {
                    _logger.LogWarning("Unable to map dimension: {DimensionName}", dimension);
                }
            }
            
            return mappedDimensions;
        }
        
        private List<MappedFilter> MapFilters(List<Filter>? rawFilters)
        {
            if (rawFilters == null || !rawFilters.Any())
                return new List<MappedFilter>();
                
            var mappedFilters = new List<MappedFilter>();
            
            foreach (var filter in rawFilters)
            {
                // Try to map to a dimension
                var dimension = _dimensionMappingService.MapDimension(filter.Dimension);
                
                if (dimension != null)
                {
                    // Format the value appropriately based on the dimension type
                    object formattedValue = FormatFilterValue(filter.Value, dimension);
                    
                    mappedFilters.Add(new MappedFilter
                    {
                        DatabaseField = dimension.DatabaseField,
                        Operator = filter.Operator,
                        Value = formattedValue,
                        IsNegated = filter.IsNegated
                    });
                }
                else
                {
                    _logger.LogWarning("Unable to map filter dimension: {DimensionName}", filter.Dimension);
                }
            }
            
            return mappedFilters;
        }
        
        private object FormatFilterValue(object? value, MappedDimension dimension)
        {
            if (value == null)
                return DBNull.Value;
                
            // Format the value based on the dimension type
            if (dimension.IsDate && value is string strValue)
            {
                // Try to parse as date
                if (DateTime.TryParse(strValue, out var dateValue))
                {
                    return dateValue.ToString("yyyy-MM-dd");
                }
            }
            
            // For LIKE queries, ensure the value has wildcards if needed
            if (dimension.DatabaseField.EndsWith("Name", StringComparison.OrdinalIgnoreCase) && 
                value is string textValue)
            {
                // If it doesn't already have wildcards, add them
                if (!textValue.Contains("%"))
                {
                    return $"%{textValue}%";
                }
            }
            
            return value;
        }
        
        private void AddImplicitTimeDimension(MappedQueryEntities entities)
        {
            // If we have a time range but no time dimension, add an appropriate one
            if (entities.TimeRange != null && 
                !entities.Dimensions.Any(d => d.Category == "Time"))
            {
                // Determine the appropriate time dimension based on the time range
                MappedDimension? timeDimension = null;
                
                if (entities.TimeRange.Period == "daily")
                {
                    timeDimension = _dimensionMappingService.MapDimension("date");
                }
                else if (entities.TimeRange.Period == "weekly")
                {
                    timeDimension = _dimensionMappingService.MapDimension("week");
                }
                else if (entities.TimeRange.Period == "monthly")
                {
                    timeDimension = _dimensionMappingService.MapDimension("month");
                }
                else if (entities.TimeRange.Period == "quarterly")
                {
                    timeDimension = _dimensionMappingService.MapDimension("quarter");
                }
                else if (entities.TimeRange.Period == "yearly")
                {
                    timeDimension = _dimensionMappingService.MapDimension("year");
                }
                
                // Add the time dimension if we found an appropriate one
                if (timeDimension != null)
                {
                    entities.Dimensions.Add(timeDimension);
                }
            }
        }
        
        private void HandleCalculatedMetrics(MappedQueryEntities entities)
        {
            // Identify and handle calculated metrics
            for (int i = 0; i < entities.Metrics.Count; i++)
            {
                var metric = entities.Metrics[i];
                
                // Check if this is a calculated metric
                if (metric.IsCalculated)
                {
                    _logger.LogInformation("Handling calculated metric: {MetricName}", metric.Name);
                    
                    // For now, we'll just replace it with its components
                    // In a real implementation, this would be more sophisticated
                    
                    if (metric.Name.Equals("conversion_rate", StringComparison.OrdinalIgnoreCase))
                    {
                        // Add the component metrics
                        var depositors = _metricMappingService.MapMetric("first_time_depositors");
                        var registrations = _metricMappingService.MapMetric("registrations");
                        
                        if (depositors != null && registrations != null)
                        {
                            // Replace the calculated metric with its components
                            entities.Metrics[i] = depositors;
                            entities.Metrics.Add(registrations);
                            
                            // Add a note that this is a calculated metric
                            depositors.IsPartOfCalculation = true;
                            registrations.IsPartOfCalculation = true;
                        }
                    }
                    else if (metric.Name.Equals("arpu", StringComparison.OrdinalIgnoreCase))
                    {
                        // Add the component metrics
                        var revenue = _metricMappingService.MapMetric("revenue");
                        var activePlayers = _metricMappingService.MapMetric("active_players");
                        
                        if (revenue != null && activePlayers != null)
                        {
                            // Replace the calculated metric with its components
                            entities.Metrics[i] = revenue;
                            entities.Metrics.Add(activePlayers);
                            
                            // Add a note that this is a calculated metric
                            revenue.IsPartOfCalculation = true;
                            activePlayers.IsPartOfCalculation = true;
                        }
                    }
                    // Add more calculated metrics as needed
                }
            }
        }
        
        private void EnsureMetricAggregations(MappedQueryEntities entities)
        {
            // Ensure all metrics have appropriate aggregations
            foreach (var metric in entities.Metrics)
            {
                if (string.IsNullOrEmpty(metric.Aggregation))
                {
                    // Assign default aggregation based on the metric
                    if (metric.Name.Contains("average", StringComparison.OrdinalIgnoreCase) ||
                        metric.Name.Contains("avg", StringComparison.OrdinalIgnoreCase) ||
                        metric.Name.Contains("rate", StringComparison.OrdinalIgnoreCase) ||
                        metric.Name.Contains("ratio", StringComparison.OrdinalIgnoreCase))
                    {
                        metric.Aggregation = "avg";
                    }
                    else if (metric.Name.Contains("count", StringComparison.OrdinalIgnoreCase) ||
                             metric.Name.Contains("number", StringComparison.OrdinalIgnoreCase))
                    {
                        metric.Aggregation = "count";
                    }
                    else if (metric.Name.Contains("unique", StringComparison.OrdinalIgnoreCase) ||
                             metric.Name.Contains("distinct", StringComparison.OrdinalIgnoreCase))
                    {
                        metric.Aggregation = "count_distinct";
                    }
                    else if (metric.Name.Contains("max", StringComparison.OrdinalIgnoreCase) ||
                             metric.Name.Contains("highest", StringComparison.OrdinalIgnoreCase) ||
                             metric.Name.Contains("peak", StringComparison.OrdinalIgnoreCase))
                    {
                        metric.Aggregation = "max";
                    }
                    else if (metric.Name.Contains("min", StringComparison.OrdinalIgnoreCase) ||
                             metric.Name.Contains("lowest", StringComparison.OrdinalIgnoreCase))
                    {
                        metric.Aggregation = "min";
                    }
                    else
                    {
                        // Default to sum for most metrics
                        metric.Aggregation = "sum";
                    }
                }
            }
        }
    }
}
