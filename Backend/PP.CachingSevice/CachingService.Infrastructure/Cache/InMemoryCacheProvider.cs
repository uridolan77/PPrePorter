using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Configuration;
using CachingService.Core.Events;
using CachingService.Core.Interfaces;
using CachingService.Core.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CachingService.Infrastructure.Cache;

/// <summary>
/// In-memory implementation of the cache provider interface
/// </summary>
public class InMemoryCacheProvider : ICacheProvider
{
    private readonly ConcurrentDictionary<string, object> _cache = new();
    private readonly CacheOptions _options;
    private readonly ILogger<InMemoryCacheProvider> _logger;
    private readonly ICacheEventPublisher _eventPublisher;
    private readonly CacheStatistics _statistics;
    private readonly SemaphoreSlim _statsLock = new(1, 1);

    public string ProviderId => "InMemory";

    public InMemoryCacheProvider(
        IOptions<CacheOptions> options,
        ILogger<InMemoryCacheProvider> logger,
        ICacheEventPublisher eventPublisher)
    {
        _options = options.Value;
        _logger = logger;
        _eventPublisher = eventPublisher;
        _statistics = new CacheStatistics
        {
            ProviderId = ProviderId,
            MemoryUsage = new MemoryUsage
            {
                AllocatedBytes = _options.InMemory.SizeLimit ?? 0,
                UsedBytes = 0
            }
        };
    }

    /// <inheritdoc />
    public async Task<CacheItem<T>?> GetAsync<T>(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        if (_cache.TryGetValue(fullKey, out object? value) && value is CacheItem<T> cacheItem)
        {
            if (cacheItem.IsExpired)
            {
                await RemoveAsync(key, region, cancellationToken);

                _eventPublisher.Publish(new CacheItemRemovedEvent
                {
                    Key = key,
                    Region = region,
                    ProviderId = ProviderId,
                    Reason = CacheItemRemovalReason.Expired
                });

                await IncrementStatisticAsync(x => x.Misses++);
                await IncrementRegionStatisticAsync(region, x => x.Misses++);

                return null;
            }

            cacheItem.RecordAccess();

            _eventPublisher.Publish(new CacheItemAccessedEvent
            {
                Key = key,
                Region = region,
                ProviderId = ProviderId,
                IsHit = true
            });

            await IncrementStatisticAsync(x => x.Hits++);
            await IncrementRegionStatisticAsync(region, x => x.Hits++);

            return cacheItem;
        }

        _eventPublisher.Publish(new CacheItemAccessedEvent
        {
            Key = key,
            Region = region,
            ProviderId = ProviderId,
            IsHit = false
        });

        await IncrementStatisticAsync(x => x.Misses++);
        await IncrementRegionStatisticAsync(region, x => x.Misses++);

        return null;
    }

    /// <inheritdoc />
    public Task<bool> SetAsync<T>(CacheItem<T> item, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(item.Key))
        {
            throw new ArgumentException("Cache key cannot be null or empty", nameof(item.Key));
        }

        string fullKey = GetFullKey(item.Key, item.Region);

        // Calculate size if tracking is enabled
        if (_options.TrackSize && !item.SizeInBytes.HasValue)
        {
            try
            {
                string json = JsonSerializer.Serialize(item.Value);
                item.SizeInBytes = json.Length * sizeof(char);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to calculate size for cache item {Key}", item.Key);
            }
        }

        // Check if we need to evict items due to size constraints
        if (_options.InMemory.SizeLimit.HasValue && GetCurrentCacheSize() + (item.SizeInBytes ?? 0) > _options.InMemory.SizeLimit.Value)
        {
            EvictItems();
        }

        bool replaced = _cache.ContainsKey(fullKey);
        _cache[fullKey] = item;

