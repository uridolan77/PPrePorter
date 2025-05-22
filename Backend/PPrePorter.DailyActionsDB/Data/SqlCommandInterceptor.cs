using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Intercepts SQL commands and adds NOLOCK hints to all tables in SELECT queries
    /// </summary>
    public class SqlCommandInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<SqlCommandInterceptor> _logger;

        // Regex patterns for different SQL constructs
        private static readonly Regex _fromTablePattern = new Regex(
            @"FROM\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex _joinTablePattern = new Regex(
            @"(INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|CROSS\s+)?JOIN\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex _subqueryTablePattern = new Regex(
            @"FROM\s+\(SELECT.*?FROM\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

        private static readonly Regex _derivedTablePattern = new Regex(
            @"FROM\s+\(.*?\)\s+AS\s+\[([^\]]+)\]",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

        private static readonly Regex _ctePattern = new Regex(
            @"WITH\s+([^\s]+)\s+AS\s+\(.*?FROM\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

        // List of SQL functions that should not have NOLOCK hints
        private static readonly HashSet<string> _sqlFunctions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "OPENJSON", "OPENXML", "OPENROWSET", "OPENQUERY", "FREETEXTTABLE", "CONTAINSTABLE"
        };

        /// <summary>
        /// Constructor
        /// </summary>
        public SqlCommandInterceptor(ILogger<SqlCommandInterceptor> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Called before a command is executed
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            ModifySqlCommand(command);
            return result;
        }

        /// <summary>
        /// Called before a command is executed asynchronously
        /// </summary>
        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            ModifySqlCommand(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Modifies the SQL command to add NOLOCK hints
        /// </summary>
        private void ModifySqlCommand(DbCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.CommandText))
            {
                return;
            }

            // Only modify SELECT queries
            if (!command.CommandText.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            // Check if the query has the FORCE_NOLOCK_ON_ALL_TABLES tag
            if (command.CommandText.Contains("-- FORCE_NOLOCK_ON_ALL_TABLES", StringComparison.OrdinalIgnoreCase))
            {
                string originalSql = command.CommandText;

                try
                {
                    // Add NOLOCK hints to all tables
                    string modifiedSql = originalSql;

                    // Process the SQL in multiple passes to handle different SQL constructs

                    // Pass 1: Replace all FROM [schema].[table] with FROM [schema].[table] WITH (NOLOCK)
                    modifiedSql = _fromTablePattern.Replace(modifiedSql, "FROM [$1].[$2] WITH (NOLOCK)");

                    // Pass 2: Replace all JOIN [schema].[table] with JOIN [schema].[table] WITH (NOLOCK)
                    modifiedSql = _joinTablePattern.Replace(modifiedSql, "$1JOIN [$2].[$3] WITH (NOLOCK)");

                    // Pass 3: Handle subqueries
                    modifiedSql = ProcessSubqueries(modifiedSql);

                    // Pass 4: Handle derived tables
                    modifiedSql = ProcessDerivedTables(modifiedSql);

                    // Pass 5: Handle CTEs (Common Table Expressions)
                    modifiedSql = ProcessCTEs(modifiedSql);

                    // Pass 6: Fix any SQL functions that should not have NOLOCK hints
                    modifiedSql = FixSqlFunctions(modifiedSql);

                    // Update the command text
                    command.CommandText = modifiedSql;

                    // Log the transformation if it changed
                    if (originalSql != modifiedSql)
                    {
                        _logger?.LogDebug("Added NOLOCK hints to SQL query. Original length: {OriginalLength}, Modified length: {ModifiedLength}",
                            originalSql.Length, modifiedSql.Length);

                        // Log a sample of the transformation for debugging
                        if (_logger?.IsEnabled(LogLevel.Trace) == true)
                        {
                            _logger.LogTrace("SQL Transformation Sample: {OriginalSample} => {ModifiedSample}",
                                originalSql.Substring(0, Math.Min(100, originalSql.Length)),
                                modifiedSql.Substring(0, Math.Min(100, modifiedSql.Length)));
                        }
                    }
                }
                catch (Exception ex)
                {
                    // If anything goes wrong, revert to the original SQL
                    command.CommandText = originalSql;
                    _logger?.LogError(ex, "Error adding NOLOCK hints to SQL query");
                }
            }
        }

        /// <summary>
        /// Process subqueries to add NOLOCK hints
        /// </summary>
        private string ProcessSubqueries(string sql)
        {
            // This is a simplified approach - for complex nested subqueries, a more sophisticated parser would be needed
            return _subqueryTablePattern.Replace(sql, "FROM (SELECT FROM [$1].[$2] WITH (NOLOCK)");
        }

        /// <summary>
        /// Process derived tables to add NOLOCK hints
        /// </summary>
        private string ProcessDerivedTables(string sql)
        {
            // For derived tables, we need to process the inner query
            // This is a simplified approach - for complex derived tables, a more sophisticated parser would be needed
            return sql;
        }

        /// <summary>
        /// Process CTEs (Common Table Expressions) to add NOLOCK hints
        /// </summary>
        private string ProcessCTEs(string sql)
        {
            // This is a simplified approach - for complex CTEs, a more sophisticated parser would be needed
            return _ctePattern.Replace(sql, "WITH $1 AS (FROM [$2].[$3] WITH (NOLOCK)");
        }

        /// <summary>
        /// Fix any SQL functions that should not have NOLOCK hints
        /// </summary>
        private string FixSqlFunctions(string sql)
        {
            string result = sql;

            // Remove NOLOCK hints from SQL functions
            foreach (var function in _sqlFunctions)
            {
                // Remove NOLOCK hints from function calls
                if (result.Contains($"{function} WITH (NOLOCK)", StringComparison.OrdinalIgnoreCase))
                {
                    result = result.Replace($"{function} WITH (NOLOCK)", function, StringComparison.OrdinalIgnoreCase);
                }

                // Fix cases where WITH (NOLOCK) was added before WITH clause in functions
                var pattern = $"{function} WITH \\(NOLOCK\\) WITH";
                var replacement = $"{function} WITH";
                result = Regex.Replace(result, pattern, replacement, RegexOptions.IgnoreCase);
            }

            return result;
        }
    }
}
