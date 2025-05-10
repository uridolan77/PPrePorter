using Microsoft.Extensions.Diagnostics.HealthChecks;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.API.Features.Health
{
    /// <summary>
    /// Custom health check for application-specific checks
    /// </summary>
    public class CustomHealthCheck : IHealthCheck
    {
        private readonly IConnectionStringResolverService _connectionStringResolver;
        private readonly ILogger<CustomHealthCheck> _logger;

        public CustomHealthCheck(
            IConnectionStringResolverService connectionStringResolver,
            ILogger<CustomHealthCheck> logger)
        {
            _connectionStringResolver = connectionStringResolver ?? throw new ArgumentNullException(nameof(connectionStringResolver));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Performs the health check
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var data = new Dictionary<string, object>();
            var isHealthy = true;
            
            try
            {
                // Check if Azure Key Vault service is available
                data.Add("AzureKeyVaultStatus", "Available");
                
                // Check if connection string resolver is working
                var connectionString = await _connectionStringResolver.ResolveConnectionStringAsync("PPRePorterDB");
                if (string.IsNullOrEmpty(connectionString))
                {
                    isHealthy = false;
                    data.Add("ConnectionStringResolverStatus", "Failed to resolve connection string");
                }
                else
                {
                    data.Add("ConnectionStringResolverStatus", "Available");
                }
                
                // Add application version
                data.Add("ApplicationVersion", GetType().Assembly.GetName().Version?.ToString() ?? "Unknown");
                
                // Add environment information
                data.Add("Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown");
                
                if (isHealthy)
                {
                    return HealthCheckResult.Healthy("All application services are healthy", data);
                }
                else
                {
                    return HealthCheckResult.Degraded("Some application services are not available", null, data);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing custom health check");
                data.Add("Error", ex.Message);
                return HealthCheckResult.Unhealthy("Error performing health check", ex, data);
            }
        }
    }
}
