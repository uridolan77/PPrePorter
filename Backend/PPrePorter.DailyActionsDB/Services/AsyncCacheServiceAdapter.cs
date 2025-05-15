using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Temporary implementation of IAsyncCacheService for the DailyActionsDB project
    /// </summary>
    public class AsyncCacheServiceAdapter
    {
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<AsyncCacheServiceAdapter> _logger;

        public AsyncCacheServiceAdapter(
            IGlobalCacheService cacheService,
            ILogger<AsyncCacheServiceAdapter> logger)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Asynchronously set a value in the cache with the specified options
        /// </summary>
        public async Task SetAsync<T>(string key, T value, CacheItemOptions options)
        {
            await Task.Run(() =>
            {
                try
                {
                    // Convert CacheItemOptions to MemoryCacheEntryOptions
                    var memoryOptions = new Microsoft.Extensions.Caching.Memory.MemoryCacheEntryOptions();

                    if (options.AbsoluteExpiration != TimeSpan.Zero)
                    {
                        memoryOptions.AbsoluteExpirationRelativeToNow = options.AbsoluteExpiration;
                    }

                    if (options.SlidingExpiration.HasValue)
                    {
                        memoryOptions.SlidingExpiration = options.SlidingExpiration;
                    }

                    // Convert priority
                    memoryOptions.Priority = ConvertPriority(options.Priority);

                    _cacheService.Set(key, value, memoryOptions);
                    _logger.LogDebug("Asynchronously cached item with key: {Key}", key);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error asynchronously caching item with key: {Key}", key);
                }
            });
        }

        /// <summary>
        /// Asynchronously set a value in the cache with a sliding expiration
        /// </summary>
        public async Task SetAsync<T>(string key, T value, TimeSpan slidingExpiration)
        {
            await Task.Run(() =>
            {
                try
                {
                    _cacheService.Set(key, value, slidingExpiration);
                    _logger.LogDebug("Asynchronously cached item with key: {Key}, sliding expiration: {SlidingExpiration}",
                        key, slidingExpiration);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error asynchronously caching item with key: {Key}", key);
                }
            });
        }

        /// <summary>
        /// Asynchronously set a value in the cache with an absolute expiration
        /// </summary>
        public async Task SetAsync<T>(string key, T value, DateTimeOffset absoluteExpiration)
        {
            await Task.Run(() =>
            {
                try
                {
                    _cacheService.Set(key, value, absoluteExpiration);
                    _logger.LogDebug("Asynchronously cached item with key: {Key}, absolute expiration: {AbsoluteExpiration}",
                        key, absoluteExpiration);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error asynchronously caching item with key: {Key}", key);
                }
            });
        }

        /// <summary>
        /// Asynchronously remove a value from the cache
        /// </summary>
        public async Task RemoveAsync(string key)
        {
            await Task.Run(() =>
            {
                try
                {
                    _cacheService.Remove(key);
                    _logger.LogDebug("Asynchronously removed item with key: {Key}", key);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error asynchronously removing item with key: {Key}", key);
                }
            });
        }

        /// <summary>
        /// Asynchronously try to get a value from the cache
        /// </summary>
        public async Task<(bool exists, T value)> TryGetValueAsync<T>(string key)
        {
            return await Task.Run(() =>
            {
                try
                {
                    if (_cacheService.TryGetValue<T>(key, out var value))
                    {
                        _logger.LogDebug("Asynchronously retrieved item with key: {Key}", key);
                        return (true, value);
                    }

                    _logger.LogDebug("Item with key: {Key} not found in cache", key);
                    return (false, default);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error asynchronously retrieving item with key: {Key}", key);
                    return (false, default);
                }
            });
        }

        /// <summary>
        /// Converts from our CacheItemPriority to MemoryCacheItemPriority
        /// </summary>
        private Microsoft.Extensions.Caching.Memory.CacheItemPriority ConvertPriority(CacheItemPriority priority)
        {
            return priority switch
            {
                CacheItemPriority.Low => Microsoft.Extensions.Caching.Memory.CacheItemPriority.Low,
                CacheItemPriority.Normal => Microsoft.Extensions.Caching.Memory.CacheItemPriority.Normal,
                CacheItemPriority.High => Microsoft.Extensions.Caching.Memory.CacheItemPriority.High,
                CacheItemPriority.NeverRemove => Microsoft.Extensions.Caching.Memory.CacheItemPriority.NeverRemove,
                _ => Microsoft.Extensions.Caching.Memory.CacheItemPriority.Normal
            };
        }
    }

    /// <summary>
    /// Options for cache items
    /// </summary>
    public class CacheItemOptions
    {
        /// <summary>
        /// Gets or sets the absolute expiration time for the cache entry.
        /// </summary>
        public TimeSpan AbsoluteExpiration { get; set; }

        /// <summary>
        /// Gets or sets the sliding expiration time for the cache entry.
        /// </summary>
        public TimeSpan? SlidingExpiration { get; set; }

        /// <summary>
        /// Gets or sets the priority for the cache entry.
        /// </summary>
        public CacheItemPriority Priority { get; set; } = CacheItemPriority.Normal;
    }

    /// <summary>
    /// Priority of cache items
    /// </summary>
    public enum CacheItemPriority
    {
        Low,
        Normal,
        High,
        NeverRemove
    }
}
