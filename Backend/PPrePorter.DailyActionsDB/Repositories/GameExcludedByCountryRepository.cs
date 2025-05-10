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
    /// Repository implementation for GameExcludedByCountry entities
    /// </summary>
    public class GameExcludedByCountryRepository : BaseRepository<GameExcludedByCountry>, IGameExcludedByCountryRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByCountryRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameExcludedByCountryRepository> logger,
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
        public async Task<IEnumerable<GameExcludedByCountry>> GetByGameIdAsync(int gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByCountry> cachedResult))
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
        /// Get game exclusions by country ID
        /// </summary>
        public async Task<IEnumerable<GameExcludedByCountry>> GetByCountryIdAsync(int countryId)
        {
            string cacheKey = $"{_cacheKeyPrefix}CountryId_{countryId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameExcludedByCountry> cachedResult))
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
                    .Where(ge => ge.CountryID == countryId)
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
                _logger.LogError(ex, "Error getting game exclusions by country ID {CountryId}", countryId);
                throw;
            }
        }
        
        /// <summary>
        /// Get game exclusion by game ID and country ID
        /// </summary>
        public async Task<GameExcludedByCountry?> GetByGameIdAndCountryIdAsync(int gameId, int countryId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_CountryId_{countryId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out GameExcludedByCountry cachedEntity))
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
                    .FirstOrDefaultAsync(ge => ge.GameID == gameId && ge.CountryID == countryId);
                
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
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and country ID {CountryId}", gameId, countryId);
                throw;
            }
        }
        
        /// <summary>
        /// Check if a game is excluded for a country
        /// </summary>
        public async Task<bool> IsGameExcludedForCountryAsync(int gameId, int countryId)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsExcluded_GameId_{gameId}_CountryId_{countryId}";
            
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
                    .AnyAsync(ge => ge.GameID == gameId && ge.CountryID == countryId);
                
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
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for country {CountryId}", gameId, countryId);
                throw;
            }
        }
        
        /// <summary>
        /// Get all games excluded for a country
        /// </summary>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForCountryAsync(int countryId)
        {
            string cacheKey = $"{_cacheKeyPrefix}ExcludedGameIds_CountryId_{countryId}";
            
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
                    .Where(ge => ge.CountryID == countryId)
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
                _logger.LogError(ex, "Error getting excluded game IDs for country {CountryId}", countryId);
                throw;
            }
        }
    }
}
