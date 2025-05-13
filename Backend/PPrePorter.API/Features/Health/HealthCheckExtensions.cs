using Microsoft.Extensions.Diagnostics.HealthChecks;
using PPrePorter.API.Features.Health;
using PPrePorter.API.Features.Health.Redis;
using PPrePorter.Core.Interfaces;
using System;

namespace PPrePorter.API.Extensions
{
    /// <summary>
    /// Non-static class for logging purposes
    /// </summary>
    internal class HealthChecks
    {
    }
    /// <summary>
    /// Extensions for configuring health checks
    /// </summary>
    public static class HealthCheckExtensions
    {
        /// <summary>
        /// Adds health checks for all services
        /// </summary>
        public static IServiceCollection AddApplicationHealthChecks(this IServiceCollection services, IConfiguration configuration)
        {
            // Get connection strings from the cache service if available, otherwise from configuration
            string ppReporterConnectionString;
            string dailyActionsConnectionString;
            string redisConnectionString;

            // Create a temporary service provider to get the connection string cache service
            using (var serviceProvider = services.BuildServiceProvider())
            {
                try
                {
                    // Try to get the connection string cache service
                    var connectionStringCacheService = serviceProvider.GetService<IConnectionStringCacheService>();

                    if (connectionStringCacheService != null)
                    {
                        // Get connection strings from the cache
                        ppReporterConnectionString = connectionStringCacheService.GetConnectionString("PPRePorterDB") ?? "";
                        dailyActionsConnectionString = connectionStringCacheService.GetConnectionString("DailyActionsDB") ?? "";
                        redisConnectionString = connectionStringCacheService.GetConnectionString("Redis") ?? "";

                        // Log that we're using cached connection strings
                        var logger = serviceProvider.GetService<ILogger<HealthChecks>>();
                        logger?.LogInformation("Using cached connection strings for health checks");
                    }
                    else
                    {
                        // Fallback to configuration if cache service is not available
                        ppReporterConnectionString = configuration.GetConnectionString("PPRePorterDB") ?? "";
                        dailyActionsConnectionString = configuration.GetConnectionString("DailyActionsDB") ?? "";
                        redisConnectionString = configuration.GetConnectionString("Redis") ?? "";

                        // Log that we're using connection strings from configuration
                        var logger = serviceProvider.GetService<ILogger<HealthChecks>>();
                        logger?.LogWarning("Connection string cache service not available, using connection strings from configuration for health checks");
                    }
                }
                catch (Exception ex)
                {
                    // Fallback to configuration if there's an error
                    ppReporterConnectionString = configuration.GetConnectionString("PPRePorterDB") ?? "";
                    dailyActionsConnectionString = configuration.GetConnectionString("DailyActionsDB") ?? "";
                    redisConnectionString = configuration.GetConnectionString("Redis") ?? "";

                    // Log the error
                    var logger = serviceProvider.GetService<ILogger<HealthChecks>>();
                    logger?.LogError(ex, "Error getting connection strings from cache service, using connection strings from configuration for health checks");
                }
            }

            // Check if Redis is enabled in settings
            var useRedis = configuration.GetSection("AppSettings").GetValue<bool>("UseRedis", false);

            // Start building health checks
            var healthChecksBuilder = services.AddHealthChecks()
                // Add SQL Server health checks
                .AddSqlServer(
                    name: "PPRePorterDB",
                    connectionString: ppReporterConnectionString,
                    healthQuery: "SELECT 1;",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "database", "sql", "ppreporter" })

                .AddSqlServer(
                    name: "DailyActionsDB",
                    connectionString: dailyActionsConnectionString,
                    healthQuery: "SELECT 1;",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "database", "sql", "dailyactions" });

            // Add Redis health check only if Redis is enabled
            if (useRedis && !string.IsNullOrEmpty(redisConnectionString))
            {
                healthChecksBuilder.AddCustomRedis(
                    redisConnectionString: redisConnectionString,
                    name: "Redis",
                    failureStatus: HealthStatus.Degraded,
                    timeout: TimeSpan.FromSeconds(3), // Set a 3-second timeout
                    tags: new[] { "cache", "redis" });

                // Log that Redis health check is enabled
                using (var serviceProvider = services.BuildServiceProvider())
                {
                    var logger = serviceProvider.GetService<ILogger<HealthChecks>>();
                    logger?.LogInformation("Redis health check is enabled");
                }
            }
            else
            {
                // Log that Redis health check is disabled
                using (var serviceProvider = services.BuildServiceProvider())
                {
                    var logger = serviceProvider.GetService<ILogger<HealthChecks>>();
                    if (!useRedis)
                    {
                        logger?.LogInformation("Redis health check is disabled in settings");
                    }
                    else
                    {
                        logger?.LogInformation("Redis health check is disabled due to missing connection string");
                    }
                }
            }

            // Add remaining health checks
            healthChecksBuilder
                // Add custom health check
                .AddCheck<CustomHealthCheck>(
                    name: "ApplicationServices",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "app", "services" })

                // Add DailyActionsDB custom health check
                .AddCheck<DailyActionsDbHealthCheck>(
                    name: "DailyActionsDBCustom",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "database", "sql", "dailyactions", "custom" });

            return services;
        }

        /// <summary>
        /// Adds health check UI and endpoints
        /// </summary>
        public static IServiceCollection AddHealthCheckUI(this IServiceCollection services)
        {
            services
                .AddHealthChecksUI(options =>
                {
                    options.SetEvaluationTimeInSeconds(300); // Evaluate health every 5 minutes (increased from 60 seconds)
                    options.MaximumHistoryEntriesPerEndpoint(20); // Keep 20 history entries (reduced from 50)
                    options.SetApiMaxActiveRequests(1); // Only allow 1 concurrent request

                    // Add health check endpoint
                    options.AddHealthCheckEndpoint("API", "/health");
                })
                .AddInMemoryStorage(); // Use in-memory storage for health check history

            return services;
        }
    }
}
