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
    /// Repository implementation for SportMatch entities
    /// </summary>
    public class SportMatchRepository : BaseRepository<SportMatch>, ISportMatchRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportMatchRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportMatchRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get sport match by name
        /// </summary>
        public async Task<SportMatch?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport match name cannot be null or empty", nameof(name));
            }
            
            string cacheKey = $"{_cacheKeyPrefix}Name_{name}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out SportMatch cachedEntity))
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
                    .FirstOrDefaultAsync(sm => sm.Name == name);
                
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
                _logger.LogError(ex, "Error getting sport match by name {Name}", name);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport matches by active status
        /// </summary>
        public async Task<IEnumerable<SportMatch>> GetByActiveStatusAsync(bool isActive)
        {
            string cacheKey = $"{_cacheKeyPrefix}IsActive_{isActive}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMatch> cachedResult))
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
                    .Where(sm => sm.IsActive == isActive)
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
                _logger.LogError(ex, "Error getting sport matches by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport matches by competition ID
        /// </summary>
        public async Task<IEnumerable<SportMatch>> GetByCompetitionIdAsync(int competitionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}CompetitionId_{competitionId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMatch> cachedResult))
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
                    .Where(sm => sm.CompetitionID == competitionId)
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
                _logger.LogError(ex, "Error getting sport matches by competition ID {CompetitionId}", competitionId);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport matches by date range
        /// </summary>
        public async Task<IEnumerable<SportMatch>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMatch> cachedResult))
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
                    .Where(sm => sm.StartDate >= startDate && sm.StartDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport matches by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <summary>
        /// Get sport matches by competition ID and date range
        /// </summary>
        public async Task<IEnumerable<SportMatch>> GetByCompetitionIdAndDateRangeAsync(int competitionId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}CompetitionId_{competitionId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMatch> cachedResult))
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
                    .Where(sm => sm.CompetitionID == competitionId && sm.StartDate >= startDate && sm.StartDate <= endDate)
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
                _logger.LogError(ex, "Error getting sport matches by competition ID {CompetitionId} and date range {StartDate} to {EndDate}", competitionId, startDate, endDate);
                throw;
            }
        }
        
        /// <summary>
        /// Get upcoming sport matches
        /// </summary>
        public async Task<IEnumerable<SportMatch>> GetUpcomingMatchesAsync(int count = 10)
        {
            string cacheKey = $"{_cacheKeyPrefix}Upcoming_{count}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<SportMatch> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }
            
            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            
            try
            {
                var now = DateTime.UtcNow;
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(sm => sm.StartDate > now && sm.IsActive)
                    .OrderBy(sm => sm.StartDate)
                    .Take(count)
                    .ToListAsync();
                
                // Cache the result
                if (_enableCaching)
                {
                    // Set a shorter cache expiration for upcoming matches
                    var shorterExpiration = TimeSpan.FromMinutes(Math.Min(15, _cacheExpiration.TotalMinutes));
                    _cache.Set(cacheKey, result, shorterExpiration);
                    _logger.LogDebug("Cached result for {CacheKey} with shorter expiration {Expiration}", cacheKey, shorterExpiration);
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming sport matches (count: {Count})", count);
                throw;
            }
        }
        
        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportMatch> ApplyActiveFilter(IQueryable<SportMatch> query)
        {
            return query.Where(sm => sm.IsActive);
        }
    }
}
