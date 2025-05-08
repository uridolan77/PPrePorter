using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
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
    public class MemoryCacheService : ICacheService
    {
        private readonly ILogger<MemoryCacheService> _logger;
        private readonly SemanticLayerConfig _config;
        
        // Cache storage - concurrent dictionary for thread safety
        private readonly ConcurrentDictionary<string, CacheEntry> _cache;
        
        // Cache statistics
        private long _totalHits;
        private long _totalMisses;
        private long _totalEntries;
        
        // Background cleanup timer
        private Timer? _cleanupTimer;
        
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
            
            // Start cleanup timer if enabled
            if (_config.Cache.EnableAutoCleanup)
            {
                _cleanupTimer = new Timer(CleanupExpiredEntries, null, 
                    TimeSpan.FromMinutes(_config.Cache.CleanupIntervalMinutes),
                    TimeSpan.FromMinutes(_config.Cache.CleanupIntervalMinutes));
            }
            
            _logger.LogInformation("Memory cache service initialized with {CacheSize}MB max size", 
                _config.Cache.MaxSizeMB);
        }
        
        /// <summary>
        /// Gets a cached translation result
        /// </summary>
        public async Task<SqlTranslationResult?> GetCachedTranslationAsync(string cacheKey)
        {
            _logger.LogDebug("Checking cache for key: {CacheKey}", cacheKey);
            
            try
            {
                if (_cache.TryGetValue(cacheKey, out CacheEntry? entry))
                {
                    // Check if entry is expired
                    if (entry.ExpirationTime < DateTime.UtcNow)
                    {
                        _logger.LogDebug("Cache entry expired for key: {CacheKey}", cacheKey);
                        _cache.TryRemove(cacheKey, out _);
                        Interlocked.Increment(ref _totalMisses);
                        return null;
                    }
                    
                    // Update last access time and hit count
                    entry.LastAccessTime = DateTime.UtcNow;
                    entry.HitCount++;
                    
                    // Update cache statistics
                    Interlocked.Increment(ref _totalHits);
                    
                    _logger.LogDebug("Cache hit for key: {CacheKey}", cacheKey);
                    return entry.TranslationResult;
                }
                
                // Cache miss
                Interlocked.Increment(ref _totalMisses);
                _logger.LogDebug("Cache miss for key: {CacheKey}", cacheKey);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving from cache for key: {CacheKey}", cacheKey);
                return null;
            }
        }
        
        /// <summary>
        /// Adds a translation result to the cache
        /// </summary>
        public async Task CacheTranslationAsync(string cacheKey, SqlTranslationResult result)
        {
            _logger.LogDebug("Caching translation for key: {CacheKey}", cacheKey);
            
            try
            {
                // Check if we need to make room for new entries
                if (_config.Cache.MaxSizeMB > 0 && IsCacheFull())
                {
                    _logger.LogInformation("Cache is full, removing least recently used entries");
                    EvictLeastRecentlyUsed();
                }
                
                // Calculate expiration time based on configuration
                var expirationTime = DateTime.UtcNow.AddMinutes(_config.Cache.ExpirationMinutes);
                
                // Create cache entry
                var entry = new CacheEntry
                {
                    TranslationResult = result,
                    CreationTime = DateTime.UtcNow,
                    LastAccessTime = DateTime.UtcNow,
                    ExpirationTime = expirationTime,
                    HitCount = 0
                };
                
                // Add to cache
                _cache[cacheKey] = entry;
                
                // Update statistics
                Interlocked.Increment(ref _totalEntries);
                
                _logger.LogDebug("Added translation to cache with key: {CacheKey}, expiration: {ExpirationTime}", 
                    cacheKey, expirationTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cache for key: {CacheKey}", cacheKey);
            }
        }
        
        /// <summary>
        /// Checks if a key exists in the cache
        /// </summary>
        public async Task<bool> ContainsKeyAsync(string cacheKey)
        {
            var result = _cache.TryGetValue(cacheKey, out CacheEntry? entry);
            
            // Also check expiration
            if (result && entry != null && entry.ExpirationTime < DateTime.UtcNow)
            {
                _cache.TryRemove(cacheKey, out _);
                return false;
            }
            
            return result;
        }
        
        /// <summary>
        /// Removes a specific key from the cache
        /// </summary>
        public async Task RemoveAsync(string cacheKey)
        {
            _logger.LogDebug("Removing cache entry for key: {CacheKey}", cacheKey);
            
            if (_cache.TryRemove(cacheKey, out _))
            {
                Interlocked.Decrement(ref _totalEntries);
                _logger.LogDebug("Successfully removed cache entry for key: {CacheKey}", cacheKey);
            }
        }
        
        /// <summary>
        /// Invalidates cache entries by pattern
        /// </summary>
        public async Task InvalidateByPatternAsync(string keyPattern)
        {
            _logger.LogInformation("Invalidating cache entries by pattern: {Pattern}", keyPattern);
            
            try
            {
                // Find matching keys
                var keysToRemove = _cache.Keys
                    .Where(k => k.Contains(keyPattern, StringComparison.OrdinalIgnoreCase))
                    .ToList();
                
                if (keysToRemove.Count == 0)
                {
                    _logger.LogDebug("No cache entries matched pattern: {Pattern}", keyPattern);
                    return;
                }
                
                // Remove each key
                int removedCount = 0;
                foreach (var key in keysToRemove)
                {
                    if (_cache.TryRemove(key, out _))
                    {
                        removedCount++;
                        Interlocked.Decrement(ref _totalEntries);
                    }
                }
                
                _logger.LogInformation("Invalidated {Count} cache entries matching pattern: {Pattern}", 
                    removedCount, keyPattern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating cache entries by pattern: {Pattern}", keyPattern);
            }
        }
        
        /// <summary>
        /// Clears all cache entries
        /// </summary>
        public async Task ClearAllAsync()
        {
            _logger.LogInformation("Clearing all cache entries");
            
            _cache.Clear();
            Interlocked.Exchange(ref _totalEntries, 0);
            
            _logger.LogInformation("Cache cleared successfully");
        }
        
        /// <summary>
        /// Gets cache statistics
        /// </summary>
        public async Task<CacheStatistics> GetStatisticsAsync()
        {
            _logger.LogDebug("Getting cache statistics");
            
            return new CacheStatistics
            {
                TotalEntries = _totalEntries,
                CurrentEntries = _cache.Count,
                TotalHits = _totalHits,
                TotalMisses = _totalMisses,
                HitRatio = CalculateHitRatio(),
                AverageQueryTime = CalculateAverageQueryTime()
            };
        }
        
        /// <summary>
        /// Generates a cache key from the query entities
        /// </summary>
        public string GenerateCacheKey(QueryEntities entities)
        {
            // Use a string builder for better performance
            var keyBuilder = new StringBuilder();
            
            // Add metrics to key
            if (entities.Metrics != null && entities.Metrics.Count > 0)
            {
                keyBuilder.Append("M:");
                foreach (var metric in entities.Metrics.OrderBy(m => m.Name))
                {
                    keyBuilder.Append(metric.Name);
                    if (!string.IsNullOrEmpty(metric.Aggregation))
                    {
                        keyBuilder.Append('(');
                        keyBuilder.Append(metric.Aggregation);
                        keyBuilder.Append(')');
                    }
                    keyBuilder.Append(';');
                }
            }
            
            // Add dimensions to key
            if (entities.Dimensions != null && entities.Dimensions.Count > 0)
            {
                keyBuilder.Append("D:");
                foreach (var dimension in entities.Dimensions.OrderBy(d => d))
                {
                    keyBuilder.Append(dimension);
                    keyBuilder.Append(';');
                }
            }
            
            // Add filters to key
            if (entities.Filters != null && entities.Filters.Count > 0)
            {
                keyBuilder.Append("F:");
                foreach (var filter in entities.Filters.OrderBy(f => f.Dimension))
                {
                    keyBuilder.Append(filter.Dimension);
                    keyBuilder.Append(filter.Operator);
                    
                    // Handle different value types
                    if (filter.Value is object[] array)
                    {
                        keyBuilder.Append('[');
                        foreach (var item in array)
                        {
                            keyBuilder.Append(item?.ToString() ?? "null");
                            keyBuilder.Append(',');
                        }
                        keyBuilder.Append(']');
                    }
                    else
                    {
                        keyBuilder.Append(filter.Value?.ToString() ?? "null");
                    }
                    
                    keyBuilder.Append(';');
                }
            }
            
            // Add time range to key
            if (entities.TimeRange != null)
            {
                keyBuilder.Append("T:");
                if (!string.IsNullOrEmpty(entities.TimeRange.RelativePeriod))
                {
                    keyBuilder.Append("Rel=");
                    keyBuilder.Append(entities.TimeRange.RelativePeriod);
                }
                else if (entities.TimeRange.StartDate.HasValue && entities.TimeRange.EndDate.HasValue)
                {
                    keyBuilder.Append("Abs=");
                    keyBuilder.Append(entities.TimeRange.StartDate.Value.ToString("yyyyMMdd"));
                    keyBuilder.Append('-');
                    keyBuilder.Append(entities.TimeRange.EndDate.Value.ToString("yyyyMMdd"));
                }
                keyBuilder.Append(';');
            }
            
            // Add sort by to key
            if (entities.SortBy != null)
            {
                keyBuilder.Append("S:");
                keyBuilder.Append(entities.SortBy.Field);
                keyBuilder.Append('=');
                keyBuilder.Append(entities.SortBy.Direction);
                keyBuilder.Append(';');
            }
            
            // Add limit to key
            if (entities.Limit.HasValue)
            {
                keyBuilder.Append("L:");
                keyBuilder.Append(entities.Limit.Value);
                keyBuilder.Append(';');
            }
            
            // Create MD5 hash of the key for shorter keys
            if (_config.Cache.UseHashKeys)
            {
                using (var md5 = System.Security.Cryptography.MD5.Create())
                {
                    var inputBytes = Encoding.UTF8.GetBytes(keyBuilder.ToString());
                    var hashBytes = md5.ComputeHash(inputBytes);
                    
                    return Convert.ToBase64String(hashBytes);
                }
            }
            
            return keyBuilder.ToString();
        }
        
        #region Helper Methods
        
        /// <summary>
        /// Calculates hit ratio
        /// </summary>
        private double CalculateHitRatio()
        {
            long total = _totalHits + _totalMisses;
            if (total == 0)
            {
                return 0;
            }
            
            return (double)_totalHits / total;
        }
        
        /// <summary>
        /// Calculates average query time
        /// </summary>
        private double CalculateAverageQueryTime()
        {
            if (_cache.Count == 0)
            {
                return 0;
            }
            
            return _cache.Values.Average(e => e.QueryDurationMs);
        }
        
        /// <summary>
        /// Checks if the cache has reached its maximum size
        /// </summary>
        private bool IsCacheFull()
        {
            if (_config.Cache.MaxSizeMB <= 0)
            {
                return false;
            }
            
            // A rough estimate of memory usage
            long estimatedSize = _cache.Count * EstimateAverageEntrySize();
            long maxSizeBytes = _config.Cache.MaxSizeMB * 1024 * 1024;
            
            return estimatedSize > maxSizeBytes;
        }
        
        /// <summary>
        /// Estimates the average size of a cache entry
        /// </summary>
        private long EstimateAverageEntrySize()
        {
            // A very rough estimate - in a real implementation,
            // you would use a more sophisticated approach
            const long baseSize = 1024; // 1KB base size
            const long resultSize = 4 * 1024; // 4KB per result
            
            return baseSize + resultSize;
        }
        
        /// <summary>
        /// Evicts least recently used cache entries
        /// </summary>
        private void EvictLeastRecentlyUsed()
        {
            try
            {
                // Get entries sorted by last access time
                var entriesToRemove = _cache
                    .OrderBy(e => e.Value.LastAccessTime)
                    .Take(_config.Cache.EvictionBatchSize)
                    .ToList();
                
                // Remove entries
                foreach (var entry in entriesToRemove)
                {
                    if (_cache.TryRemove(entry.Key, out _))
                    {
                        Interlocked.Decrement(ref _totalEntries);
                    }
                }
                
                _logger.LogInformation("Evicted {Count} least recently used cache entries", entriesToRemove.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evicting least recently used cache entries");
            }
        }
        
        /// <summary>
        /// Cleans up expired cache entries
        /// </summary>
        private void CleanupExpiredEntries(object? state)
        {
            _logger.LogDebug("Running expired entries cleanup");
            
            try
            {
                var now = DateTime.UtcNow;
                
                // Find expired entries
                var expiredKeys = _cache
                    .Where(e => e.Value.ExpirationTime < now)
                    .Select(e => e.Key)
                    .ToList();
                
                if (expiredKeys.Count == 0)
                {
                    _logger.LogDebug("No expired cache entries found");
                    return;
                }
                
                // Remove expired entries
                int removedCount = 0;
                foreach (var key in expiredKeys)
                {
                    if (_cache.TryRemove(key, out _))
                    {
                        removedCount++;
                        Interlocked.Decrement(ref _totalEntries);
                    }
                }
                
                _logger.LogInformation("Removed {Count} expired cache entries", removedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired cache entries");
            }
        }
        
        #endregion
        
        #region IDisposable Implementation
        
        private bool _disposed = false;
        
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        
        protected virtual void Dispose(bool disposing)
        {
            if (_disposed)
                return;
            
            if (disposing)
            {
                _cleanupTimer?.Dispose();
                _cache.Clear();
            }
            
            _disposed = true;
        }
        
        #endregion
    }
    
    /// <summary>
    /// Represents a cache entry
    /// </summary>
    internal class CacheEntry
    {
        /// <summary>
        /// The cached translation result
        /// </summary>
        public SqlTranslationResult TranslationResult { get; set; } = new SqlTranslationResult();
        
        /// <summary>
        /// When the entry was created
        /// </summary>
        public DateTime CreationTime { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// When the entry was last accessed
        /// </summary>
        public DateTime LastAccessTime { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// When the entry expires
        /// </summary>
        public DateTime ExpirationTime { get; set; } = DateTime.UtcNow.AddMinutes(30);
        
        /// <summary>
        /// Number of times the entry has been accessed
        /// </summary>
        public int HitCount { get; set; } = 0;
        
        /// <summary>
        /// Original query duration in milliseconds
        /// </summary>
        public double QueryDurationMs { get; set; } = 0;
    }
}