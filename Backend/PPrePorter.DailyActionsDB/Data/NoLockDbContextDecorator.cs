using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Extensions;
using System;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Decorator for DbContext that automatically applies NOLOCK behavior to all queries
    /// </summary>
    /// <typeparam name="TContext">The type of DbContext to decorate</typeparam>
    public class NoLockDbContextDecorator<TContext> : IDisposable where TContext : DbContext
    {
        private readonly TContext _context;
        private readonly ILogger<NoLockDbContextDecorator<TContext>>? _logger;
        private bool _disposed = false;

        /// <summary>
        /// Gets the decorated DbContext
        /// </summary>
        public TContext Context => _context;

        /// <summary>
        /// Creates a new instance of the NoLockDbContextDecorator
        /// </summary>
        /// <param name="context">The DbContext to decorate</param>
        /// <param name="logger">Optional logger for diagnostic information</param>
        public NoLockDbContextDecorator(TContext context, ILogger<NoLockDbContextDecorator<TContext>>? logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;

            // Enable NOLOCK for all queries
            EnableNoLock();
        }

        /// <summary>
        /// Enables NOLOCK behavior for all queries
        /// </summary>
        /// <returns>True if the operation was successful, false otherwise</returns>
        public bool EnableNoLock()
        {
            return _context.EnableNoLockForAllQueries(_logger);
        }

        /// <summary>
        /// Resets the transaction isolation level to the default
        /// </summary>
        /// <returns>True if the operation was successful, false otherwise</returns>
        public bool ResetIsolationLevel()
        {
            return _context.ResetTransactionIsolationLevel(_logger);
        }

        /// <summary>
        /// Disposes the decorator and resets the transaction isolation level
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the decorator and optionally resets the transaction isolation level
        /// </summary>
        /// <param name="disposing">True if disposing, false if finalizing</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Reset the transaction isolation level
                    ResetIsolationLevel();

                    // Don't dispose the context here, as it might be managed by the DI container
                }

                _disposed = true;
            }
        }
    }
}
