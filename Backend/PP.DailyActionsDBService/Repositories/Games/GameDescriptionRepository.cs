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
    /// Repository implementation for GameDescription entities
    /// </summary>
    public class GameDescriptionRepository : BaseRepository<GameDescription>, IGameDescriptionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameDescriptionRepository(
            DailyActionsDbContext dbContext,
            ILogger<GameDescriptionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get game descriptions by game ID
        /// </summary>
        public async Task<IEnumerable<GameDescription>> GetByGameIdAsync(int gameId)
        {
            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameDescription> cachedResult))
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
                    .Where(gd => gd.GameID == gameId)
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
                _logger.LogError(ex, "Error getting game descriptions by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <summary>
        /// Get game descriptions by language
        /// </summary>
        public async Task<IEnumerable<GameDescription>> GetByLanguageAsync(string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                throw new ArgumentException("Language cannot be null or empty", nameof(language));
            }

            string cacheKey = $"{_cacheKeyPrefix}Language_{language}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<GameDescription> cachedResult))
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
                    .Where(gd => gd.LanguageID == Convert.ToInt32(language))
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
                _logger.LogError(ex, "Error getting game descriptions by language {Language}", language);
                throw;
            }
        }

        /// <summary>
        /// Get game description by game ID and language
        /// </summary>
        public async Task<GameDescription?> GetByGameIdAndLanguageAsync(int gameId, string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                throw new ArgumentException("Language cannot be null or empty", nameof(language));
            }

            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}_Language_{language}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out GameDescription cachedEntity))
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
                    .FirstOrDefaultAsync(gd => gd.GameID == gameId && gd.LanguageID == Convert.ToInt32(language));

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
                _logger.LogError(ex, "Error getting game description by game ID {GameId} and language {Language}", gameId, language);
                throw;
            }
        }
    }
}
