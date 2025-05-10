using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for WhiteLabel entities
    /// </summary>
    public class WhiteLabelRepository : BaseRepository<WhiteLabel>, IWhiteLabelRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public WhiteLabelRepository(
            DailyActionsDbContext dbContext,
            ILogger<WhiteLabelRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get white label by name
        /// </summary>
        public async Task<WhiteLabel?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name cannot be null or empty", nameof(name));
            }

            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out WhiteLabel cachedEntity))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntity;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var entity = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .FirstOrDefaultAsync(wl => wl.Name == name);

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
                _logger.LogError(ex, "Error getting white label by name {Name}", name);
                throw;
            }
        }

        /// <summary>
        /// Get white labels by active status
        /// </summary>
        public async Task<IEnumerable<WhiteLabel>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}Active_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<WhiteLabel> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();

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
                _logger.LogError(ex, "Error getting white labels by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<WhiteLabel> ApplyActiveFilter(IQueryable<WhiteLabel> query)
        {
            return query;
        }

        /// <summary>
        /// Invalidate all cache entries for WhiteLabel
        /// </summary>
        protected override void InvalidateCache()
        {
            if (_enableCaching)
            {
                // Remove all cache entries that start with the prefix
                // This is a simple approach - in a more complex system, we might use a distributed cache
                // with pattern-based invalidation
                _logger.LogDebug("Invalidating cache for WhiteLabel entities");

                // In a real implementation, we would use a more sophisticated approach to invalidate
                // specific cache entries based on the entity type and ID
            }
        }
    }
}
