using System;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Service for caching query results
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Gets a value from the cache
        /// </summary>
        T? Get<T>(string key) where T : class;
        
        /// <summary>
        /// Sets a value in the cache with an expiration time
        /// </summary>
        void Set<T>(string key, T value, TimeSpan expiration) where T : class;
        
        /// <summary>
        /// Removes a value from the cache
        /// </summary>
        void Remove(string key);
        
        /// <summary>
        /// Clears all items from the cache
        /// </summary>
        void Clear();
        
        /// <summary>
        /// Gets cache statistics
        /// </summary>
        CacheStatistics GetStatistics();
    }
    
    /// <summary>
    /// Statistics for the cache
    /// </summary>
    public class CacheStatistics
    {
        /// <summary>
        /// Number of items in the cache
        /// </summary>
        public int ItemCount { get; set; }
        
        /// <summary>
        /// Total size of the cache in bytes
        /// </summary>
        public long SizeInBytes { get; set; }
        
        /// <summary>
        /// Number of cache hits
        /// </summary>
        public long Hits { get; set; }
        
        /// <summary>
        /// Number of cache misses
        /// </summary>
        public long Misses { get; set; }
        
        /// <summary>
        /// Hit rate (hits / (hits + misses))
        /// </summary>
        public double HitRate => (Hits + Misses) > 0 ? (double)Hits / (Hits + Misses) : 0;
    }
}