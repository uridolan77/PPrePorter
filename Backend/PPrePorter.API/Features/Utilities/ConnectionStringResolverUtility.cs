using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Utilities
{
    /// <summary>
    /// Utility controller for resolving connection strings with Azure Key Vault placeholders
    /// </summary>
    [ApiController]
    [Route("api/utilities/connection-string")]
    public class ConnectionStringResolverUtilityController : ControllerBase
    {
        private readonly IAzureKeyVaultConnectionStringResolver _connectionStringResolver;
        private readonly ILogger<ConnectionStringResolverUtilityController> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public ConnectionStringResolverUtilityController(
            IAzureKeyVaultConnectionStringResolver connectionStringResolver,
            ILogger<ConnectionStringResolverUtilityController> logger)
        {
            _connectionStringResolver = connectionStringResolver ?? throw new ArgumentNullException(nameof(connectionStringResolver));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Test resolving a connection string with Azure Key Vault placeholders
        /// </summary>
        [HttpGet("resolver-test")]
        [AllowAnonymous]
        public async Task<IActionResult> TestConnectionStringResolution()
        {
            try
            {
                // Get the connection string from appsettings.json
                var connectionString = "data source=185.64.56.157;initial catalog=DailyActionsDB;persist security info=True;user id={azurevault:progressplaymcp-kv:DailyActionsDB--Username};password={azurevault:progressplaymcp-kv:DailyActionsDB--Password};TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=60;";

                _logger.LogInformation("Testing connection string resolution with Azure Key Vault placeholders");
                _logger.LogInformation("Original connection string: {ConnectionString}", SanitizeConnectionString(connectionString));

                // Resolve the connection string
                var resolvedConnectionString = await _connectionStringResolver.ResolveConnectionStringAsync(connectionString);

                // Log the resolved connection string (without sensitive info)
                var sanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
                _logger.LogInformation("Resolved connection string: {ConnectionString}", sanitizedConnectionString);

                // Check if the connection string still contains placeholders
                if (resolvedConnectionString.Contains("{azurevault:"))
                {
                    return BadRequest(new { message = "Connection string still contains Azure Key Vault placeholders after resolution" });
                }

                // Try to connect to the database using the resolved connection string
                using (var connection = new Microsoft.Data.SqlClient.SqlConnection(resolvedConnectionString))
                {
                    try
                    {
                        _logger.LogInformation("Testing connection to database server {Server}, database {Database}...",
                            connection.DataSource, connection.Database);

                        // Try to open the connection
                        await connection.OpenAsync();

                        // Execute a simple query to verify database access
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = "SELECT 1";
                            var result = await command.ExecuteScalarAsync();

                            if (result != null)
                            {
                                _logger.LogInformation("Connected successfully to {Server}\\{Database}",
                                    connection.DataSource, connection.Database);

                                // Try a simple query to verify we can access a specific table
                                try
                                {
                                    command.CommandText = "SELECT TOP 1 * FROM common.tbl_Currencies";
                                    using (var reader = await command.ExecuteReaderAsync())
                                    {
                                        if (await reader.ReadAsync())
                                        {
                                            _logger.LogInformation("Successfully queried the Currencies table");
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, "Connected to database but failed to query the Currencies table");
                                    return Ok(new {
                                        message = "Connected to database but failed to query the Currencies table",
                                        error = ex.Message
                                    });
                                }

                                return Ok(new {
                                    message = "Connection string resolved successfully and database connection verified",
                                    connectionString = sanitizedConnectionString
                                });
                            }
                            else
                            {
                                return BadRequest(new { message = "Database query returned null" });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to connect to database");
                        return BadRequest(new {
                            message = "Failed to connect to database",
                            error = ex.Message,
                            connectionString = sanitizedConnectionString
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing connection string resolution");
                return StatusCode(500, new { message = "An error occurred while testing connection string resolution", error = ex.Message });
            }
        }

        /// <summary>
        /// Helper method to sanitize connection strings by hiding sensitive information
        /// </summary>
        private static string SanitizeConnectionString(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return connectionString;

            if (connectionString.Contains("password=", StringComparison.OrdinalIgnoreCase))
            {
                // Simple string replacement
                int startIndex = connectionString.IndexOf("password=", StringComparison.OrdinalIgnoreCase);
                if (startIndex >= 0)
                {
                    int endIndex = connectionString.IndexOf(';', startIndex);
                    if (endIndex < 0)
                        endIndex = connectionString.Length;

                    // Build the sanitized string
                    var prefix = connectionString[..startIndex];
                    var suffix = endIndex < connectionString.Length ? connectionString[endIndex..] : "";
                    return prefix + "password=***" + suffix;
                }
            }

            return connectionString;
        }
    }
}
