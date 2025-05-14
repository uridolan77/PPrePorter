using Microsoft.EntityFrameworkCore.Diagnostics;
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

        /// <summary>
        /// Creates a new instance of the IsolationLevelInterceptor
        /// </summary>
        /// <param name="isolationLevel">The isolation level to use for all commands</param>
        public IsolationLevelInterceptor(IsolationLevel isolationLevel)
        {
            _isolationLevel = isolationLevel;
        }

        /// <summary>
        /// Called before a command is executed
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            // Set the transaction isolation level if there's no transaction
            if (command.Transaction == null)
            {
                command.Connection.EnlistTransaction(null);
                var transaction = command.Connection.BeginTransaction(_isolationLevel);
                command.Transaction = transaction;
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
