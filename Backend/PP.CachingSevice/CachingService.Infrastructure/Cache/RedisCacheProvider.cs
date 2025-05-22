using System;
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
using StackExchange.Redis;

namespace CachingService.Infrastructure.Cache;

/// <summary>
/// Redis implementation of the cache provider interface
/// </summary>
public class RedisCacheProvider : ICacheProvider
{
    private readonly CacheOptions _options;
    private readonly ILogger<RedisCacheProvider> _logger;
    private readonly ICacheEventPublisher _eventPublisher;
    private readonly Lazy<ConnectionMultiplexer> _redis;
    private readonly CacheStatistics _statistics;
    private readonly SemaphoreSlim _statsLock = new(1, 1);

    public string ProviderId => "Redis";

    public RedisCacheProvider(
        IOptions<CacheOptions> options,
        ILogger<RedisCacheProvider> logger,
        ICacheEventPublisher eventPublisher)
    {
        _options = options.Value;
        _logger = logger;
        _eventPublisher = eventPublisher;

        _redis = new Lazy<ConnectionMultiplexer>(() =>
        {
            try
            {
                var config = new ConfigurationOptions
                {
                    EndPoints = { _options.Redis.ConnectionString },
                    DefaultDatabase = _options.Redis.Database,
                    AbortOnConnectFail = false,
                    ConnectRetry = _options.Redis.Retry.MaxRetryAttempts,
                    ConnectTimeout = (int)_options.Redis.Retry.RetryDelay.TotalMilliseconds
                };

                return ConnectionMultiplexer.Connect(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to Redis at {ConnectionString}", _options.Redis.ConnectionString);
                throw;
            }
        });

        _statistics = new CacheStatistics
        {
            ProviderId = ProviderId
        };
    }

    private IDatabase Database => _redis.Value.GetDatabase();

    /// <inheritdoc />
    public async Task<CacheItem<T>?> GetAsync<T>(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        try
        {
            var redisValue = await Database.StringGetAsync(fullKey);

            if (redisValue.IsNull)
            {
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

            var cacheItem = JsonSerializer.Deserialize<CacheItem<T>>(redisValue.ToString());

            if (cacheItem == null)
            {
                _logger.LogWarning("Failed to deserialize cache item with key {Key}", key);
                return null;
            }

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

            // Update the item with the new access time
            await Database.StringSetAsync(
                fullKey,
                JsonSerializer.Serialize(cacheItem),
                cacheItem.ExpiresAt.HasValue ? cacheItem.ExpiresAt.Value - DateTimeOffset.UtcNow : (TimeSpan?)null);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache item with key {Key}", key);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<bool> SetAsync<T>(CacheItem<T> item, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(item.Key))
        {
            throw new ArgumentException("Cache key cannot be null or empty", nameof(item.Key));
        }

        string fullKey = GetFullKey(item.Key, item.Region);

        try
        {
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

            TimeSpan? expiry = item.ExpiresAt.HasValue ?
                item.ExpiresAt.Value - DateTimeOffset.UtcNow :
                null;

            string serializedItem = JsonSerializer.Serialize(item);

            bool replaced = await Database.KeyExistsAsync(fullKey);
            bool success = await Database.StringSetAsync(fullKey, serializedItem, expiry);

            if (success)
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

                await IncrementStatisticAsync(x =>
                {
                    if (!replaced) x.ItemCount++;

                    if (item.SizeInBytes.HasValue)
                    {
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

                await IncrementRegionStatisticAsync(item.Region, x =>
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

                // Add to tag indexes if tags are present
                if (item.Tags.Count > 0)
                {
                    foreach (var tag in item.Tags)
                    {
                        string tagKey = GetTagKey(tag);
                        await Database.SetAddAsync(tagKey, fullKey);
                    }
                }
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache item with key {Key}", item.Key);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> RemoveAsync(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        try
        {
            // Get the item first to update statistics
            var redisValue = await Database.StringGetAsync(fullKey);

            if (redisValue.IsNull)
            {
                return false;
            }

            // Remove from tag indexes
            var item = JsonSerializer.Deserialize<CacheItemBase>(redisValue.ToString());

            if (item != null && item.Tags.Count > 0)
            {
                foreach (var tag in item.Tags)
                {
                    string tagKey = GetTagKey(tag);
                    await Database.SetRemoveAsync(tagKey, fullKey);
                }
            }

            bool result = await Database.KeyDeleteAsync(fullKey);

            if (result)
            {
                _eventPublisher.Publish(new CacheItemRemovedEvent
                {
                    Key = key,
                    Region = region,
                    ProviderId = ProviderId,
                    Reason = CacheItemRemovalReason.Removed
                });

                // Update statistics
                if (item != null)
                {
                    await IncrementStatisticAsync(x =>
                    {
                        x.ItemCount--;

                        if (item.SizeInBytes.HasValue && x.TotalSizeInBytes.HasValue)
                        {
                            x.TotalSizeInBytes -= item.SizeInBytes.Value;
                            if (x.TotalSizeInBytes < 0)
                            {
                                x.TotalSizeInBytes = 0;
                            }
                        }
                    });

                    await IncrementRegionStatisticAsync(region, x =>
                    {
                        x.ItemCount--;

                        if (item.SizeInBytes.HasValue && x.SizeInBytes.HasValue)
                        {
                            x.SizeInBytes -= item.SizeInBytes.Value;
                            if (x.SizeInBytes < 0)
                            {
                                x.SizeInBytes = 0;
                            }
                        }
                    });
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache item with key {Key}", key);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(string key, string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        try
        {
            return await Database.KeyExistsAsync(fullKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if cache item exists with key {Key}", key);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ClearAsync(string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            long removed = 0;

            if (region == null)
            {
                // Clear all items with the cache prefix
                var server = GetServer();
                var keys = server.Keys(pattern: $"{_options.Redis.KeyPrefix}*");

                foreach (var key in keys)
                {
                    if (await Database.KeyDeleteAsync(key))
                    {
                        removed++;
                    }
                }

                // Reset statistics
                await ResetStatisticsAsync();
            }
            else
            {
                // Clear only items in the specified region
                var server = GetServer();
                var regionPrefix = $"{_options.Redis.KeyPrefix}{region}:";
                var keys = server.Keys(pattern: $"{regionPrefix}*");

                foreach (var key in keys)
                {
                    if (await Database.KeyDeleteAsync(key))
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache for region {Region}", region);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<int> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(tag))
        {
            throw new ArgumentException("Tag cannot be null or empty", nameof(tag));
        }

        try
        {
            string tagKey = GetTagKey(tag);
            var members = await Database.SetMembersAsync(tagKey);

            int removed = 0;

            foreach (var member in members)
            {
                string fullKey = member.ToString();

                // Get the item to update statistics
                var redisValue = await Database.StringGetAsync(fullKey);

                if (!redisValue.IsNull)
                {
                    var item = JsonSerializer.Deserialize<CacheItemBase>(redisValue.ToString());

                    if (await Database.KeyDeleteAsync(fullKey))
                    {
                        removed++;

                        // Extract original key and region from the full key
                        string? itemRegion = null;
                        string itemKey = fullKey;

                        if (fullKey.StartsWith(_options.Redis.KeyPrefix))
                        {
                            itemKey = fullKey.Substring(_options.Redis.KeyPrefix.Length);

                            int separatorIndex = itemKey.IndexOf(':');
                            if (separatorIndex > 0)
                            {
                                itemRegion = itemKey.Substring(0, separatorIndex);
                                itemKey = itemKey.Substring(separatorIndex + 1);
                            }
                        }

                        _eventPublisher.Publish(new CacheItemRemovedEvent
                        {
                            Key = itemKey,
                            Region = itemRegion,
                            ProviderId = ProviderId,
                            Reason = CacheItemRemovalReason.TagInvalidation
                        });

                        // Update statistics
                        if (item != null)
                        {
                            await IncrementStatisticAsync(x =>
                            {
                                x.ItemCount--;

                                if (item.SizeInBytes.HasValue && x.TotalSizeInBytes.HasValue)
                                {
                                    x.TotalSizeInBytes -= item.SizeInBytes.Value;
                                    if (x.TotalSizeInBytes < 0)
                                    {
                                        x.TotalSizeInBytes = 0;
                                    }
                                }
                            });

                            await IncrementRegionStatisticAsync(itemRegion, x =>
                            {
                                x.ItemCount--;

                                if (item.SizeInBytes.HasValue && x.SizeInBytes.HasValue)
                                {
                                    x.SizeInBytes -= item.SizeInBytes.Value;
                                    if (x.SizeInBytes < 0)
                                    {
                                        x.SizeInBytes = 0;
                                    }
                                }
                            });
                        }
                    }
                }
            }

            // Remove the tag set itself
            await Database.KeyDeleteAsync(tagKey);

            return removed;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing items by tag {Tag}", tag);
            return 0;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<string>> GetKeysAsync(string? region = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            var server = GetServer();
            var keys = new List<string>();

            if (region == null)
            {
                // Get all keys with the cache prefix
                var redisKeys = server.Keys(pattern: $"{_options.Redis.KeyPrefix}*");

                foreach (var redisKey in redisKeys)
                {
                    string fullKey = redisKey.ToString();

                    if (fullKey.StartsWith(_options.Redis.KeyPrefix))
                    {
                        string key = fullKey.Substring(_options.Redis.KeyPrefix.Length);

                        int separatorIndex = key.IndexOf(':');
                        if (separatorIndex > 0)
                        {
                            key = key.Substring(separatorIndex + 1);
                        }

                        keys.Add(key);
                    }
                }
            }
            else
            {
                // Get keys for the specified region
                string regionPrefix = $"{_options.Redis.KeyPrefix}{region}:";
                var redisKeys = server.Keys(pattern: $"{regionPrefix}*");

                foreach (var redisKey in redisKeys)
                {
                    string fullKey = redisKey.ToString();

                    if (fullKey.StartsWith(regionPrefix))
                    {
                        string key = fullKey.Substring(regionPrefix.Length);
                        keys.Add(key);
                    }
                }
            }

            return keys;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting keys for region {Region}", region);
            return Enumerable.Empty<string>();
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<string>> GetKeysByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(tag))
        {
            throw new ArgumentException("Tag cannot be null or empty", nameof(tag));
        }

        try
        {
            string tagKey = GetTagKey(tag);
            var members = await Database.SetMembersAsync(tagKey);
            var keys = new List<string>();

            foreach (var member in members)
            {
                string fullKey = member.ToString();

                // Extract original key from the full key
                string key = fullKey;

                if (fullKey.StartsWith(_options.Redis.KeyPrefix))
                {
                    key = fullKey.Substring(_options.Redis.KeyPrefix.Length);

                    int separatorIndex = key.IndexOf(':');
                    if (separatorIndex > 0)
                    {
                        key = key.Substring(separatorIndex + 1);
                    }
                }

                keys.Add(key);
            }

            return keys;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting keys by tag {Tag}", tag);
            return Enumerable.Empty<string>();
        }
    }

    /// <inheritdoc />
    public async Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await _statsLock.WaitAsync(cancellationToken);
        try
        {
            // Update memory usage if available
            try
            {
                var server = GetServer();
                var infoRaw = server.Info("memory");
                var info = infoRaw.SelectMany(section => section).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

                if (info.TryGetValue("used_memory", out string? usedMemoryStr) &&
                    long.TryParse(usedMemoryStr, out long usedMemory))
                {
                    if (_statistics.MemoryUsage == null)
                    {
                        _statistics.MemoryUsage = new MemoryUsage();
                    }

                    _statistics.MemoryUsage.UsedBytes = usedMemory;

                    if (info.TryGetValue("maxmemory", out string? maxMemoryStr) &&
                        long.TryParse(maxMemoryStr, out long maxMemory) &&
                        maxMemory > 0)
                    {
                        _statistics.MemoryUsage.MaxBytes = maxMemory;
                        _statistics.MemoryUsage.AllocatedBytes = maxMemory;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting Redis memory usage");
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
    public async Task<bool> RefreshExpirationAsync(
        string key,
        TimeSpan? expiration = null,
        string? region = null,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string fullKey = GetFullKey(key, region);

        try
        {
            var redisValue = await Database.StringGetAsync(fullKey);

            if (redisValue.IsNull)
            {
                return false;
            }

            var cacheItem = JsonSerializer.Deserialize<CacheItemBase>(redisValue.ToString());

            if (cacheItem == null)
            {
                return false;
            }

            if (cacheItem.IsExpired)
            {
                return false;
            }

            // Set new expiration time
            cacheItem.ExpiresAt = expiration.HasValue
                ? DateTimeOffset.UtcNow.Add(expiration.Value)
                : DateTimeOffset.UtcNow.Add(_options.DefaultExpiration);

            // Update the item in Redis
            TimeSpan? redisExpiry = cacheItem.ExpiresAt.HasValue
                ? cacheItem.ExpiresAt.Value - DateTimeOffset.UtcNow
                : null;

            string serializedItem = JsonSerializer.Serialize(cacheItem);

            return await Database.StringSetAsync(fullKey, serializedItem, redisExpiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing expiration for cache item with key {Key}", key);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<IDictionary<string, T?>> GetAllAsync<T>(string region, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(region))
        {
            throw new ArgumentException("Region cannot be null or empty", nameof(region));
        }

        try
        {
            var server = GetServer();
            string regionPrefix = $"{_options.Redis.KeyPrefix}{region}:";
            var redisKeys = server.Keys(pattern: $"{regionPrefix}*");
            var result = new Dictionary<string, T?>();

            foreach (var redisKey in redisKeys)
            {
                string fullKey = redisKey.ToString();

                if (fullKey.StartsWith(regionPrefix))
                {
                    string key = fullKey.Substring(regionPrefix.Length);
                    var redisValue = await Database.StringGetAsync(fullKey);

                    if (!redisValue.IsNull)
                    {
                        var cacheItem = JsonSerializer.Deserialize<CacheItem<T>>(redisValue.ToString());

                        if (cacheItem != null && !cacheItem.IsExpired)
                        {
                            result[key] = cacheItem.Value;
                            cacheItem.RecordAccess();

                            // Update the item with the new access time
                            await Database.StringSetAsync(
                                fullKey,
                                JsonSerializer.Serialize(cacheItem),
                                cacheItem.ExpiresAt.HasValue ? cacheItem.ExpiresAt.Value - DateTimeOffset.UtcNow : (TimeSpan?)null);
                        }
                    }
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all cache items for region {Region}", region);
            return new Dictionary<string, T?>();
        }
    }

    /// <inheritdoc />
    public async Task<int> PerformMaintenanceAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            // Redis handles expiration automatically, so we don't need to do much here
            // We could potentially clean up empty tag sets
            var server = GetServer();
            var tagKeys = server.Keys(pattern: $"{_options.Redis.KeyPrefix}tag:*");
            int removed = 0;

            foreach (var tagKey in tagKeys)
            {
                long setSize = await Database.SetLengthAsync(tagKey);

                if (setSize == 0)
                {
                    if (await Database.KeyDeleteAsync(tagKey))
                    {
                        removed++;
                    }
                }
            }

            if (removed > 0)
            {
                _eventPublisher.Publish(new CacheMaintenanceEvent
                {
                    ProviderId = ProviderId,
                    ItemsAffected = removed,
                    MaintenanceType = "TagCleanup"
                });
            }

            return removed;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing cache maintenance");
            return 0;
        }
    }

    #region Helper Methods

    private string GetFullKey(string key, string? region)
    {
        return string.IsNullOrWhiteSpace(region)
            ? $"{_options.Redis.KeyPrefix}{key}"
            : $"{_options.Redis.KeyPrefix}{region}:{key}";
    }

    private string GetTagKey(string tag)
    {
        return $"{_options.Redis.KeyPrefix}tag:{tag}";
    }

    private IServer GetServer()
    {
        var endpoints = _redis.Value.GetEndPoints();
        return _redis.Value.GetServer(endpoints[0]);
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

    #endregion
}
