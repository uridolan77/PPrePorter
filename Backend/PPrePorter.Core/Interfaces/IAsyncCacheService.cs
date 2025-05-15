using System;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Interface for asynchronous caching operations
    /// </summary>
    public interface IAsyncCacheService
    {
        /// <summary>
        /// Asynchronously set a value in the cache with the specified options
        /// </summary>
        Task SetAsync<T>(string key, T value, CacheItemOptions options);

        /// <summary>
        /// Asynchronously set a value in the cache with a sliding expiration
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan slidingExpiration);

        /// <summary>
        /// Asynchronously set a value in the cache with an absolute expiration
        /// </summary>
        Task SetAsync<T>(string key, T value, DateTimeOffset absoluteExpiration);

        /// <summary>
        /// Asynchronously remove a value from the cache
        /// </summary>
        Task RemoveAsync(string key);

        /// <summary>
        /// Asynchronously try to get a value from the cache
        /// </summary>
        Task<(bool exists, T value)> TryGetValueAsync<T>(string key);
    }
}
