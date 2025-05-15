using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using System;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for configuring DbContext to use NOLOCK behavior
    /// </summary>
    public static class DbContextNoLockExtensions
    {
        /// <summary>
        /// Adds the ReadUncommittedInterceptor to the DbContext options
        /// This will apply READ UNCOMMITTED isolation level to all database commands
        /// </summary>
        /// <param name="optionsBuilder">The DbContextOptionsBuilder to configure</param>
        /// <param name="serviceProvider">Optional service provider for resolving services</param>
        /// <param name="applyToAllCommands">If true, applies to all commands. If false, only applies to commands with specific tags</param>
        /// <returns>The configured DbContextOptionsBuilder</returns>
        public static DbContextOptionsBuilder UseReadUncommitted(
            this DbContextOptionsBuilder optionsBuilder,
            IServiceProvider? serviceProvider = null,
            bool applyToAllCommands = true)
        {
            // Get logger if service provider is available
            ILogger<ReadUncommittedInterceptor>? logger = null;
            if (serviceProvider != null)
            {
                try
                {
                    var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                    if (loggerFactory != null)
                    {
                        logger = loggerFactory.CreateLogger<ReadUncommittedInterceptor>();
                    }
                }
                catch
                {
                    // Ignore errors when trying to get the logger
                }
            }

            // Add the interceptor
            optionsBuilder.AddInterceptors(new ReadUncommittedInterceptor(logger, applyToAllCommands));

            return optionsBuilder;
        }

        /// <summary>
        /// Adds the ReadUncommittedInterceptor to the DbContextOptions
        /// This will apply READ UNCOMMITTED isolation level to all database commands
        /// </summary>
        /// <typeparam name="TContext">The type of DbContext being configured</typeparam>
        /// <param name="optionsBuilder">The DbContextOptionsBuilder to configure</param>
        /// <param name="serviceProvider">Optional service provider for resolving services</param>
        /// <param name="applyToAllCommands">If true, applies to all commands. If false, only applies to commands with specific tags</param>
        /// <returns>The configured DbContextOptionsBuilder</returns>
        public static DbContextOptionsBuilder<TContext> UseReadUncommitted<TContext>(
            this DbContextOptionsBuilder<TContext> optionsBuilder,
            IServiceProvider? serviceProvider = null,
            bool applyToAllCommands = true)
            where TContext : DbContext
        {
            // Call the non-generic version
            ((DbContextOptionsBuilder)optionsBuilder).UseReadUncommitted(serviceProvider, applyToAllCommands);
            
            return optionsBuilder;
        }
    }
}
