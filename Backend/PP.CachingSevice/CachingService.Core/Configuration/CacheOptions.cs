using System;

namespace CachingService.Core.Configuration
{
    /// <summary>
    /// Configuration options for the cache service
    /// </summary>
    public class CacheOptions
    {
        /// <summary>
        /// The default cache provider to use
        /// </summary>
        public string DefaultProvider { get; set; } = "InMemory";
        
        /// <summary>
        /// Default expiration time for cache items if not explicitly set
        /// </summary>
        public TimeSpan DefaultExpiration { get; set; } = TimeSpan.FromMinutes(30);
        
        /// <summary>
        /// Maximum number of items to store in the cache (for providers that support it)
        /// </summary>
        public int? MaxItems { get; set; }
        
        /// <summary>
        /// Maximum size of the cache in bytes (for providers that support it)
        /// </summary>
        public long? MaxSizeInBytes { get; set; }
        
        /// <summary>
        /// Whether to track cache statistics
        /// </summary>
        public bool TrackStatistics { get; set; } = true;
        
        /// <summary>
        /// Whether to track the size of cached items
        /// </summary>
        public bool TrackSize { get; set; } = true;
        
        /// <summary>
        /// Interval for running cache maintenance tasks
        /// </summary>
        public TimeSpan MaintenanceInterval { get; set; } = TimeSpan.FromMinutes(5);
        
        /// <summary>
        /// Options for the in-memory cache provider
        /// </summary>
        public InMemoryCacheOptions InMemory { get; set; } = new InMemoryCacheOptions();
        
        /// <summary>
        /// Options for the Redis cache provider
        /// </summary>
        public RedisCacheOptions Redis { get; set; } = new RedisCacheOptions();
        
        /// <summary>
        /// Options for cache warmup
        /// </summary>
        public CacheWarmupOptions Warmup { get; set; } = new CacheWarmupOptions();
    }
    
    /// <summary>
    /// Options for the in-memory cache provider
    /// </summary>
    public class InMemoryCacheOptions
    {
        /// <summary>
        /// Whether the in-memory cache provider is enabled
        /// </summary>
        public bool Enabled { get; set; } = true;
        
        /// <summary>
        /// Size limit in bytes
        /// </summary>
        public long? SizeLimit { get; set; }
        
        /// <summary>
        /// Percentage of the cache to compact when the size limit is reached
        /// </summary>
        public double CompactionPercentage { get; set; } = 0.2;
        
        /// <summary>
        /// Eviction policy to use when the cache is full
        /// </summary>
        public string EvictionPolicy { get; set; } = "LRU";
    }
    
    /// <summary>
    /// Options for the Redis cache provider
    /// </summary>
    public class RedisCacheOptions
    {
        /// <summary>
        /// Whether the Redis cache provider is enabled
        /// </summary>
        public bool Enabled { get; set; } = false;
        
        /// <summary>
        /// Redis connection string
        /// </summary>
        public string ConnectionString { get; set; } = "localhost:6379";
        
        /// <summary>
        /// Redis database index
        /// </summary>
        public int Database { get; set; } = 0;
        
        /// <summary>
        /// Prefix for Redis keys
        /// </summary>
        public string KeyPrefix { get; set; } = "cache:";
        
        /// <summary>
        /// Whether to use Redis cluster
        /// </summary>
        public bool UseCluster { get; set; } = false;
        
        /// <summary>
        /// Retry options for Redis operations
        /// </summary>
        public RedisRetryOptions Retry { get; set; } = new RedisRetryOptions();
    }
    
    /// <summary>
    /// Retry options for Redis operations
    /// </summary>
    public class RedisRetryOptions
    {
        /// <summary>
        /// Maximum number of retry attempts
        /// </summary>
        public int MaxRetryAttempts { get; set; } = 3;
        
        /// <summary>
        /// Delay between retry attempts
        /// </summary>
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(1);
    }
    
    /// <summary>
    /// Options for cache warmup
    /// </summary>
    public class CacheWarmupOptions
    {
        /// <summary>
        /// Whether cache warmup is enabled
        /// </summary>
        public bool Enabled { get; set; } = true;
        
        /// <summary>
        /// Whether to warm up the cache on startup
        /// </summary>
        public bool WarmupOnStartup { get; set; } = true;
        
        /// <summary>
        /// Delay before starting warmup on startup
        /// </summary>
        public TimeSpan StartupDelay { get; set; } = TimeSpan.FromSeconds(5);
        
        /// <summary>
        /// Interval for refreshing warmed up items
        /// </summary>
        public TimeSpan RefreshInterval { get; set; } = TimeSpan.FromMinutes(30);
    }
}
