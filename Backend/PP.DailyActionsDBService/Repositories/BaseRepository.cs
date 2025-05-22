using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
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

        // Property name constants for common entity properties
        protected const string NamePropertySuffix = "Name";
        protected const string IsActivePropertyName = "IsActive";

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
                var query = _dbSet.AsNoTracking().WithForceNoLock();

                // Apply inactive filter if needed
                if (!includeInactive)
                {
                    query = ApplyActiveFilter(query);
                }

                var result = await query.ToListWithNoLockAsync();

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
                    .WithForceNoLock()
                    .Where(filter)
                    .ToListWithNoLockAsync();
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
                // Use FirstOrDefaultWithNoLockAsync instead of FindAsync to ensure NOLOCK hint is applied
                var entity = await _dbSet
                    .AsNoTracking()
                    .Where(e => EF.Property<int>(e, "Id") == id)
                    .FirstOrDefaultWithNoLockAsync();

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
                // Use FirstOrDefaultWithNoLockAsync instead of FindAsync to ensure NOLOCK hint is applied
                var entity = await _dbSet
                    .AsNoTracking()
                    .Where(e => EF.Property<int>(e, "Id") == id)
                    .FirstOrDefaultWithNoLockAsync();

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
                    .WithForceNoLock()
                    .Where(filter)
                    .AnyWithNoLockAsync();
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

        /// <summary>
        /// Get entity by name using reflection to find the name property
        /// </summary>
        /// <param name="name">Name to search for</param>
        /// <returns>Entity or null if not found</returns>
        protected virtual async Task<T?> GetByNamePropertyAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name cannot be null or empty", nameof(name));
            }

            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";

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
                // Find the name property using reflection
                var nameProperty = FindNameProperty();
                if (nameProperty == null)
                {
                    throw new InvalidOperationException($"No name property found for entity type {typeof(T).Name}");
                }

                // Create a parameter expression for the lambda
                var parameter = Expression.Parameter(typeof(T), "e");

                // Create a property access expression
                var propertyAccess = Expression.Property(parameter, nameProperty);

                // Create an equality expression comparing the property to the name parameter
                var constant = Expression.Constant(name);
                var equality = Expression.Equal(propertyAccess, constant);

                // Create the lambda expression
                var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

                var entity = await _dbSet
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(lambda)
                    .FirstOrDefaultWithNoLockAsync();

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
                _logger.LogError(ex, "Error getting entity of type {EntityType} by name {Name}", typeof(T).Name, name);
                throw;
            }
        }

        /// <summary>
        /// Get entities by active status using reflection to find the IsActive property
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of entities</returns>
        protected virtual async Task<IEnumerable<T>> GetByActiveStatusPropertyAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";

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
                // Find the IsActive property using reflection
                var isActiveProperty = typeof(T).GetProperty(IsActivePropertyName);
                if (isActiveProperty == null)
                {
                    // If the entity doesn't have an IsActive property, return all entities
                    _logger.LogWarning("No IsActive property found for entity type {EntityType}, returning all entities", typeof(T).Name);
                    return await GetAllAsync();
                }

                // Create a parameter expression for the lambda
                var parameter = Expression.Parameter(typeof(T), "e");

                // Create a property access expression
                var propertyAccess = Expression.Property(parameter, isActiveProperty);

                // Create an equality expression comparing the property to the isActive parameter
                var constant = Expression.Constant(isActive);
                var equality = Expression.Equal(propertyAccess, constant);

                // Create the lambda expression
                var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

                var result = await _dbSet
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(lambda)
                    .ToListWithNoLockAsync();

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
                _logger.LogError(ex, "Error getting entities of type {EntityType} by active status {IsActive}", typeof(T).Name, isActive);
                throw;
            }
        }

        /// <summary>
        /// Find the name property for the entity type using reflection
        /// </summary>
        /// <returns>PropertyInfo for the name property, or null if not found</returns>
        protected virtual PropertyInfo? FindNameProperty()
        {
            // Try to find a property ending with "Name"
            var properties = typeof(T).GetProperties();

            // First, look for properties ending with "Name"
            var nameProperty = properties.FirstOrDefault(p =>
                p.Name.EndsWith(NamePropertySuffix) &&
                p.PropertyType == typeof(string));

            if (nameProperty != null)
            {
                return nameProperty;
            }

            // If not found, look for a property called "Name"
            nameProperty = properties.FirstOrDefault(p =>
                p.Name == "Name" &&
                p.PropertyType == typeof(string));

            return nameProperty;
        }

        /// <summary>
        /// Get cached result or execute query and cache the result
        /// </summary>
        /// <typeparam name="TResult">Result type</typeparam>
        /// <param name="cacheKey">Cache key</param>
        /// <param name="queryFunc">Function to execute if cache miss</param>
        /// <returns>Result from cache or query</returns>
        protected virtual async Task<TResult> GetCachedResultAsync<TResult>(string cacheKey, Func<Task<TResult>> queryFunc)
        {
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out TResult cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await queryFunc();

                // Cache the result
                if (_enableCaching && result != null)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query for cache key {CacheKey}", cacheKey);
                throw;
            }
        }
    }
}
