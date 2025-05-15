using System;

namespace CachingService.Core.Events
{
    /// <summary>
    /// Base class for all cache events
    /// </summary>
    public abstract class CacheEvent
    {
        /// <summary>
        /// Unique identifier for the event
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();
        
        /// <summary>
        /// When the event occurred
        /// </summary>
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
        
        /// <summary>
        /// Identifier of the cache provider that generated the event
        /// </summary>
        public string ProviderId { get; set; } = default!;
    }
    
    /// <summary>
    /// Event fired when an item is added to the cache
    /// </summary>
    public class CacheItemAddedEvent : CacheEvent
    {
        /// <summary>
        /// Key of the added item
        /// </summary>
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Region of the added item
        /// </summary>
        public string? Region { get; set; }
        
        /// <summary>
        /// Type of the added value
        /// </summary>
        public Type? ValueType { get; set; }
        
        /// <summary>
        /// Size of the added item in bytes
        /// </summary>
        public long? SizeInBytes { get; set; }
        
        /// <summary>
        /// When the item will expire
        /// </summary>
        public DateTimeOffset? ExpiresAt { get; set; }
    }
    
    /// <summary>
    /// Event fired when an item is removed from the cache
    /// </summary>
    public class CacheItemRemovedEvent : CacheEvent
    {
        /// <summary>
        /// Key of the removed item
        /// </summary>
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Region of the removed item
        /// </summary>
        public string? Region { get; set; }
        
        /// <summary>
        /// Reason for removal
        /// </summary>
        public CacheItemRemovalReason Reason { get; set; }
    }
    
    /// <summary>
    /// Event fired when an item is accessed in the cache
    /// </summary>
    public class CacheItemAccessedEvent : CacheEvent
    {
        /// <summary>
        /// Key of the accessed item
        /// </summary>
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Region of the accessed item
        /// </summary>
        public string? Region { get; set; }
        
        /// <summary>
        /// Whether the access was a hit (item found) or miss (item not found)
        /// </summary>
        public bool IsHit { get; set; }
    }
    
    /// <summary>
    /// Event fired when the cache is cleared
    /// </summary>
    public class CacheClearedEvent : CacheEvent
    {
        /// <summary>
        /// Region that was cleared, or null if the entire cache was cleared
        /// </summary>
        public string? Region { get; set; }
        
        /// <summary>
        /// Number of items that were removed
        /// </summary>
        public long ItemsRemoved { get; set; }
    }
    
    /// <summary>
    /// Event fired when cache maintenance is performed
    /// </summary>
    public class CacheMaintenanceEvent : CacheEvent
    {
        /// <summary>
        /// Number of items affected by maintenance
        /// </summary>
        public long ItemsAffected { get; set; }
        
        /// <summary>
        /// Type of maintenance performed
        /// </summary>
        public string MaintenanceType { get; set; } = default!;
    }
    
    /// <summary>
    /// Reasons for removing an item from the cache
    /// </summary>
    public enum CacheItemRemovalReason
    {
        /// <summary>
        /// Item was explicitly removed by the application
        /// </summary>
        Removed,
        
        /// <summary>
        /// Item expired
        /// </summary>
        Expired,
        
        /// <summary>
        /// Item was evicted due to memory pressure
        /// </summary>
        Evicted,
        
        /// <summary>
        /// Item was replaced with a new value
        /// </summary>
        Replaced,
        
        /// <summary>
        /// Cache was cleared
        /// </summary>
        Cleared,
        
        /// <summary>
        /// Item was removed due to a tag invalidation
        /// </summary>
        TagInvalidation
    }
}
