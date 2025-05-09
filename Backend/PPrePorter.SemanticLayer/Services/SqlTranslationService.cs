using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// Service for translating mapped entities to SQL
    /// </summary>
    public class SqlTranslationService : ISqlTranslationService
    {
        private readonly ILogger<SqlTranslationService> _logger;
        private readonly SemanticLayerConfig _config;

        public SqlTranslationService(
            ILogger<SqlTranslationService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
        }

        /// <summary>
        /// Translates mapped entities to SQL
        /// </summary>
        public async Task<SqlTranslationResult> TranslateToSqlAsync(
            MappedQueryEntities entities,
            DataModel dataModel,
            TranslationContext? context = null)
        {
            _logger.LogInformation("Translating mapped entities to SQL");

            try
            {
                var result = new SqlTranslationResult();

                // Set up translation context if not provided
                context ??= new TranslationContext
                {
                    ParameterPrefix = "@p",
                    TableAliases = new Dictionary<string, string>(),
                    ParameterCounter = 0
                };

                // Identify the main table and related tables
                var mainTable = IdentifyMainTable(entities, dataModel);
                if (mainTable == null)
                {
                    throw new InvalidOperationException("Could not identify the main table for the query");
                }

                // Generate SQL components
                var selectClause = GenerateSelectClause(entities, mainTable, context);
                var fromClause = GenerateFromClause(entities, mainTable, dataModel, context);
                var whereClause = GenerateWhereClause(entities, mainTable, dataModel, context);
                var groupByClause = GenerateGroupByClause(entities, mainTable, context);
                var orderByClause = GenerateOrderByClause(entities, mainTable, context);
                var limitClause = GenerateLimitClause(entities);

                // Build the complete SQL query
                var sqlBuilder = new StringBuilder();
                sqlBuilder.Append(selectClause);
                sqlBuilder.Append(fromClause);
                sqlBuilder.Append(whereClause);
                sqlBuilder.Append(groupByClause);
                sqlBuilder.Append(orderByClause);
                sqlBuilder.Append(limitClause);

                // Set the result properties
                result.Sql = sqlBuilder.ToString();
                result.Parameters = context.Parameters;
                result.MainTable = mainTable.Name;
                result.UsedTables.Add(mainTable.Name);
                result.UsedTables.AddRange(context.TableAliases.Keys.Where(t => t != mainTable.Name));

                // Generate comparison queries if needed
                if (entities.Comparisons != null && entities.Comparisons.Count > 0)
                {
                    result.ComparisonQueries = await GenerateComparisonQueriesAsync(
                        entities, result.Sql, result.Parameters, dataModel);
                }

                _logger.LogInformation("Successfully translated entities to SQL");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating mapped entities to SQL");
                throw;
            }
        }

        /// <summary>
        /// Applies optimizations to a SQL translation result
        /// </summary>
        public async Task<SqlTranslationResult> ApplyOptimizationsAsync(
            SqlTranslationResult result,
            DataModel dataModel)
        {
            _logger.LogInformation("Applying optimizations to SQL query");

            try
            {
                // Clone the result to avoid modifying the original
                var optimizedResult = new SqlTranslationResult
                {
                    Sql = result.Sql,
                    Parameters = new Dictionary<string, object>(result.Parameters),
                    MainTable = result.MainTable,
                    UsedTables = new List<string>(result.UsedTables),
                    ComparisonQueries = result.ComparisonQueries != null
                        ? new Dictionary<string, string>(result.ComparisonQueries)
                        : null
                };

                // Apply query hints if enabled
                if (_config.Sql.EnableQueryHints)
                {
                    optimizedResult.Sql = ApplyQueryHints(optimizedResult.Sql, dataModel);
                }

                // Apply table hints if enabled
                if (_config.Sql.EnableTableHints)
                {
                    optimizedResult.Sql = ApplyTableHints(optimizedResult.Sql, dataModel);
                }

                // Apply index hints if enabled
                if (_config.Sql.EnableIndexHints)
                {
                    optimizedResult.Sql = ApplyIndexHints(optimizedResult.Sql, dataModel);
                }

                // Rewrite query to use WITH clause for complex queries if enabled
                if (_config.Sql.EnableCteOptimization && IsComplexQuery(optimizedResult.Sql))
                {
                    optimizedResult.Sql = RewriteWithCte(optimizedResult.Sql);
                }

                _logger.LogInformation("Successfully applied optimizations to SQL query");
                return optimizedResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying optimizations to SQL query");
                return result; // Return the original result if optimization fails
            }
        }

        /// <summary>
        /// Validates a SQL query before execution
        /// </summary>
        public async Task<bool> ValidateSqlAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            _logger.LogInformation("Validating SQL query: {SqlLength} characters", sql?.Length ?? 0);

            try
            {
                // Basic validation checks
                if (string.IsNullOrEmpty(sql))
                {
                    _logger.LogWarning("SQL query is empty or null");
                    return false;
                }

                // Check for common SQL injection patterns
                if (ContainsSqlInjectionPatterns(sql))
                {
                    _logger.LogWarning("SQL query contains potential SQL injection patterns");
                    return false;
                }

                // Check for proper parameter usage
                if (parameters != null && !ValidateParameterUsage(sql, parameters))
                {
                    _logger.LogWarning("SQL query has issues with parameter usage");
                    return false;
                }

                // Additional validation could be done here, such as parsing the SQL
                // or executing an EXPLAIN without actually running the query

                _logger.LogInformation("SQL query validation succeeded");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating SQL query");
                return false;
            }
        }

        /// <summary>
        /// Explains how a SQL query will be executed
        /// </summary>
        public async Task<string> ExplainSqlAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            _logger.LogInformation("Generating SQL execution plan for query");

            try
            {
                // Basic validation
                if (string.IsNullOrEmpty(sql))
                {
                    return "Error: SQL query is empty or null";
                }

                // Replace parameters with values for the explain
                string explainSql = sql;
                if (parameters != null)
                {
                    foreach (var param in parameters)
                    {
                        string paramValue = GetParameterValueAsString(param.Value);
                        explainSql = explainSql.Replace(param.Key, paramValue);
                    }
                }

                // Prefix with EXPLAIN
                explainSql = $"EXPLAIN {explainSql}";

                // In a real implementation, you would execute this SQL against the database
                // and return the explain plan. For now, we'll just return the EXPLAIN SQL.

                _logger.LogInformation("Successfully generated SQL execution plan");
                return explainSql;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SQL execution plan");
                return $"Error generating execution plan: {ex.Message}";
            }
        }

        #region SQL Generation Methods

        /// <summary>
        /// Identifies the main table for the query
        /// </summary>
        private Table? IdentifyMainTable(MappedQueryEntities entities, DataModel dataModel)
        {
            // First check for fact tables that contain metrics
            if (entities.Metrics != null && entities.Metrics.Count > 0)
            {
                foreach (var table in dataModel.Tables)
                {
                    if (table.Type == "Fact" &&
                        entities.Metrics.Any(m => table.Columns.Any(c => c.Name == m.DatabaseField)))
                    {
                        return table;
                    }
                }
            }

            // Next check for dimension tables that match the most dimensions
            if (entities.Dimensions != null && entities.Dimensions.Count > 0)
            {
                var tableCounts = new Dictionary<string, int>();

                foreach (var dimension in entities.Dimensions)
                {
                    foreach (var table in dataModel.Tables)
                    {
                        if (table.Columns.Any(c => c.Name == dimension.DatabaseField))
                        {
                            if (!tableCounts.ContainsKey(table.Name))
                            {
                                tableCounts[table.Name] = 0;
                            }

                            tableCounts[table.Name]++;
                        }
                    }
                }

                if (tableCounts.Count > 0)
                {
                    // Get the table with the most dimension matches
                    var mainTableName = tableCounts.OrderByDescending(kv => kv.Value).First().Key;
                    return dataModel.Tables.FirstOrDefault(t => t.Name == mainTableName);
                }
            }

            // If we still don't have a main table, try to use filters
            if (entities.Filters != null && entities.Filters.Count > 0)
            {
                foreach (var filter in entities.Filters)
                {
                    foreach (var table in dataModel.Tables)
                    {
                        if (table.Columns.Any(c => c.Name == filter.DatabaseField))
                        {
                            return table;
                        }
                    }
                }
            }

            // Default to the first fact table if all else fails
            var factTable = dataModel.Tables.FirstOrDefault(t => t.Type == "Fact");
            if (factTable != null)
            {
                return factTable;
            }

            // Absolute last resort: just use the first table
            return dataModel.Tables.FirstOrDefault();
        }

        /// <summary>
        /// Generates the SELECT clause of the SQL query
        /// </summary>
        private string GenerateSelectClause(
            MappedQueryEntities entities,
            Table mainTable,
            TranslationContext context)
        {
            var selectBuilder = new StringBuilder("SELECT ");

            // Add metrics to the SELECT clause
            if (entities.Metrics != null && entities.Metrics.Count > 0)
            {
                for (int i = 0; i < entities.Metrics.Count; i++)
                {
                    var metric = entities.Metrics[i];

                    // Handle calculated metrics
                    if (metric.IsCalculated && !string.IsNullOrEmpty(metric.CalculationFormula))
                    {
                        selectBuilder.Append(metric.CalculationFormula);
                    }
                    else
                    {
                        // Apply aggregation if specified
                        if (!string.IsNullOrEmpty(metric.Aggregation))
                        {
                            selectBuilder.Append($"{metric.Aggregation}({GetFullyQualifiedColumnName(metric.DatabaseField, mainTable.Name, context)})");
                        }
                        else
                        {
                            selectBuilder.Append(GetFullyQualifiedColumnName(metric.DatabaseField, mainTable.Name, context));
                        }
                    }

                    // Add alias
                    selectBuilder.Append($" AS {metric.Name}");

                    // Add comma if not the last metric
                    if (i < entities.Metrics.Count - 1)
                    {
                        selectBuilder.Append(", ");
                    }
                }
            }

            // Add dimensions to the SELECT clause
            if (entities.Dimensions != null && entities.Dimensions.Count > 0)
            {
                // Add comma if we already have metrics
                if (entities.Metrics != null && entities.Metrics.Count > 0)
                {
                    selectBuilder.Append(", ");
                }

                for (int i = 0; i < entities.Dimensions.Count; i++)
                {
                    var dimension = entities.Dimensions[i];

                    selectBuilder.Append(GetFullyQualifiedColumnName(dimension.DatabaseField, mainTable.Name, context));

                    // Add alias
                    selectBuilder.Append($" AS {dimension.Name}");

                    // Add comma if not the last dimension
                    if (i < entities.Dimensions.Count - 1)
                    {
                        selectBuilder.Append(", ");
                    }
                }
            }

            // If no metrics or dimensions, use COUNT(*)
            if ((entities.Metrics == null || entities.Metrics.Count == 0) &&
                (entities.Dimensions == null || entities.Dimensions.Count == 0))
            {
                selectBuilder.Append("COUNT(*) AS Count");
            }

            selectBuilder.Append("\n");
            return selectBuilder.ToString();
        }

        /// <summary>
        /// Generates the FROM clause of the SQL query
        /// </summary>
        private string GenerateFromClause(
            MappedQueryEntities entities,
            Table mainTable,
            DataModel dataModel,
            TranslationContext context)
        {
            var fromBuilder = new StringBuilder($"FROM {mainTable.Name}");

            // Add alias for the main table
            string mainTableAlias = GetTableAlias(mainTable.Name, context);
            fromBuilder.Append($" AS {mainTableAlias}\n");

            // Identify related tables needed for the query
            var relatedTables = new HashSet<string>();

            // Check metrics for related tables
            if (entities.Metrics != null)
            {
                foreach (var metric in entities.Metrics)
                {
                    if (!string.IsNullOrEmpty(metric.DatabaseField))
                    {
                        var tableName = FindTableForColumn(metric.DatabaseField, dataModel);
                        if (!string.IsNullOrEmpty(tableName) && tableName != mainTable.Name)
                        {
                            relatedTables.Add(tableName);
                        }
                    }
                }
            }

            // Check dimensions for related tables
            if (entities.Dimensions != null)
            {
                foreach (var dimension in entities.Dimensions)
                {
                    if (!string.IsNullOrEmpty(dimension.DatabaseField))
                    {
                        var tableName = FindTableForColumn(dimension.DatabaseField, dataModel);
                        if (!string.IsNullOrEmpty(tableName) && tableName != mainTable.Name)
                        {
                            relatedTables.Add(tableName);
                        }
                    }
                }
            }

            // Check filters for related tables
            if (entities.Filters != null)
            {
                foreach (var filter in entities.Filters)
                {
                    if (!string.IsNullOrEmpty(filter.DatabaseField))
                    {
                        var tableName = FindTableForColumn(filter.DatabaseField, dataModel);
                        if (!string.IsNullOrEmpty(tableName) && tableName != mainTable.Name)
                        {
                            relatedTables.Add(tableName);
                        }
                    }
                }
            }

            // Build JOIN clauses for related tables
            foreach (var tableName in relatedTables)
            {
                // Find relationships between main table and related table
                var relationship = dataModel.Relationships.FirstOrDefault(r =>
                    (r.SourceTable == mainTable.Name && r.TargetTable == tableName) ||
                    (r.SourceTable == tableName && r.TargetTable == mainTable.Name));

                if (relationship != null)
                {
                    // Get the alias for the related table
                    string relatedTableAlias = GetTableAlias(tableName, context);

                    // Determine source and target columns
                    string sourceTable = relationship.SourceTable;
                    string targetTable = relationship.TargetTable;
                    string sourceColumn = relationship.SourceColumn;
                    string targetColumn = relationship.TargetColumn;

                    // Determine aliases for the source and target tables
                    string sourceAlias = sourceTable == mainTable.Name ? mainTableAlias : relatedTableAlias;
                    string targetAlias = targetTable == mainTable.Name ? mainTableAlias : relatedTableAlias;

                    // Build the JOIN clause
                    fromBuilder.Append($"JOIN {tableName} AS {relatedTableAlias} ON ");
                    fromBuilder.Append($"{sourceAlias}.{sourceColumn} = {targetAlias}.{targetColumn}\n");
                }
                else
                {
                    // If no direct relationship, try to find an indirect one
                    // (through a bridge table)
                    // This is a simplified approach - in reality, you would use a
                    // graph algorithm to find the shortest path between tables

                    var bridgeTables = dataModel.Tables.Where(t => t.Type == "Bridge").ToList();

                    foreach (var bridgeTable in bridgeTables)
                    {
                        var sourceRelationship = dataModel.Relationships.FirstOrDefault(r =>
                            (r.SourceTable == mainTable.Name && r.TargetTable == bridgeTable.Name) ||
                            (r.SourceTable == bridgeTable.Name && r.TargetTable == mainTable.Name));

                        var targetRelationship = dataModel.Relationships.FirstOrDefault(r =>
                            (r.SourceTable == tableName && r.TargetTable == bridgeTable.Name) ||
                            (r.SourceTable == bridgeTable.Name && r.TargetTable == tableName));

                        if (sourceRelationship != null && targetRelationship != null)
                        {
                            // First join the bridge table
                            string bridgeTableAlias = GetTableAlias(bridgeTable.Name, context);

                            var sourceRel = sourceRelationship;
                            string sourceBridgeAlias = sourceRel.SourceTable == mainTable.Name ? mainTableAlias : bridgeTableAlias;
                            string targetBridgeAlias = sourceRel.TargetTable == mainTable.Name ? mainTableAlias : bridgeTableAlias;

                            fromBuilder.Append($"JOIN {bridgeTable.Name} AS {bridgeTableAlias} ON ");
                            fromBuilder.Append($"{sourceBridgeAlias}.{sourceRel.SourceColumn} = {targetBridgeAlias}.{sourceRel.TargetColumn}\n");

                            // Then join the target table
                            string relatedTableAlias = GetTableAlias(tableName, context);

                            var targetRel = targetRelationship;
                            string sourceRelAlias = targetRel.SourceTable == tableName ? relatedTableAlias : bridgeTableAlias;
                            string targetRelAlias = targetRel.TargetTable == tableName ? relatedTableAlias : bridgeTableAlias;

                            fromBuilder.Append($"JOIN {tableName} AS {relatedTableAlias} ON ");
                            fromBuilder.Append($"{sourceRelAlias}.{targetRel.SourceColumn} = {targetRelAlias}.{targetRel.TargetColumn}\n");

                            break;
                        }
                    }
                }
            }

            return fromBuilder.ToString();
        }

        /// <summary>
        /// Generates the WHERE clause of the SQL query
        /// </summary>
        private string GenerateWhereClause(
            MappedQueryEntities entities,
            Table mainTable,
            DataModel dataModel,
            TranslationContext context)
        {
            var whereBuilder = new StringBuilder();
            var conditions = new List<string>();

            // Add time range filter if present
            if (entities.TimeRange != null)
            {
                string timeRangeCondition = GenerateTimeRangeCondition(entities.TimeRange, mainTable, dataModel, context);
                if (!string.IsNullOrEmpty(timeRangeCondition))
                {
                    conditions.Add(timeRangeCondition);
                }
            }

            // Add regular filters if present
            if (entities.Filters != null && entities.Filters.Count > 0)
            {
                foreach (var filterMapping in entities.Filters)
                {
                    // Convert FilterMapping to MappedFilter
                    var filter = new Models.Translation.MappedFilter
                    {
                        DatabaseField = filterMapping.DatabaseField,
                        Operator = filterMapping.Operator,
                        Value = filterMapping.Value,
                        IsNegated = filterMapping.IsNegated
                    };

                    string condition = GenerateFilterCondition(filter, mainTable, dataModel, context);
                    if (!string.IsNullOrEmpty(condition))
                    {
                        conditions.Add(condition);
                    }
                }
            }

            // Combine all conditions with AND
            if (conditions.Count > 0)
            {
                whereBuilder.Append("WHERE ");
                whereBuilder.Append(string.Join(" AND ", conditions));
                whereBuilder.Append("\n");
            }

            return whereBuilder.ToString();
        }

        /// <summary>
        /// Generates the GROUP BY clause of the SQL query
        /// </summary>
        private string GenerateGroupByClause(
            MappedQueryEntities entities,
            Table mainTable,
            TranslationContext context)
        {
            var groupByBuilder = new StringBuilder();

            // Add GROUP BY if we have dimensions and aggregated metrics
            bool hasAggregatedMetrics = entities.Metrics != null &&
                entities.Metrics.Any(m => !string.IsNullOrEmpty(m.Aggregation) || m.IsCalculated);

            if (hasAggregatedMetrics && entities.Dimensions != null && entities.Dimensions.Count > 0)
            {
                groupByBuilder.Append("GROUP BY ");

                for (int i = 0; i < entities.Dimensions.Count; i++)
                {
                    var dimension = entities.Dimensions[i];

                    groupByBuilder.Append(GetFullyQualifiedColumnName(dimension.DatabaseField, mainTable.Name, context));

                    // Add comma if not the last dimension
                    if (i < entities.Dimensions.Count - 1)
                    {
                        groupByBuilder.Append(", ");
                    }
                }

                groupByBuilder.Append("\n");
            }

            return groupByBuilder.ToString();
        }

        /// <summary>
        /// Generates the ORDER BY clause of the SQL query
        /// </summary>
        private string GenerateOrderByClause(
            MappedQueryEntities entities,
            Table mainTable,
            TranslationContext context)
        {
            var orderByBuilder = new StringBuilder();

            // Add ORDER BY if we have a sort field
            if (entities.SortBy != null)
            {
                orderByBuilder.Append("ORDER BY ");

                // First, check if the sort field is a metric
                var metric = entities.Metrics?.FirstOrDefault(m => m.Name == entities.SortBy.Field);
                if (metric != null)
                {
                    // If it's a calculated metric, use the alias directly
                    if (metric.IsCalculated)
                    {
                        orderByBuilder.Append(metric.Name);
                    }
                    else
                    {
                        // If it has an aggregation, use the alias
                        if (!string.IsNullOrEmpty(metric.Aggregation))
                        {
                            orderByBuilder.Append(metric.Name);
                        }
                        else
                        {
                            // Otherwise, use the fully qualified column name
                            orderByBuilder.Append(GetFullyQualifiedColumnName(metric.DatabaseField, mainTable.Name, context));
                        }
                    }
                }
                else
                {
                    // Check if it's a dimension
                    var dimension = entities.Dimensions?.FirstOrDefault(d => d.Name == entities.SortBy.Field);
                    if (dimension != null)
                    {
                        // Use the fully qualified column name
                        orderByBuilder.Append(GetFullyQualifiedColumnName(dimension.DatabaseField, mainTable.Name, context));
                    }
                    else
                    {
                        // Default to the field name as-is
                        orderByBuilder.Append(entities.SortBy.Field);
                    }
                }

                // Add direction
                orderByBuilder.Append(entities.SortBy.Direction == "asc" ? " ASC" : " DESC");
                orderByBuilder.Append("\n");
            }

            return orderByBuilder.ToString();
        }

        /// <summary>
        /// Generates the LIMIT clause of the SQL query
        /// </summary>
        private string GenerateLimitClause(MappedQueryEntities entities)
        {
            if (entities.Limit.HasValue && entities.Limit.Value > 0)
            {
                return $"LIMIT {entities.Limit.Value}\n";
            }

            return string.Empty;
        }

        /// <summary>
        /// Generates a time range condition for the WHERE clause
        /// </summary>
        private string GenerateTimeRangeCondition(
            TimeRange timeRange,
            Table mainTable,
            DataModel dataModel,
            TranslationContext context)
        {
            // Find the date column in the main table
            var dateColumn = mainTable.Columns.FirstOrDefault(c => c.IsDate);

            if (dateColumn == null)
            {
                // Try to find a date column in any table
                foreach (var table in dataModel.Tables)
                {
                    dateColumn = table.Columns.FirstOrDefault(c => c.IsDate);
                    if (dateColumn != null)
                    {
                        break;
                    }
                }
            }

            if (dateColumn == null)
            {
                _logger.LogWarning("No date column found for time range filter");
                return string.Empty;
            }

            // Get the fully qualified column name
            string columnName = GetFullyQualifiedColumnName(dateColumn.Name, mainTable.Name, context);

            // Handle relative period
            if (!string.IsNullOrEmpty(timeRange.RelativePeriod))
            {
                // Parse the relative period
                if (timeRange.RelativePeriod.StartsWith("last ", StringComparison.OrdinalIgnoreCase))
                {
                    string[] parts = timeRange.RelativePeriod.Split(' ');
                    if (parts.Length >= 3 && int.TryParse(parts[1], out int number))
                    {
                        string unit = parts[2].ToLowerInvariant();

                        // Calculate the start date based on the relative period
                        DateTime now = DateTime.Now;
                        DateTime startDate = unit switch
                        {
                            "day" or "days" => now.AddDays(-number),
                            "week" or "weeks" => now.AddDays(-number * 7),
                            "month" or "months" => now.AddMonths(-number),
                            "quarter" or "quarters" => now.AddMonths(-number * 3),
                            "year" or "years" => now.AddYears(-number),
                            _ => now.AddDays(-30) // Default to 30 days
                        };

                        // Create parameters for the dates
                        string startParam = AddParameter(context, startDate);
                        string endParam = AddParameter(context, now);

                        return $"{columnName} BETWEEN {startParam} AND {endParam}";
                    }
                }
                else if (timeRange.RelativePeriod == "today")
                {
                    DateTime today = DateTime.Today;
                    string startParam = AddParameter(context, today);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "yesterday")
                {
                    DateTime yesterday = DateTime.Today.AddDays(-1);
                    string startParam = AddParameter(context, yesterday);
                    string endParam = AddParameter(context, yesterday.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "this week")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                    string startParam = AddParameter(context, startOfWeek);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "this month")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfMonth = new DateTime(today.Year, today.Month, 1);
                    string startParam = AddParameter(context, startOfMonth);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "this quarter")
                {
                    DateTime today = DateTime.Today;
                    int quarterStartMonth = ((today.Month - 1) / 3) * 3 + 1;
                    DateTime startOfQuarter = new DateTime(today.Year, quarterStartMonth, 1);
                    string startParam = AddParameter(context, startOfQuarter);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "this year")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfYear = new DateTime(today.Year, 1, 1);
                    string startParam = AddParameter(context, startOfYear);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "year to date")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfYear = new DateTime(today.Year, 1, 1);
                    string startParam = AddParameter(context, startOfYear);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "quarter to date")
                {
                    DateTime today = DateTime.Today;
                    int quarterStartMonth = ((today.Month - 1) / 3) * 3 + 1;
                    DateTime startOfQuarter = new DateTime(today.Year, quarterStartMonth, 1);
                    string startParam = AddParameter(context, startOfQuarter);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "month to date")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfMonth = new DateTime(today.Year, today.Month, 1);
                    string startParam = AddParameter(context, startOfMonth);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }
                else if (timeRange.RelativePeriod == "week to date")
                {
                    DateTime today = DateTime.Today;
                    DateTime startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                    string startParam = AddParameter(context, startOfWeek);
                    string endParam = AddParameter(context, today.AddDays(1).AddSeconds(-1));

                    return $"{columnName} BETWEEN {startParam} AND {endParam}";
                }

                // Default to last 30 days if we couldn't parse the relative period
                DateTime defaultStart = DateTime.Now.AddDays(-30);
                string defaultStartParam = AddParameter(context, defaultStart);
                string defaultEndParam = AddParameter(context, DateTime.Now);

                return $"{columnName} BETWEEN {defaultStartParam} AND {defaultEndParam}";
            }

            // Handle absolute dates
            if (timeRange.StartDate.HasValue && timeRange.EndDate.HasValue)
            {
                string startParam = AddParameter(context, timeRange.StartDate.Value);
                string endParam = AddParameter(context, timeRange.EndDate.Value.AddDays(1).AddSeconds(-1));

                return $"{columnName} BETWEEN {startParam} AND {endParam}";
            }

            return string.Empty;
        }

        /// <summary>
        /// Generates a filter condition for the WHERE clause
        /// </summary>
        private string GenerateFilterCondition(
            Models.Translation.MappedFilter filter,
            Table mainTable,
            DataModel dataModel,
            TranslationContext context)
        {
            if (string.IsNullOrEmpty(filter.DatabaseField))
            {
                return string.Empty;
            }

            // Get the fully qualified column name
            string columnName = GetFullyQualifiedColumnName(filter.DatabaseField, mainTable.Name, context);

            // Handle different operators
            switch (filter.Operator?.ToLowerInvariant())
            {
                case "equals":
                    string equalsParam = AddParameter(context, filter.Value);
                    return filter.IsNegated
                        ? $"{columnName} <> {equalsParam}"
                        : $"{columnName} = {equalsParam}";

                case "notequals":
                    string notEqualsParam = AddParameter(context, filter.Value);
                    return filter.IsNegated
                        ? $"{columnName} = {notEqualsParam}"
                        : $"{columnName} <> {notEqualsParam}";

                case "greaterthan":
                    string greaterThanParam = AddParameter(context, filter.Value);
                    return filter.IsNegated
                        ? $"{columnName} <= {greaterThanParam}"
                        : $"{columnName} > {greaterThanParam}";

                case "lessthan":
                    string lessThanParam = AddParameter(context, filter.Value);
                    return filter.IsNegated
                        ? $"{columnName} >= {lessThanParam}"
                        : $"{columnName} < {lessThanParam}";

                case "contains":
                    string containsValue = filter.Value?.ToString() ?? "";
                    string containsParam = AddParameter(context, $"%{containsValue}%");
                    return filter.IsNegated
                        ? $"{columnName} NOT LIKE {containsParam}"
                        : $"{columnName} LIKE {containsParam}";

                case "startswith":
                    string startsWithValue = filter.Value?.ToString() ?? "";
                    string startsWithParam = AddParameter(context, $"{startsWithValue}%");
                    return filter.IsNegated
                        ? $"{columnName} NOT LIKE {startsWithParam}"
                        : $"{columnName} LIKE {startsWithParam}";

                case "endswith":
                    string endsWithValue = filter.Value?.ToString() ?? "";
                    string endsWithParam = AddParameter(context, $"%{endsWithValue}");
                    return filter.IsNegated
                        ? $"{columnName} NOT LIKE {endsWithParam}"
                        : $"{columnName} LIKE {endsWithParam}";

                case "between":
                    if (filter.Value is object[] betweenValues && betweenValues.Length >= 2)
                    {
                        string lowerParam = AddParameter(context, betweenValues[0]);
                        string upperParam = AddParameter(context, betweenValues[1]);

                        return filter.IsNegated
                            ? $"({columnName} < {lowerParam} OR {columnName} > {upperParam})"
                            : $"{columnName} BETWEEN {lowerParam} AND {upperParam}";
                    }
                    return string.Empty;

                case "in":
                    if (filter.Value is object[] inValues && inValues.Length > 0)
                    {
                        var parameters = new List<string>();

                        foreach (var value in inValues)
                        {
                            parameters.Add(AddParameter(context, value));
                        }

                        string inList = string.Join(", ", parameters);

                        return filter.IsNegated
                            ? $"{columnName} NOT IN ({inList})"
                            : $"{columnName} IN ({inList})";
                    }
                    return string.Empty;

                case "isnull":
                    return filter.IsNegated
                        ? $"{columnName} IS NOT NULL"
                        : $"{columnName} IS NULL";

                default:
                    // Default to equals
                    string defaultParam = AddParameter(context, filter.Value);
                    return filter.IsNegated
                        ? $"{columnName} <> {defaultParam}"
                        : $"{columnName} = {defaultParam}";
            }
        }

        /// <summary>
        /// Generates comparison queries
        /// </summary>
        private Task<Dictionary<string, string>?> GenerateComparisonQueriesAsync(
            MappedQueryEntities entities,
            string baseSql,
            Dictionary<string, object> baseParameters,
            DataModel dataModel)
        {
            var comparisonQueries = new Dictionary<string, string>();

            if (entities.Comparisons == null || entities.Comparisons.Count == 0)
            {
                return Task.FromResult<Dictionary<string, string>?>(null);
            }

            foreach (var comparison in entities.Comparisons)
            {
                switch (comparison.ToLowerInvariant())
                {
                    case "year-over-year":
                        if (entities.TimeRange != null)
                        {
                            var yoyQuery = GenerateYearOverYearQuery(
                                baseSql, baseParameters, entities.TimeRange);

                            if (!string.IsNullOrEmpty(yoyQuery))
                            {
                                comparisonQueries["year-over-year"] = yoyQuery;
                            }
                        }
                        break;

                    case "month-over-month":
                        if (entities.TimeRange != null)
                        {
                            var momQuery = GenerateMonthOverMonthQuery(
                                baseSql, baseParameters, entities.TimeRange);

                            if (!string.IsNullOrEmpty(momQuery))
                            {
                                comparisonQueries["month-over-month"] = momQuery;
                            }
                        }
                        break;

                    case "previous-period":
                        if (entities.TimeRange != null)
                        {
                            var prevQuery = GeneratePreviousPeriodQuery(
                                baseSql, baseParameters, entities.TimeRange);

                            if (!string.IsNullOrEmpty(prevQuery))
                            {
                                comparisonQueries["previous-period"] = prevQuery;
                            }
                        }
                        break;
                }
            }

            return Task.FromResult(comparisonQueries.Count > 0 ? comparisonQueries : null);
        }

        /// <summary>
        /// Generates a year-over-year comparison query
        /// </summary>
        private string GenerateYearOverYearQuery(
            string baseSql,
            Dictionary<string, object> baseParameters,
            TimeRange timeRange)
        {
            // Clone the base parameters
            var yoyParameters = new Dictionary<string, object>(baseParameters);

            // Adjust date parameters to be one year earlier
            foreach (var param in baseParameters)
            {
                if (param.Value is DateTime dateValue)
                {
                    yoyParameters[param.Key] = dateValue.AddYears(-1);
                }
            }

            // Return the base SQL with adjusted parameters
            // In a real implementation, you would modify the SQL to include
            // the adjusted parameters with new parameter names

            // This is a simplified version that just returns the base SQL
            // with an indication that it's for year-over-year comparison
            return $"/* Year-over-year comparison */\n{baseSql}";
        }

        /// <summary>
        /// Generates a month-over-month comparison query
        /// </summary>
        private string GenerateMonthOverMonthQuery(
            string baseSql,
            Dictionary<string, object> baseParameters,
            TimeRange timeRange)
        {
            // Clone the base parameters
            var momParameters = new Dictionary<string, object>(baseParameters);

            // Adjust date parameters to be one month earlier
            foreach (var param in baseParameters)
            {
                if (param.Value is DateTime dateValue)
                {
                    momParameters[param.Key] = dateValue.AddMonths(-1);
                }
            }

            // Return the base SQL with adjusted parameters
            // This is a simplified version that just returns the base SQL
            // with an indication that it's for month-over-month comparison
            return $"/* Month-over-month comparison */\n{baseSql}";
        }

        /// <summary>
        /// Generates a previous period comparison query
        /// </summary>
        private string GeneratePreviousPeriodQuery(
            string baseSql,
            Dictionary<string, object> baseParameters,
            TimeRange timeRange)
        {
            // Clone the base parameters
            var prevParameters = new Dictionary<string, object>(baseParameters);

            // Determine the period length
            TimeSpan periodLength = TimeSpan.Zero;

            if (timeRange.StartDate.HasValue && timeRange.EndDate.HasValue)
            {
                periodLength = timeRange.EndDate.Value - timeRange.StartDate.Value;
            }
            else if (!string.IsNullOrEmpty(timeRange.RelativePeriod))
            {
                // Estimate period length based on relative period
                if (timeRange.RelativePeriod.Contains("day", StringComparison.OrdinalIgnoreCase))
                {
                    periodLength = TimeSpan.FromDays(1);
                }
                else if (timeRange.RelativePeriod.Contains("week", StringComparison.OrdinalIgnoreCase))
                {
                    periodLength = TimeSpan.FromDays(7);
                }
                else if (timeRange.RelativePeriod.Contains("month", StringComparison.OrdinalIgnoreCase))
                {
                    periodLength = TimeSpan.FromDays(30);
                }
                else if (timeRange.RelativePeriod.Contains("quarter", StringComparison.OrdinalIgnoreCase))
                {
                    periodLength = TimeSpan.FromDays(90);
                }
                else if (timeRange.RelativePeriod.Contains("year", StringComparison.OrdinalIgnoreCase))
                {
                    periodLength = TimeSpan.FromDays(365);
                }
                else
                {
                    // Default to 30 days
                    periodLength = TimeSpan.FromDays(30);
                }
            }

            // Adjust date parameters to be one period earlier
            foreach (var param in baseParameters)
            {
                if (param.Value is DateTime dateValue)
                {
                    prevParameters[param.Key] = dateValue.Subtract(periodLength);
                }
            }

            // Return the base SQL with adjusted parameters
            // This is a simplified version that just returns the base SQL
            // with an indication that it's for previous period comparison
            return $"/* Previous period comparison */\n{baseSql}";
        }

        #endregion

        #region Optimization Methods

        /// <summary>
        /// Applies query hints to a SQL query
        /// </summary>
        private string ApplyQueryHints(string sql, DataModel dataModel)
        {
            // This is a placeholder implementation
            // In a real-world scenario, you would apply database-specific query hints

            // Add a OPTION (RECOMPILE) hint for SQL Server
            if (_config.Sql.DatabaseType == "SqlServer")
            {
                if (!sql.Contains("OPTION (RECOMPILE)", StringComparison.OrdinalIgnoreCase))
                {
                    return $"{sql}\nOPTION (RECOMPILE)";
                }
            }

            return sql;
        }

        /// <summary>
        /// Applies table hints to a SQL query
        /// </summary>
        private string ApplyTableHints(string sql, DataModel dataModel)
        {
            // This is a placeholder implementation
            // In a real-world scenario, you would apply database-specific table hints

            // Add a WITH (NOLOCK) hint for SQL Server
            if (_config.Sql.DatabaseType == "SqlServer")
            {
                foreach (var table in dataModel.Tables)
                {
                    // Skip small tables
                    if (table.RowCount < _config.Sql.NoLockThreshold)
                    {
                        continue;
                    }

                    // Add NOLOCK hint
                    string pattern = $"FROM {table.Name}";
                    string replacement = $"FROM {table.Name} WITH (NOLOCK)";

                    sql = sql.Replace(pattern, replacement);

                    // Also handle the JOIN cases
                    pattern = $"JOIN {table.Name}";
                    replacement = $"JOIN {table.Name} WITH (NOLOCK)";

                    sql = sql.Replace(pattern, replacement);
                }
            }

            return sql;
        }

        /// <summary>
        /// Applies index hints to a SQL query
        /// </summary>
        private string ApplyIndexHints(string sql, DataModel dataModel)
        {
            // This is a placeholder implementation
            // In a real-world scenario, you would apply database-specific index hints

            // For MySQL, you could use FORCE INDEX
            // For SQL Server, you could use WITH (INDEX(index_name))
            // This function would require index metadata to be included in the data model

            return sql;
        }

        /// <summary>
        /// Checks if a query is complex enough to benefit from a CTE
        /// </summary>
        private bool IsComplexQuery(string sql)
        {
            // Check if the query has multiple JOINs, GROUP BY, and aggregate functions
            bool hasMultipleJoins = CountOccurrences(sql, "JOIN") >= 2;
            bool hasGroupBy = sql.Contains("GROUP BY", StringComparison.OrdinalIgnoreCase);
            bool hasAggregates = sql.Contains("SUM(", StringComparison.OrdinalIgnoreCase) ||
                                sql.Contains("AVG(", StringComparison.OrdinalIgnoreCase) ||
                                sql.Contains("COUNT(", StringComparison.OrdinalIgnoreCase) ||
                                sql.Contains("MAX(", StringComparison.OrdinalIgnoreCase) ||
                                sql.Contains("MIN(", StringComparison.OrdinalIgnoreCase);

            return hasMultipleJoins && hasGroupBy && hasAggregates;
        }

        /// <summary>
        /// Rewrites a query to use a CTE for better performance
        /// </summary>
        private string RewriteWithCte(string sql)
        {
            // This is a placeholder implementation
            // In a real-world scenario, you would parse the SQL and restructure it to use CTEs

            // A very simplified approach that just wraps the query in a CTE
            return $"WITH MainQuery AS (\n{sql}\n)\nSELECT * FROM MainQuery";
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Gets a fully qualified column name with the appropriate table alias
        /// </summary>
        private string GetFullyQualifiedColumnName(
            string columnName,
            string tableName,
            TranslationContext context)
        {
            // If the table name doesn't match the column's table, try to find the right table
            // This could be improved by using a more sophisticated schema lookup

            // Get the alias for the table
            string tableAlias = GetTableAlias(tableName, context);

            return $"{tableAlias}.{columnName}";
        }

        /// <summary>
        /// Gets or creates a table alias
        /// </summary>
        private string GetTableAlias(string tableName, TranslationContext context)
        {
            if (!context.TableAliases.TryGetValue(tableName, out string? alias))
            {
                // Create a simple alias from the first character of each word in the table name
                alias = string.Concat(
                    tableName.Split(new[] { ' ', '_' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(word => word[0])
                );

                // Ensure the alias is unique
                string baseAlias = alias;
                int counter = 1;

                while (context.TableAliases.Values.Contains(alias))
                {
                    alias = $"{baseAlias}{counter++}";
                }

                context.TableAliases[tableName] = alias;
            }

            return alias;
        }

        /// <summary>
        /// Adds a parameter to the context and returns the parameter name
        /// </summary>
        private string AddParameter(TranslationContext context, object? value)
        {
            string paramName = $"{context.ParameterPrefix}{++context.ParameterCounter}";

            context.Parameters ??= new Dictionary<string, object>();
            context.Parameters[paramName] = value ?? DBNull.Value;

            return paramName;
        }

        /// <summary>
        /// Finds the table that contains a specific column
        /// </summary>
        private string FindTableForColumn(string columnName, DataModel dataModel)
        {
            foreach (var table in dataModel.Tables)
            {
                if (table.Columns.Any(c => c.Name == columnName))
                {
                    return table.Name;
                }
            }

            return string.Empty;
        }

        /// <summary>
        /// Counts the occurrences of a substring in a string
        /// </summary>
        private int CountOccurrences(string source, string substring)
        {
            int count = 0;
            int index = 0;

            while ((index = source.IndexOf(substring, index, StringComparison.OrdinalIgnoreCase)) != -1)
            {
                count++;
                index += substring.Length;
            }

            return count;
        }

        /// <summary>
        /// Formats a parameter value as a string for SQL
        /// </summary>
        private string GetParameterValueAsString(object? value)
        {
            if (value == null || value == DBNull.Value)
            {
                return "NULL";
            }

            if (value is string strValue)
            {
                return $"'{strValue.Replace("'", "''")}'";
            }

            if (value is DateTime dateValue)
            {
                return $"'{dateValue:yyyy-MM-dd HH:mm:ss}'";
            }

            if (value is bool boolValue)
            {
                return boolValue ? "1" : "0";
            }

            return value.ToString() ?? "NULL";
        }

        /// <summary>
        /// Checks if a SQL query contains potential SQL injection patterns
        /// </summary>
        private bool ContainsSqlInjectionPatterns(string sql)
        {
            // Check for common SQL injection patterns
            string[] patterns = {
                "--",               // Comment
                ";",               // Statement terminator
                "/*",              // Comment block
                "*/",              // Comment block end
                "xp_",             // Extended stored procedures
                "sp_",             // System stored procedures
                "EXEC",            // Execute statement
                "EXECUTE",         // Execute statement
                "UNION",           // Union statement
                "DROP",            // Drop statement
                "DELETE",          // Delete statement
                "UPDATE",          // Update statement
                "INSERT",          // Insert statement
                "TRUNCATE",        // Truncate statement
                "ALTER",           // Alter statement
                "CREATE",          // Create statement
                "INFORMATION_SCHEMA", // Information schema
                "WAITFOR DELAY",   // Wait for delay
                "SLEEP",           // Sleep function
                "SELECT @@VERSION" // Get database version
            };

            // This is a very simple check and not sufficient for real SQL injection prevention
            // In a real implementation, you would use parameterized queries and validation

            foreach (var pattern in patterns)
            {
                if (sql.Contains(pattern, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Validates that all parameters used in the SQL are defined
        /// </summary>
        private bool ValidateParameterUsage(string sql, Dictionary<string, object> parameters)
        {
            // Check that all parameter references in the SQL are defined
            foreach (var param in parameters)
            {
                if (!sql.Contains(param.Key, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Parameter {ParamName} is defined but not used in SQL", param.Key);
                }
            }

            // Check for parameter references in SQL that are not defined
            // This is a simplified approach and not sufficient for real validation
            int paramStart = 0;
            while ((paramStart = sql.IndexOf("@", paramStart, StringComparison.OrdinalIgnoreCase)) != -1)
            {
                int paramEnd = paramStart + 1;
                while (paramEnd < sql.Length && (char.IsLetterOrDigit(sql[paramEnd]) || sql[paramEnd] == '_'))
                {
                    paramEnd++;
                }

                if (paramEnd > paramStart + 1)
                {
                    string paramName = sql.Substring(paramStart, paramEnd - paramStart);

                    if (!parameters.ContainsKey(paramName))
                    {
                        _logger.LogWarning("SQL references parameter {ParamName} which is not defined", paramName);
                        return false;
                    }
                }

                paramStart = paramEnd;
            }

            return true;
        }

        #endregion
    }
}