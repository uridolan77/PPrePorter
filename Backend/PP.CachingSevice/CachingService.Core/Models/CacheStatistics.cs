using System;
using System.Collections.Generic;

namespace CachingService.Core.Models
{
    /// <summary>
    /// Represents cache performance and usage statistics
    /// </summary>
    public class CacheStatistics
    {
        /// <summary>
        /// Unique identifier for the cache provider
        /// </summary>
        public string ProviderId { get; set; } = default!;
        
        /// <summary>
        /// Total number of items currently in the cache
        /// </summary>
        public long ItemCount { get; set; }
        
        /// <summary>
        /// Total size of all cached items in bytes (if available)
        /// </summary>
        public long? TotalSizeInBytes { get; set; }
        
        /// <summary>
        /// Number of cache hits (requests for items that were found in cache)
        /// </summary>
        public long Hits { get; set; }
        
        /// <summary>
        /// Number of cache misses (requests for items that were not found in cache)
        /// </summary>
        public long Misses { get; set; }
        
        /// <summary>
        /// Hit ratio (hits / (hits + misses))
        /// </summary>
        public double HitRatio => (Hits + Misses) > 0 
            ? (double)Hits / (Hits + Misses) 
            : 0;
        
        /// <summary>
        /// Number of items evicted from the cache due to expiration or memory pressure
        /// </summary>
        public long Evictions { get; set; }
        
        /// <summary>
        /// Timestamp when the statistics were last reset
        /// </summary>
        public DateTimeOffset LastResetTime { get; set; } = DateTimeOffset.UtcNow;
        
        /// <summary>
        /// Statistics per region/partition if available
        /// </summary>
        public Dictionary<string, RegionStatistics> RegionStats { get; set; } = new Dictionary<string, RegionStatistics>();
        
        /// <summary>
        /// Memory usage information if available
        /// </summary>
        public MemoryUsage? MemoryUsage { get; set; }
    }
    
    /// <summary>
    /// Statistics for a specific cache region/partition
    /// </summary>
    public class RegionStatistics
    {
        /// <summary>
        /// Name of the region
        /// </summary>
        public string Region { get; set; } = default!;
        
        /// <summary>
        /// Number of items in this region
        /// </summary>
        public long ItemCount { get; set; }
        
        /// <summary>
        /// Total size of items in this region in bytes (if available)
        /// </summary>
        public long? SizeInBytes { get; set; }
        
        /// <summary>
        /// Number of cache hits for this region
        /// </summary>
        public long Hits { get; set; }
        
        /// <summary>
        /// Number of cache misses for this region
        /// </summary>
        public long Misses { get; set; }
        
        /// <summary>
        /// Hit ratio for this region
        /// </summary>
        public double HitRatio => (Hits + Misses) > 0 
            ? (double)Hits / (Hits + Misses) 
            : 0;
    }
    
    /// <summary>
    /// Memory usage information for the cache
    /// </summary>
    public class MemoryUsage
    {
        /// <summary>
        /// Total memory allocated for the cache in bytes
        /// </summary>
        public long AllocatedBytes { get; set; }
        
        /// <summary>
        /// Memory currently used by the cache in bytes
        /// </summary>
        public long UsedBytes { get; set; }
        
        /// <summary>
        /// Memory usage percentage
        /// </summary>
        public double UsagePercentage => AllocatedBytes > 0 
            ? (double)UsedBytes / AllocatedBytes * 100 
            : 0;
        
        /// <summary>
        /// Maximum memory limit for the cache in bytes
        /// </summary>
        public long? MaxBytes { get; set; }
    }
}
