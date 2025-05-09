using PPrePorter.SemanticLayer.Models.Translation;
using System;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Interface for caching service
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Gets a cached translation result by query
        /// </summary>
        Task<SqlTranslationResult?> GetCachedTranslationAsync(string query);

        /// <summary>
        /// Caches a translation result
        /// </summary>
        Task CacheTranslationAsync(string query, SqlTranslationResult result);

        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        Task<bool> ContainsKeyAsync(string key);

        /// <summary>
        /// Removes an item from the cache
        /// </summary>
        Task RemoveAsync(string key);

        /// <summary>
        /// Invalidates cache entries matching a pattern
        /// </summary>
        Task InvalidateByPatternAsync(string pattern);

        /// <summary>
        /// Clears all cache entries
        /// </summary>
        Task ClearAllAsync();

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        Task<CacheStatistics> GetStatisticsAsync();
    }


}