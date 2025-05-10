using Microsoft.Extensions.Diagnostics.HealthChecks;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Health
{
    /// <summary>
    /// Health check for DailyActionsDB
    /// </summary>
    public class DailyActionsDbHealthCheck : IHealthCheck
    {
        private readonly IAzureKeyVaultConnectionStringResolver _connectionStringResolver;
        private readonly IConnectionStringCacheService _connectionStringCacheService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DailyActionsDbHealthCheck> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionsDbHealthCheck(
            IAzureKeyVaultConnectionStringResolver connectionStringResolver,
            IConnectionStringCacheService connectionStringCacheService,
            IConfiguration configuration,
            ILogger<DailyActionsDbHealthCheck> logger)
        {
            _connectionStringResolver = connectionStringResolver ?? throw new ArgumentNullException(nameof(connectionStringResolver));
            _connectionStringCacheService = connectionStringCacheService ?? throw new ArgumentNullException(nameof(connectionStringCacheService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Check health of DailyActionsDB
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                // First try to get the connection string from the cache
                string resolvedConnectionString = _connectionStringCacheService.GetConnectionString("DailyActionsDB");

                // If not in cache, try to resolve it
                if (string.IsNullOrEmpty(resolvedConnectionString))
                {
                    _logger.LogWarning("Connection string 'DailyActionsDB' not found in cache, resolving from configuration");

                    // Dump the cache contents for debugging
                    _connectionStringCacheService.DumpCacheContents();

                    // Get the connection string template from configuration
                    string connectionStringTemplate = _configuration.GetConnectionString("DailyActionsDB");
                    if (string.IsNullOrEmpty(connectionStringTemplate))
                    {
                        return HealthCheckResult.Unhealthy("Connection string 'DailyActionsDB' not found in configuration");
                    }

                    // Resolve the connection string
                    resolvedConnectionString = await _connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate);

                    // Cache the resolved connection string
                    if (!string.IsNullOrEmpty(resolvedConnectionString))
                    {
                        // Manually add it to the cache
                        _logger.LogInformation("Manually adding resolved connection string to cache");
                        _connectionStringCacheService.AddToCache("DailyActionsDB", resolvedConnectionString);

                        // Dump the cache contents after adding
                        _connectionStringCacheService.DumpCacheContents();
                    }
                }
                else
                {
                    _logger.LogInformation("Using cached connection string for DailyActionsDB health check");
                }

                // Check if the connection string still contains placeholders
                if (resolvedConnectionString.Contains("{azurevault:"))
                {
                    return HealthCheckResult.Degraded("Connection string still contains Azure Key Vault placeholders after resolution");
                }

                // Try to connect to the database
                using (var connection = new Microsoft.Data.SqlClient.SqlConnection(resolvedConnectionString))
                {
                    await connection.OpenAsync(cancellationToken);

                    // Execute a simple query to verify database access
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "SELECT 1";
                        var result = await command.ExecuteScalarAsync(cancellationToken);

                        if (result != null)
                        {
                            // Try a simple query to verify we can access a specific table
                            try
                            {
                                command.CommandText = "SELECT TOP 1 * FROM common.tbl_Currencies";
                                using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                                {
                                    if (await reader.ReadAsync(cancellationToken))
                                    {
                                        return HealthCheckResult.Healthy("Successfully connected to DailyActionsDB and queried the Currencies table");
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Connected to database but failed to query the Currencies table");
                                return HealthCheckResult.Degraded("Connected to database but failed to query the Currencies table");
                            }

                            return HealthCheckResult.Healthy("Successfully connected to DailyActionsDB");
                        }
                        else
                        {
                            return HealthCheckResult.Degraded("Database query returned null");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking health of DailyActionsDB");
                return HealthCheckResult.Unhealthy("Failed to connect to DailyActionsDB", ex);
            }
        }
    }
}
