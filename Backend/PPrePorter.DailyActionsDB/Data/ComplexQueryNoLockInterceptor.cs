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
                // Check for special tags in the SQL comment
                bool isComplexQuery = sql.Contains("COMPLEX_QUERY", StringComparison.OrdinalIgnoreCase);
                bool hasCaseExpressions = sql.Contains("CASE_EXPRESSIONS", StringComparison.OrdinalIgnoreCase);

                // Remove the comment tags from the SQL
                sql = Regex.Replace(sql, @"--\s*WITH\s*\(NOLOCK\)\s*COMPLEX_QUERY\s*\n", string.Empty, RegexOptions.IgnoreCase);
                sql = Regex.Replace(sql, @"--\s*WITH\s*\(NOLOCK\)\s*CASE_EXPRESSIONS\s*\n", string.Empty, RegexOptions.IgnoreCase);

                // For complex queries with subqueries and CASE expressions, we'll use a different approach
                // We'll parse the SQL and add NOLOCK hints to each table reference

                // First, handle direct table references in the FROM clause
                sql = AddNoLockToTableReferences(sql);

                // Then, handle subqueries in the FROM clause if it's a complex query
                if (isComplexQuery || sql.Contains("(SELECT") || sql.Contains("( SELECT"))
                {
                    _logger?.LogDebug("Processing complex query with subqueries");
                    sql = AddNoLockToSubqueries(sql);
                }

                // Finally, handle CASE expressions in JOIN clauses if needed
                if (hasCaseExpressions || sql.Contains("CASE") || sql.Contains("LEFT JOIN") && sql.Contains("ON CASE"))
                {
                    _logger?.LogDebug("Processing query with CASE expressions");
                    sql = AddNoLockToCaseJoins(sql);
                }
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
            // Match table references in the FROM clause
            var tablePattern = new Regex(@"(FROM|JOIN)\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
                RegexOptions.Compiled | RegexOptions.IgnoreCase);

            return tablePattern.Replace(sql, match =>
            {
                string clause = match.Groups[1].Value; // FROM or JOIN
                string schema = match.Groups[2].Value;
                string table = match.Groups[3].Value;
                string alias = match.Groups[4].Success ? match.Groups[4].Value : null;

                if (string.IsNullOrEmpty(alias))
                {
                    return $"{clause} [{schema}].[{table}] WITH (NOLOCK)";
                }
                else
                {
                    return $"{clause} [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                }
            });
        }

        /// <summary>
        /// Adds NOLOCK hints to subqueries in the FROM clause
        /// </summary>
        private string AddNoLockToSubqueries(string sql)
        {
            // Match subqueries in the FROM clause
            var subqueryPattern = new Regex(@"FROM\s+\(\s*SELECT\s+.*?FROM\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            return subqueryPattern.Replace(sql, match =>
            {
                string fullMatch = match.Value;
                string schema = match.Groups[1].Value;
                string table = match.Groups[2].Value;
                string alias = match.Groups[3].Success ? match.Groups[3].Value : null;

                int fromIndex = fullMatch.LastIndexOf("FROM");
                if (fromIndex >= 0)
                {
                    string beforeFrom = fullMatch.Substring(0, fromIndex + 4); // Include "FROM"

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
        /// Adds NOLOCK hints to JOIN clauses with CASE expressions
        /// </summary>
        private string AddNoLockToCaseJoins(string sql)
        {
            // Match JOIN clauses with CASE expressions
            var caseJoinPattern = new Regex(@"(LEFT|RIGHT|INNER|CROSS)?\s*JOIN\s+\[(\w+)\]\.\[(\w+)\](?:\s+(?:AS\s+)?\[(\w+)\])?(?!\s+WITH\s*\(NOLOCK\))\s+ON\s+CASE",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            sql = caseJoinPattern.Replace(sql, match =>
            {
                string joinType = match.Groups[1].Success ? match.Groups[1].Value : string.Empty;
                string schema = match.Groups[2].Value;
                string table = match.Groups[3].Value;
                string alias = match.Groups[4].Success ? match.Groups[4].Value : null;

                string joinClause = !string.IsNullOrEmpty(joinType) ? $"{joinType} JOIN" : "JOIN";

                if (string.IsNullOrEmpty(alias))
                {
                    return $"{joinClause} [{schema}].[{table}] WITH (NOLOCK) ON CASE";
                }
                else
                {
                    return $"{joinClause} [{schema}].[{table}] AS [{alias}] WITH (NOLOCK) ON CASE";
                }
            });

            // Special handling for the specific pattern in your query
            // This pattern matches LEFT JOIN with a complex CASE expression that includes subqueries
            var complexCaseJoinPattern = new Regex(
                @"LEFT\s+JOIN\s+\[(\w+)\]\.\[(\w+)\]\s+AS\s+\[(\w+)\](?!\s+WITH\s*\(NOLOCK\))\s+ON\s+CASE\s+WHEN.*?END\s+=\s+\[(\w+)\]\.(\w+)",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

            return complexCaseJoinPattern.Replace(sql, match =>
            {
                string schema = match.Groups[1].Value;
                string table = match.Groups[2].Value;
                string alias = match.Groups[3].Value;
                string rightAlias = match.Groups[4].Value;
                string rightColumn = match.Groups[5].Value;

                // Extract the full CASE expression
                int startIndex = match.Value.IndexOf("ON CASE");
                if (startIndex >= 0)
                {
                    string beforeCase = match.Value.Substring(0, startIndex + 2); // Include "ON"
                    string caseExpression = match.Value.Substring(startIndex + 3); // Skip "ON "

                    return $"LEFT JOIN [{schema}].[{table}] AS [{alias}] WITH (NOLOCK) ON {caseExpression}";
                }

                // Fallback if we can't extract the CASE expression
                return $"LEFT JOIN [{schema}].[{table}] AS [{alias}] WITH (NOLOCK) ON CASE WHEN ... END = [{rightAlias}].{rightColumn}";
            });
        }
    }
}
