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
    /// Repository implementation for BonusBalance entities
    /// </summary>
    public class BonusBalanceRepository : BaseRepository<BonusBalance>, IBonusBalanceRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public BonusBalanceRepository(
            DailyActionsDbContext dbContext,
            ILogger<BonusBalanceRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get bonus balances by player ID
        /// </summary>
        public async Task<IEnumerable<BonusBalance>> GetByPlayerIdAsync(long playerId)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<BonusBalance> cachedResult))
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
                    .Where(bb => bb.PlayerID == playerId)
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
                _logger.LogError(ex, "Error getting bonus balances by player ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <summary>
        /// Get bonus balances by bonus ID
        /// </summary>
        public async Task<IEnumerable<BonusBalance>> GetByBonusIdAsync(int bonusId)
        {
            string cacheKey = $"{_cacheKeyPrefix}BonusId_{bonusId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<BonusBalance> cachedResult))
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
                    .Where(bb => bb.BonusID == bonusId)
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
                _logger.LogError(ex, "Error getting bonus balances by bonus ID {BonusId}", bonusId);
                throw;
            }
        }
        
        /// <summary>
        /// Get bonus balances by status
        /// </summary>
        public async Task<IEnumerable<BonusBalance>> GetByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status cannot be null or empty", nameof(status));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}Status_{status}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<BonusBalance> cachedResult))
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
                    .Where(bb => bb.Status == status)
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
                _logger.LogError(ex, "Error getting bonus balances by status {Status}", status);
                throw;
            }
        }
        
        /// <summary>
        /// Get bonus balances by player ID and bonus ID
        /// </summary>
        public async Task<IEnumerable<BonusBalance>> GetByPlayerIdAndBonusIdAsync(long playerId, int bonusId)
        {
            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}_BonusId_{bonusId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<BonusBalance> cachedResult))
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
                    .Where(bb => bb.PlayerID == playerId && bb.BonusID == bonusId)
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
                _logger.LogError(ex, "Error getting bonus balances by player ID {PlayerId} and bonus ID {BonusId}", playerId, bonusId);
                throw;
            }
        }
    }
}
