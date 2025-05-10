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
    /// Repository implementation for SportRegion entities
    /// </summary>
    public class SportRegionRepository : BaseRepository<SportRegion>, ISportRegionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportRegionRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportRegionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get sport region by name
        /// </summary>
        public async Task<SportRegion?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport region name cannot be null or empty", nameof(name));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out SportRegion cachedEntity))
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
                    .FirstOrDefaultAsync(sr => sr.Name == name);
                
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
                _logger.LogError(ex, "Error getting sport region by name {Name}", name);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport regions by active status
        /// </summary>
        public async Task<IEnumerable<SportRegion>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportRegion> cachedResult))
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
                    .Where(sr => sr.IsActive == isActive)
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
                _logger.LogError(ex, "Error getting sport regions by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport regions by sport ID
        /// </summary>
        public async Task<IEnumerable<SportRegion>> GetBySportIdAsync(int sportId)
        {
            string cacheKey = $"{_cacheKeyPrefix}SportId_{sportId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportRegion> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                // Get all competitions for the sport
                var competitions = await _dailyActionsDbContext.SportCompetitions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(c => c.SportID == sportId)
                    .ToListAsync();
                
                // Get all region IDs from the competitions
                var regionIds = competitions
                    .Select(c => c.RegionID)
                    .Distinct()
                    .ToList();
                
                // Get all regions
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(sr => regionIds.Contains(sr.ID))
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
                _logger.LogError(ex, "Error getting sport regions by sport ID {SportId}", sportId);
                throw;
            }
        }
        
        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportRegion> ApplyActiveFilter(IQueryable<SportRegion> query)
        {
            return query.Where(sr => sr.IsActive);
        }
    }
}
