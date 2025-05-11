using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Monitoring.Controllers
{
    [ApiController]
    [Route("api/cache-diagnostics")]
    [AllowAnonymous] // Allow anonymous access for testing
    [ApiExplorerSettings(GroupName = SwaggerGroups.CacheDiagnostics)]
    public class CacheDiagnosticsController : ControllerBase
    {
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _globalCacheService;
        private readonly CacheSettings _cacheSettings;
        private readonly ILogger<CacheDiagnosticsController> _logger;

        public CacheDiagnosticsController(
            IMemoryCache memoryCache,
            IGlobalCacheService globalCacheService,
            IOptions<CacheSettings> cacheSettings,
            ILogger<CacheDiagnosticsController> logger)
        {
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _globalCacheService = globalCacheService ?? throw new ArgumentNullException(nameof(globalCacheService));
            _cacheSettings = cacheSettings?.Value ?? throw new ArgumentNullException(nameof(cacheSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get cache diagnostics information
        /// </summary>
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult GetCacheDiagnostics()
        {
            // Get cache statistics
            var globalCacheStats = _globalCacheService.GetStatistics();

            // Get memory cache statistics using reflection (since there's no public API)
            var memoryCacheStats = GetMemoryCacheStats();

            // Get cache settings
            var settings = new
            {
                Enabled = _cacheSettings.Enabled,
                MemoryCacheSizeLimitMB = _cacheSettings.MemoryCacheSizeLimitMB,
                MemoryCacheCompactionPercentage = _cacheSettings.MemoryCacheCompactionPercentage,
                DefaultSlidingExpirationMinutes = _cacheSettings.DefaultSlidingExpirationMinutes,
                DefaultAbsoluteExpirationMinutes = _cacheSettings.DefaultAbsoluteExpirationMinutes,
                DefaultResponseCacheDurationSeconds = _cacheSettings.DefaultResponseCacheDurationSeconds,
                MaxResponseBodySizeMB = _cacheSettings.MaxResponseBodySizeMB,
                UseCaseSensitivePaths = _cacheSettings.UseCaseSensitivePaths,
                DefaultCachePriority = _cacheSettings.DefaultCachePriority.ToString(),
                DefaultCacheEntrySize = _cacheSettings.DefaultCacheEntrySize,
                ExcludedPaths = _cacheSettings.ExcludedPaths,
                ExcludedMethods = _cacheSettings.ExcludedMethods
            };

            // Add response headers for diagnostics
            Response.Headers.Append("X-Cache-Diagnostics", "true");
            Response.Headers.Append("X-Cache-Enabled", _cacheSettings.Enabled.ToString());

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                cacheSettings = settings,
                globalCacheStatistics = globalCacheStats,
                memoryCacheStatistics = memoryCacheStats,
                requestHeaders = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                responseHeaders = Response.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())
            });
        }

        /// <summary>
        /// Test response caching with a simple endpoint
        /// </summary>
        [HttpGet("test")]
        [ResponseCache(Duration = 30, Location = ResponseCacheLocation.Any, VaryByHeader = "Accept-Encoding")]
        public IActionResult TestResponseCaching()
        {
            string requestId = Guid.NewGuid().ToString("N");

            // Add explicit cache control headers
            Response.Headers.CacheControl = "public, max-age=30";
            var expiresDate = DateTime.UtcNow.AddSeconds(30);
            Response.Headers.Expires = expiresDate.ToString("R");

            // Add request ID for tracking
            Response.Headers.Append("X-Request-ID", requestId);

            // Log the request
            _logger.LogInformation("Cache diagnostics test requested at {Time}, RequestId: {RequestId}",
                DateTime.UtcNow, requestId);

            return Ok(new
            {
                requestId = requestId,
                timestamp = DateTime.UtcNow,
                message = "This response should be cached for 30 seconds. Refresh to see if the timestamp changes.",
                requestTime = DateTime.UtcNow.ToString("HH:mm:ss.fff")
            });
        }

        /// <summary>
        /// Get memory cache statistics using reflection
        /// </summary>
        private object GetMemoryCacheStats()
        {
            try
            {
                // Use reflection to access internal cache statistics
                var cacheType = _memoryCache.GetType();

                // Try to get the cache entries count
                int entriesCount = 0;
                var entriesField = cacheType.GetField("_entries", BindingFlags.NonPublic | BindingFlags.Instance);
                if (entriesField != null)
                {
                    var entries = entriesField.GetValue(_memoryCache);
                    if (entries != null)
                    {
                        var countProperty = entries.GetType().GetProperty("Count");
                        if (countProperty != null)
                        {
                            entriesCount = (int)countProperty.GetValue(entries);
                        }
                    }
                }

                return new
                {
                    EntriesCount = entriesCount,
                    MemoryCacheType = cacheType.FullName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memory cache statistics");
                return new { Error = "Failed to get memory cache statistics" };
            }
        }
    }
}
