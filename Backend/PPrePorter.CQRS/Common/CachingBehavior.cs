using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Attribute for marking queries as cacheable
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public sealed class CacheableQueryAttribute : Attribute
    {
        /// <summary>
        /// Gets or sets the cache key
        /// </summary>
        public string CacheKey { get; }

        /// <summary>
        /// Gets or sets the cache duration in seconds
        /// </summary>
        public int DurationSeconds { get; }

        /// <summary>
        /// Creates a new cacheable query attribute
        /// </summary>
        /// <param name="cacheKey">The cache key</param>
        /// <param name="durationSeconds">The cache duration in seconds</param>
        public CacheableQueryAttribute(string cacheKey, int durationSeconds = 60)
        {
            CacheKey = cacheKey;
            DurationSeconds = durationSeconds;
        }
    }

    /// <summary>
    /// Pipeline behavior for caching query results
    /// </summary>
    /// <typeparam name="TRequest">The type of the request</typeparam>
    /// <typeparam name="TResponse">The type of the response</typeparam>
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

        public CachingBehavior(
            IMemoryCache cache,
            ILogger<CachingBehavior<TRequest, TResponse>> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Handles the request
        /// </summary>
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Check if the request is cacheable
            var attribute = typeof(TRequest).GetCustomAttributes(typeof(CacheableQueryAttribute), false)
                .FirstOrDefault() as CacheableQueryAttribute;

            if (attribute == null)
            {
                // If the request is not cacheable, continue
                return await next();
            }

            // Get the cache key
            var cacheKey = GetCacheKey(attribute.CacheKey, request);

            // Try to get the response from the cache
            if (_cache.TryGetValue(cacheKey, out TResponse cachedResponse))
            {
                _logger.LogInformation("Returning cached result for {RequestType} with key {CacheKey}",
                    typeof(TRequest).Name, cacheKey);
                return cachedResponse;
            }

            // If the response is not in the cache, continue
            var response = await next();

            // Cache the response
            _cache.Set(cacheKey, response, TimeSpan.FromSeconds(attribute.DurationSeconds));

            _logger.LogInformation("Caching result for {RequestType} with key {CacheKey} for {DurationSeconds} seconds",
                typeof(TRequest).Name, cacheKey, attribute.DurationSeconds);

            return response;
        }

        /// <summary>
        /// Gets the cache key for the request
        /// </summary>
        /// <param name="baseCacheKey">The base cache key</param>
        /// <param name="request">The request</param>
        /// <returns>The cache key</returns>
        private string GetCacheKey(string baseCacheKey, TRequest request)
        {
            // Serialize the request to JSON to include it in the cache key
            var requestJson = JsonSerializer.Serialize(request);

            // Create a hash of the request JSON
            var requestHash = requestJson.GetHashCode().ToString("X");

            // Combine the base cache key and the request hash
            return $"{baseCacheKey}_{requestHash}";
        }
    }
}
