using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.API.Services;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Monitoring
{
    /// <summary>
    /// Controller for checking cache status
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Allow anonymous access to check cache status
    public class CacheStatusController : ControllerBase
    {
        private readonly SimpleCachePrewarmingService _cachePrewarmingService;
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<CacheStatusController> _logger;

        public CacheStatusController(
            SimpleCachePrewarmingService cachePrewarmingService,
            IGlobalCacheService cacheService,
            ILogger<CacheStatusController> logger)
        {
            _cachePrewarmingService = cachePrewarmingService ?? throw new ArgumentNullException(nameof(cachePrewarmingService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets the cache status
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(CacheStatusResponse), StatusCodes.Status200OK)]
        public IActionResult GetCacheStatus()
        {
            try
            {
                // Get the cache statistics
                var cacheStats = _cacheService.GetStatistics();

                // Get all cache keys
                var allKeys = _cacheService.GetAllKeys();
                var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();

                // Create the response
                var response = new CacheStatusResponse
                {
                    IsPrewarmed = _cachePrewarmingService.IsPrewarmed,
                    TotalCacheItems = allKeys.Count,
                    DailyActionsCacheItems = dailyActionsKeys.Count,
                    CacheHitRatio = cacheStats.ContainsKey("HitRatio") ? Convert.ToDouble(cacheStats["HitRatio"]) : 0,
                    TotalHits = cacheStats.ContainsKey("TotalHits") ? Convert.ToInt32(cacheStats["TotalHits"]) : 0,
                    TotalMisses = cacheStats.ContainsKey("TotalMisses") ? Convert.ToInt32(cacheStats["TotalMisses"]) : 0
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache status");
                return StatusCode(500, new { message = "An error occurred while getting cache status" });
            }
        }

        /// <summary>
        /// Manually triggers cache prewarming
        /// </summary>
        [HttpPost("prewarm")]
        [ProducesResponseType(typeof(CacheStatusResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> PrewarmCache()
        {
            try
            {
                // Prewarm the cache
                await _cachePrewarmingService.PrewarmCacheAsync();

                // Get the cache statistics
                var cacheStats = _cacheService.GetStatistics();

                // Get all cache keys
                var allKeys = _cacheService.GetAllKeys();
                var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();

                // Create the response
                var response = new CacheStatusResponse
                {
                    IsPrewarmed = _cachePrewarmingService.IsPrewarmed,
                    TotalCacheItems = allKeys.Count,
                    DailyActionsCacheItems = dailyActionsKeys.Count,
                    CacheHitRatio = cacheStats.ContainsKey("HitRatio") ? Convert.ToDouble(cacheStats["HitRatio"]) : 0,
                    TotalHits = cacheStats.ContainsKey("TotalHits") ? Convert.ToInt32(cacheStats["TotalHits"]) : 0,
                    TotalMisses = cacheStats.ContainsKey("TotalMisses") ? Convert.ToInt32(cacheStats["TotalMisses"]) : 0
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming cache");
                return StatusCode(500, new { message = "An error occurred while prewarming cache" });
            }
        }
    }

    /// <summary>
    /// Response model for cache status
    /// </summary>
    public class CacheStatusResponse
    {
        /// <summary>
        /// Gets or sets whether the cache has been prewarmed
        /// </summary>
        public bool IsPrewarmed { get; set; }

        /// <summary>
        /// Gets or sets the total number of items in the cache
        /// </summary>
        public int TotalCacheItems { get; set; }

        /// <summary>
        /// Gets or sets the number of DailyActions items in the cache
        /// </summary>
        public int DailyActionsCacheItems { get; set; }

        /// <summary>
        /// Gets or sets the cache hit ratio
        /// </summary>
        public double CacheHitRatio { get; set; }

        /// <summary>
        /// Gets or sets the total number of cache hits
        /// </summary>
        public int TotalHits { get; set; }

        /// <summary>
        /// Gets or sets the total number of cache misses
        /// </summary>
        public int TotalMisses { get; set; }
    }
}
