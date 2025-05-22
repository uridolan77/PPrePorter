using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for DailyActionGame entities
    /// </summary>
    public class DailyActionGameRepository : BaseRepository<DailyActionGame>, IDailyActionGameRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionGameRepository(
            DailyActionsDbContext dbContext,
            ILogger<DailyActionGameRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get daily action games by player ID
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByPlayerIdAsync(long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.PlayerID == playerId)
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
                _logger.LogError(ex, "Error getting daily action games by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Get daily action games by game ID
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByGameIdAsync(long gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.GameID == gameId)
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
                _logger.LogError(ex, "Error getting daily action games by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <summary>
        /// Get daily action games by date range
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.GameDate >= startDate && g.GameDate <= endDate)
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
                _logger.LogError(ex, "Error getting daily action games by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get daily action games by player ID and date range
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.PlayerID == playerId && g.GameDate >= startDate && g.GameDate <= endDate)
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
                _logger.LogError(ex, "Error getting daily action games by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get daily action games by game ID and date range
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByGameIdAndDateRangeAsync(long gameId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.GameID == gameId && g.GameDate >= startDate && g.GameDate <= endDate)
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
                _logger.LogError(ex, "Error getting daily action games by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get daily action games by platform
        /// </summary>
        public async Task<IEnumerable<DailyActionGame>> GetByPlatformAsync(string platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be null or empty", nameof(platform));
            }

            string cacheKey = $"{_cacheKeyPrefix}Platform_{platform}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<DailyActionGame> cachedResult))
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
                    .Where(g => g.Platform == platform)
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
                _logger.LogError(ex, "Error getting daily action games by platform {Platform}", platform);
                throw;
            }
        }
    }
}
