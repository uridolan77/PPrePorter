using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Extensions;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for DailyAction entities
    /// </summary>
    public class DailyActionRepository : BaseRepository<DailyAction>, IDailyActionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionRepository(
            DailyActionsDbContext dbContext,
            ILogger<DailyActionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get daily actions by date range
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate)
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
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get daily actions by white label ID
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByWhiteLabelIdAsync(short whiteLabelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}WhiteLabel_{whiteLabelId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.WhiteLabelID == whiteLabelId)
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
                _logger.LogError(ex, "Error getting daily actions by white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Get daily actions by date range and white label ID
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, short whiteLabelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_WhiteLabel_{whiteLabelId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate && da.WhiteLabelID == whiteLabelId)
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
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and white label ID {WhiteLabelId}",
                    startDate, endDate, whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Get daily actions by date range and white label IDs
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<short> whiteLabelIds)
        {
            // Create a hash of the white label IDs for the cache key
            var whiteLabelIdsHash = string.Join("_", whiteLabelIds.OrderBy(id => id));
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_WhiteLabels_{whiteLabelIdsHash}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate && da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value))
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
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and white label IDs {WhiteLabelIds}",
                    startDate, endDate, string.Join(", ", whiteLabelIds));
                throw;
            }
        }

        /// <summary>
        /// Get daily actions by player ID
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByPlayerIdAsync(long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}Player_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.PlayerID == playerId)
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
                _logger.LogError(ex, "Error getting daily actions by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Get daily actions by date range and player ID
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAndPlayerIdAsync(DateTime startDate, DateTime endDate, long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_Player_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedResult))
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
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate && da.PlayerID == playerId)
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
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and player ID {PlayerId}",
                    startDate, endDate, playerId);
                throw;
            }
        }
    }
}
