using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading.Tasks;
using MemoryCacheItemPriority = Microsoft.Extensions.Caching.Memory.CacheItemPriority;
using CoreCacheItemPriority = PPrePorter.Core.Interfaces.CacheItemPriority;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Implementation of the asynchronous cache service
    /// </summary>
    public class AsyncCacheService : IAsyncCacheService
    {
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<AsyncCacheService> _logger;

        public AsyncCacheService(
            IGlobalCacheService cacheService,
            ILogger<AsyncCacheService> logger)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task SetAsync<T>(string key, T value, CacheItemOptions options)
        {
            await Task.Run(() =>
            {
                try
                {
                    // Convert CacheItemOptions to MemoryCacheEntryOptions
                    var memoryOptions = new MemoryCacheEntryOptions();

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

        /// <inheritdoc/>
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

        /// <inheritdoc/>
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

        /// <inheritdoc/>
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

        /// <inheritdoc/>
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
        /// Converts from our CoreCacheItemPriority to MemoryCacheItemPriority
        /// </summary>
        private MemoryCacheItemPriority ConvertPriority(CoreCacheItemPriority priority)
        {
            return priority switch
            {
                CoreCacheItemPriority.Low => MemoryCacheItemPriority.Low,
                CoreCacheItemPriority.Normal => MemoryCacheItemPriority.Normal,
                CoreCacheItemPriority.High => MemoryCacheItemPriority.High,
                CoreCacheItemPriority.NeverRemove => MemoryCacheItemPriority.NeverRemove,
                _ => MemoryCacheItemPriority.Normal
            };
        }
    }
}
