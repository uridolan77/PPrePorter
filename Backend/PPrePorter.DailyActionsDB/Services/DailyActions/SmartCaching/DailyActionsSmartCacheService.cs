using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching
{
    /// <summary>
    /// Smart caching service for DailyActions data with tiered storage and intelligent loading strategies
    /// </summary>
    public class DailyActionsSmartCacheService : IDailyActionsSmartCacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<DailyActionsSmartCacheService> _logger;
        private readonly SemaphoreSlim _cacheLock = new SemaphoreSlim(1, 1);

        // Track cache statistics
        private readonly ConcurrentDictionary<string, CacheItemStatistics> _cacheStats = new();

        // Constants for cache keys and expiration
        private const string CACHE_KEY_PREFIX = "DailyActions_";
        private const string HOT_CACHE_KEY_PREFIX = "Hot_";
        private const string WARM_CACHE_KEY_PREFIX = "Warm_";
        private const string COLD_CACHE_KEY_PREFIX = "Cold_";

        // Cache tiers with different expiration policies
        private const int HOT_CACHE_EXPIRATION_MINUTES = 15;    // Today's data - very short expiration
        private const int WARM_CACHE_EXPIRATION_HOURS = 2;      // Recent data (yesterday, last week) - medium expiration
        private const int COLD_CACHE_EXPIRATION_HOURS = 24;     // Historical data - longer expiration

        // Cache size limits
        private const long MAX_CACHE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB max cache size
        private long _currentCacheSize = 0;

        public DailyActionsSmartCacheService(
            IMemoryCache cache,
            ILogger<DailyActionsSmartCacheService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets daily actions data from cache or loads it if not available
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsAsync(
            DateTime startDate,
            DateTime endDate,
            int? whiteLabelId = null,
            Func<DateTime, DateTime, int?, Task<IEnumerable<DailyAction>>>? dataLoader = null)
        {
            if (dataLoader == null)
            {
                throw new ArgumentNullException(nameof(dataLoader), "Data loader function is required");
            }

            // Normalize dates
            var start = startDate.Date;
            var end = endDate.Date;

            // Determine cache tier based on date range
            var (cachePrefix, expirationTime) = GetCacheTierForDateRange(start, end);

            // Create cache key
            string cacheKey = $"{CACHE_KEY_PREFIX}{cachePrefix}{start:yyyyMMdd}_{end:yyyyMMdd}_{whiteLabelId ?? 0}";

            // Try to get from cache first
            if (_cache.TryGetValue(cacheKey, out IEnumerable<DailyAction> cachedData) && cachedData != null)
            {
                // Update cache statistics
                UpdateCacheStatistics(cacheKey, true);

                _logger.LogInformation("CACHE HIT [{Tier}]: Retrieved daily actions from cache for date range {StartDate} to {EndDate}, white label {WhiteLabelId}, cache key: {CacheKey}",
                    cachePrefix, start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), whiteLabelId, cacheKey);

                return cachedData;
            }

            // Update cache statistics for miss
            UpdateCacheStatistics(cacheKey, false);

            // Cache miss - load data
            _logger.LogWarning("CACHE MISS [{Tier}]: Loading daily actions from database for date range {StartDate} to {EndDate}, white label {WhiteLabelId}, cache key: {CacheKey}",
                cachePrefix, start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), whiteLabelId, cacheKey);

            // Use semaphore to prevent multiple concurrent loads for the same data
            await _cacheLock.WaitAsync();
            try
            {
                // Double-check if another thread has already loaded the data
                if (_cache.TryGetValue(cacheKey, out cachedData) && cachedData != null)
                {
                    _logger.LogInformation("CACHE HIT AFTER LOCK: Another thread loaded the data while waiting");
                    return cachedData;
                }

                // Load data using the provided loader function
                var loadStartTime = DateTime.UtcNow;
                var data = await dataLoader(start, end, whiteLabelId);
                var loadEndTime = DateTime.UtcNow;

                // Convert to list to ensure we can enumerate multiple times
                var dataList = data.ToList();

                _logger.LogInformation("Loaded {Count} daily actions records in {ElapsedMs}ms",
                    dataList.Count, (loadEndTime - loadStartTime).TotalMilliseconds);

                // Estimate data size for cache management
                long estimatedSize = EstimateDataSize(dataList);

                // Check if we have room in the cache
                if (_currentCacheSize + estimatedSize > MAX_CACHE_SIZE_BYTES)
                {
                    // Need to evict some items
                    TrimCache(estimatedSize);
                }

                // Cache the data with appropriate expiration
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    Priority = GetCachePriorityForTier(cachePrefix),
                    SlidingExpiration = TimeSpan.FromMinutes(30),
                    AbsoluteExpiration = DateTimeOffset.Now.Add(expirationTime),
                    Size = estimatedSize
                };

                // Register callback to update cache size when item is removed
                cacheOptions.RegisterPostEvictionCallback((key, value, reason, state) =>
                {
                    if (value is IEnumerable<DailyAction> evictedData)
                    {
                        var size = EstimateDataSize(evictedData);
                        Interlocked.Add(ref _currentCacheSize, -size);
                        _logger.LogDebug("Cache item evicted: {Key}, Size: {Size}, Reason: {Reason}, New cache size: {CacheSize}",
                            key, size, reason, _currentCacheSize);
                    }
                });

                _cache.Set(cacheKey, dataList, cacheOptions);

                // Update current cache size
                Interlocked.Add(ref _currentCacheSize, estimatedSize);

                _logger.LogInformation("CACHE SET [{Tier}]: Cached {Count} daily actions with key: {CacheKey}, estimated size: {Size} bytes, total cache size: {TotalSize} bytes",
                    cachePrefix, dataList.Count, cacheKey, estimatedSize, _currentCacheSize);

                return dataList;
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        /// <summary>
        /// Prewarms the cache with commonly accessed data
        /// </summary>
        public async Task PrewarmCacheAsync(Func<DateTime, DateTime, int?, Task<IEnumerable<DailyAction>>> dataLoader)
        {
            if (dataLoader == null)
            {
                throw new ArgumentNullException(nameof(dataLoader));
            }

            try
            {
                _logger.LogInformation("Starting smart cache prewarming...");

                // Get today and yesterday dates
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var lastWeekStart = today.AddDays(-7);

                // Prewarm today's data (HOT tier)
                _logger.LogInformation("Prewarming HOT tier cache with today's data: {Today}", today.ToString("yyyy-MM-dd"));
                await GetDailyActionsAsync(today, today, null, dataLoader);

                // Prewarm yesterday's data (WARM tier)
                _logger.LogInformation("Prewarming WARM tier cache with yesterday's data: {Yesterday}", yesterday.ToString("yyyy-MM-dd"));
                await GetDailyActionsAsync(yesterday, yesterday, null, dataLoader);

                // Prewarm last week's data (WARM tier)
                _logger.LogInformation("Prewarming WARM tier cache with last week's data: {LastWeekStart} to {Yesterday}",
                    lastWeekStart.ToString("yyyy-MM-dd"), yesterday.ToString("yyyy-MM-dd"));
                await GetDailyActionsAsync(lastWeekStart, yesterday, null, dataLoader);

                _logger.LogInformation("Cache prewarming completed successfully. Total items in cache: {CacheCount}, Total size: {CacheSize} bytes",
                    _cacheStats.Count, _currentCacheSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming cache");
            }
        }

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        public CacheStatistics GetCacheStatistics()
        {
            return new CacheStatistics
            {
                TotalItems = _cacheStats.Count,
                TotalSizeBytes = _currentCacheSize,
                HitCount = _cacheStats.Values.Sum(s => s.HitCount),
                MissCount = _cacheStats.Values.Sum(s => s.MissCount),
                HitRate = _cacheStats.Values.Sum(s => s.HitCount + s.MissCount) > 0
                    ? (double)_cacheStats.Values.Sum(s => s.HitCount) / _cacheStats.Values.Sum(s => s.HitCount + s.MissCount)
                    : 0,
                ItemStats = _cacheStats.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new ItemStatistics
                    {
                        HitCount = kvp.Value.HitCount,
                        MissCount = kvp.Value.MissCount,
                        LastAccessed = kvp.Value.LastAccessed
                    })
            };
        }

        #region Private Helper Methods

        private (string prefix, TimeSpan expiration) GetCacheTierForDateRange(DateTime start, DateTime end)
        {
            var today = DateTime.UtcNow.Date;

            // HOT tier - Today's data
            if (start >= today && end >= today)
            {
                return (HOT_CACHE_KEY_PREFIX, TimeSpan.FromMinutes(HOT_CACHE_EXPIRATION_MINUTES));
            }

            // WARM tier - Recent data (yesterday to last week)
            if (start >= today.AddDays(-7))
            {
                return (WARM_CACHE_KEY_PREFIX, TimeSpan.FromHours(WARM_CACHE_EXPIRATION_HOURS));
            }

            // COLD tier - Historical data
            return (COLD_CACHE_KEY_PREFIX, TimeSpan.FromHours(COLD_CACHE_EXPIRATION_HOURS));
        }

        private CacheItemPriority GetCachePriorityForTier(string tier)
        {
            return tier switch
            {
                HOT_CACHE_KEY_PREFIX => CacheItemPriority.High,
                WARM_CACHE_KEY_PREFIX => CacheItemPriority.Normal,
                COLD_CACHE_KEY_PREFIX => CacheItemPriority.Low,
                _ => CacheItemPriority.Normal
            };
        }

        private long EstimateDataSize(IEnumerable<DailyAction> data)
        {
            // Rough estimate: each DailyAction object is approximately 500 bytes
            return data.Count() * 500;
        }

        private void UpdateCacheStatistics(string cacheKey, bool isHit)
        {
            _cacheStats.AddOrUpdate(
                cacheKey,
                new CacheItemStatistics
                {
                    HitCount = isHit ? 1 : 0,
                    MissCount = isHit ? 0 : 1,
                    LastAccessed = DateTime.UtcNow
                },
                (key, existing) =>
                {
                    if (isHit)
                        existing.HitCount++;
                    else
                        existing.MissCount++;

                    existing.LastAccessed = DateTime.UtcNow;
                    return existing;
                });
        }

        private void TrimCache(long requiredSpace)
        {
            _logger.LogWarning("Cache size limit reached. Current size: {CurrentSize} bytes. Trimming cache to make room for {RequiredSpace} bytes",
                _currentCacheSize, requiredSpace);

            // Get items sorted by priority (low to high) and then by last accessed time (oldest first)
            var itemsToEvict = _cacheStats
                .OrderBy(s => GetPriorityValueForKey(s.Key))
                .ThenBy(s => s.Value.LastAccessed)
                .ToList();

            long freedSpace = 0;
            foreach (var item in itemsToEvict)
            {
                // Skip if we've freed enough space
                if (freedSpace >= requiredSpace)
                    break;

                // Try to get the item to estimate its size
                if (_cache.TryGetValue(item.Key, out IEnumerable<DailyAction> itemData))
                {
                    long itemSize = EstimateDataSize(itemData);

                    // Remove from cache
                    _cache.Remove(item.Key);
                    _cacheStats.TryRemove(item.Key, out _);

                    // Update freed space
                    freedSpace += itemSize;

                    _logger.LogInformation("Evicted cache item: {Key}, Size: {Size} bytes, Last accessed: {LastAccessed}",
                        item.Key, itemSize, item.Value.LastAccessed);
                }
            }

            _logger.LogInformation("Cache trimming completed. Freed {FreedSpace} bytes", freedSpace);
        }

        private int GetPriorityValueForKey(string key)
        {
            // Convert cache priority to numeric value for sorting
            if (key.Contains(HOT_CACHE_KEY_PREFIX))
                return 3; // Highest priority
            if (key.Contains(WARM_CACHE_KEY_PREFIX))
                return 2;
            if (key.Contains(COLD_CACHE_KEY_PREFIX))
                return 1;
            return 0; // Default/unknown
        }

        #endregion
    }

    /// <summary>
    /// Statistics for a single cache item
    /// </summary>
    internal class CacheItemStatistics
    {
        public int HitCount { get; set; }
        public int MissCount { get; set; }
        public DateTime LastAccessed { get; set; }
    }
}
