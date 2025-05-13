using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using DbIsolationLevel = System.Data.IsolationLevel;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Interceptor that sets the transaction isolation level for all database operations
    /// </summary>
    public class TransactionIsolationInterceptor : DbCommandInterceptor
    {
        private readonly IsolationLevel _isolationLevel;
        private readonly ILogger<TransactionIsolationInterceptor>? _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="isolationLevel">The isolation level to use</param>
        /// <param name="logger">Optional logger</param>
        public TransactionIsolationInterceptor(IsolationLevel isolationLevel, ILogger<TransactionIsolationInterceptor>? logger = null)
        {
            _isolationLevel = isolationLevel;
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
            ApplyIsolationLevel(command);
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
            ApplyIsolationLevel(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Applies the isolation level to the command
        /// </summary>
        private void ApplyIsolationLevel(DbCommand command)
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

            try
            {
                // Only apply if there's no transaction already
                if (command.Transaction == null)
                {
                    // Create a new transaction with the specified isolation level
                    var connection = command.Connection;
                    if (connection.State != ConnectionState.Open)
                    {
                        connection.Open();
                    }

                    // Set the transaction isolation level
                    var transaction = connection.BeginTransaction((DbIsolationLevel)_isolationLevel);
                    command.Transaction = transaction;

                    _logger?.LogDebug("TransactionIsolationInterceptor: Applied {IsolationLevel} isolation level to command", _isolationLevel);
                }
            }
            catch (Exception ex)
            {
                // If anything goes wrong, log the error but continue with the original command
                _logger?.LogError(ex, "TransactionIsolationInterceptor: Error applying {IsolationLevel} isolation level", _isolationLevel);
            }
        }
    }
}
