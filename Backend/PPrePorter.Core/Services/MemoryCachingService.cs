using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Memory-based implementation of the ICachingService interface
    /// </summary>
    public class MemoryCachingService : ICachingService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<MemoryCachingService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="MemoryCachingService"/> class
        /// </summary>
        /// <param name="memoryCache">Memory cache</param>
        /// <param name="logger">Logger</param>
        public MemoryCachingService(IMemoryCache memoryCache, ILogger<MemoryCachingService> logger)
        {
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets a value from the cache or creates it using a factory method if it doesn't exist
        /// </summary>
        /// <typeparam name="T">Type of the value</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Factory method to create the value if it doesn't exist</param>
        /// <param name="slidingExpiration">Sliding expiration time</param>
        /// <param name="absoluteExpiration">Absolute expiration time</param>
        /// <returns>The cached value</returns>
        public async Task<T> GetOrCreateAsync<T>(
            string key,
            Func<Task<T>> factory,
            TimeSpan? slidingExpiration = null,
            TimeSpan? absoluteExpiration = null)
        {
            try
            {
                _logger.LogDebug("Getting or creating cache entry for key: {Key}", key);

                // Check if the value exists in the cache
                if (_memoryCache.TryGetValue(key, out T cachedValue))
                {
                    _logger.LogDebug("Cache hit for key: {Key}", key);
                    return cachedValue;
                }

                // Value doesn't exist, create it
                _logger.LogDebug("Cache miss for key: {Key}, creating value", key);
                var value = await factory();

                // Set cache options
                var cacheOptions = new MemoryCacheEntryOptions();

                if (slidingExpiration.HasValue)
                {
                    cacheOptions.SlidingExpiration = slidingExpiration.Value;
                }

                if (absoluteExpiration.HasValue)
                {
                    cacheOptions.AbsoluteExpirationRelativeToNow = absoluteExpiration.Value;
                }

                // Add the value to the cache
                _memoryCache.Set(key, value, cacheOptions);

                return value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting or creating cache entry for key: {Key}", key);
                
                // If caching fails, fall back to the factory method
                return await factory();
            }
        }

        /// <summary>
        /// Removes a value from the cache
        /// </summary>
        /// <param name="key">Cache key</param>
        public Task RemoveAsync(string key)
        {
            try
            {
                _logger.LogDebug("Removing cache entry for key: {Key}", key);
                _memoryCache.Remove(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache entry for key: {Key}", key);
            }

            return Task.CompletedTask;
        }

        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        /// <param name="key">Cache key</param>
        /// <returns>True if the key exists, false otherwise</returns>
        public Task<bool> ExistsAsync(string key)
        {
            try
            {
                _logger.LogDebug("Checking if cache entry exists for key: {Key}", key);
                return Task.FromResult(_memoryCache.TryGetValue(key, out _));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if cache entry exists for key: {Key}", key);
                return Task.FromResult(false);
            }
        }
    }
}
