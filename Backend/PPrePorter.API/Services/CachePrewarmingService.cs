using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.API.Services
{
    /// <summary>
    /// Background service that prewarms the cache after the application has started
    /// </summary>
    public class CachePrewarmingService : BackgroundService
    {
        private readonly ILogger<CachePrewarmingService> _logger;
        // We'll use a direct reference to the DailyActionsService instead of the interface
        private readonly object _dailyActionsService;
        private readonly IGlobalCacheService _cacheService;
        private readonly IServiceProvider _serviceProvider;
        private readonly IMetadataService _metadataService;
        private bool _isPrewarmed = false;
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public CachePrewarmingService(
            ILogger<CachePrewarmingService> logger,
            IGlobalCacheService cacheService,
            IServiceProvider serviceProvider,
            IMetadataService metadataService,
            object dailyActionsService = null) // Made optional
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dailyActionsService = dailyActionsService; // Can be null
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
            _metadataService = metadataService ?? throw new ArgumentNullException(nameof(metadataService));
        }

        /// <summary>
        /// Executes the background service
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                // Wait for 5 seconds to allow the application to start up
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

                // Prewarm the cache
                await PrewarmCacheAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing cache prewarming service");
            }
        }

        /// <summary>
        /// Prewarms the cache
        /// </summary>
        public async Task PrewarmCacheAsync(CancellationToken cancellationToken = default)
        {
            // Ensure only one prewarming operation runs at a time
            await _semaphore.WaitAsync(cancellationToken);

            try
            {
                // Check if the cache has already been prewarmed
                if (_isPrewarmed)
                {
                    _logger.LogInformation("Cache has already been prewarmed");
                    return;
                }

                _logger.LogInformation("Starting cache prewarming");

                // Get the cache statistics before prewarming
                var cacheStats = _cacheService.GetStatistics();
                _logger.LogInformation("Initial cache statistics: {CacheStats}", cacheStats);

                // Prewarm the metadata cache first
                _logger.LogInformation("Prewarming metadata cache...");
                await _metadataService.PreloadMetadataAsync();

                // Then prewarm the daily actions cache
                _logger.LogInformation("Prewarming daily actions cache...");

                // Use reflection to call the PrewarmCacheAsync method if dailyActionsService is available
                if (_dailyActionsService != null)
                {
                    try
                    {
                        var method = _dailyActionsService.GetType().GetMethod("PrewarmCacheAsync");
                        if (method != null)
                        {
                            var task = (Task)method.Invoke(_dailyActionsService, new object[] { });
                            await task;
                            _logger.LogInformation("Successfully prewarmed daily actions cache");
                        }
                        else
                        {
                            _logger.LogWarning("Could not find PrewarmCacheAsync method on dailyActionsService");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error calling PrewarmCacheAsync method");
                    }
                }
                else
                {
                    _logger.LogWarning("DailyActionsService is not available, skipping cache prewarming for daily actions");
                }

                // Get the cache statistics after prewarming
                cacheStats = _cacheService.GetStatistics();
                _logger.LogInformation("Cache statistics after prewarming: {CacheStats}", cacheStats);

                // Get all cache keys
                var allKeys = _cacheService.GetAllKeys();
                var dailyActionsKeys = allKeys.Where(k => k.Contains("DailyActions")).ToList();

                _logger.LogInformation("Total cache keys: {TotalCount}, DailyActions cache keys: {DailyActionsCount}",
                    allKeys.Count, dailyActionsKeys.Count);

                // Set the flag to indicate that the cache has been prewarmed
                _isPrewarmed = true;

                _logger.LogInformation("Cache prewarming completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming cache");
            }
            finally
            {
                _semaphore.Release();
            }
        }

        /// <summary>
        /// Gets whether the cache has been prewarmed
        /// </summary>
        public bool IsPrewarmed => _isPrewarmed;
    }
}
