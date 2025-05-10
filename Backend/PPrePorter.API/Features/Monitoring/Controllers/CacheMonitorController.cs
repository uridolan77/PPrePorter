using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Monitoring.Controllers
{
    [ApiController]
    [Route("api/cache-monitor")]
    [AllowAnonymous] // Allow anonymous access for testing
    public class CacheMonitorController : ControllerBase
    {
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<CacheMonitorController> _logger;

        public CacheMonitorController(
            IGlobalCacheService cacheService,
            ILogger<CacheMonitorController> logger)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Test if the global cache is working
        /// </summary>
        [HttpGet("test")]
        public IActionResult TestCache()
        {
            // Create a test cache entry
            string testKey = "GlobalCache_Test";
            var testValue = DateTime.UtcNow;
            
            // Set the test value in cache
            _cacheService.Set(testKey, testValue, TimeSpan.FromMinutes(5));
            
            // Try to retrieve it immediately
            bool retrievedSuccessfully = _cacheService.TryGetValue(testKey, out DateTime value);
            
            return Ok(new
            {
                cacheStatus = "Active",
                cacheServiceHashCode = _cacheService.GetHashCode(),
                testKey,
                testValue,
                retrievedSuccessfully,
                retrievedValue = value,
                timeDifference = retrievedSuccessfully ? (DateTime.UtcNow - value).TotalMilliseconds : 0,
                message = "If retrievedSuccessfully is true and timeDifference is small, the cache is working correctly."
            });
        }

        /// <summary>
        /// Get cache statistics
        /// </summary>
        [HttpGet("stats")]
        public IActionResult GetCacheStatistics()
        {
            var stats = _cacheService.GetStatistics();
            return Ok(stats);
        }

        /// <summary>
        /// Clear the cache
        /// </summary>
        [HttpPost("clear")]
        public IActionResult ClearCache()
        {
            try
            {
                // Get the cache service hash code before clearing
                var cacheServiceHashCode = _cacheService.GetHashCode();
                
                // Clear the cache
                _cacheService.Clear();
                
                // Create a test cache entry to verify the cache is still working
                string testKey = "GlobalCache_Test_AfterClear";
                var testValue = DateTime.UtcNow;
                
                // Set the test value in cache
                _cacheService.Set(testKey, testValue, TimeSpan.FromMinutes(5));
                
                // Try to retrieve it immediately
                bool retrievedSuccessfully = _cacheService.TryGetValue(testKey, out DateTime value);
                
                return Ok(new
                {
                    message = "Cache cleared successfully",
                    cacheServiceHashCode,
                    cacheStillWorking = retrievedSuccessfully,
                    testValue,
                    retrievedValue = value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache");
                return StatusCode(500, new { message = "An error occurred while clearing the cache", error = ex.Message });
            }
        }
    }
}
