using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.Common;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Interceptor that applies NOLOCK hints to all tables in SQL queries
    /// </summary>
    public class ReadUncommittedInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<ReadUncommittedInterceptor>? _logger;
        private readonly bool _applyToAllCommands;
        private static readonly Regex _fromTableRegex = new Regex(@"FROM\s+\[?(\w+)\]?\.\[?(\w+)\]?\s+AS\s+\[(\w+)\]", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex _joinTableRegex = new Regex(@"JOIN\s+\[?(\w+)\]?\.\[?(\w+)\]?\s+AS\s+\[(\w+)\]", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        /// <summary>
        /// Creates a new instance of ReadUncommittedInterceptor
        /// </summary>
        /// <param name="logger">Optional logger for diagnostic information</param>
        /// <param name="applyToAllCommands">If true, applies to all commands. If false, only applies to commands with specific tags</param>
        public ReadUncommittedInterceptor(ILogger<ReadUncommittedInterceptor>? logger = null, bool applyToAllCommands = true)
        {
            _logger = logger;
            _applyToAllCommands = applyToAllCommands;
        }

        /// <summary>
        /// Intercepts the command before it is executed and applies NOLOCK hints
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            ApplyNoLockHints(command);
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously and applies NOLOCK hints
        /// </summary>
        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            ApplyNoLockHints(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Applies NOLOCK hints to all tables in the command
        /// </summary>
        private void ApplyNoLockHints(DbCommand command)
        {
            // Only apply to SELECT statements or if configured to apply to all commands
            if (_applyToAllCommands ||
                (command.CommandText?.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) == true))
            {
                // Check if this command should use NOLOCK hints
                bool shouldApply = _applyToAllCommands ||
                                  command.CommandText.Contains("WITH (NOLOCK)", StringComparison.OrdinalIgnoreCase) ||
                                  command.CommandText.Contains("FORCE_NOLOCK_ON_ALL_TABLES", StringComparison.OrdinalIgnoreCase);

                if (shouldApply)
                {
                    try
                    {
                        // Apply both approaches for maximum compatibility

                        // Approach 1: Modify SQL to add NOLOCK hints
                        string originalSql = command.CommandText;
                        string modifiedSql = AddNoLockHintsToSql(originalSql);

                        if (originalSql != modifiedSql)
                        {
                            command.CommandText = modifiedSql;
                            _logger?.LogDebug("Applied NOLOCK hints to SQL query");
                        }

                        // Approach 2: Use READ UNCOMMITTED isolation level as a fallback
                        if (command.Transaction == null)
                        {
                            var connection = command.Connection;

                            // Ensure the connection is open
                            if (connection.State != ConnectionState.Open)
                            {
                                connection.Open();
                                _logger?.LogDebug("Opened connection to apply READ UNCOMMITTED isolation level");
                            }

                            // Create a transaction with READ UNCOMMITTED isolation level
                            var transaction = connection.BeginTransaction(IsolationLevel.ReadUncommitted);
                            command.Transaction = transaction;

                            _logger?.LogDebug("Applied READ UNCOMMITTED isolation level to command");
                        }
                        else if (command.Transaction.IsolationLevel != IsolationLevel.ReadUncommitted)
                        {
                            _logger?.LogWarning(
                                "Command already has a transaction with isolation level {IsolationLevel}, " +
                                "cannot apply READ UNCOMMITTED isolation level",
                                command.Transaction.IsolationLevel);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log the error but don't throw it to avoid breaking the query
                        _logger?.LogError(ex, "Error applying NOLOCK hints to command");
                    }
                }
            }
        }

        /// <summary>
        /// Adds NOLOCK hints to all tables in the SQL query
        /// </summary>
        private string AddNoLockHintsToSql(string sql)
        {
            try
            {
                // Add NOLOCK hints to FROM clauses
                sql = _fromTableRegex.Replace(sql, "FROM [$1].[$2] AS [$3] WITH (NOLOCK)");

                // Add NOLOCK hints to JOIN clauses
                sql = _joinTableRegex.Replace(sql, "JOIN [$1].[$2] AS [$3] WITH (NOLOCK)");

                return sql;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adding NOLOCK hints to SQL query");
                return sql; // Return original SQL if there's an error
            }
        }
    }
}
