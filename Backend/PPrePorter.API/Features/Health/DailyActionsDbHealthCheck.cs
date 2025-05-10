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
        private readonly IConfiguration _configuration;
        private readonly ILogger<DailyActionsDbHealthCheck> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionsDbHealthCheck(
            IAzureKeyVaultConnectionStringResolver connectionStringResolver,
            IConfiguration configuration,
            ILogger<DailyActionsDbHealthCheck> logger)
        {
            _connectionStringResolver = connectionStringResolver ?? throw new ArgumentNullException(nameof(connectionStringResolver));
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
                // Get the connection string template from configuration
                string connectionStringTemplate = _configuration.GetConnectionString("DailyActionsDB");
                if (string.IsNullOrEmpty(connectionStringTemplate))
                {
                    return HealthCheckResult.Unhealthy("Connection string 'DailyActionsDB' not found in configuration");
                }

                // Resolve the connection string
                string resolvedConnectionString = await _connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate);

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
