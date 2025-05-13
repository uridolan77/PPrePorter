using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using System;

namespace PPrePorter.API.Features.Health.Redis
{
    /// <summary>
    /// Extensions for adding custom Redis health check
    /// </summary>
    public static class CustomRedisHealthCheckExtensions
    {
        /// <summary>
        /// Add custom Redis health check with timeout
        /// </summary>
        public static IHealthChecksBuilder AddCustomRedis(
            this IHealthChecksBuilder builder,
            string redisConnectionString,
            string name = "Redis",
            HealthStatus? failureStatus = HealthStatus.Unhealthy,
            TimeSpan? timeout = null,
            string[]? tags = null)
        {
            if (string.IsNullOrEmpty(redisConnectionString))
            {
                throw new ArgumentNullException(nameof(redisConnectionString));
            }

            return builder.Add(new HealthCheckRegistration(
                name,
                serviceProvider => new CustomRedisHealthCheck(
                    redisConnectionString,
                    serviceProvider.GetRequiredService<ILogger<CustomRedisHealthCheck>>(),
                    timeout),
                failureStatus,
                tags));
        }

        /// <summary>
        /// Check if Redis is enabled in the application settings
        /// </summary>
        public static bool IsRedisEnabled(IConfiguration configuration)
        {
            return configuration.GetSection("AppSettings").GetValue<bool>("UseRedis", false);
        }
    }
}