        Task.Run(() =>
        {
            if (replaced)
            {
                _eventPublisher.Publish(new CacheItemRemovedEvent
                {
                    Key = item.Key,
                    Region = item.Region,
                    ProviderId = ProviderId,
                    Reason = CacheItemRemovalReason.Replaced
                });
            }

            _eventPublisher.Publish(new CacheItemAddedEvent
            {
                Key = item.Key,
                Region = item.Region,
                ProviderId = ProviderId,
                ValueType = typeof(T),
                SizeInBytes = item.SizeInBytes,
                ExpiresAt = item.ExpiresAt
            });

            IncrementStatisticAsync(x =>
            {
                if (!replaced) x.ItemCount++;

                if (item.SizeInBytes.HasValue)
                {
                    if (x.MemoryUsage != null)
                    {
                        x.MemoryUsage.UsedBytes += item.SizeInBytes.Value;
                    }

                    if (x.TotalSizeInBytes.HasValue)
                    {
                        x.TotalSizeInBytes += item.SizeInBytes.Value;
                    }
                    else
                    {
                        x.TotalSizeInBytes = item.SizeInBytes.Value;
                    }
                }
            });

            IncrementRegionStatisticAsync(item.Region, x =>
            {
                if (!replaced) x.ItemCount++;

                if (item.SizeInBytes.HasValue)
                {
                    if (x.SizeInBytes.HasValue)
                    {
                        x.SizeInBytes += item.SizeInBytes.Value;
                    }
                    else
                    {
                        x.SizeInBytes = item.SizeInBytes.Value;
                    }
                }
            });
        });

