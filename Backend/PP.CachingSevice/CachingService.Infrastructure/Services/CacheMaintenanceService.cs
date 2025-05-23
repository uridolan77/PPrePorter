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
    /// Background service that handles cache maintenance tasks
    /// </summary>
    public class CacheMaintenanceService : BackgroundService
    {
        private readonly IEnumerable<ICacheProvider> _providers;
        private readonly CacheOptions _options;
        private readonly ILogger<CacheMaintenanceService> _logger;
        
        public CacheMaintenanceService(
            IEnumerable<ICacheProvider> providers,
            IOptions<CacheOptions> options,
            ILogger<CacheMaintenanceService> logger)
        {
            _providers = providers;
            _options = options.Value;
            _logger = logger;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                // Initial delay before starting maintenance
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                
                while (!stoppingToken.IsCancellationRequested)
                {
                    await PerformMaintenanceAsync(stoppingToken);
                    await Task.Delay(_options.MaintenanceInterval, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in cache maintenance service");
            }
        }
        
        private async Task PerformMaintenanceAsync(CancellationToken cancellationToken)
        {
            _logger.LogDebug("Starting cache maintenance...");
            
            foreach (var provider in _providers)
            {
                try
                {
                    int affectedItems = await provider.PerformMaintenanceAsync(cancellationToken);
                    
                    if (affectedItems > 0)
                    {
                        _logger.LogInformation(
                            "Cache maintenance for provider {ProviderId} affected {Count} items",
                            provider.ProviderId,
                            affectedItems);
                    }
                    else
                    {
                        _logger.LogDebug(
                            "Cache maintenance for provider {ProviderId} completed with no affected items",
                            provider.ProviderId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error performing maintenance for provider {ProviderId}",
                        provider.ProviderId);
                }
            }
            
            _logger.LogDebug("Cache maintenance complete");
        }
    }
}
