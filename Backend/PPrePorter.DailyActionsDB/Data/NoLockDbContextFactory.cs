using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Factory for creating NoLockDbContextDecorator instances
    /// </summary>
    public class NoLockDbContextFactory
    {
        private readonly IServiceProvider _serviceProvider;

        /// <summary>
        /// Creates a new instance of the NoLockDbContextFactory
        /// </summary>
        /// <param name="serviceProvider">The service provider to use for resolving dependencies</param>
        public NoLockDbContextFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        /// <summary>
        /// Creates a new NoLockDbContextDecorator for the specified DbContext type
        /// </summary>
        /// <typeparam name="TContext">The type of DbContext to decorate</typeparam>
        /// <returns>A new NoLockDbContextDecorator instance</returns>
        public NoLockDbContextDecorator<TContext> CreateNoLockContext<TContext>() where TContext : DbContext
        {
            // Resolve the DbContext from the service provider
            var context = _serviceProvider.GetRequiredService<TContext>();

            // Resolve the logger if available
            var logger = _serviceProvider.GetService<ILogger<NoLockDbContextDecorator<TContext>>>();

            // Create and return the decorator
            return new NoLockDbContextDecorator<TContext>(context, logger);
        }
    }
}
