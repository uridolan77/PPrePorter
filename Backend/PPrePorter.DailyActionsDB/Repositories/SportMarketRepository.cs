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
    /// Repository implementation for SportMarket entities
    /// </summary>
    public class SportMarketRepository : BaseRepository<SportMarket>, ISportMarketRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportMarketRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportMarketRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sport markets by match ID
        /// </summary>
        public async Task<IEnumerable<SportMarket>> GetByMatchIdAsync(int matchId)
        {
            string cacheKey = $"{_cacheKeyPrefix}MatchId_{matchId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMarket> cachedResult))
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
                    .Where(sm => sm.MarketTypeID == matchId)
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
                _logger.LogError(ex, "Error getting sport markets by match ID {MatchId}", matchId);
                throw;
            }
        }

        /// <summary>
        /// Get sport markets by sport ID
        /// </summary>
        public async Task<IEnumerable<SportMarket>> GetBySportIdAsync(int sportId)
        {
            string cacheKey = $"{_cacheKeyPrefix}SportId_{sportId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMarket> cachedResult))
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
                    .Where(sm => sm.MarketTypeID == sportId)
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
                _logger.LogError(ex, "Error getting sport markets by sport ID {SportId}", sportId);
                throw;
            }
        }

        /// <summary>
        /// Get sport markets by active status
        /// </summary>
        public async Task<IEnumerable<SportMarket>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMarket> cachedResult))
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
                _logger.LogError(ex, "Error getting sport markets by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Get sport markets by match ID and active status
        /// </summary>
        public async Task<IEnumerable<SportMarket>> GetByMatchIdAndActiveStatusAsync(int matchId, bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}MatchId_{matchId}_IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMarket> cachedResult))
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
                    .Where(sm => sm.MarketTypeID == matchId)
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
                _logger.LogError(ex, "Error getting sport markets by match ID {MatchId} and active status {IsActive}", matchId, isActive);
                throw;
            }
        }

        /// <summary>
        /// Get sport markets by sport ID and active status
        /// </summary>
        public async Task<IEnumerable<SportMarket>> GetBySportIdAndActiveStatusAsync(int sportId, bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}SportId_{sportId}_IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMarket> cachedResult))
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
                    .Where(sm => sm.MarketTypeID == sportId)
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
                _logger.LogError(ex, "Error getting sport markets by sport ID {SportId} and active status {IsActive}", sportId, isActive);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportMarket> ApplyActiveFilter(IQueryable<SportMarket> query)
        {
            return query;
        }
    }
}
