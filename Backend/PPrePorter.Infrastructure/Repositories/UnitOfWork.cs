using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Common;
using System.Collections.Concurrent;

namespace PPrePorter.Infrastructure.Repositories
{
    /// <summary>
    /// Unit of work implementation for managing transactions
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DbContext _dbContext;
        private readonly ILoggerFactory _loggerFactory;
        private readonly ConcurrentDictionary<Type, object> _repositories;
        private IDbContextTransaction? _transaction;
        private bool _disposed;

        public UnitOfWork(DbContext dbContext, ILoggerFactory loggerFactory)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
            _repositories = new ConcurrentDictionary<Type, object>();
        }

        /// <summary>
        /// Gets a repository for the specified entity type
        /// </summary>
        public IRepository<T> Repository<T>() where T : BaseEntity
        {
            return (IRepository<T>)_repositories.GetOrAdd(
                typeof(T),
                entityType => CreateRepository<T>());
        }

        /// <summary>
        /// Creates a new repository for the specified entity type
        /// </summary>
        private IRepository<T> CreateRepository<T>() where T : BaseEntity
        {
            var logger = _loggerFactory.CreateLogger<Repository<T>>();
            return new Repository<T>(_dbContext, logger);
        }

        /// <summary>
        /// Saves all changes made in this unit of work to the database
        /// </summary>
        public async Task<int> SaveChangesAsync()
        {
            return await _dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// Begins a transaction
        /// </summary>
        public async Task BeginTransactionAsync()
        {
            if (_transaction != null)
            {
                throw new InvalidOperationException("A transaction is already in progress");
            }

            _transaction = await _dbContext.Database.BeginTransactionAsync();
        }

        /// <summary>
        /// Commits the transaction
        /// </summary>
        public async Task CommitTransactionAsync()
        {
            try
            {
                await SaveChangesAsync();

                if (_transaction == null)
                {
                    throw new InvalidOperationException("No transaction to commit");
                }

                await _transaction.CommitAsync();
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        /// <summary>
        /// Rolls back the transaction
        /// </summary>
        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_transaction == null)
                {
                    throw new InvalidOperationException("No transaction to roll back");
                }

                await _transaction.RollbackAsync();
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        /// <summary>
        /// Disposes the unit of work
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the unit of work
        /// </summary>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                _transaction?.Dispose();
                _dbContext.Dispose();
                _disposed = true;
            }
        }
    }
}
