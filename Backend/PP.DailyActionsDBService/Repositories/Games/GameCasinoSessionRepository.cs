using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Games;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for GameCasinoSession entities
    /// </summary>
    public class GameCasinoSessionRepository : BaseRepository<GameCasinoSession>, IGameCasinoSessionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameCasinoSessionRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameCasinoSessionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get game casino sessions by player ID
        /// </summary>
        public async Task<IEnumerable<GameCasinoSession>> GetByPlayerIdAsync(long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameCasinoSession> cachedResult))
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
                    .Where(gcs => gcs.PlayerID == playerId)
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
                _logger.LogError(ex, "Error getting game casino sessions by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Get game casino sessions by game ID
        /// </summary>
        public async Task<IEnumerable<GameCasinoSession>> GetByGameIdAsync(int gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameCasinoSession> cachedResult))
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
                    .Where(gcs => gcs.GameID == gameId)
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
                _logger.LogError(ex, "Error getting game casino sessions by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <summary>
        /// Get game casino sessions by date range
        /// </summary>
        public async Task<IEnumerable<GameCasinoSession>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameCasinoSession> cachedResult))
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
                    .Where(gcs => gcs.CreationDate >= startDate && gcs.CreationDate <= endDate)
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
                _logger.LogError(ex, "Error getting game casino sessions by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get game casino sessions by player ID and date range
        /// </summary>
        public async Task<IEnumerable<GameCasinoSession>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameCasinoSession> cachedResult))
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
                    .Where(gcs => gcs.PlayerID == playerId && gcs.CreationDate >= startDate && gcs.CreationDate <= endDate)
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
                _logger.LogError(ex, "Error getting game casino sessions by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get game casino sessions by game ID and date range
        /// </summary>
        public async Task<IEnumerable<GameCasinoSession>> GetByGameIdAndDateRangeAsync(int gameId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameCasinoSession> cachedResult))
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
                    .Where(gcs => gcs.GameID == gameId && gcs.CreationDate >= startDate && gcs.CreationDate <= endDate)
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
                _logger.LogError(ex, "Error getting game casino sessions by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                throw;
            }
        }
    }
}
