using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CachingService.Contracts.Requests
{
    /// <summary>
    /// Base class for all cache requests
    /// </summary>
    public abstract class CacheRequestBase
    {
        /// <summary>
        /// Optional cache provider to use
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? ProviderId { get; set; }
    }
    
    /// <summary>
    /// Request to get an item from the cache
    /// </summary>
    public class GetCacheItemRequest : CacheRequestBase
    {
        /// <summary>
        /// Key of the item to retrieve
        /// </summary>
        [Required]
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Optional region/partition
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Region { get; set; }
    }
    
    /// <summary>
    /// Request to set an item in the cache
    /// </summary>
    public class SetCacheItemRequest<T> : CacheRequestBase
    {
        /// <summary>
        /// Key of the item to set
        /// </summary>
        [Required]
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Value to cache
        /// </summary>
        [Required]
        public T Value { get; set; } = default!;
        
        /// <summary>
        /// Optional region/partition
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Region { get; set; }
        
        /// <summary>
        /// Optional expiration time in seconds
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int? ExpirationSeconds { get; set; }
        
        /// <summary>
        /// Optional tags for the item
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public IEnumerable<string>? Tags { get; set; }
    }
    
    /// <summary>
    /// Request to remove an item from the cache
    /// </summary>
    public class RemoveCacheItemRequest : CacheRequestBase
    {
        /// <summary>
        /// Key of the item to remove
        /// </summary>
        [Required]
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Optional region/partition
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Region { get; set; }
    }
    
    /// <summary>
    /// Request to remove items by tag
    /// </summary>
    public class RemoveByTagRequest : CacheRequestBase
    {
        /// <summary>
        /// Tag to remove items by
        /// </summary>
        [Required]
        public string Tag { get; set; } = default!;
    }
    
    /// <summary>
    /// Request to clear the cache
    /// </summary>
    public class ClearCacheRequest : CacheRequestBase
    {
        /// <summary>
        /// Optional region/partition to clear
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Region { get; set; }
    }
    
    /// <summary>
    /// Request to get all items from a region
    /// </summary>
    public class GetAllRequest : CacheRequestBase
    {
        /// <summary>
        /// Region to get items from
        /// </summary>
        [Required]
        public string Region { get; set; } = default!;
    }
    
    /// <summary>
    /// Request to refresh the expiration of an item
    /// </summary>
    public class RefreshExpirationRequest : CacheRequestBase
    {
        /// <summary>
        /// Key of the item to refresh
        /// </summary>
        [Required]
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Optional region/partition
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Region { get; set; }
        
        /// <summary>
        /// New expiration time in seconds
        /// </summary>
        [Required]
        public int ExpirationSeconds { get; set; }
    }
}
