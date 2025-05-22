using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CachingService.Core.Models
{
    /// <summary>
    /// Represents a generic item stored in the cache
    /// </summary>
    /// <typeparam name="T">The type of the cached value</typeparam>
    public class CacheItem<T>
    {
        /// <summary>
        /// Unique identifier for the cache item
        /// </summary>
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// The cached value
        /// </summary>
        public T? Value { get; set; }
        
        /// <summary>
        /// Optional region/partition for the cache item
        /// </summary>
        public string? Region { get; set; }
        
        /// <summary>
        /// When the cache item was created
        /// </summary>
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        /// <summary>
        /// When the cache item will expire
        /// </summary>
        public DateTimeOffset? ExpiresAt { get; set; }
        
        /// <summary>
        /// Last time the cache item was accessed
        /// </summary>
        public DateTimeOffset LastAccessedAt { get; set; } = DateTimeOffset.UtcNow;
        
        /// <summary>
        /// Number of times the cache item has been accessed
        /// </summary>
        public long AccessCount { get; set; } = 0;
        
        /// <summary>
        /// Size of the cache item in bytes (if available)
        /// </summary>
        public long? SizeInBytes { get; set; }
        
        /// <summary>
        /// Tags associated with this cache item for grouping or invalidation
        /// </summary>
        public ICollection<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// Custom metadata for the cache item
        /// </summary>
        [JsonExtensionData]
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Checks if the cache item is expired
        /// </summary>
        public bool IsExpired => ExpiresAt.HasValue && DateTimeOffset.UtcNow >= ExpiresAt.Value;
        
        /// <summary>
        /// Updates the access statistics when the item is retrieved
        /// </summary>
        public void RecordAccess()
        {
            LastAccessedAt = DateTimeOffset.UtcNow;
            AccessCount++;
        }
    }

    /// <summary>
    /// Non-generic base class for cache items
    /// </summary>
    public abstract class CacheItemBase
    {
        public string Key { get; set; } = default!;
        public string? Region { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? ExpiresAt { get; set; }
        public DateTimeOffset LastAccessedAt { get; set; } = DateTimeOffset.UtcNow;
        public long AccessCount { get; set; } = 0;
        public long? SizeInBytes { get; set; }
        public ICollection<string> Tags { get; set; } = new List<string>();
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public bool IsExpired => ExpiresAt.HasValue && DateTimeOffset.UtcNow >= ExpiresAt.Value;
    }
}
