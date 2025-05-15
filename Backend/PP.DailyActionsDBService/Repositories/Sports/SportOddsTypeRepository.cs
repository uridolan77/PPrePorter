using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Sports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for SportOddsType entities
    /// </summary>
    public class SportOddsTypeRepository : BaseRepository<SportOddsType>, ISportOddsTypeRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportOddsTypeRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportOddsTypeRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sport odds type by name
        /// </summary>
        public async Task<SportOddsType?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport odds type name cannot be null or empty", nameof(name));
            }

            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out SportOddsType cachedEntity))
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
                    .FirstOrDefaultAsync(sot => sot.OddTypeName == name);

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
                _logger.LogError(ex, "Error getting sport odds type by name {Name}", name);
                throw;
            }
        }

        /// <summary>
        /// Get sport odds types by active status
        /// </summary>
        public async Task<IEnumerable<SportOddsType>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportOddsType> cachedResult))
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
                _logger.LogError(ex, "Error getting sport odds types by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportOddsType> ApplyActiveFilter(IQueryable<SportOddsType> query)
        {
            return query;
        }
    }
}
