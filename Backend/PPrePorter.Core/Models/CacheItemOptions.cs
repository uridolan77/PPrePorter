using System;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Options for cache items
    /// </summary>
    public class CacheItemOptions
    {
        /// <summary>
        /// Gets or sets the absolute expiration time for the cache entry.
        /// </summary>
        public TimeSpan AbsoluteExpiration { get; set; }

        /// <summary>
        /// Gets or sets the sliding expiration time for the cache entry.
        /// </summary>
        public TimeSpan? SlidingExpiration { get; set; }

        /// <summary>
        /// Gets or sets the priority for the cache entry.
        /// </summary>
        public CacheItemPriority Priority { get; set; } = CacheItemPriority.Normal;
    }

    /// <summary>
    /// Priority of cache items
    /// </summary>
    public enum CacheItemPriority
    {
        Low,
        Normal,
        High,
        NeverRemove
    }
}
