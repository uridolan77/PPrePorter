using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Global singleton cache service that ensures cache persistence across requests
    /// </summary>
    public class GlobalCacheService : IGlobalCacheService
    {
        // Static cache instance to ensure it persists across requests
        private static MemoryCache _staticCache = new MemoryCache(new MemoryCacheOptions
        {
            SizeLimit = 1024 * 1024 * 200, // 200 MB size limit
            CompactionPercentage = 0.2 // 20% compaction when limit is reached
        });

        // Cache statistics
        private static readonly ConcurrentDictionary<string, int> _cacheHits = new ConcurrentDictionary<string, int>();
        private static readonly ConcurrentDictionary<string, int> _cacheMisses = new ConcurrentDictionary<string, int>();
        private static int _totalHits = 0;
        private static int _totalMisses = 0;

        private readonly ILogger<GlobalCacheService> _logger;

        public GlobalCacheService(ILogger<GlobalCacheService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logger.LogInformation("GlobalCacheService initialized with static cache instance: {CacheHashCode}",
                _staticCache.GetHashCode());
        }

        /// <summary>
        /// Try to get a value from the cache
        /// </summary>
        public bool TryGetValue<T>(string key, out T value)
        {
            _logger.LogDebug("CACHE TRY GET: Attempting to get value from cache with key: {CacheKey}, type: {ValueType}",
                key, typeof(T).Name);

            bool cacheHit = _staticCache.TryGetValue(key, out object cachedValue);

            if (cacheHit)
            {
                _logger.LogDebug("CACHE RAW HIT: Found value in cache with key: {CacheKey}, value type: {ValueType}, is T: {IsT}",
                    key, cachedValue?.GetType().Name ?? "null", cachedValue is T);
            }
            else
            {
                _logger.LogDebug("CACHE RAW MISS: No value found in cache with key: {CacheKey}", key);
            }

            if (cacheHit && cachedValue is T typedValue)
            {
                value = typedValue;

                // Update statistics
                _cacheHits.AddOrUpdate(key, 1, (k, v) => v + 1);
                Interlocked.Increment(ref _totalHits);

                // Get more info about the value if it's a collection
                string valueInfo = "";
                if (typedValue is System.Collections.ICollection collection)
                {
                    valueInfo = $", Count: {collection.Count}";

                    // Try to get the first item's type if available
                    if (collection.Count > 0)
                    {
                        var enumerator = collection.GetEnumerator();
                        if (enumerator.MoveNext() && enumerator.Current != null)
                        {
                            valueInfo += $", First item type: {enumerator.Current.GetType().Name}";
                        }

                        // Dispose the enumerator if it's IDisposable
                        if (enumerator is IDisposable disposable)
                        {
                            disposable.Dispose();
                        }
                    }
                }

                _logger.LogInformation("CACHE HIT: Retrieved value from cache with key: {CacheKey}, value type: {ValueType}{ValueInfo}",
                    key, typedValue.GetType().Name, valueInfo);
                return true;
            }
            else if (cacheHit && cachedValue != null)
            {
                // Cache hit but wrong type
                _logger.LogWarning("CACHE TYPE MISMATCH: Value found in cache with key {CacheKey} but type {ActualType} cannot be cast to {ExpectedType}",
                    key, cachedValue.GetType().Name, typeof(T).Name);
            }

            value = default;

            // Update statistics
            _cacheMisses.AddOrUpdate(key, 1, (k, v) => v + 1);
            Interlocked.Increment(ref _totalMisses);

            _logger.LogWarning("CACHE MISS: Failed to retrieve value from cache with key: {CacheKey}", key);
            return false;
        }

        /// <summary>
        /// Set a value in the cache with the specified options
        /// </summary>
        public void Set<T>(string key, T value, MemoryCacheEntryOptions options)
        {
            try
            {
                // Log the current cache count before setting
                int beforeCount = GetCount();

                _logger.LogDebug("CACHE SET START: Setting value in cache with key: {CacheKey}, type: {ValueType}, options: {@Options}, current cache count: {CacheCount}",
                    key,
                    value?.GetType().Name ?? "null",
                    new {
                        Priority = options.Priority,
                        Size = options.Size,
                        SlidingExpiration = options.SlidingExpiration,
                        AbsoluteExpiration = options.AbsoluteExpiration
                    },
                    beforeCount);

                // Ensure the options have a size set if not already specified
                long estimatedSize = 0;
                if (!options.Size.HasValue)
                {
                    estimatedSize = EstimateObjectSize(value);
                    options.SetSize(estimatedSize);
                    _logger.LogInformation("CACHE SIZE AUTO: Auto-estimated cache size for key {CacheKey}: {Size} bytes", key, estimatedSize);
                }
                else
                {
                    estimatedSize = options.Size.Value;
                    _logger.LogInformation("CACHE SIZE PROVIDED: Using provided cache size for key {CacheKey}: {Size} bytes", key, estimatedSize);
                }

                // Check if the value is a collection
                if (value is System.Collections.ICollection collection)
                {
                    string itemTypeInfo = "";

                    // Try to get the first item's type if available
                    if (collection.Count > 0)
                    {
                        var enumerator = collection.GetEnumerator();
                        if (enumerator.MoveNext() && enumerator.Current != null)
                        {
                            itemTypeInfo = $", First item type: {enumerator.Current.GetType().Name}";
                        }

                        // Dispose the enumerator if it's IDisposable
                        if (enumerator is IDisposable disposable)
                        {
                            disposable.Dispose();
                        }
                    }

                    _logger.LogInformation("CACHE COLLECTION: Caching collection with {Count} items for key {CacheKey}, total size: {Size} bytes, avg size per item: {AvgSize} bytes{ItemTypeInfo}",
                        collection.Count,
                        key,
                        estimatedSize,
                        collection.Count > 0 ? estimatedSize / collection.Count : 0,
                        itemTypeInfo);
                }

                // Store a reference to the value for comparison
                var originalValueRef = value;

                // Set the value in the cache
                _logger.LogDebug("CACHE SET EXECUTE: About to call _staticCache.Set for key {CacheKey}", key);
                _staticCache.Set(key, value, options);
                _logger.LogDebug("CACHE SET EXECUTE: Completed _staticCache.Set for key {CacheKey}", key);

                // Verify the cache was set correctly
                _logger.LogDebug("CACHE SET VERIFY: About to verify cache set for key {CacheKey}", key);
                bool verifySet = _staticCache.TryGetValue(key, out object verifyValue);

                // Log the cache count after setting
                int afterCount = GetCount();
                _logger.LogDebug("CACHE COUNT CHANGE: Before: {BeforeCount}, After: {AfterCount}, Difference: {Difference}",
                    beforeCount, afterCount, afterCount - beforeCount);

                if (verifySet)
                {
                    bool sameReference = Object.ReferenceEquals(originalValueRef, verifyValue);

                    _logger.LogDebug("CACHE SET VERIFY: Successfully verified cache set for key {CacheKey}, value type: {ValueType}, same reference: {SameReference}",
                        key, verifyValue?.GetType().Name ?? "null", sameReference);

                    // If it's a collection, verify the count
                    if (verifyValue is ICollection verifyCollection && originalValueRef is ICollection originalCollection)
                    {
                        _logger.LogDebug("CACHE SET VERIFY COLLECTION: Original count: {OriginalCount}, Verified count: {VerifiedCount}, Same count: {SameCount}",
                            originalCollection.Count, verifyCollection.Count, originalCollection.Count == verifyCollection.Count);
                    }
                }
                else
                {
                    _logger.LogWarning("CACHE SET VERIFY FAILED: Failed to verify cache set for key {CacheKey}", key);

                    // Try to diagnose why verification failed
                    try
                    {
                        // Check if the cache is full
                        var cacheSize = GetCount();
                        _logger.LogWarning("CACHE DIAGNOSTICS: Current cache count: {CacheCount}", cacheSize);

                        // Try to get any entry from the cache to see if it's working
                        var entriesField = typeof(MemoryCache).GetField("_entries", BindingFlags.NonPublic | BindingFlags.Instance);
                        if (entriesField != null)
                        {
                            var entries = entriesField.GetValue(_staticCache);
                            _logger.LogWarning("CACHE DIAGNOSTICS: Entries object is {EntriesStatus}", entries != null ? "not null" : "null");
                        }
                    }
                    catch (Exception diagEx)
                    {
                        _logger.LogError(diagEx, "CACHE DIAGNOSTICS ERROR: Failed to diagnose cache verification failure");
                    }
                }

                _logger.LogInformation("CACHE SET COMPLETE: Cached value with key: {CacheKey}, size: {Size} bytes", key, estimatedSize);

                // Log cache statistics after setting
                _logger.LogDebug("CACHE STATS after set: TotalHits={TotalHits}, TotalMisses={TotalMisses}, CacheCount={Count}",
                    _totalHits, _totalMisses, GetCount());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CACHE SET ERROR: Failed to set cache with key {CacheKey}", key);
                throw; // Rethrow to allow caller to handle
            }
        }

        /// <summary>
        /// Set a value in the cache with a sliding expiration
        /// </summary>
        public void Set<T>(string key, T value, TimeSpan slidingExpiration)
        {
            var options = new MemoryCacheEntryOptions()
                .SetPriority(CacheItemPriority.High)
                .SetSlidingExpiration(slidingExpiration)
                .SetSize(EstimateObjectSize(value)); // Set size for cache entry

            _staticCache.Set(key, value, options);
            _logger.LogInformation("Cached value with key: {CacheKey} and sliding expiration: {SlidingExpiration}",
                key, slidingExpiration);
        }

        /// <summary>
        /// Set a value in the cache with an absolute expiration
        /// </summary>
        public void Set<T>(string key, T value, DateTimeOffset absoluteExpiration)
        {
            var options = new MemoryCacheEntryOptions()
                .SetPriority(CacheItemPriority.High)
                .SetAbsoluteExpiration(absoluteExpiration)
                .SetSize(EstimateObjectSize(value)); // Set size for cache entry

            _staticCache.Set(key, value, options);
            _logger.LogInformation("Cached value with key: {CacheKey} and absolute expiration: {AbsoluteExpiration}",
                key, absoluteExpiration);
        }

        /// <summary>
        /// Remove a value from the cache
        /// </summary>
        public void Remove(string key)
        {
            _staticCache.Remove(key);
            _logger.LogInformation("Removed value from cache with key: {CacheKey}", key);
        }

        /// <summary>
        /// Clear all cache entries
        /// </summary>
        public void Clear()
        {
            // Create a new cache instance to replace the old one
            var newCache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 1024 * 1024 * 200,
                CompactionPercentage = 0.2
            });

            // Replace the static cache with the new one
            var oldCache = Interlocked.Exchange(ref _staticCache, newCache);

            // Dispose the old cache
            oldCache.Dispose();

            // Clear statistics
            _cacheHits.Clear();
            _cacheMisses.Clear();
            Interlocked.Exchange(ref _totalHits, 0);
            Interlocked.Exchange(ref _totalMisses, 0);

            _logger.LogWarning("Cleared all cache entries");
        }

        /// <summary>
        /// Get cache statistics
        /// </summary>
        public Dictionary<string, object> GetStatistics()
        {
            return new Dictionary<string, object>
            {
                ["TotalHits"] = _totalHits,
                ["TotalMisses"] = _totalMisses,
                ["HitRatio"] = _totalHits + _totalMisses > 0
                    ? (double)_totalHits / (_totalHits + _totalMisses)
                    : 0,
                ["CacheCount"] = GetCount(),
                ["TopHits"] = _cacheHits.OrderByDescending(kv => kv.Value).Take(10).ToDictionary(kv => kv.Key, kv => kv.Value),
                ["TopMisses"] = _cacheMisses.OrderByDescending(kv => kv.Value).Take(10).ToDictionary(kv => kv.Key, kv => kv.Value)
            };
        }

        /// <summary>
        /// Estimates the size of an object for cache size limits
        /// </summary>
        private long EstimateObjectSize<T>(T obj)
        {
            if (obj == null)
                return 0;

            // Default minimum size for any object
            long baseSize = 1;

            try
            {
                // For strings, use the string length as an approximation
                if (obj is string str)
                {
                    return Math.Max(baseSize, str.Length * 2); // Unicode chars are 2 bytes
                }

                // For collections, estimate based on count and content
                if (obj is System.Collections.ICollection collection)
                {
                    // Base size for the collection itself
                    long collectionSize = Math.Max(baseSize, collection.Count);

                    // Check if the collection is empty
                    if (collection.Count == 0)
                    {
                        _logger.LogDebug("Collection is empty, using minimum size of {Size} bytes", baseSize);
                        return baseSize;
                    }

                    // Get the type name of the collection for better logging
                    string collectionTypeName = obj.GetType().Name;

                    // For DailyActions collections, use a more accurate estimate
                    if (collectionTypeName.Contains("DailyAction"))
                    {
                        // DailyAction objects are large with many properties
                        long estimatedSize = collection.Count * 1000; // 1000 bytes per DailyAction is a conservative estimate
                        _logger.LogInformation("DailyActions collection detected with {Count} items, using estimated size of {Size} bytes",
                            collection.Count, estimatedSize);
                        return estimatedSize;
                    }

                    // If it's a small collection, we can estimate the size of each item
                    if (collection.Count <= 1000)
                    {
                        // Get the first item to estimate item size
                        var enumerator = collection.GetEnumerator();
                        if (enumerator.MoveNext() && enumerator.Current != null)
                        {
                            // Estimate size of one item and multiply by count
                            var firstItem = enumerator.Current;
                            var itemSize = EstimateItemSize(firstItem);
                            collectionSize = Math.Max(collectionSize, collection.Count * itemSize);

                            // Log detailed information about the first item
                            _logger.LogDebug("First item in collection is of type {Type} with estimated size {Size} bytes",
                                firstItem.GetType().Name,
                                itemSize);

                            // If it's a DailyAction, use a more accurate estimate
                            if (firstItem.GetType().Name.Contains("DailyAction"))
                            {
                                _logger.LogInformation("DailyAction objects detected in collection - using higher size estimate");
                                // Use a more conservative estimate for DailyAction objects
                                collectionSize = collection.Count * 1000; // 1000 bytes per DailyAction
                            }
                        }

                        // Dispose the enumerator if it's IDisposable
                        if (enumerator is IDisposable disposable)
                        {
                            disposable.Dispose();
                        }
                    }
                    else
                    {
                        // For large collections, use a more conservative estimate
                        // to avoid spending too much time calculating sizes
                        collectionSize = collection.Count * 200; // Assume average of 200 bytes per item for large collections
                    }

                    _logger.LogDebug("Estimated collection size: {Size} bytes for {Count} items (avg {AvgSize} bytes per item)",
                        collectionSize,
                        collection.Count,
                        collection.Count > 0 ? collectionSize / collection.Count : 0);
                    return collectionSize;
                }

                // For simple value types, use a small fixed size
                if (obj.GetType().IsValueType)
                {
                    return baseSize;
                }

                // For complex objects, try to estimate based on type
                return EstimateComplexObjectSize(obj);
            }
            catch (Exception ex)
            {
                // If estimation fails, log and use a default size
                _logger.LogWarning(ex, "Error estimating object size for type {Type}, using default size", obj.GetType().Name);
                return 200; // Use a larger default size to be safe
            }
        }

        /// <summary>
        /// Estimates the size of a single item in a collection
        /// </summary>
        private long EstimateItemSize(object item)
        {
            if (item == null)
                return 0;

            // For strings, use the string length
            if (item is string str)
                return str.Length * 2;

            // For value types, use a small fixed size
            if (item.GetType().IsValueType)
                return 8; // Most value types are 8 bytes or less

            // For complex objects, use a more detailed estimation
            return EstimateComplexObjectSize(item);
        }

        /// <summary>
        /// Estimates the size of a complex object based on its type
        /// </summary>
        private long EstimateComplexObjectSize(object obj)
        {
            if (obj == null)
                return 0;

            var type = obj.GetType();
            var typeName = type.Name;

            // Special handling for known types
            if (typeName.Contains("DailyAction"))
            {
                // DailyAction objects are large with many properties
                var propertyCount = type.GetProperties().Length;
                _logger.LogInformation("DailyAction object has {PropertyCount} properties", propertyCount);

                // More accurate estimate based on property count
                long size = propertyCount * 40; // Assume average of 40 bytes per property (many are decimal)

                // Add extra for the large number of decimal properties
                size += 400; // Additional overhead for decimal properties

                _logger.LogInformation("Estimated DailyAction size: {Size} bytes", size);
                return size; // More accurate estimate for DailyAction objects
            }

            if (typeName.Contains("WhiteLabel"))
            {
                return 300; // Estimate for WhiteLabel objects
            }

            if (typeName.Contains("Player"))
            {
                return 400; // Estimate for Player objects
            }

            if (typeName.Contains("Game"))
            {
                return 350; // Estimate for Game objects
            }

            if (typeName.Contains("Transaction"))
            {
                return 300; // Estimate for Transaction objects
            }

            if (typeName.Contains("Summary") || typeName.Contains("Dto"))
            {
                return 500; // Estimate for summary or DTO objects
            }

            // For other complex objects, use a default size based on complexity
            // Count the number of properties to get a better estimate
            try
            {
                var properties = type.GetProperties();
                long estimatedSize = properties.Length * 30; // Assume 30 bytes per property
                return Math.Max(200, estimatedSize); // Minimum of 200 bytes for any complex object
            }
            catch
            {
                return 200; // Default size for unknown complex objects
            }
        }

        /// <summary>
        /// Gets the count of items in the cache (approximate)
        /// </summary>
        /// <returns>Approximate count of items in the cache</returns>
        public int GetCount()
        {
            try
            {
                // This is a hack to get the count of items in the cache
                // since IMemoryCache doesn't expose a Count property
                var cacheEntriesCollection = typeof(MemoryCache).GetProperty("EntriesCollection", BindingFlags.NonPublic | BindingFlags.Instance);

                if (cacheEntriesCollection != null)
                {
                    var entries = cacheEntriesCollection.GetValue(_staticCache) as ICollection;
                    return entries?.Count ?? 0;
                }

                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting cache count");
                return -1;
            }
        }

        /// <summary>
        /// Gets all cache keys for debugging purposes
        /// </summary>
        /// <returns>List of cache keys</returns>
        public List<string> GetAllKeys()
        {
            var keys = new List<string>();

            try
            {
                // Get the entries collection using reflection
                var entriesCollectionProperty = typeof(MemoryCache).GetProperty("EntriesCollection", BindingFlags.NonPublic | BindingFlags.Instance);
                if (entriesCollectionProperty != null)
                {
                    var entriesCollection = entriesCollectionProperty.GetValue(_staticCache) as ICollection;
                    if (entriesCollection != null)
                    {
                        // Each entry is a KeyValuePair with a key of type object
                        foreach (var entry in entriesCollection)
                        {
                            // Get the key property using reflection
                            var entryType = entry.GetType();
                            var keyProperty = entryType.GetProperty("Key");
                            if (keyProperty != null)
                            {
                                var keyValue = keyProperty.GetValue(entry);
                                if (keyValue != null)
                                {
                                    keys.Add(keyValue.ToString());
                                }
                            }
                        }
                    }
                }

                _logger.LogDebug("Retrieved {Count} cache keys", keys.Count);
                return keys;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting cache keys");
                return keys;
            }
        }
    }
}
