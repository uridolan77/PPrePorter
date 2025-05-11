using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// SQL Server command interceptor that adds NOLOCK hints to SELECT queries
    /// </summary>
    public class NoLockCommandInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<NoLockCommandInterceptor>? _logger;

        public NoLockCommandInterceptor(ILogger<NoLockCommandInterceptor>? logger = null)
        {
            _logger = logger;
        }

        // This regex pattern matches table references in SQL queries with or without aliases
        private static readonly Regex TablePattern = new Regex(
            @"FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // This regex pattern matches JOIN clauses in SQL queries with or without aliases
        private static readonly Regex JoinPattern = new Regex(
            @"(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // This regex pattern matches subquery table references in SQL queries
        private static readonly Regex SubqueryTablePattern = new Regex(
            @"FROM\s+\[(\w+)\]\.\[(\w+)\]\s+AS\s+\[(\w+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // This regex pattern matches derived tables in the FROM clause
        private static readonly Regex DerivedTablePattern = new Regex(
            @"FROM\s+\(\s*SELECT",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // This regex pattern matches the comment at the beginning of the query
        private static readonly Regex CommentPattern = new Regex(
            @"^\s*--\s*WITH\s*\(NOLOCK\)\s*\n",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);

        // This regex pattern matches table aliases in the FROM clause
        private static readonly Regex TableAliasPattern = new Regex(
            @"\[(\w+)\](?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        /// <summary>
        /// Intercepts the command before it is executed and adds NOLOCK hints
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            if (command != null && !string.IsNullOrWhiteSpace(command.CommandText))
            {
                string originalSql = command.CommandText;
                command.CommandText = ProcessSqlQuery(command.CommandText);

                // Log the transformation if it changed
                if (originalSql != command.CommandText)
                {
                    _logger?.LogDebug("Applied NOLOCK hints to SQL query. Original length: {OriginalLength}, Modified length: {ModifiedLength}",
                        originalSql.Length, command.CommandText.Length);
                }
            }
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously and adds NOLOCK hints
        /// </summary>
        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            if (command != null && !string.IsNullOrWhiteSpace(command.CommandText))
            {
                string originalSql = command.CommandText;
                command.CommandText = ProcessSqlQuery(command.CommandText);

                // Log the transformation if it changed
                if (originalSql != command.CommandText)
                {
                    _logger?.LogDebug("Applied NOLOCK hints to SQL query. Original length: {OriginalLength}, Modified length: {ModifiedLength}",
                        originalSql.Length, command.CommandText.Length);
                }
            }
            return new ValueTask<InterceptionResult<DbDataReader>>(result);
        }

        /// <summary>
        /// Processes a SQL query to add NOLOCK hints to all tables
        /// </summary>
        private string ProcessSqlQuery(string sql)
        {
            // Only process SELECT statements
            if (!sql.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                return sql;
            }

            // Remove the comment at the beginning of the query
            sql = CommentPattern.Replace(sql, string.Empty);

            try
            {
                // Process main FROM clauses
                sql = TablePattern.Replace(sql, match =>
                {
                    string schema = match.Groups[1].Value;
                    string table = match.Groups[2].Value;
                    string alias = match.Groups[3].Success ? match.Groups[3].Value : null;

                    if (string.IsNullOrEmpty(alias))
                    {
                        return $"FROM [{schema}].[{table}] WITH (NOLOCK)";
                    }
                    else
                    {
                        return $"FROM [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                    }
                });

                // Process JOIN clauses
                sql = JoinPattern.Replace(sql, match =>
                {
                    string joinType = match.Groups[1].Success ? match.Groups[1].Value : string.Empty;
                    string schema = match.Groups[2].Value;
                    string table = match.Groups[3].Value;
                    string alias = match.Groups[4].Success ? match.Groups[4].Value : null;

                    string joinClause = !string.IsNullOrEmpty(joinType) ? $"{joinType} JOIN" : "JOIN";

                    if (string.IsNullOrEmpty(alias))
                    {
                        return $"{joinClause} [{schema}].[{table}] WITH (NOLOCK)";
                    }
                    else
                    {
                        return $"{joinClause} [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                    }
                });

                // Process subquery table references
                sql = SubqueryTablePattern.Replace(sql, match =>
                {
                    string schema = match.Groups[1].Value;
                    string table = match.Groups[2].Value;
                    string alias = match.Groups[3].Value;

                    return $"FROM [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                });

                // Handle complex subqueries in the SELECT statement
                // This is a more advanced approach to handle nested queries
                if (sql.Contains("SELECT") && sql.Contains("FROM"))
                {
                    // Process nested SELECT statements
                    sql = ProcessNestedSelects(sql);
                }

                // Special handling for derived tables
                if (DerivedTablePattern.IsMatch(sql))
                {
                    _logger?.LogDebug("Query contains derived tables, applying special handling");
                    sql = ProcessDerivedTables(sql);
                }

                // Handle LEFT JOIN with CASE expressions
                if (sql.Contains("LEFT JOIN") && sql.Contains("CASE"))
                {
                    _logger?.LogDebug("Query contains LEFT JOIN with CASE expressions, applying special handling");
                    sql = ProcessLeftJoinWithCase(sql);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw it to avoid breaking the query
                _logger?.LogError(ex, "Error applying NOLOCK hints to SQL query");
            }

            return sql;
        }

        /// <summary>
        /// Process nested SELECT statements to add NOLOCK hints
        /// </summary>
        private string ProcessNestedSelects(string sql)
        {
            // Find all SELECT ... FROM patterns in the SQL
            var selectPattern = new Regex(@"SELECT\s+.*?\s+FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            return selectPattern.Replace(sql, match =>
            {
                string fullMatch = match.Value;
                string schema = match.Groups[1].Value;
                string table = match.Groups[2].Value;
                string alias = match.Groups[3].Success ? match.Groups[3].Value : null;

                int fromIndex = fullMatch.LastIndexOf("FROM");
                if (fromIndex >= 0)
                {
                    string beforeFrom = fullMatch.Substring(0, fromIndex + 4); // Include "FROM"
                    string afterFrom = fullMatch.Substring(fromIndex + 4);

                    if (string.IsNullOrEmpty(alias))
                    {
                        return $"{beforeFrom} [{schema}].[{table}] WITH (NOLOCK)";
                    }
                    else
                    {
                        return $"{beforeFrom} [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                    }
                }

                return fullMatch;
            });
        }

        /// <summary>
        /// Process derived tables in the FROM clause
        /// </summary>
        private string ProcessDerivedTables(string sql)
        {
            // Find all derived tables in the FROM clause
            var derivedTablePattern = new Regex(@"FROM\s+\(\s*SELECT.*?\)\s+AS\s+\[(\w+)\]",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            return derivedTablePattern.Replace(sql, match =>
            {
                string fullMatch = match.Value;
                string alias = match.Groups[1].Value;

                // Process the inner SELECT statement
                string innerSql = fullMatch;
                innerSql = ProcessSqlQuery(innerSql);

                return innerSql;
            });
        }

        /// <summary>
        /// Process LEFT JOIN with CASE expressions
        /// </summary>
        private string ProcessLeftJoinWithCase(string sql)
        {
            // Find all LEFT JOIN ... ON CASE patterns
            var leftJoinCasePattern = new Regex(
                @"LEFT\s+JOIN\s+\[(\w+)\]\.\[(\w+)\]\s+AS\s+\[(\w+)\]\s+ON\s+CASE",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            return leftJoinCasePattern.Replace(sql, match =>
            {
                string schema = match.Groups[1].Value;
                string table = match.Groups[2].Value;
                string alias = match.Groups[3].Value;

                return $"LEFT JOIN [{schema}].[{table}] AS [{alias}] WITH (NOLOCK) ON CASE";
            });
        }
    }
}
