using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Configuration;
using CachingService.Core.Interfaces;
using CachingService.Core.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CachingService.Infrastructure.Cache
{
    /// <summary>
    /// Implementation of the cache manager interface
    /// </summary>
    public class CacheManager : ICacheManager
    {
        private readonly IEnumerable<ICacheProvider> _providers;
        private readonly CacheOptions _options;
        private readonly ILogger<CacheManager> _logger;
        
        public CacheManager(
            IEnumerable<ICacheProvider> providers,
            IOptions<CacheOptions> options,
            ILogger<CacheManager> logger)
        {
            _providers = providers ?? throw new ArgumentNullException(nameof(providers));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            if (!_providers.Any())
            {
                throw new InvalidOperationException("No cache providers are registered");
            }
        }
        
        /// <inheritdoc />
        public async Task<T?> GetOrCreateAsync<T>(
            string key,
            Func<CancellationToken, Task<T?>> factory,
            TimeSpan? expiration = null,
            string? region = null,
            IEnumerable<string>? tags = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            if (factory == null)
            {
                throw new ArgumentNullException(nameof(factory));
            }
            
            var provider = GetProvider();
            
            // Try to get the item from cache
            var cacheItem = await provider.GetAsync<T>(key, region, cancellationToken);
            
            if (cacheItem != null && !cacheItem.IsExpired)
            {
                return cacheItem.Value;
            }
            
            // Item not found in cache, create it
            T? value;
            try
            {
                value = await factory(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating value for cache key {Key}", key);
                throw;
            }
            
            // If the factory returns null, don't cache it
            if (value == null)
            {
                return default;
            }
            
            // Cache the new value
            await SetAsync(key, value, expiration, region, tags, cancellationToken);
            
            return value;
        }
        
        /// <inheritdoc />
        public async Task<T?> GetAsync<T>(string key, string? region = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            var provider = GetProvider();
            var cacheItem = await provider.GetAsync<T>(key, region, cancellationToken);
            
            return cacheItem != null && !cacheItem.IsExpired ? cacheItem.Value : default;
        }
        
        /// <inheritdoc />
        public async Task<bool> SetAsync<T>(
            string key,
            T value,
            TimeSpan? expiration = null,
            string? region = null,
            IEnumerable<string>? tags = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            if (value == null)
            {
                return false;
            }
            
            var provider = GetProvider();
            
            var cacheItem = new CacheItem<T>
            {
                Key = key,
                Value = value,
                Region = region,
                ExpiresAt = expiration.HasValue 
                    ? DateTimeOffset.UtcNow.Add(expiration.Value) 
                    : DateTimeOffset.UtcNow.Add(_options.DefaultExpiration),
                Tags = tags?.ToList() ?? new List<string>()
            };
            
            return await provider.SetAsync(cacheItem, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<bool> RemoveAsync(string key, string? region = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            var provider = GetProvider();
            return provider.RemoveAsync(key, region, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<int> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(tag))
            {
                throw new ArgumentException("Tag cannot be null or empty", nameof(tag));
            }
            
            var provider = GetProvider();
            return provider.RemoveByTagAsync(tag, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<bool> ClearAsync(string? region = null, CancellationToken cancellationToken = default)
        {
            var provider = GetProvider();
            return provider.ClearAsync(region, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<bool> ExistsAsync(string key, string? region = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            var provider = GetProvider();
            return provider.ExistsAsync(key, region, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<IDictionary<string, T?>> GetAllAsync<T>(string region, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(region))
            {
                throw new ArgumentException("Region cannot be null or empty", nameof(region));
            }
            
            var provider = GetProvider();
            return provider.GetAllAsync<T>(region, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<IEnumerable<string>> GetKeysAsync(string? region = null, CancellationToken cancellationToken = default)
        {
            var provider = GetProvider();
            return provider.GetKeysAsync(region, cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
        {
            var provider = GetProvider();
            return provider.GetStatisticsAsync(cancellationToken);
        }
        
        /// <inheritdoc />
        public Task<bool> RefreshExpirationAsync(
            string key, 
            TimeSpan? expiration = null, 
            string? region = null, 
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("Cache key cannot be null or empty", nameof(key));
            }
            
            var provider = GetProvider();
            return provider.RefreshExpirationAsync(key, expiration, region, cancellationToken);
        }
        
        /// <inheritdoc />
        public async Task<int> WarmupAsync<T>(
            Func<CancellationToken, Task<IEnumerable<T>>> factory,
            Func<T, string> keySelector,
            TimeSpan? expiration = null,
            string? region = null,
            Func<T, IEnumerable<string>>? tagSelector = null,
            CancellationToken cancellationToken = default)
        {
            if (factory == null)
            {
                throw new ArgumentNullException(nameof(factory));
            }
            
            if (keySelector == null)
            {
                throw new ArgumentNullException(nameof(keySelector));
            }
            
            int count = 0;
            
            try
            {
                var items = await factory(cancellationToken);
                
                if (items == null)
                {
                    return 0;
                }
                
                foreach (var item in items)
                {
                    if (item == null)
                    {
                        continue;
                    }
                    
                    string key = keySelector(item);
                    
                    if (string.IsNullOrWhiteSpace(key))
                    {
                        _logger.LogWarning("Warmup item has null or empty key");
                        continue;
                    }
                    
                    IEnumerable<string>? tags = tagSelector?.Invoke(item);
                    
                    if (await SetAsync(key, item, expiration, region, tags, cancellationToken))
                    {
                        count++;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error warming up cache");
                throw;
            }
            
            return count;
        }
        
        private ICacheProvider GetProvider()
        {
            // Get the provider specified in options, or the first one if not found
            return _providers.FirstOrDefault(p => p.ProviderId == _options.DefaultProvider) ?? _providers.First();
        }
    }
}
