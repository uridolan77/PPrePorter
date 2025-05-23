using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Models;

namespace CachingService.Core.Interfaces
{
    /// <summary>
    /// Interface for cache providers that handle the actual storage and retrieval of cache items
    /// </summary>
    public interface ICacheProvider
    {
        /// <summary>
        /// Unique identifier for this cache provider
        /// </summary>
        string ProviderId { get; }
        
        /// <summary>
        /// Retrieves an item from the cache by key
        /// </summary>
        /// <typeparam name="T">Type of the cached item</typeparam>
        /// <param name="key">Key of the item to retrieve</param>
        /// <param name="region">Optional region/partition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The cached item, or null if not found</returns>
        Task<CacheItem<T>?> GetAsync<T>(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Sets an item in the cache
        /// </summary>
        /// <typeparam name="T">Type of the item to cache</typeparam>
        /// <param name="item">The cache item to store</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the item was successfully stored</returns>
        Task<bool> SetAsync<T>(CacheItem<T> item, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Removes an item from the cache by key
        /// </summary>
        /// <param name="key">Key of the item to remove</param>
        /// <param name="region">Optional region/partition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the item was removed, false if not found</returns>
        Task<bool> RemoveAsync(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Checks if an item exists in the cache
        /// </summary>
        /// <param name="key">Key to check</param>
        /// <param name="region">Optional region/partition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the item exists and is not expired</returns>
        Task<bool> ExistsAsync(string key, string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Removes all items from the cache
        /// </summary>
        /// <param name="region">Optional region/partition to clear</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the cache was cleared successfully</returns>
        Task<bool> ClearAsync(string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Removes all items with the specified tag
        /// </summary>
        /// <param name="tag">Tag to clear</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items removed</returns>
        Task<int> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets all keys in the cache
        /// </summary>
        /// <param name="region">Optional region/partition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of keys</returns>
        Task<IEnumerable<string>> GetKeysAsync(string? region = null, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets items by tag
        /// </summary>
        /// <param name="tag">Tag to filter by</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of keys with the specified tag</returns>
        Task<IEnumerable<string>> GetKeysByTagAsync(string tag, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets statistics for this cache provider
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Cache statistics</returns>
        Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Refreshes the expiration time for an item
        /// </summary>
        /// <param name="key">Key of the item to refresh</param>
        /// <param name="expiration">New expiration time</param>
        /// <param name="region">Optional region/partition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the item was found and refreshed</returns>
        Task<bool> RefreshExpirationAsync(
            string key, 
            TimeSpan? expiration = null, 
            string? region = null, 
            CancellationToken cancellationToken = default);
            
        /// <summary>
        /// Gets all items in a region
        /// </summary>
        /// <typeparam name="T">Type of items to retrieve</typeparam>
        /// <param name="region">Region to retrieve items from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Dictionary of key-value pairs</returns>
        Task<IDictionary<string, T?>> GetAllAsync<T>(string region, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Performs maintenance on the cache (cleanup, etc.)
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items affected by maintenance</returns>
        Task<int> PerformMaintenanceAsync(CancellationToken cancellationToken = default);
    }
}
