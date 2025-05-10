using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using System;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Unit of Work implementation for managing DbContext lifecycle and transactions
    /// </summary>
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly DailyActionsDbContext _dbContext;
        private readonly ILogger<UnitOfWork> _logger;
        private bool _disposed;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="logger">Logger</param>
        public UnitOfWork(DailyActionsDbContext dbContext, ILogger<UnitOfWork> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _disposed = false;
        }

        /// <summary>
        /// Get the DbContext
        /// </summary>
        public DailyActionsDbContext DbContext => _dbContext;

        /// <summary>
        /// Begin a transaction
        /// </summary>
        public async Task BeginTransactionAsync()
        {
            _logger.LogInformation("Beginning transaction");
            await _dbContext.Database.BeginTransactionAsync();
        }

        /// <summary>
        /// Commit the transaction
        /// </summary>
        public async Task CommitTransactionAsync()
        {
            _logger.LogInformation("Committing transaction");
            await _dbContext.Database.CommitTransactionAsync();
        }

        /// <summary>
        /// Rollback the transaction
        /// </summary>
        public async Task RollbackTransactionAsync()
        {
            _logger.LogInformation("Rolling back transaction");
            await _dbContext.Database.RollbackTransactionAsync();
        }

        /// <summary>
        /// Save changes to the database
        /// </summary>
        public async Task<int> SaveChangesAsync()
        {
            try
            {
                _logger.LogInformation("Saving changes to database");
                return await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving changes to database");
                throw;
            }
        }

        /// <summary>
        /// Dispose the unit of work
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Dispose the unit of work
        /// </summary>
        /// <param name="disposing">Whether to dispose managed resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources
                    _dbContext.Dispose();
                }

                _disposed = true;
            }
        }
    }
}
