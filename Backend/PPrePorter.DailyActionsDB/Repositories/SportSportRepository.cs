using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for SportSport entities
    /// </summary>
    public class SportSportRepository : BaseRepository<SportSport>, ISportSportRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportSportRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportSportRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sport by name
        /// </summary>
        public async Task<SportSport?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport name cannot be null or empty", nameof(name));
            }

            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out SportSport cachedEntity))
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
                    .FirstOrDefaultAsync(s => s.SportName == name);

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
                _logger.LogError(ex, "Error getting sport by name {Name}", name);
                throw;
            }
        }

        /// <summary>
        /// Get sports by active status
        /// </summary>
        public async Task<IEnumerable<SportSport>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportSport> cachedResult))
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
                _logger.LogError(ex, "Error getting sports by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Get sports by region ID
        /// </summary>
        public async Task<IEnumerable<SportSport>> GetByRegionIdAsync(int regionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}RegionId_{regionId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportSport> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                // Get all competitions for the region
                var competitionIds = await _dailyActionsDbContext.SportCompetitions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(c => c.CompetitionID == regionId)
                    .Select(c => c.ID)
                    .ToListAsync();

                // Get all matches for the competitions
                var matchIds = await _dailyActionsDbContext.SportMatches
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => competitionIds.Contains(m.MatchID))
                    .Select(m => m.ID)
                    .ToListAsync();

                // Get all markets for the matches
                var marketIds = await _dailyActionsDbContext.SportMarkets
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => matchIds.Contains(m.MarketTypeID))
                    .Select(m => m.ID)
                    .ToListAsync();

                // Get all sports
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
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
                _logger.LogError(ex, "Error getting sports by region ID {RegionId}", regionId);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportSport> ApplyActiveFilter(IQueryable<SportSport> query)
        {
            return query;
        }
    }
}
