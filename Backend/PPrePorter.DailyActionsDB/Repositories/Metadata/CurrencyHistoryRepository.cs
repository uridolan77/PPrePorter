using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for CurrencyHistory entities
    /// </summary>
    public class CurrencyHistoryRepository : BaseRepository<CurrencyHistory>, ICurrencyHistoryRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public CurrencyHistoryRepository(
            DailyActionsDbContext dbContext,
            ILogger<CurrencyHistoryRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }
        
        /// <summary>
        /// Get currency history by currency ID
        /// </summary>
        public async Task<IEnumerable<CurrencyHistory>> GetByCurrencyIdAsync(byte currencyId)
        {
            string cacheKey = $"{_cacheKeyPrefix}CurrencyId_{currencyId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<CurrencyHistory> cachedResult))
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
                    .Where(ch => ch.CurrencyId == currencyId)
                    .OrderByDescending(ch => ch.UpdatedDate)
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
                _logger.LogError(ex, "Error getting currency history by currency ID {CurrencyId}", currencyId);
                throw;
            }
        }
        
        /// <summary>
        /// Get currency history by date range
        /// </summary>
        public async Task<IEnumerable<CurrencyHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<CurrencyHistory> cachedResult))
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
                    .Where(ch => ch.UpdatedDate >= startDate && ch.UpdatedDate <= endDate)
                    .OrderByDescending(ch => ch.UpdatedDate)
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
                _logger.LogError(ex, "Error getting currency history by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <summary>
        /// Get currency history by currency ID and date range
        /// </summary>
        public async Task<IEnumerable<CurrencyHistory>> GetByCurrencyIdAndDateRangeAsync(byte currencyId, DateTime startDate, DateTime endDate)
        {
            string cacheKey = $"{_cacheKeyPrefix}CurrencyId_{currencyId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<CurrencyHistory> cachedResult))
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
                    .Where(ch => ch.CurrencyId == currencyId && ch.UpdatedDate >= startDate && ch.UpdatedDate <= endDate)
                    .OrderByDescending(ch => ch.UpdatedDate)
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
                _logger.LogError(ex, "Error getting currency history by currency ID {CurrencyId} and date range {StartDate} to {EndDate}", currencyId, startDate, endDate);
                throw;
            }
        }
        
        /// <summary>
        /// Get latest currency history by currency ID
        /// </summary>
        public async Task<CurrencyHistory?> GetLatestByCurrencyIdAsync(byte currencyId)
        {
            string cacheKey = $"{_cacheKeyPrefix}Latest_CurrencyId_{currencyId}";
            
            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out CurrencyHistory cachedEntity))
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
                    .Where(ch => ch.CurrencyId == currencyId)
                    .OrderByDescending(ch => ch.UpdatedDate)
                    .FirstOrDefaultAsync();
                
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
                _logger.LogError(ex, "Error getting latest currency history by currency ID {CurrencyId}", currencyId);
                throw;
            }
        }
    }
}
