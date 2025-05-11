using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Utilities
{
    /// <summary>
    /// Controller for testing connection string resolution
    /// </summary>
    [ApiController]
    [Route("api/utilities/connection-string")]
    [ApiExplorerSettings(GroupName = SwaggerGroups.ConnectionStringTest)]
    public class ConnectionStringTestController : ControllerBase
    {
        private readonly IConnectionStringResolverService _connectionStringResolverService;
        private readonly IAzureKeyVaultConnectionStringResolver _azureKeyVaultConnectionStringResolver;
        private readonly ILogger<ConnectionStringTestController> _logger;
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Constructor
        /// </summary>
        public ConnectionStringTestController(
            IConnectionStringResolverService connectionStringResolverService,
            IAzureKeyVaultConnectionStringResolver azureKeyVaultConnectionStringResolver,
            ILogger<ConnectionStringTestController> logger,
            IConfiguration configuration)
        {
            _connectionStringResolverService = connectionStringResolverService ?? throw new ArgumentNullException(nameof(connectionStringResolverService));
            _azureKeyVaultConnectionStringResolver = azureKeyVaultConnectionStringResolver ?? throw new ArgumentNullException(nameof(azureKeyVaultConnectionStringResolver));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        /// <summary>
        /// Test connection string resolution
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public async Task<IActionResult> TestConnectionString()
        {
            try
            {
                // Get the connection string template from configuration
                string connectionStringTemplate = _configuration.GetConnectionString("DailyActionsDB");
                if (string.IsNullOrEmpty(connectionStringTemplate))
                {
                    return NotFound(new { message = "Connection string 'DailyActionsDB' not found in configuration" });
                }

                // Log the connection string template (without sensitive info)
                string sanitizedTemplate = SanitizeConnectionString(connectionStringTemplate);
                _logger.LogInformation("Connection string template: {ConnectionString}", sanitizedTemplate);

                // Resolve the connection string using both services
                string resolvedConnectionString1 = await _connectionStringResolverService.ResolveConnectionStringAsync(connectionStringTemplate);
                string resolvedConnectionString2 = await _azureKeyVaultConnectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate);

                // Log the resolved connection strings (without sensitive info)
                string sanitizedConnectionString1 = SanitizeConnectionString(resolvedConnectionString1);
                string sanitizedConnectionString2 = SanitizeConnectionString(resolvedConnectionString2);
                _logger.LogInformation("Resolved connection string 1: {ConnectionString}", sanitizedConnectionString1);
                _logger.LogInformation("Resolved connection string 2: {ConnectionString}", sanitizedConnectionString2);

                // Check if the connection strings still contain placeholders
                bool containsPlaceholders1 = resolvedConnectionString1.Contains("{azurevault:");
                bool containsPlaceholders2 = resolvedConnectionString2.Contains("{azurevault:");

                // Try to connect to the database using both resolved connection strings
                bool canConnect1 = false;
                bool canConnect2 = false;
                string errorMessage1 = null;
                string errorMessage2 = null;

                try
                {
                    using (var connection = new SqlConnection(resolvedConnectionString1))
                    {
                        await connection.OpenAsync();
                        canConnect1 = true;
                    }
                }
                catch (Exception ex)
                {
                    errorMessage1 = ex.Message;
                }

                try
                {
                    using (var connection = new SqlConnection(resolvedConnectionString2))
                    {
                        await connection.OpenAsync();
                        canConnect2 = true;
                    }
                }
                catch (Exception ex)
                {
                    errorMessage2 = ex.Message;
                }

                return Ok(new
                {
                    connectionStringTemplate = sanitizedTemplate,
                    resolvedConnectionString1 = sanitizedConnectionString1,
                    resolvedConnectionString2 = sanitizedConnectionString2,
                    containsPlaceholders1 = containsPlaceholders1,
                    containsPlaceholders2 = containsPlaceholders2,
                    canConnect1 = canConnect1,
                    canConnect2 = canConnect2,
                    errorMessage1 = errorMessage1,
                    errorMessage2 = errorMessage2
                });
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
