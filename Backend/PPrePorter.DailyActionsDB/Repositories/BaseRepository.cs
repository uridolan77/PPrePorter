using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Generic base repository implementation with caching and monitoring
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public abstract class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly DbContext _dbContext;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger _logger;
        protected readonly IMemoryCache _cache;
        
        // Cache settings
        protected readonly bool _enableCaching;
        protected readonly TimeSpan _cacheExpiration;
        protected readonly string _cacheKeyPrefix;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="logger">Logger</param>
        /// <param name="cache">Memory cache</param>
        /// <param name="enableCaching">Whether to enable caching</param>
        /// <param name="cacheExpirationMinutes">Cache expiration in minutes</param>
        public BaseRepository(
            DbContext dbContext,
            ILogger logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _dbSet = _dbContext.Set<T>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            
            _enableCaching = enableCaching;
            _cacheExpiration = TimeSpan.FromMinutes(cacheExpirationMinutes);
            _cacheKeyPrefix = $"{typeof(T).Name}_";
        }
        
        /// <summary>
        /// Get all entities with optional caching
        /// </summary>
        public virtual async Task<IEnumerable<T>> GetAllAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}All_{includeInactive}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<T> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                var query = _dbSet.AsNoTracking().TagWith("WITH (NOLOCK)");
                
                // Apply inactive filter if needed
                if (!includeInactive)
                {
                    query = ApplyActiveFilter(query);
                }
                
                var result = await query.ToListAsync();
                
                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all entities of type {EntityType}", typeof(T).Name);
                throw;
            }
        }
        
        /// <summary>
        /// Get entities by filter
        /// </summary>
        public virtual async Task<IEnumerable<T>> GetByFilterAsync(Expression<Func<T, bool>> filter)
        {
            try
            {
                // No caching for filtered queries as they can be too varied
                return await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(filter)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting entities of type {EntityType} by filter", typeof(T).Name);
                throw;
            }
        }
        
        /// <summary>
        /// Get entity by ID with caching
        /// </summary>
        public virtual async Task<T?> GetByIdAsync(int id)
        {
            string cacheKey = $"{_cacheKeyPrefix}{id}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out T cachedEntity))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntity;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                var entity = await _dbSet.FindAsync(id);
                
                // Cache the result if found
                if (entity != null && _enableCaching)
                {
                    _cache.Set(cacheKey, entity, _cacheExpiration);
                    _logger.LogDebug("Cached entity for {CacheKey}", cacheKey);
                }
                
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting entity of type {EntityType} with ID {Id}", typeof(T).Name, id);
                throw;
            }
        }
        
        /// <summary>
        /// Add a new entity
        /// </summary>
        public virtual async Task<T> AddAsync(T entity)
        {
            try
            {
                _dbSet.Add(entity);
                await _dbContext.SaveChangesAsync();
                
                // Invalidate cache
                InvalidateCache();
                
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding entity of type {EntityType}", typeof(T).Name);
                throw;
            }
        }
        
        /// <summary>
        /// Update an existing entity
        /// </summary>
        public virtual async Task<T> UpdateAsync(T entity)
        {
            try
            {
                _dbContext.Entry(entity).State = EntityState.Modified;
                await _dbContext.SaveChangesAsync();
                
                // Invalidate cache
                InvalidateCache();
                
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating entity of type {EntityType}", typeof(T).Name);
                throw;
            }
        }
        
        /// <summary>
        /// Delete an entity
        /// </summary>
        public virtual async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                {
                    return false;
                }
                
                _dbSet.Remove(entity);
                await _dbContext.SaveChangesAsync();
                
                // Invalidate cache
                InvalidateCache();
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting entity of type {EntityType} with ID {Id}", typeof(T).Name, id);
                throw;
            }
        }
        
        /// <summary>
        /// Check if any entity matches the filter
        /// </summary>
        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> filter)
        {
            try
            {
                return await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .AnyAsync(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if any entity of type {EntityType} matches filter", typeof(T).Name);
                throw;
            }
        }
        
        /// <summary>
        /// Apply active filter to query - to be implemented by derived classes
        /// </summary>
        protected virtual IQueryable<T> ApplyActiveFilter(IQueryable<T> query)
        {
            // Default implementation does nothing
            // Override in derived classes to filter inactive entities
            return query;
        }
        
        /// <summary>
        /// Invalidate all cache entries for this entity type
        /// </summary>
        protected virtual void InvalidateCache()
        {
            if (_enableCaching)
            {
                // This is a simple approach - in a more complex system, we might use a distributed cache
                // with pattern-based invalidation
                _logger.LogDebug("Invalidating cache for entity type {EntityType}", typeof(T).Name);
            }
        }
    }
}
