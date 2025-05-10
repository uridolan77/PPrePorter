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
    /// Repository implementation for Country entities
    /// </summary>
    public class CountryRepository : BaseRepository<Country>, ICountryRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public CountryRepository(
            DailyActionsDbContext dbContext,
            ILogger<CountryRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get country by ISO code
        /// </summary>
        public async Task<Country?> GetByIsoCodeAsync(string isoCode)
        {
            if (string.IsNullOrWhiteSpace(isoCode))
            {
                throw new ArgumentException("ISO code cannot be null or empty", nameof(isoCode));
            }

            string cacheKey = $"{_cacheKeyPrefix}IsoCode_{isoCode}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out Country cachedEntity))
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
                    .FirstOrDefaultAsync(c => c.IsoCode == isoCode);

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
                _logger.LogError(ex, "Error getting country by ISO code {IsoCode}", isoCode);
                throw;
            }
        }

        /// <summary>
        /// Get countries by active status
        /// </summary>
        public async Task<IEnumerable<Country>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}Active_{isActive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Country> cachedResult))
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
                    .OrderBy(c => c.CountryName)
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
                _logger.LogError(ex, "Error getting countries by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<Country> ApplyActiveFilter(IQueryable<Country> query)
        {
            return query;
        }
    }
}
