using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.Common;

namespace PPrePorter.DailyActionsDB.Interceptors
{
    /// <summary>
    /// Interceptor to set the isolation level for all database commands
    /// </summary>
    public class IsolationLevelInterceptor : DbCommandInterceptor
    {
        private readonly IsolationLevel _isolationLevel;
        private readonly ILogger<IsolationLevelInterceptor> _logger;

        /// <summary>
        /// Creates a new instance of the IsolationLevelInterceptor
        /// </summary>
        /// <param name="isolationLevel">The isolation level to use for all commands</param>
        /// <param name="logger">Logger for diagnostic information</param>
        public IsolationLevelInterceptor(IsolationLevel isolationLevel, ILogger<IsolationLevelInterceptor> logger = null)
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
            try
            {
                // Set the transaction isolation level if there's no transaction
                if (command.Transaction == null)
                {
                    _logger?.LogDebug("Setting isolation level to {IsolationLevel} for command", _isolationLevel);
                    command.Connection.EnlistTransaction(null);
                    var transaction = command.Connection.BeginTransaction(_isolationLevel);
                    command.Transaction = transaction;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting isolation level to {IsolationLevel}", _isolationLevel);
            }

            return result;
        }
    }

    /// <summary>
    /// Static class to register interceptors
    /// </summary>
    public static class DbInterception
    {
        /// <summary>
        /// Adds an interceptor to the global interceptor collection
        /// </summary>
        /// <param name="interceptor">The interceptor to add</param>
        public static void Add(DbCommandInterceptor interceptor)
        {
            // In EF Core, interceptors are registered through the DbContextOptionsBuilder
            // This is a placeholder method to maintain compatibility with the existing code
            // The actual registration should happen in the service registration
        }
    }
}
