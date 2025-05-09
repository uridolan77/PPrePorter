using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// In-memory cache service for semantic layer query results
    /// </summary>
    public class MemoryCacheService : ICacheService, IDisposable
    {
        private readonly ILogger<MemoryCacheService> _logger;
        private readonly SemanticLayerConfig _config;

        // Cache storage - concurrent dictionary for thread safety
        private readonly ConcurrentDictionary<string, CacheEntry> _cache;

        // Cache statistics
        private long _totalHits;
        private long _totalMisses;
        private long _totalEntries;
        private Timer? _cleanupTimer;

        /// <summary>
        /// Cache entry with metadata
        /// </summary>
        private class CacheEntry
        {
            public object Value { get; set; }
            public DateTime ExpirationTime { get; set; }
            public DateTime LastAccessTime { get; set; }
            public int HitCount { get; set; }
            public long SizeInBytes { get; set; }

            public CacheEntry(object value, DateTime expirationTime, long sizeInBytes)
            {
                Value = value;
                ExpirationTime = expirationTime;
                LastAccessTime = DateTime.UtcNow;
                HitCount = 1;
                SizeInBytes = sizeInBytes;
            }
        }

        public MemoryCacheService(
            ILogger<MemoryCacheService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
            _cache = new ConcurrentDictionary<string, CacheEntry>();

            // Initialize statistics
            _totalHits = 0;
            _totalMisses = 0;
            _totalEntries = 0;

            // Start cleanup timer
            _cleanupTimer = new Timer(CleanupExpiredEntries, null,
                TimeSpan.FromMinutes(5),  // Default to 5 minutes
                TimeSpan.FromMinutes(5)); // Default to 5 minutes

            _logger.LogInformation("Memory cache service initialized");
        }

        /// <summary>
        /// Gets a value from the cache
        /// </summary>
        public T? Get<T>(string key) where T : class
        {
            try
            {
                if (_cache.TryGetValue(key, out CacheEntry? entry))
                {
                    // Check if entry is expired
                    if (entry.ExpirationTime < DateTime.UtcNow)
                    {
                        _logger.LogDebug("Cache entry expired for key: {CacheKey}", key);
                        _cache.TryRemove(key, out _);
                        Interlocked.Increment(ref _totalMisses);
                        return null;
                    }

                    // Update last access time and hit count
                    entry.LastAccessTime = DateTime.UtcNow;
                    entry.HitCount++;

                    // Update cache statistics
                    Interlocked.Increment(ref _totalHits);

                    _logger.LogDebug("Cache hit for key: {CacheKey}", key);
                    return entry.Value as T;
                }

                // Cache miss
                Interlocked.Increment(ref _totalMisses);
                _logger.LogDebug("Cache miss for key: {CacheKey}", key);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving from cache for key: {CacheKey}", key);
                return null;
            }
        }

        /// <summary>
        /// Sets a value in the cache with an expiration time
        /// </summary>
        public void Set<T>(string key, T value, TimeSpan expiration) where T : class
        {
            try
            {
                // Check if cache is full and evict if necessary
                if (IsCacheFull())
                {
                    EvictLeastRecentlyUsedEntries();
                }

                // Create a new cache entry
                var expirationTime = DateTime.UtcNow.Add(expiration);
                var sizeInBytes = EstimateObjectSize(value);
                var entry = new CacheEntry(value, expirationTime, sizeInBytes);

                // Add or update the cache
                _cache[key] = entry;
                Interlocked.Increment(ref _totalEntries);

                _logger.LogDebug("Added to cache: {CacheKey}, expires in {Expiration}", key, expiration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cache for key: {CacheKey}", key);
            }
        }

        /// <summary>
        /// Removes a value from the cache
        /// </summary>
        public void Remove(string key)
        {
            try
            {
                if (_cache.TryRemove(key, out _))
                {
                    _logger.LogDebug("Removed from cache: {CacheKey}", key);
                }
                else
                {
                    _logger.LogDebug("Key not found to remove: {CacheKey}", key);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cache for key: {CacheKey}", key);
            }
        }

        /// <summary>
        /// Clears all items from the cache
        /// </summary>
        public void Clear()
        {
            try
            {
                _cache.Clear();
                _logger.LogInformation("Cache cleared");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache");
            }
        }

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        public CacheStatistics GetStatistics()
        {
            return new Core.CacheStatistics
            {
                ItemCount = _cache.Count,
                TotalSizeBytes = _cache.Values.Sum(v => v.SizeInBytes),
                HitCount = _totalHits,
                MissCount = _totalMisses
            };
        }

        /// <summary>
        /// Gets a cached translation result by query
        /// </summary>
        public Task<SqlTranslationResult?> GetCachedTranslationAsync(string query)
        {
            var result = Get<SqlTranslationResult>(query);
            return Task.FromResult(result);
        }

        /// <summary>
        /// Caches a translation result
        /// </summary>
        public Task CacheTranslationAsync(string query, SqlTranslationResult result)
        {
            Set(query, result, TimeSpan.FromMinutes(15)); // Default to 15 minutes
            return Task.CompletedTask;
        }

        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        public Task<bool> ContainsKeyAsync(string key)
        {
            bool exists = _cache.ContainsKey(key);
            return Task.FromResult(exists);
        }

        /// <summary>
        /// Removes an item from the cache
        /// </summary>
        public Task RemoveAsync(string key)
        {
            Remove(key);
            return Task.CompletedTask;
        }

        /// <summary>
        /// Invalidates cache entries matching a pattern
        /// </summary>
        public Task InvalidateByPatternAsync(string pattern)
        {
            try
            {
                var keysToRemove = _cache.Keys
                    .Where(k => k.Contains(pattern, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var key in keysToRemove)
                {
                    _cache.TryRemove(key, out _);
                }

                _logger.LogDebug("Invalidated {Count} cache entries matching pattern: {Pattern}",
                    keysToRemove.Count, pattern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating cache entries with pattern: {Pattern}", pattern);
            }

            return Task.CompletedTask;
        }

        /// <summary>
        /// Clears all cache entries
        /// </summary>
        public Task ClearAllAsync()
        {
            Clear();
            return Task.CompletedTask;
        }

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        public Task<Core.CacheStatistics> GetStatisticsAsync()
        {
            var stats = GetStatistics();
            return Task.FromResult(stats);
        }

        /// <summary>
        /// Generates a cache key from the query entities
        /// </summary>
        public string GenerateCacheKey(QueryEntities entities)
        {
            if (entities == null)
            {
                return "null-entities";
            }

            var keyBuilder = new StringBuilder();

            // Add metrics to key
            if (entities.Metrics != null && entities.Metrics.Any())
            {
                foreach (var metric in entities.Metrics.OrderBy(m => m.Name))
                {
                    keyBuilder.Append($"M:{metric.Name}:{metric.Aggregation};");
                }
            }

            // Add dimensions to key
            if (entities.Dimensions != null && entities.Dimensions.Any())
            {
                foreach (var dimension in entities.Dimensions.OrderBy(d => d.Name))
                {
                    keyBuilder.Append($"D:{dimension.Name};");
                }
            }

            // Add time range to key
            if (entities.TimeRange != null)
            {
                if (!string.IsNullOrEmpty(entities.TimeRange.RelativePeriod))
                {
                    keyBuilder.Append($"TR:{entities.TimeRange.RelativePeriod};");
                }
                else if (entities.TimeRange.StartDate.HasValue && entities.TimeRange.EndDate.HasValue)
                {
                    keyBuilder.Append($"TR:{entities.TimeRange.StartDate.Value:yyyyMMdd}-{entities.TimeRange.EndDate.Value:yyyyMMdd};");
                }
            }

            // Add filters to key
            if (entities.Filters != null && entities.Filters.Any())
            {
                foreach (var filter in entities.Filters.OrderBy(f => f.Field))
                {
                    keyBuilder.Append($"F:{filter.Field}:{filter.Operator}:{filter.Value}:{filter.IsNegated};");
                }
            }

            // Add sort to key
            if (entities.SortBy != null)
            {
                keyBuilder.Append($"S:{entities.SortBy.Field}:{entities.SortBy.Direction};");
            }

            // Add limit to key
            if (entities.Limit.HasValue)
            {
                keyBuilder.Append($"L:{entities.Limit.Value};");
            }

            // Get the final key
            string key = keyBuilder.ToString();

            // Calculate a hash if the key is too long
            if (key.Length > 100)
            {
                return $"hash-{key.GetHashCode()}";
            }

            return key;
        }

        /// <summary>
        /// Cleanup expired cache entries
        /// </summary>
        private void CleanupExpiredEntries(object? state)
        {
            _logger.LogDebug("Starting cache cleanup");

            int removedCount = 0;
            var now = DateTime.UtcNow;

            // Find and remove expired entries
            foreach (var key in _cache.Keys)
            {
                if (_cache.TryGetValue(key, out CacheEntry? entry) && entry.ExpirationTime < now)
                {
                    if (_cache.TryRemove(key, out _))
                    {
                        removedCount++;
                    }
                }
            }

            _logger.LogDebug("Cache cleanup removed {Count} expired entries", removedCount);
        }

        /// <summary>
        /// Checks if the cache is full based on the configured maximum size
        /// </summary>
        private bool IsCacheFull()
        {
            // If no max size is set, the cache is never full
            int maxSizeMB = 100; // Default to 100MB
            if (maxSizeMB <= 0)
            {
                return false;
            }

            // Calculate current size
            long currentSizeBytes = _cache.Values.Sum(v => v.SizeInBytes);
            long maxSizeBytes = maxSizeMB * 1024 * 1024;

            return currentSizeBytes >= maxSizeBytes;
        }

        /// <summary>
        /// Evicts least recently used entries when the cache is full
        /// </summary>
        private void EvictLeastRecentlyUsedEntries()
        {
            _logger.LogDebug("Evicting least recently used cache entries");

            // Sort by last access time and take the oldest entries
            var keysToRemove = _cache
                .OrderBy(kvp => kvp.Value.LastAccessTime)
                .Take(10) // Evict 10 entries at a time
                .Select(kvp => kvp.Key)
                .ToList();

            // Remove the entries
            foreach (var key in keysToRemove)
            {
                _cache.TryRemove(key, out _);
            }

            _logger.LogDebug("Evicted {Count} cache entries", keysToRemove.Count);
        }

        /// <summary>
        /// Estimates the size of an object in bytes
        /// </summary>
        private long EstimateObjectSize(object obj)
        {
            // Simple size estimation based on object type
            if (obj == null)
            {
                return 0;
            }

            if (obj is string str)
            {
                return str.Length * 2; // UTF-16 encoding, 2 bytes per char
            }

            if (obj is SqlTranslationResult result)
            {
                return (result.Sql?.Length ?? 0) * 2 +
                       1000; // Base size for other properties
            }

            // Default size estimation
            return 1000; // Assume 1KB for unknown objects
        }

        /// <summary>
        /// Disposes the timer when the service is disposed
        /// </summary>
        public void Dispose()
        {
            _cleanupTimer?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
