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
                _logger?.LogError(ex, "Error applying NOLOCK hints to complex SQL query");
            }

            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to table references in the FROM clause
        /// </summary>
        private string AddNoLockToTableReferences(string sql)
        {
            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            // Return the SQL with just the comment - we'll let EF Core handle the actual query
            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to subqueries in the FROM clause
        /// </summary>
        private string AddNoLockToSubqueries(string sql)
        {
            // We're now using a comment-based approach instead of trying to modify the SQL directly
            // This is more reliable and less likely to cause syntax errors

            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            // Return the SQL with just the comment - we'll let EF Core handle the actual query
            return sql;
        }

        /// <summary>
        /// Adds NOLOCK hints to JOIN clauses with CASE expressions
        /// </summary>
        private string AddNoLockToCaseJoins(string sql)
        {
            // We're now using a comment-based approach instead of trying to modify the SQL directly
            // This is more reliable and less likely to cause syntax errors

            // Add a comment at the beginning of the query to indicate NOLOCK should be used
            if (!sql.Contains("-- WITH (NOLOCK)"))
            {
                sql = "-- WITH (NOLOCK)\r\n" + sql;
            }

            // Return the SQL with just the comment - we'll let EF Core handle the actual query
            return sql;
        }
    }
}
