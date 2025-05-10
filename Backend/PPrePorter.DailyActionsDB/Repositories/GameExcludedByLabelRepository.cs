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
    /// Repository implementation for GameExcludedByLabel entities
    /// </summary>
    public class GameExcludedByLabelRepository : BaseRepository<GameExcludedByLabel>, IGameExcludedByLabelRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByLabelRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameExcludedByLabelRepository> logger,
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
        public async Task<IEnumerable<GameExcludedByLabel>> GetByGameIdAsync(int gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByLabel> cachedResult))
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
        /// Get game exclusions by label ID
        /// </summary>
        public async Task<IEnumerable<GameExcludedByLabel>> GetByLabelIdAsync(int labelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}LabelId_{labelId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByLabel> cachedResult))
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
                    .Where(ge => ge.LabelID == labelId)
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
                _logger.LogError(ex, "Error getting game exclusions by label ID {LabelId}", labelId);
                throw;
            }
        }
        
        /// <summary>
        /// Get game exclusion by game ID and label ID
        /// </summary>
        public async Task<GameExcludedByLabel?> GetByGameIdAndLabelIdAsync(int gameId, int labelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_LabelId_{labelId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out GameExcludedByLabel cachedEntity))
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
                    .FirstOrDefaultAsync(ge => ge.GameID == gameId && ge.LabelID == labelId);
                
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
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and label ID {LabelId}", gameId, labelId);
                throw;
            }
        }
        
        /// <summary>
        /// Check if a game is excluded for a label
        /// </summary>
        public async Task<bool> IsGameExcludedForLabelAsync(int gameId, int labelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsExcluded_GameId_{gameId}_LabelId_{labelId}";
            
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
                    .AnyAsync(ge => ge.GameID == gameId && ge.LabelID == labelId);
                
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
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for label {LabelId}", gameId, labelId);
                throw;
            }
        }
        
        /// <summary>
        /// Get all games excluded for a label
        /// </summary>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForLabelAsync(int labelId)
        {
            string cacheKey = $"{_cacheKeyPrefix}ExcludedGameIds_LabelId_{labelId}";
            
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
                    .Where(ge => ge.LabelID == labelId)
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
                _logger.LogError(ex, "Error getting excluded game IDs for label {LabelId}", labelId);
                throw;
            }
        }
    }
}
