using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Models;

namespace CachingService.Core.Interfaces
{
    /// <summary>
    /// High-level interface for interacting with the cache
    /// </summary>
    public interface ICacheManager
    {
        /// <summary>
        /// Gets a value from the cache or creates it if it doesn't exist
        /// </summary>
        /// <typeparam name="T">Type of the cached value</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Function to create the value if not in cache</param>
        /// <param name="expiration">Optional expiration time</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="tags">Optional tags for categorization and bulk operations</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The cached or newly created value</returns>
        Task<T?> GetOrCreateAsync<T>(
            string key,
            Func<CancellationToken, Task<T?>> factory,
            TimeSpan? expiration = null,
            string? region = null,
            IEnumerable<string>? tags = null,
            CancellationToken cancellationToken = default);
            
        /// <summary>
        /// Gets a value from the cache
        /// </summary>
        /// <typeparam name="T">Type of the cached value</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The cached value or default(T) if not found</returns>
        Task<T?> GetAsync<T>(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Sets a value in the cache
        /// </summary>
        /// <typeparam name="T">Type of the value to cache</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="value">Value to cache</param>
        /// <param name="expiration">Optional expiration time</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="tags">Optional tags for categorization and bulk operations</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the value was successfully cached</returns>
        Task<bool> SetAsync<T>(
            string key,
            T value,
            TimeSpan? expiration = null,
            string? region = null,
            IEnumerable<string>? tags = null,
            CancellationToken cancellationToken = default);
            
        /// <summary>
        /// Removes a value from the cache
        /// </summary>
        /// <param name="key">Cache key</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the value was removed, false if not found</returns>
        Task<bool> RemoveAsync(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Removes all values with the specified tag
        /// </summary>
        /// <param name="tag">Tag to invalidate</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items removed</returns>
        Task<int> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Clears all values from the cache or a specific region
        /// </summary>
        /// <param name="region">Optional region to clear</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the cache was cleared successfully</returns>
        Task<bool> ClearAsync(string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        /// <param name="key">Cache key</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the key exists</returns>
        Task<bool> ExistsAsync(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets all values from a specific region
        /// </summary>
        /// <typeparam name="T">Type of the cached values</typeparam>
        /// <param name="region">Cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Dictionary of key-value pairs</returns>
        Task<IDictionary<string, T?>> GetAllAsync<T>(string region, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets all keys from the cache or a specific region
        /// </summary>
        /// <param name="region">Optional cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of keys</returns>
        Task<IEnumerable<string>> GetKeysAsync(string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets cache statistics
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Cache statistics</returns>
        Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Refreshes the expiration for a cached item
        /// </summary>
        /// <param name="key">Cache key</param>
        /// <param name="expiration">New expiration time</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the expiration was refreshed</returns>
        Task<bool> RefreshExpirationAsync(
            string key, 
            TimeSpan? expiration = null, 
            string? region = null, 
            CancellationToken cancellationToken = default);
            
        /// <summary>
        /// Warms up the cache with specified items
        /// </summary>
        /// <typeparam name="T">Type of items to warm up</typeparam>
        /// <param name="factory">Factory function to create the items</param>
        /// <param name="keySelector">Function to select the key for each item</param>
        /// <param name="expiration">Optional expiration time</param>
        /// <param name="region">Optional cache region</param>
        /// <param name="tagSelector">Optional function to select tags for each item</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items warmed up</returns>
        Task<int> WarmupAsync<T>(
            Func<CancellationToken, Task<IEnumerable<T>>> factory,
            Func<T, string> keySelector,
            TimeSpan? expiration = null,
            string? region = null,
            Func<T, IEnumerable<string>>? tagSelector = null,
            CancellationToken cancellationToken = default);
    }
}
