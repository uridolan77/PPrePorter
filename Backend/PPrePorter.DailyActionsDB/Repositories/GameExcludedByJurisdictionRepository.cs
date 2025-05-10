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
    /// Repository implementation for GameExcludedByJurisdiction entities
    /// </summary>
    public class GameExcludedByJurisdictionRepository : BaseRepository<GameExcludedByJurisdiction>, IGameExcludedByJurisdictionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByJurisdictionRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameExcludedByJurisdictionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        public async Task<IEnumerable<GameExcludedByJurisdiction>> GetByGameIdAsync(int gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByJurisdiction> cachedResult))
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
                    .Where(ge => ge.GameID == gameId)
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
                _logger.LogError(ex, "Error getting game exclusions by game ID {GameId}", gameId);
                throw;
            }
        }
        
        /// <summary>
        /// Get game exclusions by jurisdiction ID
        /// </summary>
        public async Task<IEnumerable<GameExcludedByJurisdiction>> GetByJurisdictionIdAsync(int jurisdictionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}JurisdictionId_{jurisdictionId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByJurisdiction> cachedResult))
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
                    .Where(ge => ge.JurisdictionID == jurisdictionId)
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
                _logger.LogError(ex, "Error getting game exclusions by jurisdiction ID {JurisdictionId}", jurisdictionId);
                throw;
            }
        }
        
        /// <summary>
        /// Get game exclusion by game ID and jurisdiction ID
        /// </summary>
        public async Task<GameExcludedByJurisdiction?> GetByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_JurisdictionId_{jurisdictionId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out GameExcludedByJurisdiction cachedEntity))
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
                    .FirstOrDefaultAsync(ge => ge.GameID == gameId && ge.JurisdictionID == jurisdictionId);
                
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
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and jurisdiction ID {JurisdictionId}", gameId, jurisdictionId);
                throw;
            }
        }
        
        /// <summary>
        /// Check if a game is excluded for a jurisdiction
        /// </summary>
        public async Task<bool> IsGameExcludedForJurisdictionAsync(int gameId, int jurisdictionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsExcluded_GameId_{gameId}_JurisdictionId_{jurisdictionId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out bool cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                var isExcluded = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .AnyAsync(ge => ge.GameID == gameId && ge.JurisdictionID == jurisdictionId);
                
                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, isExcluded, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }
                
                return isExcluded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for jurisdiction {JurisdictionId}", gameId, jurisdictionId);
                throw;
            }
        }
        
        /// <summary>
        /// Get all games excluded for a jurisdiction
        /// </summary>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForJurisdictionAsync(int jurisdictionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}ExcludedGameIds_JurisdictionId_{jurisdictionId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<int> cachedResult))
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
                    .Where(ge => ge.JurisdictionID == jurisdictionId)
                    .Select(ge => ge.GameID)
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
                _logger.LogError(ex, "Error getting excluded game IDs for jurisdiction {JurisdictionId}", jurisdictionId);
                throw;
            }
        }
    }
}
