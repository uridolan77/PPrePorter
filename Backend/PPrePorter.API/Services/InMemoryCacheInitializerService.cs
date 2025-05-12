using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.API.Services
{
    /// <summary>
    /// Background service that initializes the in-memory daily actions cache at startup
    /// </summary>
    public class InMemoryCacheInitializerService : BackgroundService
    {
        private readonly ILogger<InMemoryCacheInitializerService> _logger;
        private readonly IServiceProvider _serviceProvider;

        /// <summary>
        /// Constructor
        /// </summary>
        public InMemoryCacheInitializerService(
            ILogger<InMemoryCacheInitializerService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        /// <summary>
        /// Execute the background service
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("InMemoryCacheInitializerService is starting");

            // Wait a short delay to allow other services to initialize
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            try
            {
                // Create a scope to resolve the service
                using var scope = _serviceProvider.CreateScope();
                var inMemoryDailyActionsService = scope.ServiceProvider.GetRequiredService<IInMemoryDailyActionsService>();

                _logger.LogInformation("Initializing in-memory daily actions cache");
                await inMemoryDailyActionsService.InitializeAsync();
                _logger.LogInformation("In-memory daily actions cache initialized successfully");

                // Schedule periodic refresh of today's data
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        // Refresh data every minute
                        // This will refresh today's data and handle day transitions automatically
                        _logger.LogInformation("Performing scheduled refresh of in-memory daily actions cache");
                        using var refreshScope = _serviceProvider.CreateScope();
                        var refreshService = refreshScope.ServiceProvider.GetRequiredService<IInMemoryDailyActionsService>();
                        await refreshService.RefreshAsync();
                        _logger.LogInformation("Scheduled refresh of in-memory daily actions cache completed successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error during scheduled refresh of in-memory daily actions cache");
                    }

                    // Wait for 1 minute before the next refresh
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing in-memory daily actions cache");
            }
        }

        /// <summary>
        /// Called when the service is stopping
        /// </summary>
        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("InMemoryCacheInitializerService is stopping");
            return base.StopAsync(cancellationToken);
        }
    }
}
