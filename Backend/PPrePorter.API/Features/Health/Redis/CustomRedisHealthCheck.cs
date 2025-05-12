using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Health.Redis
{
    /// <summary>
    /// Custom Redis health check with timeout
    /// </summary>
    public class CustomRedisHealthCheck : IHealthCheck
    {
        private readonly string _redisConnectionString;
        private readonly ILogger<CustomRedisHealthCheck> _logger;
        private readonly TimeSpan _timeout;

        /// <summary>
        /// Constructor
        /// </summary>
        public CustomRedisHealthCheck(
            string redisConnectionString,
            ILogger<CustomRedisHealthCheck> logger,
            TimeSpan? timeout = null)
        {
            _redisConnectionString = redisConnectionString ?? throw new ArgumentNullException(nameof(redisConnectionString));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _timeout = timeout ?? TimeSpan.FromSeconds(5); // Default timeout of 5 seconds
        }

        /// <summary>
        /// Check health of Redis
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Starting Redis health check with timeout of {Timeout} seconds", _timeout.TotalSeconds);
            var startTime = DateTime.UtcNow;

            try
            {
                // Create a cancellation token that will timeout after the specified timeout
                using var timeoutCts = new CancellationTokenSource(_timeout);
                using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(timeoutCts.Token, cancellationToken);

                // Configure Redis connection with explicit timeout
                var configurationOptions = ConfigurationOptions.Parse(_redisConnectionString);
                configurationOptions.ConnectTimeout = (int)_timeout.TotalMilliseconds;
                configurationOptions.SyncTimeout = (int)_timeout.TotalMilliseconds;
                configurationOptions.AbortOnConnectFail = false;

                // Connect to Redis
                _logger.LogDebug("Connecting to Redis at {ConnectionString}", _redisConnectionString);
                using var connection = await ConnectionMultiplexer.ConnectAsync(configurationOptions);

                // Ping Redis to check if it's responsive
                var db = connection.GetDatabase();
                var pingResult = await db.PingAsync();

                var elapsedTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("Redis health check completed successfully in {ElapsedTime} ms", elapsedTime.TotalMilliseconds);

                return HealthCheckResult.Healthy($"Redis is healthy. Ping time: {pingResult.TotalMilliseconds} ms");
            }
            catch (TaskCanceledException ex) when (cancellationToken.IsCancellationRequested)
            {
                var elapsedTime = DateTime.UtcNow - startTime;
                _logger.LogWarning(ex, "Redis health check timed out after {ElapsedTime} ms", elapsedTime.TotalMilliseconds);
                return HealthCheckResult.Degraded($"Redis health check timed out after {_timeout.TotalSeconds} seconds");
            }
            catch (RedisConnectionException ex)
            {
                var elapsedTime = DateTime.UtcNow - startTime;
                _logger.LogError(ex, "Redis connection failed after {ElapsedTime} ms", elapsedTime.TotalMilliseconds);
                return HealthCheckResult.Unhealthy("Redis connection failed", ex);
            }
            catch (Exception ex)
            {
                var elapsedTime = DateTime.UtcNow - startTime;
                _logger.LogError(ex, "Redis health check failed after {ElapsedTime} ms", elapsedTime.TotalMilliseconds);
                return HealthCheckResult.Unhealthy("Redis health check failed", ex);
            }
        }
    }
}
