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
    /// Specialized interceptor for adding NOLOCK hints to complex SQL queries with subqueries and CASE expressions
    /// </summary>
    public class ComplexQueryNoLockInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<ComplexQueryNoLockInterceptor>? _logger;

        public ComplexQueryNoLockInterceptor(ILogger<ComplexQueryNoLockInterceptor>? logger = null)
        {
            _logger = logger;
        }

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
                command.CommandText = ProcessComplexQuery(command.CommandText);

                // Log the transformation if it changed
                if (originalSql != command.CommandText)
                {
                    _logger?.LogDebug("Applied NOLOCK hints to complex SQL query. Original length: {OriginalLength}, Modified length: {ModifiedLength}",
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
                command.CommandText = ProcessComplexQuery(command.CommandText);

                // Log the transformation if it changed
                if (originalSql != command.CommandText)
                {
                    _logger?.LogDebug("Applied NOLOCK hints to complex SQL query. Original length: {OriginalLength}, Modified length: {ModifiedLength}",
                        originalSql.Length, command.CommandText.Length);
                }
            }
            return new ValueTask<InterceptionResult<DbDataReader>>(result);
        }

        // Regular expressions for matching table references in complex queries
        private static readonly Regex ComplexFromPattern = new Regex(
            @"FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex ComplexJoinPattern = new Regex(
            @"(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex SubqueryPattern = new Regex(
            @"(\(SELECT\s+.*?FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\)))",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

        /// <summary>
        /// Processes a complex SQL query to add NOLOCK hints to all tables
        /// </summary>
        private string ProcessComplexQuery(string sql)
        {
            // Only process SELECT statements
            if (!sql.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                return sql;
            }

            try
            {
                // Add NOLOCK hints to FROM clauses in the main query
                sql = ComplexFromPattern.Replace(sql, "FROM [$1].[$2]$3 WITH (NOLOCK)");

                // Add NOLOCK hints to JOIN clauses in the main query
                sql = ComplexJoinPattern.Replace(sql, "$1 JOIN [$2].[$3]$4 WITH (NOLOCK)");

                // Process subqueries
                sql = AddNoLockToSubqueries(sql);

                // Process CASE expressions in JOIN clauses
                sql = AddNoLockToCaseJoins(sql);

                // Log the modified SQL for debugging
                _logger?.LogDebug("Modified complex SQL with NOLOCK: {CommandText}",
                    sql.Length > 500 ? sql.Substring(0, 500) + "..." : sql);
            }
            catch (Exception ex)
            {
                // Log the error but don't throw it to avoid breaking the query
                _logger?.LogError(ex, "Error applying NOLOCK hints to complex SQL query");
            }

            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to table references in the FROM clause
        /// </summary>
        private string AddNoLockToTableReferences(string sql)
        {
            // Use regex to find all table references in the FROM clause and add NOLOCK hints
            sql = ComplexFromPattern.Replace(sql, "FROM [$1].[$2]$3 WITH (NOLOCK)");
            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to subqueries in the FROM clause
        /// </summary>
        private string AddNoLockToSubqueries(string sql)
        {
            // Find all subqueries in the SQL
            var matches = SubqueryPattern.Matches(sql);

            // Process each subquery
            foreach (Match match in matches)
            {
                if (match.Success)
                {
                    string subquery = match.Groups[1].Value;
                    string schema = match.Groups[2].Value;
                    string table = match.Groups[3].Value;
                    string alias = match.Groups[4].Value;

                    // Add NOLOCK hint to the table in the subquery
                    string modifiedSubquery = subquery.Replace(
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")}",
                        $"FROM [{schema}].[{table}]{(string.IsNullOrEmpty(alias) ? "" : $" AS [{alias}]")} WITH (NOLOCK)");

                    // Replace the original subquery with the modified one
                    sql = sql.Replace(subquery, modifiedSubquery);
                }
            }

            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to JOIN clauses with CASE expressions
        /// </summary>
        private string AddNoLockToCaseJoins(string sql)
        {
            // This is a more complex case that requires special handling
            // Look for JOIN clauses that contain CASE expressions

            // First, add NOLOCK hints to all regular JOIN clauses
            sql = ComplexJoinPattern.Replace(sql, "$1 JOIN [$2].[$3]$4 WITH (NOLOCK)");

            // For CASE expressions in JOIN clauses, we need a more sophisticated approach
            // This is a simplified version that handles common patterns

            // Look for LEFT JOIN with CASE WHEN
            if (sql.Contains("LEFT JOIN") && sql.Contains("CASE WHEN"))
            {
                // Find all LEFT JOIN clauses that contain CASE expressions
                var leftJoinCasePattern = new Regex(
                    @"LEFT JOIN\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))\s+ON\s+CASE\s+WHEN",
                    RegexOptions.IgnoreCase | RegexOptions.Compiled);

                // Add NOLOCK hints to these JOIN clauses
                sql = leftJoinCasePattern.Replace(sql, "LEFT JOIN [$1].[$2]$3 WITH (NOLOCK) ON CASE WHEN");
            }

            return sql;
        }
    }
}
