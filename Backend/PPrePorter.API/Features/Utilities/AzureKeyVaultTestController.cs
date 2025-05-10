using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Utilities
{
    /// <summary>
    /// Controller for testing Azure Key Vault functionality
    /// </summary>
    [ApiController]
    [Route("api/utilities/azure-key-vault")]
    public class AzureKeyVaultTestController : ControllerBase
    {
        private readonly IAzureKeyVaultService _keyVaultService;
        private readonly ILogger<AzureKeyVaultTestController> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public AzureKeyVaultTestController(
            IAzureKeyVaultService keyVaultService,
            ILogger<AzureKeyVaultTestController> logger)
        {
            _keyVaultService = keyVaultService ?? throw new ArgumentNullException(nameof(keyVaultService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Test retrieving a secret from Azure Key Vault
        /// </summary>
        [HttpGet("test-secret")]
        [AllowAnonymous]
        public async Task<IActionResult> TestGetSecret([FromQuery] string vaultName = "progressplaymcp-kv", [FromQuery] string secretName = "DailyActionsDB--Username")
        {
            try
            {
                _logger.LogInformation("Testing retrieving secret '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                
                // Get the implementation type of the Azure Key Vault service
                var implementationType = _keyVaultService.GetType().Name;
                _logger.LogInformation("Using Azure Key Vault service implementation: {Implementation}", implementationType);
                
                // Retrieve the secret
                var secretValue = await _keyVaultService.GetSecretAsync(vaultName, secretName);
                
                if (string.IsNullOrEmpty(secretValue))
                {
                    return NotFound(new { message = $"Secret '{secretName}' not found in vault '{vaultName}'" });
                }
                
                // Only log the first few characters of the secret if it's a password
                string logValue = secretName.Contains("Password", StringComparison.OrdinalIgnoreCase) ?
                    secretValue.Substring(0, Math.Min(3, secretValue.Length)) + "***" :
                    secretValue;
                
                _logger.LogInformation("Successfully retrieved secret '{SecretName}' from vault '{VaultName}': {Value}",
                    secretName, vaultName, logValue);
                
                return Ok(new { 
                    message = $"Successfully retrieved secret '{secretName}' from vault '{vaultName}'",
                    implementation = implementationType,
                    secretName = secretName,
                    secretValue = logValue
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving secret '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                return StatusCode(500, new { 
                    message = $"An error occurred while retrieving secret '{secretName}' from vault '{vaultName}'", 
                    error = ex.Message,
                    implementation = _keyVaultService.GetType().Name
                });
            }
        }
    }
}
