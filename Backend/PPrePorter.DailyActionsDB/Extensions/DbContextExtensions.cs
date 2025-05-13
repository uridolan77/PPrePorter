using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for DbContext
    /// </summary>
    public static class DbContextExtensions
    {
        /// <summary>
        /// Sets the transaction isolation level to READ UNCOMMITTED for all queries in this context
        /// This effectively applies NOLOCK behavior to all queries
        /// </summary>
        /// <param name="context">The DbContext to configure</param>
        /// <param name="logger">Optional logger for diagnostic information</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        public static bool EnableNoLockForAllQueries(this DbContext context, ILogger? logger = null)
        {
            try
            {
                // Execute raw SQL to set the transaction isolation level
                context.Database.ExecuteSqlRaw("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;");
                logger?.LogInformation("Set transaction isolation level to READ UNCOMMITTED for all queries");
                return true;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to set transaction isolation level to READ UNCOMMITTED");
                return false;
            }
        }

        /// <summary>
        /// Resets the transaction isolation level to the default (READ COMMITTED)
        /// </summary>
        /// <param name="context">The DbContext to configure</param>
        /// <param name="logger">Optional logger for diagnostic information</param>
        /// <returns>True if the operation was successful, false otherwise</returns>
        public static bool ResetTransactionIsolationLevel(this DbContext context, ILogger? logger = null)
        {
            try
            {
                // Execute raw SQL to reset the transaction isolation level
                context.Database.ExecuteSqlRaw("SET TRANSACTION ISOLATION LEVEL READ COMMITTED;");
                logger?.LogInformation("Reset transaction isolation level to READ COMMITTED");
                return true;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to reset transaction isolation level");
                return false;
            }
        }
    }
}