        return Task.FromResult(true);
    }

    /// <inheritdoc />
    public Task<bool> RemoveAsync(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        bool result = _cache.TryRemove(fullKey, out object? removedItem);

        if (result && removedItem != null)
        {
            Task.Run(() =>
            {
                _eventPublisher.Publish(new CacheItemRemovedEvent
                {
                    Key = key,
                    Region = region,
                    ProviderId = ProviderId,
                    Reason = CacheItemRemovalReason.Removed
                });

                // Update statistics
                UpdateStatisticsForRemovedItem(removedItem, region);
            });
        }

        return Task.FromResult(result);
    }

    /// <inheritdoc />
    public Task<bool> ExistsAsync(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        if (_cache.TryGetValue(fullKey, out object? value))
        {
            // Check if the item is expired
            if (value is CacheItemBase cacheItem && cacheItem.IsExpired)
            {
                // Remove expired item asynchronously
                Task.Run(() => RemoveAsync(key, region, CancellationToken.None));
                return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    /// <inheritdoc />
    public async Task<bool> ClearAsync(string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        int removed = 0;

        if (region == null)
        {
            // Clear all items
            removed = _cache.Count;
            _cache.Clear();

            // Reset statistics
            await ResetStatisticsAsync();
        }
        else
        {
            // Clear only items in the specified region
            string prefix = $"{region}:";

            var keysToRemove = _cache.Keys
                .Where(k => k.StartsWith(prefix))
                .ToList();

            foreach (var key in keysToRemove)
            {
                if (_cache.TryRemove(key, out _))
                {
                    removed++;
                }
            }

            // Reset region statistics
            await ResetRegionStatisticsAsync(region);
        }

        _eventPublisher.Publish(new CacheClearedEvent
        {
            Region = region,
            ProviderId = ProviderId,
            ItemsRemoved = removed
        });

        return true;
    }

    /// <inheritdoc />
    public async Task<int> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(tag))
        {
            throw new ArgumentException("Tag cannot be null or empty", nameof(tag));
        }

        int removed = 0;
        var keysToRemove = new List<(string Key, string? Region)>();

        // Find all items with the specified tag
        foreach (var kvp in _cache)
        {
            if (kvp.Value is CacheItemBase cacheItem && cacheItem.Tags.Contains(tag))
            {
                // Parse out the original key and region
                string fullKey = kvp.Key;
                string? itemRegion = null;
                string itemKey = fullKey;

                int separatorIndex = fullKey.IndexOf(':');
                if (separatorIndex > 0)
                {
                    itemRegion = fullKey.Substring(0, separatorIndex);
                    itemKey = fullKey.Substring(separatorIndex + 1);
                }

                keysToRemove.Add((itemKey, itemRegion));
            }
        }

        // Remove the items
        foreach (var (key, itemRegion) in keysToRemove)
        {
            if (await RemoveAsync(key, itemRegion, cancellationToken))
            {
                removed++;
            }
        }

        return removed;
    }

    /// <inheritdoc />
    public Task<IEnumerable<string>> GetKeysAsync(string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IEnumerable<string> keys;

        if (region == null)
        {
            // Return all keys, stripped of region prefix
            keys = _cache.Keys.Select(k =>
            {
                int separatorIndex = k.IndexOf(':');
                return separatorIndex > 0 ? k.Substring(separatorIndex + 1) : k;
            });
        }
        else
        {
            // Return only keys in the specified region, stripped of region prefix
            string prefix = $"{region}:";
            keys = _cache.Keys
                .Where(k => k.StartsWith(prefix))
                .Select(k => k.Substring(prefix.Length));
        }

        return Task.FromResult(keys);
    }

    /// <inheritdoc />
    public Task<IEnumerable<string>> GetKeysByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(tag))
        {
            throw new ArgumentException("Tag cannot be null or empty", nameof(tag));
        }

        var keys = new List<string>();

        foreach (var kvp in _cache)
        {
            if (kvp.Value is CacheItemBase cacheItem && cacheItem.Tags.Contains(tag))
            {
                // Parse out the original key
                string fullKey = kvp.Key;
                string itemKey = fullKey;

                int separatorIndex = fullKey.IndexOf(':');
                if (separatorIndex > 0)
                {
                    itemKey = fullKey.Substring(separatorIndex + 1);
                }

                keys.Add(itemKey);
            }
        }

        return Task.FromResult(keys.AsEnumerable());
    }

    /// <inheritdoc />
    public async Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await _statsLock.WaitAsync(cancellationToken);
        try
        {
            // Update memory usage
            if (_statistics.MemoryUsage != null)
            {
                _statistics.MemoryUsage.UsedBytes = GetCurrentCacheSize();
            }

            // Create a copy to avoid returning a reference to the mutable statistics object
            return new CacheStatistics
            {
                ProviderId = _statistics.ProviderId,
                ItemCount = _statistics.ItemCount,
                TotalSizeInBytes = _statistics.TotalSizeInBytes,
                Hits = _statistics.Hits,
                Misses = _statistics.Misses,
                Evictions = _statistics.Evictions,
                LastResetTime = _statistics.LastResetTime,
                MemoryUsage = _statistics.MemoryUsage != null
                    ? new MemoryUsage
                    {
                        AllocatedBytes = _statistics.MemoryUsage.AllocatedBytes,
                        UsedBytes = _statistics.MemoryUsage.UsedBytes,
                        MaxBytes = _statistics.MemoryUsage.MaxBytes
                    }
                    : null,
                RegionStats = _statistics.RegionStats.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new RegionStatistics
                    {
                        Region = kvp.Value.Region,
                        ItemCount = kvp.Value.ItemCount,
                        SizeInBytes = kvp.Value.SizeInBytes,
                        Hits = kvp.Value.Hits,
                        Misses = kvp.Value.Misses
                    })
            };
        }
        finally
        {
            _statsLock.Release();
        }
    }

    /// <inheritdoc />
    public Task<bool> RefreshExpirationAsync(string key, TimeSpan? expiration = null, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        if (_cache.TryGetValue(fullKey, out object? value) && value is CacheItemBase cacheItem)
        {
            // If already expired, return false
            if (cacheItem.IsExpired)
            {
                return Task.FromResult(false);
            }

            // Set new expiration time
            cacheItem.ExpiresAt = expiration.HasValue
                ? DateTimeOffset.UtcNow.Add(expiration.Value)
                : DateTimeOffset.UtcNow.Add(_options.DefaultExpiration);

            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    /// <inheritdoc />
    public Task<IDictionary<string, T?>> GetAllAsync<T>(string region, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(region))
        {
            throw new ArgumentException("Region cannot be null or empty", nameof(region));
        }

        string prefix = $"{region}:";
        var result = new Dictionary<string, T?>();

        foreach (var kvp in _cache)
        {
            if (kvp.Key.StartsWith(prefix) && kvp.Value is CacheItem<T> cacheItem)
            {
                if (!cacheItem.IsExpired)
                {
                    string key = kvp.Key.Substring(prefix.Length);
                    result[key] = cacheItem.Value;
                    cacheItem.RecordAccess();
                }
            }
        }

        return Task.FromResult<IDictionary<string, T?>>(result);
    }

    /// <inheritdoc />
    public async Task<int> PerformMaintenanceAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        int removed = 0;
        var keysToRemove = new List<(string Key, string? Region)>();

        // Find all expired items
        foreach (var kvp in _cache)
        {
            if (kvp.Value is CacheItemBase cacheItem && cacheItem.IsExpired)
            {
                string fullKey = kvp.Key;
                string? itemRegion = null;
                string itemKey = fullKey;

                int separatorIndex = fullKey.IndexOf(':');
                if (separatorIndex > 0)
                {
                    itemRegion = fullKey.Substring(0, separatorIndex);
                    itemKey = fullKey.Substring(separatorIndex + 1);
                }

                keysToRemove.Add((itemKey, itemRegion));
            }
        }

        // Remove expired items
        foreach (var (key, itemRegion) in keysToRemove)
        {
            await RemoveAsync(key, itemRegion, cancellationToken);
            removed++;
        }

        // Check if we need to evict items due to size constraints
        if (_options.InMemory.SizeLimit.HasValue && GetCurrentCacheSize() > _options.InMemory.SizeLimit.Value)
        {
            int evicted = EvictItems();
            removed += evicted;
        }

        _eventPublisher.Publish(new CacheMaintenanceEvent
        {
            ProviderId = ProviderId,
            ItemsAffected = removed,
            MaintenanceType = "Cleanup"
        });

        return removed;
    }

    #region Helper Methods

    private string GetFullKey(string key, string? region)
    {
        return string.IsNullOrWhiteSpace(region) ? key : $"{region}:{key}";
    }

    private long GetCurrentCacheSize()
    {
        long size = 0;

        foreach (var item in _cache.Values)
        {
            if (item is CacheItemBase cacheItem && cacheItem.SizeInBytes.HasValue)
            {
                size += cacheItem.SizeInBytes.Value;
            }
        }

        return size;
    }

    private int EvictItems()
    {
        int evicted = 0;
        long currentSize = GetCurrentCacheSize();
        long targetSize = _options.InMemory.SizeLimit.HasValue
            ? (long)(_options.InMemory.SizeLimit.Value * (1 - _options.InMemory.CompactionPercentage))
            : 0;

        if (targetSize <= 0 || currentSize <= targetSize)
        {
            return evicted;
        }

        // Get all non-expired items
        var items = _cache.Values
            .OfType<CacheItemBase>()
            .Where(item => !item.IsExpired)
            .ToList();

        // Sort items based on eviction policy
        IEnumerable<CacheItemBase> sortedItems;

        switch (_options.InMemory.EvictionPolicy.ToUpperInvariant())
        {
            case "LRU":
                // Least Recently Used - evict items that haven't been accessed in the longest time
                sortedItems = items.OrderBy(item => item.LastAccessedAt);
                break;

            case "LFU":
                // Least Frequently Used - evict items that have been accessed the least
                sortedItems = items.OrderBy(item => item.AccessCount);
                break;

            case "FIFO":
                // First In First Out - evict oldest items first
                sortedItems = items.OrderBy(item => item.CreatedAt);
                break;

            default:
                // Default to LRU
                sortedItems = items.OrderBy(item => item.LastAccessedAt);
                break;
        }

        // Evict items until we reach the target size
        foreach (var item in sortedItems)
        {
            string fullKey = GetFullKey(item.Key, item.Region);

            if (_cache.TryRemove(fullKey, out object? removedItem))
            {
                evicted++;

                Task.Run(() =>
                {
                    _eventPublisher.Publish(new CacheItemRemovedEvent
                    {
                        Key = item.Key,
                        Region = item.Region,
                        ProviderId = ProviderId,
                        Reason = CacheItemRemovalReason.Evicted
                    });

                    // Update statistics
                    IncrementStatisticAsync(x => x.Evictions++);
                    UpdateStatisticsForRemovedItem(removedItem, item.Region);
                });

                // If item has a size, subtract it from the current size
                if (item.SizeInBytes.HasValue)
                {
                    currentSize -= item.SizeInBytes.Value;

                    // If we've reached the target size, stop evicting
                    if (currentSize <= targetSize)
                    {
                        break;
                    }
                }
            }
        }

        return evicted;
    }

    private async Task IncrementStatisticAsync(Action<CacheStatistics> action)
    {
        await _statsLock.WaitAsync();
        try
        {
            action(_statistics);
        }
        finally
        {
            _statsLock.Release();
        }
    }

    private async Task IncrementRegionStatisticAsync(string? region, Action<RegionStatistics> action)
    {
        if (string.IsNullOrWhiteSpace(region))
        {
            return;
        }

        await _statsLock.WaitAsync();
        try
        {
            if (!_statistics.RegionStats.TryGetValue(region, out RegionStatistics? regionStats))
            {
                regionStats = new RegionStatistics { Region = region };
                _statistics.RegionStats[region] = regionStats;
            }

            action(regionStats);
        }
        finally
        {
            _statsLock.Release();
        }
    }

    private async Task ResetStatisticsAsync()
    {
        await _statsLock.WaitAsync();
        try
        {
            _statistics.ItemCount = 0;
            _statistics.TotalSizeInBytes = 0;
            _statistics.Hits = 0;
            _statistics.Misses = 0;
            _statistics.Evictions = 0;
            _statistics.LastResetTime = DateTimeOffset.UtcNow;
            _statistics.RegionStats.Clear();

            if (_statistics.MemoryUsage != null)
            {
                _statistics.MemoryUsage.UsedBytes = 0;
            }
        }
        finally
        {
            _statsLock.Release();
        }
    }

    private async Task ResetRegionStatisticsAsync(string region)
    {
        if (string.IsNullOrWhiteSpace(region))
        {
            return;
        }

        await _statsLock.WaitAsync();
        try
        {
            if (_statistics.RegionStats.TryGetValue(region, out RegionStatistics? regionStats))
            {
                regionStats.ItemCount = 0;
                regionStats.SizeInBytes = 0;
                regionStats.Hits = 0;
                regionStats.Misses = 0;
            }
        }
        finally
        {
            _statsLock.Release();
        }
    }

    private void UpdateStatisticsForRemovedItem(object removedItem, string? region)
    {
        if (removedItem is CacheItemBase cacheItem && cacheItem.SizeInBytes.HasValue)
        {
            IncrementStatisticAsync(x =>
            {
                x.ItemCount--;

                if (x.TotalSizeInBytes.HasValue)
                {
                    x.TotalSizeInBytes -= cacheItem.SizeInBytes.Value;
                    if (x.TotalSizeInBytes < 0)
                    {
                        x.TotalSizeInBytes = 0;
                    }
                }

                if (x.MemoryUsage != null)
                {
                    x.MemoryUsage.UsedBytes -= cacheItem.SizeInBytes.Value;
                    if (x.MemoryUsage.UsedBytes < 0)
                    {
                        x.MemoryUsage.UsedBytes = 0;
                    }
                }
            });

            if (!string.IsNullOrWhiteSpace(region))
            {
                IncrementRegionStatisticAsync(region, x =>
                {
                    x.ItemCount--;

                    if (x.SizeInBytes.HasValue)
                    {
                        x.SizeInBytes -= cacheItem.SizeInBytes.Value;
                        if (x.SizeInBytes < 0)
                        {
                            x.SizeInBytes = 0;
                        }
                    }
                });
            }
        }
    }

    #endregion
}
