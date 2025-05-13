using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching
{
    /// <summary>
    /// Interface for smart caching service for DailyActions data
    /// </summary>
    public interface IDailyActionsSmartCacheService
    {
        /// <summary>
        /// Gets daily actions data from cache or loads it if not available
        /// </summary>
        /// <param name="startDate">Start date for the data range</param>
        /// <param name="endDate">End date for the data range</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        /// <param name="dataLoader">Function to load data if not in cache</param>
        /// <returns>Collection of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsAsync(
            DateTime startDate,
            DateTime endDate,
            int? whiteLabelId = null,
            Func<DateTime, DateTime, int?, Task<IEnumerable<DailyAction>>>? dataLoader = null);

        /// <summary>
        /// Prewarms the cache with commonly accessed data
        /// </summary>
        /// <param name="dataLoader">Function to load data if not in cache</param>
        Task PrewarmCacheAsync(Func<DateTime, DateTime, int?, Task<IEnumerable<DailyAction>>> dataLoader);

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        /// <returns>Cache statistics</returns>
        CacheStatistics GetCacheStatistics();
    }

    /// <summary>
    /// Cache statistics
    /// </summary>
    public class CacheStatistics
    {
        /// <summary>
        /// Total number of items in the cache
        /// </summary>
        public int TotalItems { get; set; }

        /// <summary>
        /// Total size of the cache in bytes
        /// </summary>
        public long TotalSizeBytes { get; set; }

        /// <summary>
        /// Number of cache hits
        /// </summary>
        public int HitCount { get; set; }

        /// <summary>
        /// Number of cache misses
        /// </summary>
        public int MissCount { get; set; }

        /// <summary>
        /// Cache hit rate (0-1)
        /// </summary>
        public double HitRate { get; set; }

        /// <summary>
        /// Statistics for individual cache items
        /// </summary>
        public Dictionary<string, ItemStatistics> ItemStats { get; set; }
    }

    /// <summary>
    /// Statistics for a single cache item
    /// </summary>
    public class ItemStatistics
    {
        /// <summary>
        /// Number of cache hits for this item
        /// </summary>
        public int HitCount { get; set; }

        /// <summary>
        /// Number of cache misses for this item
        /// </summary>
        public int MissCount { get; set; }

        /// <summary>
        /// Last time this item was accessed
        /// </summary>
        public DateTime LastAccessed { get; set; }
    }
}
