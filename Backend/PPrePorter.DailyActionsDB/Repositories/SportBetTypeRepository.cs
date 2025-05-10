using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for SportBetType entities
    /// </summary>
    public class SportBetTypeRepository : BaseRepository<SportBetType>, ISportBetTypeRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetTypeRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportBetTypeRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sport bet type by name
        /// </summary>
        public async Task<SportBetType?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport bet type name cannot be null or empty", nameof(name));
            }

            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out SportBetType cachedEntity))
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
                    .FirstOrDefaultAsync(sbt => sbt.BetTypeName == name);

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
                _logger.LogError(ex, "Error getting sport bet type by name {Name}", name);
                throw;
            }
        }

        /// <summary>
        /// Get sport bet types by active status
        /// </summary>
        public async Task<IEnumerable<SportBetType>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetType> cachedResult))
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
                _logger.LogError(ex, "Error getting sport bet types by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportBetType> ApplyActiveFilter(IQueryable<SportBetType> query)
        {
            return query;
        }
    }
}
