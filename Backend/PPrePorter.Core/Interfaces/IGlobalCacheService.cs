using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Interface for global singleton cache service
    /// </summary>
    public interface IGlobalCacheService
    {
        /// <summary>
        /// Try to get a value from the cache
        /// </summary>
        bool TryGetValue<T>(string key, out T value);

        /// <summary>
        /// Set a value in the cache with the specified options
        /// </summary>
        void Set<T>(string key, T value, MemoryCacheEntryOptions options);

        /// <summary>
        /// Set a value in the cache with a sliding expiration
        /// </summary>
        void Set<T>(string key, T value, TimeSpan slidingExpiration);

        /// <summary>
        /// Set a value in the cache with an absolute expiration
        /// </summary>
        void Set<T>(string key, T value, DateTimeOffset absoluteExpiration);

        /// <summary>
        /// Remove a value from the cache
        /// </summary>
        void Remove(string key);

        /// <summary>
        /// Clear all cache entries
        /// </summary>
        void Clear();

        /// <summary>
        /// Get cache statistics
        /// </summary>
        Dictionary<string, object> GetStatistics();

        /// <summary>
        /// Gets the count of items in the cache (approximate)
        /// </summary>
        /// <returns>Approximate count of items in the cache</returns>
        int GetCount();

        /// <summary>
        /// Gets all cache keys for debugging purposes
        /// </summary>
        /// <returns>List of cache keys</returns>
        List<string> GetAllKeys();
    }
}
