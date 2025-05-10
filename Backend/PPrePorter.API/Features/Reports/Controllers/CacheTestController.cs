using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Reports.Controllers
{
    [ApiController]
    [Route("api/cache-test")]
    [AllowAnonymous] // Allow anonymous access for testing
    public class CacheTestController : ControllerBase
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CacheTestController> _logger;
        private const string TEST_CACHE_KEY = "CacheTest_Key";

        public CacheTestController(
            IMemoryCache memoryCache,
            ILogger<CacheTestController> logger)
        {
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Test if the memory cache is working
        /// </summary>
        [HttpGet("memory-cache")]
        [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByHeader = "Accept-Encoding")]
        public IActionResult TestMemoryCache()
        {
            // Try to get from cache
            if (_memoryCache.TryGetValue(TEST_CACHE_KEY, out DateTime cachedTime))
            {
                _logger.LogInformation("CACHE HIT: Retrieved value from cache with key: {CacheKey}", TEST_CACHE_KEY);

                // Add cache hit header
                Response.Headers.Append("X-Cache-Hit", "true");

                return Ok(new
                {
                    cacheHit = true,
                    cachedTime = cachedTime,
                    currentTime = DateTime.UtcNow,
                    timeDifference = (DateTime.UtcNow - cachedTime).TotalSeconds
                });
            }

            // Cache miss - store current time in cache
            var currentTime = DateTime.UtcNow;

            // Set cache options with size
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetPriority(CacheItemPriority.High)
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10))
                .SetSize(1); // Set a small size for the DateTime object

            // Store in cache
            _memoryCache.Set(TEST_CACHE_KEY, currentTime, cacheOptions);

            _logger.LogWarning("CACHE MISS: Stored value in cache with key: {CacheKey}", TEST_CACHE_KEY);

            // Add cache miss header
            Response.Headers.Append("X-Cache-Miss", "true");

            return Ok(new
            {
                cacheHit = false,
                currentTime = currentTime,
                message = "Value stored in cache. Refresh to see if cache is working."
            });
        }

        /// <summary>
        /// Clear the test cache entry
        /// </summary>
        [HttpDelete("memory-cache")]
        public IActionResult ClearMemoryCache()
        {
            _memoryCache.Remove(TEST_CACHE_KEY);
            _logger.LogInformation("Removed cache entry with key: {CacheKey}", TEST_CACHE_KEY);

            return Ok(new
            {
                message = "Cache entry removed"
            });
        }

        /// <summary>
        /// Test response caching middleware
        /// </summary>
        [HttpGet("response-cache")]
        [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByHeader = "Accept-Encoding")]
        public IActionResult TestResponseCache()
        {
            // This endpoint demonstrates response caching
            // The entire response will be cached by the middleware

            // Add cache headers
            Response.Headers.Append("X-Response-Cache-Test", "true");

            // Add Cache-Control header explicitly
            Response.Headers.CacheControl = "public, max-age=60";

            // Add Expires header
            var expiresDate = DateTime.UtcNow.AddSeconds(60);
            Response.Headers.Expires = expiresDate.ToString("R");

            // Add ETag for validation
            string etag = $"\"{Guid.NewGuid():N}\"";
            Response.Headers.ETag = etag;

            // Log the request to help with debugging
            _logger.LogInformation("Response cache test requested at {Time} with ETag {ETag}",
                DateTime.UtcNow, etag);

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                message = "This response should be cached for 60 seconds. Refresh to see if the timestamp changes.",
                cacheInfo = "If the timestamp doesn't change on refresh, the response is being served from cache.",
                requestTime = DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                etag = etag
            });
        }

        /// <summary>
        /// Test both memory cache and response cache together
        /// </summary>
        [HttpGet("combined-cache")]
        [ResponseCache(Duration = 30, Location = ResponseCacheLocation.Any, VaryByHeader = "Accept-Encoding")]
        public IActionResult TestCombinedCache()
        {
            string cacheKey = "CombinedCacheTest";
            DateTime cachedTime;
            bool cacheHit = false;
            string requestId = Guid.NewGuid().ToString("N");

            // Try to get from memory cache
            if (_memoryCache.TryGetValue(cacheKey, out cachedTime))
            {
                cacheHit = true;
                _logger.LogInformation("MEMORY CACHE HIT: Retrieved value with key: {CacheKey}, RequestId: {RequestId}",
                    cacheKey, requestId);
            }
            else
            {
                // Cache miss - store current time in cache
                cachedTime = DateTime.UtcNow;

                // Set cache options with size
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(1))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
                    .SetSize(1);

                // Store in cache
                _memoryCache.Set(cacheKey, cachedTime, cacheOptions);
                _logger.LogWarning("MEMORY CACHE MISS: Stored value with key: {CacheKey}, RequestId: {RequestId}",
                    cacheKey, requestId);
            }

            // Add appropriate headers
            if (cacheHit)
            {
                Response.Headers.Append("X-Memory-Cache-Hit", "true");
            }
            else
            {
                Response.Headers.Append("X-Memory-Cache-Miss", "true");
            }

            // Add explicit cache control headers
            Response.Headers.CacheControl = "public, max-age=30";
            var expiresDate = DateTime.UtcNow.AddSeconds(30);
            Response.Headers.Expires = expiresDate.ToString("R");

            // Add request ID for tracking
            Response.Headers.Append("X-Request-ID", requestId);

            // Log the request
            _logger.LogInformation("Combined cache test requested at {Time}, RequestId: {RequestId}",
                DateTime.UtcNow, requestId);

            // The entire response will also be cached by the middleware
            return Ok(new
            {
                requestId = requestId,
                requestTime = DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                memoryCache = new
                {
                    hit = cacheHit,
                    cachedTime = cachedTime,
                    timeDifference = (DateTime.UtcNow - cachedTime).TotalSeconds
                },
                responseCache = new
                {
                    currentTime = DateTime.UtcNow,
                    message = "This response should be cached for 30 seconds by the response caching middleware."
                }
            });
        }
    }
}
