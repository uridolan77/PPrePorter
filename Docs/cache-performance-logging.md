# Cache Performance Logging

This document provides information about the performance logging added to the caching system in the PPrePorter application, particularly for the DailyActions data.

## Performance Metrics

The application now includes detailed performance metrics for all cache operations with millisecond timestamps:

### Method Performance

```log
PERF [12:34:56.789]: Starting GetDailyActionsAsync
PERF [12:34:56.789]: GetDailyActionsAsync completed with CACHE HIT in 15.3ms
PERF [12:34:56.789]: GetDailyActionsAsync completed with CACHE MISS in 1250.7ms
```

### Cache Operation Performance

```log
PERF [12:34:56.789]: Cache set operation completed in 8.5ms
PERF [12:34:56.789]: Database query for daily actions completed in 1150.2ms
```

### Request Performance

```log
PERF [12:34:56.789]: Starting GetDailyActionsData request
PERF [12:34:56.789]: GetDailyActionsAsync completed in 15.3ms
PERF [12:34:56.789]: GetSummaryMetricsAsync completed in 12.1ms
PERF [12:34:56.789]: Total GetDailyActionsData request completed in 45.8ms
```

## Enhanced Cache Logging

The application logs detailed information about cache operations with millisecond timestamps:

### Cache Key Generation

```log
CACHE KEY GENERATION [12:34:56.789]: Generated cache key for daily actions: DailyActions_Data_20250509_20250510_2 with parameters: startDate=2025-05-09, endDate=2025-05-10, whiteLabelId=2
```

### Cache Hit

```log
CACHE HIT [12:34:56.789]: Retrieved daily actions from cache for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2, count: 145, retrieval time: 5.2ms
```

### Cache Miss

```log
CACHE MISS [12:34:56.789]: Getting daily actions from database for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2
```

### Cache Set

```log
CACHE SET SUCCESS [12:34:56.789]: Cached daily actions for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2, estimated size: 145000 bytes, count: 145
```

## Performance Analysis

The performance logging helps identify bottlenecks in the caching system:

1. **Cache Key Generation**: Typically very fast (< 1ms)
2. **Cache Lookup**: Should be fast (< 10ms)
3. **Database Query**: Typically slow (100ms - several seconds)
4. **Cache Set**: Should be relatively fast (< 50ms)
5. **Total Request Time**: Varies based on cache hit/miss

### Cache Hit vs. Miss Performance

A cache hit should be significantly faster than a cache miss:

- **Cache Hit**: Typically 10-50ms total request time
- **Cache Miss**: Typically 500-5000ms total request time (depending on database query complexity)

If cache hits are not significantly faster than cache misses, there may be issues with:

1. The cache implementation
2. The serialization/deserialization of cached objects
3. The cache key generation
4. The cache verification process

## Troubleshooting Slow Cache Performance

If cache hits are not providing the expected performance improvement:

1. **Check Cache Lookup Time**: If > 10ms, the cache lookup may be inefficient
2. **Check Object Size**: Large objects may take longer to deserialize
3. **Check Cache Implementation**: Memory cache should be very fast
4. **Check Cache Verification**: Verification should be minimal for cache hits

## Example Performance Analysis

```log
PERF [12:34:56.789]: Starting GetDailyActionsData request
CACHE KEY GENERATION [12:34:56.790]: Generated cache key for daily actions: DailyActions_Data_20250509_20250510_2
CACHE CHECK [12:34:56.791]: Checking cache for daily actions with key: DailyActions_Data_20250509_20250510_2
CACHE RESULT [12:34:56.795]: TryGetValue returned True for key DailyActions_Data_20250509_20250510_2 in 4.2ms
CACHE HIT [12:34:56.796]: Retrieved daily actions from cache, count: 145, retrieval time: 5.2ms
PERF [12:34:56.797]: GetDailyActionsAsync completed with CACHE HIT in 8.3ms
PERF [12:34:56.810]: Total GetDailyActionsData request completed in 21.5ms
```

This example shows a fast cache hit with good performance:
- Cache key generation: ~1ms
- Cache lookup: ~4ms
- Total cache retrieval: ~5ms
- Total method time: ~8ms
- Total request time: ~21ms

## Conclusion

The detailed performance logging helps identify where time is being spent in the caching system. By analyzing these logs, you can determine if the cache is providing the expected performance benefits and identify any bottlenecks in the system.
