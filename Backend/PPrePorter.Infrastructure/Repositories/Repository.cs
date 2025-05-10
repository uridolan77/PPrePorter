using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Common;
using System.Linq.Expressions;

namespace PPrePorter.Infrastructure.Repositories
{
    /// <summary>
    /// Generic repository implementation for CRUD operations
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly DbContext _dbContext;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger<Repository<T>> _logger;

        public Repository(DbContext dbContext, ILogger<Repository<T>> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _dbSet = _dbContext.Set<T>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets an entity by ID
        /// </summary>
        public virtual async Task<T?> GetByIdAsync(int id)
        {
            try
            {
                return await _dbSet.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting entity of type {EntityType} with ID {Id}", typeof(T).Name, id);
                throw;
            }
        }

        /// <summary>
        /// Gets all entities
        /// </summary>
        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            try
            {
                return await _dbSet.AsNoTracking().ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all entities of type {EntityType}", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Gets entities that match the specified predicate
        /// </summary>
        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.AsNoTracking().Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding entities of type {EntityType} with predicate", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Gets a single entity that matches the specified predicate
        /// </summary>
        public virtual async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.AsNoTracking().FirstOrDefaultAsync(predicate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding one entity of type {EntityType} with predicate", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Adds a new entity
        /// </summary>
        public virtual async Task<T> AddAsync(T entity)
        {
            try
            {
                var result = await _dbSet.AddAsync(entity);
                return result.Entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding entity of type {EntityType}", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Updates an existing entity
        /// </summary>
        public virtual Task UpdateAsync(T entity)
        {
            try
            {
                _dbSet.Update(entity);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating entity of type {EntityType} with ID {Id}", typeof(T).Name, entity.Id);
                throw;
            }
        }

        /// <summary>
        /// Deletes an entity by ID
        /// </summary>
        public virtual async Task DeleteAsync(int id)
        {
            try
            {
                var entity = await GetByIdAsync(id);
                if (entity != null)
                {
                    _dbSet.Remove(entity);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting entity of type {EntityType} with ID {Id}", typeof(T).Name, id);
                throw;
            }
        }

        /// <summary>
        /// Gets a queryable for the entity
        /// </summary>
        public virtual IQueryable<T> Query()
        {
            try
            {
                // Add NOLOCK hint for SQL Server
                return _dbSet.TagWith("WITH (NOLOCK)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting query for entity of type {EntityType}", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Gets a queryable with no tracking for the entity
        /// </summary>
        public virtual IQueryable<T> QueryNoTracking()
        {
            try
            {
                // Add NOLOCK hint for SQL Server
                return _dbSet.AsNoTracking().TagWith("WITH (NOLOCK)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting no-tracking query for entity of type {EntityType}", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Checks if any entity matches the specified predicate
        /// </summary>
        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.AsNoTracking().AnyAsync(predicate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if any entity of type {EntityType} matches predicate", typeof(T).Name);
                throw;
            }
        }

        /// <summary>
        /// Counts entities that match the specified predicate
        /// </summary>
        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.AsNoTracking().CountAsync(predicate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting entities of type {EntityType} with predicate", typeof(T).Name);
                throw;
            }
        }
    }
}
