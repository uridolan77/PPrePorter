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
    /// Repository implementation for Game entities
    /// </summary>
    public class GameRepository : BaseRepository<Game>, IGameRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get game by name
        /// </summary>
        public async Task<Game?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Game name cannot be null or empty", nameof(name));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out Game cachedEntity))
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
                    .FirstOrDefaultAsync(g => g.GameName == name);
                
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
                _logger.LogError(ex, "Error getting game by name {Name}", name);
                throw;
            }
        }
        
        /// <summary>
        /// Get games by provider
        /// </summary>
        public async Task<IEnumerable<Game>> GetByProviderAsync(string provider)
        {
            if (string.IsNullOrWhiteSpace(provider))
            {
                throw new ArgumentException("Provider cannot be null or empty", nameof(provider));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}Provider_{provider}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Game> cachedResult))
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
                    .Where(g => g.Provider == provider)
                    .OrderBy(g => g.GameName)
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
                _logger.LogError(ex, "Error getting games by provider {Provider}", provider);
                throw;
            }
        }
        
        /// <summary>
        /// Get games by game type
        /// </summary>
        public async Task<IEnumerable<Game>> GetByGameTypeAsync(string gameType)
        {
            if (string.IsNullOrWhiteSpace(gameType))
            {
                throw new ArgumentException("Game type cannot be null or empty", nameof(gameType));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}GameType_{gameType}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Game> cachedResult))
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
                    .Where(g => g.GameType == gameType)
                    .OrderBy(g => g.GameName)
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
                _logger.LogError(ex, "Error getting games by game type {GameType}", gameType);
                throw;
            }
        }
        
        /// <summary>
        /// Get games by active status
        /// </summary>
        public async Task<IEnumerable<Game>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Game> cachedResult))
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
                    .Where(g => g.IsActive == isActive)
                    .OrderBy(g => g.GameName)
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
                _logger.LogError(ex, "Error getting games by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <summary>
        /// Get games ordered by game order
        /// </summary>
        public async Task<IEnumerable<Game>> GetOrderedByGameOrderAsync()
        {
            string cacheKey = $"{_cacheKeyPrefix}OrderedByGameOrder";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Game> cachedResult))
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
                    .OrderBy(g => g.GameOrder)
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
                _logger.LogError(ex, "Error getting games ordered by game order");
                throw;
            }
        }
        
        /// <summary>
        /// Get games that are not excluded for a specific country
        /// </summary>
        public async Task<IEnumerable<Game>> GetNotExcludedForCountryAsync(int countryId)
        {
            string cacheKey = $"{_cacheKeyPrefix}NotExcludedForCountry_{countryId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Game> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                // Get all games that are not in the excluded list for the country
                var excludedGameIds = await _dailyActionsDbContext.GameExcludedByCountries
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(g => g.CountryID == countryId)
                    .Select(g => g.GameID)
                    .ToListAsync();
                
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(g => !excludedGameIds.Contains(g.GameID))
                    .OrderBy(g => g.GameName)
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
                _logger.LogError(ex, "Error getting games not excluded for country {CountryId}", countryId);
                throw;
            }
        }
        
        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<Game> ApplyActiveFilter(IQueryable<Game> query)
        {
            return query.Where(g => g.IsActive);
        }
    }
}
