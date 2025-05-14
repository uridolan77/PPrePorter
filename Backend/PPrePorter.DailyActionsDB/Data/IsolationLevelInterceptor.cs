using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Interceptor that applies a specific isolation level to all database commands
    /// This is used to implement NOLOCK behavior by setting the isolation level to READ UNCOMMITTED
    /// </summary>
    public class IsolationLevelInterceptor : DbCommandInterceptor
    {
        private readonly IsolationLevel _isolationLevel;
        private readonly ILogger<IsolationLevelInterceptor>? _logger;

        /// <summary>
        /// Creates a new instance of the IsolationLevelInterceptor
        /// </summary>
        /// <param name="isolationLevel">The isolation level to apply to all commands</param>
        /// <param name="logger">Optional logger for diagnostic information</param>
        public IsolationLevelInterceptor(IsolationLevel isolationLevel, ILogger<IsolationLevelInterceptor>? logger = null)
        {
            _isolationLevel = isolationLevel;
            _logger = logger;
        }

        /// <summary>
        /// Intercepts the command before it is executed to read data and applies the specified isolation level
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            SetTransaction(command);
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously to read data and applies the specified isolation level
        /// </summary>
        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            SetTransaction(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Intercepts the command before it is executed to return a scalar value and applies the specified isolation level
        /// </summary>
        public override InterceptionResult<object> ScalarExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<object> result)
        {
            SetTransaction(command);
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously to return a scalar value and applies the specified isolation level
        /// </summary>
        public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<object> result,
            CancellationToken cancellationToken = default)
        {
            SetTransaction(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Intercepts the command before it is executed to perform a non-query operation and applies the specified isolation level
        /// </summary>
        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result)
        {
            SetTransaction(command);
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously to perform a non-query operation and applies the specified isolation level
        /// </summary>
        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            SetTransaction(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Sets the transaction isolation level for the command
        /// </summary>
        /// <param name="command">The command to set the transaction for</param>
        private void SetTransaction(DbCommand command)
        {
            if (command == null)
            {
                return;
            }

            try
            {
                // Only set the transaction if one doesn't already exist
                if (command.Transaction == null)
                {
                    // Ensure the connection is open
                    var connection = command.Connection;
                    if (connection != null)
                    {
                        if (connection.State != ConnectionState.Open)
                        {
                            connection.Open();
                        }

                        // Begin a transaction with the specified isolation level
                        var transaction = connection.BeginTransaction(_isolationLevel);
                        command.Transaction = transaction;

                        _logger?.LogDebug("Applied isolation level {IsolationLevel} to command: {CommandText}",
                            _isolationLevel, command.CommandText?.Substring(0, Math.Min(100, command.CommandText?.Length ?? 0)));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting transaction isolation level to {IsolationLevel}", _isolationLevel);
                // Don't throw the exception - let the command execute with the default isolation level
            }
        }
    }
}
