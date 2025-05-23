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
    /// Repository implementation for SportBetEnhanced entities
    /// </summary>
    public class SportBetEnhancedRepository : BaseRepository<SportBetEnhanced>, ISportBetEnhancedRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetEnhancedRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportBetEnhancedRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sport bets by player ID
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByPlayerIdAsync(long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.PlayerId == playerId)
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
                _logger.LogError(ex, "Error getting sport bets by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by bet type ID
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByBetTypeIdAsync(int betTypeId)
        {
            string cacheKey = $"{_cacheKeyPrefix}BetTypeId_{betTypeId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.BetType == betTypeId)
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
                _logger.LogError(ex, "Error getting sport bets by bet type ID {BetTypeId}", betTypeId);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by bet state ID
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByBetStateIdAsync(int betStateId)
        {
            string cacheKey = $"{_cacheKeyPrefix}BetStateId_{betStateId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.BetState == betStateId)
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
                _logger.LogError(ex, "Error getting sport bets by bet state ID {BetStateId}", betStateId);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by date range
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.UpdatedDate >= startDate && sb.UpdatedDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport bets by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by player ID and date range
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.PlayerId == playerId && sb.UpdatedDate >= startDate && sb.UpdatedDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport bets by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by bet type ID and date range
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByBetTypeIdAndDateRangeAsync(int betTypeId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}BetTypeId_{betTypeId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.BetType == betTypeId && sb.UpdatedDate >= startDate && sb.UpdatedDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport bets by bet type ID {BetTypeId} and date range {StartDate} to {EndDate}", betTypeId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get sport bets by bet state ID and date range
        /// </summary>
        public async Task<IEnumerable<SportBetEnhanced>> GetByBetStateIdAndDateRangeAsync(int betStateId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}BetStateId_{betStateId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportBetEnhanced> cachedResult))
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
                    .Where(sb => sb.BetState == betStateId && sb.UpdatedDate >= startDate && sb.UpdatedDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport bets by bet state ID {BetStateId} and date range {StartDate} to {EndDate}", betStateId, startDate, endDate);
                throw;
            }
        }
    }
}
