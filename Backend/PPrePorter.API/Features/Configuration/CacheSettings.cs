using Microsoft.Extensions.Caching.Memory;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Settings for caching
    /// </summary>
    public class CacheSettings
    {
        /// <summary>
        /// Gets or sets whether caching is enabled
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// Gets or sets the default memory cache size limit in MB
        /// </summary>
        public int MemoryCacheSizeLimitMB { get; set; } = 200;

        /// <summary>
        /// Gets or sets the default memory cache compaction percentage
        /// </summary>
        public double MemoryCacheCompactionPercentage { get; set; } = 0.2;

        /// <summary>
        /// Gets or sets the default sliding expiration in minutes
        /// </summary>
        public int DefaultSlidingExpirationMinutes { get; set; } = 5;

        /// <summary>
        /// Gets or sets the default absolute expiration in minutes
        /// </summary>
        public int DefaultAbsoluteExpirationMinutes { get; set; } = 30;

        /// <summary>
        /// Gets or sets the default response cache duration in seconds
        /// </summary>
        public int DefaultResponseCacheDurationSeconds { get; set; } = 60;

        /// <summary>
        /// Gets or sets the maximum response body size for caching in MB
        /// </summary>
        public int MaxResponseBodySizeMB { get; set; } = 64;

        /// <summary>
        /// Gets or sets whether to use case-sensitive paths for response caching
        /// </summary>
        public bool UseCaseSensitivePaths { get; set; } = false;

        /// <summary>
        /// Gets or sets the default cache priority
        /// </summary>
        public CacheItemPriority DefaultCachePriority { get; set; } = CacheItemPriority.Normal;

        /// <summary>
        /// Gets or sets the default cache entry size
        /// </summary>
        public long DefaultCacheEntrySize { get; set; } = 1;

        /// <summary>
        /// Gets or sets the paths to exclude from response caching
        /// </summary>
        public List<string> ExcludedPaths { get; set; } = new List<string>
        {
            "/api/auth",
            "/api/users",
            "/health",
            "/metrics"
        };

        /// <summary>
        /// Gets or sets the HTTP methods to exclude from response caching
        /// </summary>
        public List<string> ExcludedMethods { get; set; } = new List<string>
        {
            "POST",
            "PUT",
            "DELETE",
            "PATCH"
        };
    }
}
