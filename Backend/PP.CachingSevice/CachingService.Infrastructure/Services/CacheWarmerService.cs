using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Configuration;
using CachingService.Core.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CachingService.Infrastructure.Services
{
    /// <summary>
    /// Background service that handles cache warmup and refresh
    /// </summary>
    public class CacheWarmerService : BackgroundService
    {
        private readonly ICacheManager _cacheManager;
        private readonly CacheOptions _options;
        private readonly ILogger<CacheWarmerService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly List<ICacheWarmerProvider> _warmers = new();
        
        public CacheWarmerService(
            ICacheManager cacheManager,
            IOptions<CacheOptions> options,
            ILogger<CacheWarmerService> logger,
            IServiceProvider serviceProvider,
            IEnumerable<ICacheWarmerProvider> warmers)
        {
            _cacheManager = cacheManager;
            _options = options.Value;
            _logger = logger;
            _serviceProvider = serviceProvider;
            
            foreach (var warmer in warmers)
            {
                _warmers.Add(warmer);
            }
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.Warmup.Enabled)
            {
                _logger.LogInformation("Cache warmup is disabled. Skipping warmup service.");
                return;
            }
            
            try
            {
                // Initial delay before starting warmup
                if (_options.Warmup.WarmupOnStartup && _options.Warmup.StartupDelay > TimeSpan.Zero)
                {
                    _logger.LogInformation("Waiting {Delay} before starting initial cache warmup", _options.Warmup.StartupDelay);
                    await Task.Delay(_options.Warmup.StartupDelay, stoppingToken);
                }
                
                // Initial warmup
                if (_options.Warmup.WarmupOnStartup)
                {
                    await WarmupCacheAsync(stoppingToken);
                }
                
                // Refresh loop
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(_options.Warmup.RefreshInterval, stoppingToken);
                    await RefreshCacheAsync(stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in cache warmer service");
            }
        }
        
        private async Task WarmupCacheAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting cache warmup...");
            
            int warmedUpItems = 0;
            
            foreach (var warmer in _warmers)
            {
                try
                {
                    var result = await warmer.WarmupAsync(_cacheManager, cancellationToken);
                    warmedUpItems += result;
                    
                    _logger.LogInformation(
                        "Cache warmer {WarmerName} added {Count} items to cache",
                        warmer.GetType().Name,
                        result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error warming up cache with provider {WarmerName}",
                        warmer.GetType().Name);
                }
            }
            
            _logger.LogInformation("Cache warmup complete. {Count} items added to cache.", warmedUpItems);
        }
        
        private async Task RefreshCacheAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting cache refresh...");
            
            int refreshedItems = 0;
            
            foreach (var warmer in _warmers)
            {
                try
                {
                    var result = await warmer.RefreshAsync(_cacheManager, cancellationToken);
                    refreshedItems += result;
                    
                    _logger.LogInformation(
                        "Cache warmer {WarmerName} refreshed {Count} items in cache",
                        warmer.GetType().Name,
                        result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error refreshing cache with provider {WarmerName}",
                        warmer.GetType().Name);
                }
            }
            
            _logger.LogInformation("Cache refresh complete. {Count} items refreshed in cache.", refreshedItems);
        }
    }
}
