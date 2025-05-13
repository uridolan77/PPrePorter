using Microsoft.EntityFrameworkCore;
using System.Data;
using DbIsolationLevel = System.Data.IsolationLevel;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Extension methods for DbContextOptionsBuilder
    /// </summary>
    public static class DbContextOptionsBuilderExtensions
    {
        /// <summary>
        /// Configures the DbContext to use the specified transaction isolation level for all operations
        /// </summary>
        /// <param name="optionsBuilder">The options builder</param>
        /// <param name="isolationLevel">The isolation level to use</param>
        /// <returns>The options builder for chaining</returns>
        public static DbContextOptionsBuilder UseReadUncommitted(this DbContextOptionsBuilder optionsBuilder)
        {
            // Register a DbContextInterceptor that will set the transaction isolation level
            optionsBuilder.AddInterceptors(new TransactionIsolationInterceptor(DbIsolationLevel.ReadUncommitted));
            return optionsBuilder;
        }
    }
}
