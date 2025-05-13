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

            try
            {
                // Add NOLOCK hints to FROM clauses
                sql = TablePattern.Replace(sql, "FROM [$1].[$2]$3 WITH (NOLOCK)");

                // Add NOLOCK hints to JOIN clauses
                sql = JoinPattern.Replace(sql, "$1 JOIN [$2].[$3]$4 WITH (NOLOCK)");

                // Add NOLOCK hints to subquery table references
                sql = SubqueryTablePattern.Replace(sql, "FROM [$1].[$2] AS [$3] WITH (NOLOCK)");

                // Process nested SELECT statements
                sql = ProcessNestedSelects(sql);

                // Process derived tables
                sql = ProcessDerivedTables(sql);

                // Process LEFT JOIN with CASE expressions
                sql = ProcessLeftJoinWithCase(sql);

                // Log the modified SQL for debugging (truncate if too long)
                if (sql.Length > 500)
                {
                    _logger?.LogDebug("Modified SQL with NOLOCK (truncated): {CommandText}...", sql.Substring(0, 500));
                }
                else
                {
                    _logger?.LogDebug("Modified SQL with NOLOCK: {CommandText}", sql);
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
            // Define a regex pattern to match nested SELECT statements
            var nestedSelectPattern = new Regex(
                @"(\(SELECT\s+.*?FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\)))",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Find all nested SELECT statements
            var matches = nestedSelectPattern.Matches(sql);

            // Process each nested SELECT
            foreach (Match match in matches)
            {
                if (match.Success)
                {
                    string nestedSelect = match.Groups[1].Value;
                    string schema = match.Groups[2].Value;
                    string table = match.Groups[3].Value;
                    string alias = match.Groups[4].Value;

                    // Add NOLOCK hint to the table in the nested SELECT
                    string modifiedNestedSelect = nestedSelect.Replace(
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")}",
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")} WITH (NOLOCK)");

                    // Replace the original nested SELECT with the modified one
                    sql = sql.Replace(nestedSelect, modifiedNestedSelect);
                }
            }

            return sql;
        }

        /// <summary>
        /// Process derived tables in the FROM clause
        /// </summary>
        private string ProcessDerivedTables(string sql)
        {
            // For derived tables, we need to add NOLOCK hints to the tables inside the derived table

            // Define a regex pattern to match derived tables
            var derivedTablePattern = new Regex(
                @"FROM\s+\(\s*SELECT\s+.*?FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Find all derived tables
            var matches = derivedTablePattern.Matches(sql);

            // Process each derived table
            foreach (Match match in matches)
            {
                if (match.Success)
                {
                    string derivedTable = match.Value;
                    string schema = match.Groups[1].Value;
                    string table = match.Groups[2].Value;
                    string alias = match.Groups[3].Value;

                    // Add NOLOCK hint to the table in the derived table
                    string modifiedDerivedTable = derivedTable.Replace(
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")}",
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")} WITH (NOLOCK)");

                    // Replace the original derived table with the modified one
                    sql = sql.Replace(derivedTable, modifiedDerivedTable);
                }
            }

            return sql;
        }

        /// <summary>
        /// Process LEFT JOIN with CASE expressions
        /// </summary>
        private string ProcessLeftJoinWithCase(string sql)
        {
            // For LEFT JOIN with CASE expressions, we need to add NOLOCK hints to the tables

            // Define a regex pattern to match LEFT JOIN with CASE expressions
            var leftJoinCasePattern = new Regex(
                @"LEFT JOIN\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))\s+ON\s+CASE\s+WHEN",
                RegexOptions.Compiled | RegexOptions.IgnoreCase);

            // Add NOLOCK hints to these JOIN clauses
            sql = leftJoinCasePattern.Replace(sql, "LEFT JOIN [$1].[$2]$3 WITH (NOLOCK) ON CASE WHEN");

            return sql;
        }
    }
}
