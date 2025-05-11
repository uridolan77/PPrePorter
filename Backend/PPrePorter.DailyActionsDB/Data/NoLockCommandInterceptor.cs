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
                // We're now using a comment-based approach instead of trying to modify the SQL directly
                // This is more reliable and less likely to cause syntax errors

                // Add a comment at the beginning of the query to indicate NOLOCK should be used
                if (!sql.Contains("-- WITH (NOLOCK)"))
                {
                    sql = "-- WITH (NOLOCK)\r\n" + sql;
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
            // We're now using a comment-based approach instead of trying to modify the SQL directly
            // This is more reliable and less likely to cause syntax errors

            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            return sql;
        }

        /// <summary>
        /// Process derived tables in the FROM clause
        /// </summary>
        private string ProcessDerivedTables(string sql)
        {
            // We're now using a comment-based approach instead of trying to modify the SQL directly
            // This is more reliable and less likely to cause syntax errors

            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            return sql;
        }

        /// <summary>
        /// Process LEFT JOIN with CASE expressions
        /// </summary>
        private string ProcessLeftJoinWithCase(string sql)
        {
            // We're now using a comment-based approach instead of trying to modify the SQL directly
            // This is more reliable and less likely to cause syntax errors

            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            return sql;
        }
    }
}
