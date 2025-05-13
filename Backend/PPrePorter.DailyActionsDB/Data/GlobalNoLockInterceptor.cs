using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Global interceptor that adds NOLOCK hint to ALL database queries
    /// This interceptor is designed to be the last line of defense to ensure all queries have NOLOCK hints
    /// </summary>
    public class GlobalNoLockInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<GlobalNoLockInterceptor>? _logger;

        // We'll use a different approach that doesn't rely on regex for SQL modification
        // This is because regex-based SQL modification is prone to errors with complex queries

        public GlobalNoLockInterceptor(ILogger<GlobalNoLockInterceptor>? logger = null)
        {
            _logger = logger;
        }

        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            ApplyNoLockHint(command);
            return result;
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            ApplyNoLockHint(command);
            return ValueTask.FromResult(result);
        }

        private void ApplyNoLockHint(DbCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.CommandText))
            {
                return;
            }

            // Skip if not a SELECT statement or if it's a stored procedure
            if (!command.CommandText.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) ||
                command.CommandType == System.Data.CommandType.StoredProcedure)
            {
                return;
            }

            // Instead of modifying the SQL directly, we'll use a transaction with READ UNCOMMITTED isolation level
            // This achieves the same effect as NOLOCK hints but in a more reliable way
            try
            {
                if (command.Transaction == null)
                {
                    // Create a new transaction with READ UNCOMMITTED isolation level
                    var connection = command.Connection;
                    if (connection.State != System.Data.ConnectionState.Open)
                    {
                        connection.Open();
                    }

                    // Set the transaction isolation level to READ UNCOMMITTED
                    var transaction = connection.BeginTransaction(System.Data.IsolationLevel.ReadUncommitted);
                    command.Transaction = transaction;

                    _logger?.LogDebug("GlobalNoLockInterceptor: Applied READ UNCOMMITTED isolation level to command");
                }
            }
            catch (Exception ex)
            {
                // If anything goes wrong, log the error but continue with the original command
                _logger?.LogError(ex, "GlobalNoLockInterceptor: Error applying READ UNCOMMITTED isolation level");
            }
        }

        // We're using a simpler approach that doesn't need this method anymore
        // This is kept as a placeholder in case we need to add more complex processing in the future
        private string ProcessNestedSelects(string sql)
        {
            return sql;
        }
    }
}
