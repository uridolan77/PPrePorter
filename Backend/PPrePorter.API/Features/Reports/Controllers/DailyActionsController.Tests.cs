using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System.Diagnostics;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Partial class for DailyActionsController containing test endpoints
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Test cache functionality with a simple key
        /// </summary>
        [HttpGet("test-cache")]
        [AllowAnonymous]
        public async Task<IActionResult> TestCache([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                // Default date range to tomorrow-day after tomorrow to avoid conflicts with real data
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var dayAfterTomorrow = today.AddDays(2);
                var start = startDate?.Date ?? tomorrow;
                var end = endDate?.Date ?? dayAfterTomorrow;

                // Get cache service
                var cacheService = HttpContext.RequestServices.GetService<IGlobalCacheService>();
                if (cacheService == null)
                {
                    return StatusCode(500, new { message = "Cache service not available" });
                }

                // Create a cache key
                var cacheKey = $"DailyActions_Data_{start:yyyyMMdd}_{end:yyyyMMdd}_all";
                _logger.LogInformation("TEST CACHE: Testing cache with key {CacheKey}", cacheKey);

                // Check if the key exists in the cache before first call
                var initialCacheCheck = cacheService.TryGetValue<IEnumerable<DailyAction>>(cacheKey, out var initialCacheResult);
                _logger.LogInformation("TEST CACHE: Initial cache check - key exists: {Exists}, value is null: {IsNull}",
                    initialCacheCheck, initialCacheResult == null);

                // Get all cache keys
                var cacheKeys = cacheService.GetAllKeys();
                var dailyActionsKeys = cacheKeys.Where(k => k.Contains("DailyActions")).ToList();
                _logger.LogInformation("TEST CACHE: Found {TotalCount} total cache keys, {DailyActionsCount} related to DailyActions",
                    cacheKeys.Count, dailyActionsKeys.Count);

                // Get cache statistics
                var cacheStats = cacheService.GetStatistics();
                _logger.LogInformation("TEST CACHE: Cache statistics: {Stats}",
                    string.Join(", ", cacheStats.Select(kvp => $"{kvp.Key}={kvp.Value}")));

                // First call - should be a cache miss
                _logger.LogInformation("TEST CACHE: First call - should be a cache miss");
                var stopwatch1 = Stopwatch.StartNew();
                var result1 = await _dailyActionsService.GetDailyActionsAsync(start, end);
                stopwatch1.Stop();
                _logger.LogInformation("TEST CACHE: First call took {ElapsedMs}ms", stopwatch1.ElapsedMilliseconds);

                // Check if the key exists in the cache after first call
                var afterFirstCallCheck = cacheService.TryGetValue<IEnumerable<DailyAction>>(cacheKey, out var afterFirstCallResult);
                _logger.LogInformation("TEST CACHE: After first call - key exists: {Exists}, value is null: {IsNull}, count: {Count}",
                    afterFirstCallCheck, afterFirstCallResult == null, afterFirstCallResult?.Count() ?? 0);

                // Second call - should be a cache hit
                _logger.LogInformation("TEST CACHE: Second call - should be a cache hit");
                var stopwatch2 = Stopwatch.StartNew();
                var result2 = await _dailyActionsService.GetDailyActionsAsync(start, end);
                stopwatch2.Stop();
                _logger.LogInformation("TEST CACHE: Second call took {ElapsedMs}ms", stopwatch2.ElapsedMilliseconds);

                // Check if the results are the same
                var sameReference = ReferenceEquals(result1, result2);
                var sameFirstItemId = result1.Any() && result2.Any() && result1.First().Id == result2.First().Id;
                _logger.LogInformation("TEST CACHE: Same reference: {SameReference}, same first item ID: {SameFirstItemId}",
                    sameReference, sameFirstItemId);

                // Calculate time difference and determine if cache is working
                var timeDifference = stopwatch1.ElapsedMilliseconds - stopwatch2.ElapsedMilliseconds;
                var cacheStatus = "inactive";

                // Check multiple indicators to determine if cache is active
                bool isCacheActive = false;

                // Check if we have cache hits
                var totalHits = 0;
                if (cacheStats.TryGetValue("TotalHits", out var hitsObj) && hitsObj is int hits)
                {
                    totalHits = hits;
                }

                // Check if we have cache keys
                bool hasCacheKeys = cacheKeys.Count > 0 || dailyActionsKeys.Count > 0;

                // Check if the second call was significantly faster
                bool secondCallFaster = timeDifference > 50;

                // Check if we have the same reference or same first item ID
                bool dataConsistency = sameReference || sameFirstItemId;

                // Check if we successfully retrieved from cache after first call
                bool retrievedFromCache = afterFirstCallCheck && afterFirstCallResult != null;

                // Determine cache status based on multiple indicators
                if ((retrievedFromCache && secondCallFaster) ||
                    (retrievedFromCache && dataConsistency) ||
                    (totalHits > 0 && hasCacheKeys))
                {
                    cacheStatus = "active";
                    isCacheActive = true;
                }
                else if (retrievedFromCache || hasCacheKeys || totalHits > 0)
                {
                    cacheStatus = "suspicious";
                }

                return Ok(new
                {
                    cacheStatus = cacheStatus,
                    isCacheActive = isCacheActive,
                    secondCallMs = $"{stopwatch2.ElapsedMilliseconds}ms",
                    firstCallMs = $"{stopwatch1.ElapsedMilliseconds}ms",
                    testKey = cacheKey,
                    testValue = start.ToString("o"),
                    retrievedSuccessfully = afterFirstCallCheck,
                    startDate = start.ToString("o"),
                    timeDifference = $"{timeDifference}ms",
                    sameReference = sameReference,
                    sameFirstItemId = sameFirstItemId,
                    initialCacheCheck = initialCacheCheck,
                    afterFirstCallCheck = afterFirstCallCheck,
                    itemCount = result1.Count(),
                    cacheCount = cacheService?.GetCount() ?? 0,
                    cacheHits = totalHits,
                    dailyActionsCacheKeys = dailyActionsKeys,
                    totalCacheKeys = cacheKeys.Count,
                    message = "Cache status is determined by multiple indicators including retrieval success, timing difference, and cache statistics."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing cache");
                return StatusCode(500, new { message = "An error occurred while testing cache" });
            }
        }

        /// <summary>
        /// Test cache functionality with date range
        /// </summary>
        [HttpGet("test-cache-dates")]
        [AllowAnonymous]
        public async Task<IActionResult> TestCacheDates([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                // Default date range to tomorrow-day after tomorrow to avoid conflicts with real data
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var dayAfterTomorrow = today.AddDays(2);
                startDate ??= tomorrow;
                endDate ??= dayAfterTomorrow;

                // Get cache service
                var cacheService = HttpContext.RequestServices.GetService<IGlobalCacheService>();
                if (cacheService == null)
                {
                    return StatusCode(500, new { message = "Cache service not available" });
                }

                // Create a cache key
                var cacheKey = $"DailyActions_Data_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_all";
                _logger.LogInformation("TEST CACHE DATES: Testing cache with key {CacheKey}", cacheKey);

                // Check if the key exists in the cache before first call
                var initialCacheCheck = cacheService.TryGetValue<IEnumerable<DailyAction>>(cacheKey, out var initialCacheResult);
                _logger.LogInformation("TEST CACHE DATES: Initial cache check - key exists: {Exists}, value is null: {IsNull}",
                    initialCacheCheck, initialCacheResult == null);

                // First call - should be a cache miss
                _logger.LogInformation("TEST CACHE DATES: First call - should be a cache miss");
                var stopwatch1 = Stopwatch.StartNew();
                var result1 = await _dailyActionsService.GetDailyActionsAsync(startDate.Value, endDate.Value);
                stopwatch1.Stop();
                _logger.LogInformation("TEST CACHE DATES: First call took {ElapsedMs}ms", stopwatch1.ElapsedMilliseconds);

                // Check if the key exists in the cache after first call
                var afterFirstCallCheck = cacheService.TryGetValue<IEnumerable<DailyAction>>(cacheKey, out var afterFirstCallResult);
                _logger.LogInformation("TEST CACHE DATES: After first call - key exists: {Exists}, value is null: {IsNull}, count: {Count}",
                    afterFirstCallCheck, afterFirstCallResult == null, afterFirstCallResult?.Count() ?? 0);

                // Get all cache keys
                var cacheKeys = cacheService.GetAllKeys();
                var dailyActionsKeys = cacheKeys.Where(k => k.Contains("DailyActions")).ToList();
                _logger.LogInformation("TEST CACHE DATES: Found {TotalCount} total cache keys, {DailyActionsCount} related to DailyActions",
                    cacheKeys.Count, dailyActionsKeys.Count);

                // Second call - should be a cache hit
                _logger.LogInformation("TEST CACHE DATES: Second call - should be a cache hit");
                var stopwatch2 = Stopwatch.StartNew();
                var result2 = await _dailyActionsService.GetDailyActionsAsync(startDate.Value, endDate.Value);
                stopwatch2.Stop();
                _logger.LogInformation("TEST CACHE DATES: Second call took {ElapsedMs}ms", stopwatch2.ElapsedMilliseconds);

                // Calculate time difference and determine if cache is working
                var timeDifference = stopwatch1.ElapsedMilliseconds - stopwatch2.ElapsedMilliseconds;
                var cacheStatus = "inactive";

                // Check multiple indicators to determine if cache is active
                bool isCacheActive = false;

                // Check if we have cache keys
                var allKeys = cacheService?.GetAllKeys() ?? new List<string>();
                var dailyActionKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();
                bool hasCacheKeys = allKeys.Count > 0 || dailyActionKeys.Count > 0;

                // Check if the second call was significantly faster
                bool secondCallFaster = timeDifference > 50;

                // Check if we successfully retrieved from cache after first call
                bool retrievedFromCache = afterFirstCallCheck && afterFirstCallResult != null;

                // Get cache statistics
                var cacheStats = cacheService?.GetStatistics() ?? new Dictionary<string, object>();
                var totalHits = 0;
                if (cacheStats.TryGetValue("TotalHits", out var hitsObj) && hitsObj is int hits)
                {
                    totalHits = hits;
                }

                // Determine cache status based on multiple indicators
                if ((retrievedFromCache && secondCallFaster) ||
                    (totalHits > 0 && hasCacheKeys))
                {
                    cacheStatus = "active";
                    isCacheActive = true;
                }
                else if (retrievedFromCache || hasCacheKeys || totalHits > 0)
                {
                    cacheStatus = "suspicious";
                }

                return Ok(new
                {
                    cacheStatus,
                    isCacheActive,
                    secondCallMs = $"{stopwatch2.ElapsedMilliseconds}ms",
                    firstCallMs = $"{stopwatch1.ElapsedMilliseconds}ms",
                    testKey = cacheKey,
                    startDate = startDate?.ToString("o"),
                    endDate = endDate?.ToString("o"),
                    timeDifference = $"{timeDifference}ms",
                    retrievedSuccessfully = afterFirstCallCheck,
                    itemCount = result1.Count(),
                    cacheCount = cacheService?.GetCount() ?? 0,
                    cacheHits = totalHits,
                    dailyActionsCacheKeys = dailyActionsKeys,
                    totalCacheKeys = allKeys.Count,
                    message = "Cache status is determined by multiple indicators including retrieval success, timing difference, and cache statistics."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing cache with dates");
                return StatusCode(500, new { message = "An error occurred while testing cache with dates" });
            }
        }
    }
}
