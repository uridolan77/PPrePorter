using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.Infrastructure.Services
{
    public class RedisCachingService : ICachingService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly ILogger<RedisCachingService> _logger;

        public RedisCachingService(IDistributedCache distributedCache, ILogger<RedisCachingService> logger)
        {
            _distributedCache = distributedCache ?? throw new ArgumentNullException(nameof(distributedCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<T> GetOrCreateAsync<T>(
            string key, 
            Func<Task<T>> factory, 
            TimeSpan? slidingExpiration = null, 
            TimeSpan? absoluteExpiration = null)
        {
            // Try to get the item from cache
            string cachedValue = await _distributedCache.GetStringAsync(key);
            
            if (!string.IsNullOrEmpty(cachedValue))
            {
                try
                {
                    _logger.LogDebug("Cache hit for key: {Key}", key);
                    return JsonSerializer.Deserialize<T>(cachedValue);
                }
                catch (Exception ex)
                {
                    // If deserialization fails, log error and continue to create new value
                    _logger.LogError(ex, "Failed to deserialize cached value for key: {Key}", key);
                }
            }
            
            // Cache miss or deserialization error, execute factory to create value
            _logger.LogDebug("Cache miss for key: {Key}", key);
            T value = await factory();
            
            if (value != null)
            {
                // Cache the new value
                var options = new DistributedCacheEntryOptions();
                
                if (slidingExpiration.HasValue)
                {
                    options.SlidingExpiration = slidingExpiration.Value;
                }
                
                if (absoluteExpiration.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = absoluteExpiration.Value;
                }
                
                try
                {
                    string serialized = JsonSerializer.Serialize(value);
                    await _distributedCache.SetStringAsync(key, serialized, options);
                    _logger.LogDebug("Successfully cached value for key: {Key}", key);
                }
                catch (Exception ex)
                {
                    // If caching fails, log error but still return the value
                    _logger.LogError(ex, "Failed to cache value for key: {Key}", key);
                }
            }
            
            return value;
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                await _distributedCache.RemoveAsync(key);
                _logger.LogDebug("Removed cached item with key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to remove cached item with key: {Key}", key);
                throw;
            }
        }

        public async Task<bool> ExistsAsync(string key)
        {
            try
            {
                byte[] value = await _distributedCache.GetAsync(key);
                return value != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking cache key: {Key}", key);
                return false;
            }
        }
    }
}