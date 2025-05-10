# PPrePorter Caching Strategy

This document outlines the caching strategy implemented in the PPrePorter application.

## Overview

The PPrePorter application uses a distributed caching approach to improve performance and reduce database load. The caching implementation is based on the following principles:

1. **Distributed Caching**: Using Redis as the primary caching mechanism for production environments
2. **Fallback Mechanism**: Using in-memory caching as a fallback for development environments
3. **Consistent Interface**: Using a common interface (`ICachingService`) for all caching operations
4. **Configurable Expiration**: Supporting both sliding and absolute expiration policies

## Implementation Details

### Caching Service

The application uses the `RedisCachingService` implementation of the `ICachingService` interface. This service provides the following functionality:

- **GetOrCreateAsync**: Retrieves a value from the cache or creates it using a factory method if it doesn't exist
- **RemoveAsync**: Removes a value from the cache
- **ExistsAsync**: Checks if a key exists in the cache

### Configuration

The caching service is configured in `Program.cs` to use Redis in production environments and fall back to in-memory caching in development environments:

```csharp
// Configure Redis for distributed caching
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    // Use Redis for distributed caching in production
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "PPrePorter:";
    });
    Console.WriteLine("Using Redis for distributed caching");
}
else
{
    // Fallback to in-memory cache for development
    builder.Services.AddDistributedMemoryCache();
    Console.WriteLine("Using in-memory distributed cache (Redis not configured)");
}

// Register the real caching service implementation
builder.Services.AddScoped<ICachingService, RedisCachingService>();
```

### Redis Connection String

The Redis connection string is configured in `appsettings.json`:

```json
"ConnectionStrings": {
  "Redis": "localhost:6379,abortConnect=false",
  // Other connection strings...
}
```

## Usage Examples

### Caching Dashboard Data

```csharp
public async Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request)
{
    var cacheKey = $"dashboard:summary:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

    return await _cachingService.GetOrCreateAsync(
        cacheKey,
        async () => await FetchDashboardSummaryAsync(request),
        slidingExpiration: TimeSpan.FromMinutes(15),
        absoluteExpiration: TimeSpan.FromHours(1));
}
```

### Caching Report Data

```csharp
public async Task<ReportResult> GenerateReportAsync(ReportRequest request, string userId)
{
    var cacheKey = $"report:{request.ReportType}:{userId}:{request.GetHashCode()}";
    
    return await _cachingService.GetOrCreateAsync(
        cacheKey,
        async () => await _reportGenerator.GenerateReportAsync(request),
        slidingExpiration: TimeSpan.FromMinutes(30),
        absoluteExpiration: TimeSpan.FromHours(2));
}
```

## Cache Invalidation Strategy

Cache invalidation is handled in the following ways:

1. **Time-Based Expiration**: Using sliding and absolute expiration policies
2. **Explicit Invalidation**: Using the `RemoveAsync` method when data is updated
3. **Key Namespacing**: Using consistent key naming conventions to allow for targeted invalidation

## Best Practices

When using the caching service, follow these best practices:

1. **Use Consistent Key Naming**: Follow the pattern `{entity}:{identifier}:{parameters}` for cache keys
2. **Set Appropriate Expiration Times**: Use shorter expiration times for frequently changing data
3. **Handle Cache Failures Gracefully**: The caching service is designed to fall back to the factory method if caching fails
4. **Cache at the Service Level**: Implement caching in service methods rather than controllers or repositories
5. **Consider Data Size**: Only cache data that is expensive to compute or retrieve and is of reasonable size

## Testing

The caching implementation includes unit tests that verify the behavior of the `RedisCachingService`. These tests cover:

- Cache hits and misses
- Error handling
- Cache invalidation

## Future Improvements

Potential future improvements to the caching strategy include:

1. **Tag-Based Invalidation**: Adding support for invalidating groups of related cache entries
2. **Cache Compression**: Implementing compression for large cached objects
3. **Cache Metrics**: Adding detailed metrics for cache hit/miss rates and performance
4. **Cache Warming**: Implementing proactive cache warming for frequently accessed data
5. **Circuit Breaker**: Adding a circuit breaker pattern for Redis connection failures
