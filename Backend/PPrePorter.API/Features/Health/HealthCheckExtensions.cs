using Microsoft.Extensions.Diagnostics.HealthChecks;
using PPrePorter.API.Features.Health;

namespace PPrePorter.API.Extensions
{
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
            // Get connection strings
            var ppReporterConnectionString = configuration.GetConnectionString("PPRePorterDB") ?? "";
            var dailyActionsConnectionString = configuration.GetConnectionString("DailyActionsDB") ?? "";
            var redisConnectionString = configuration.GetConnectionString("Redis") ?? "";

            // Add health checks
            services.AddHealthChecks()
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
                    tags: new[] { "database", "sql", "dailyactions" })

                // Add Redis health check if configured
                .AddRedis(
                    redisConnectionString: redisConnectionString,
                    name: "Redis",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "cache", "redis" })

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
                    options.SetEvaluationTimeInSeconds(60); // Evaluate health every 60 seconds
                    options.MaximumHistoryEntriesPerEndpoint(50); // Keep 50 history entries
                    options.SetApiMaxActiveRequests(1); // Only allow 1 concurrent request

                    // Add health check endpoint
                    options.AddHealthCheckEndpoint("API", "/health");
                })
                .AddInMemoryStorage(); // Use in-memory storage for health check history

            return services;
        }
    }
}
