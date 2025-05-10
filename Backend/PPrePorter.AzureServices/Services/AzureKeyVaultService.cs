using System;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.AzureServices.Services
{
    /// <summary>
    /// Implementation of IAzureKeyVaultService that retrieves secrets from Azure Key Vault
    /// </summary>
    public class AzureKeyVaultService : IAzureKeyVaultService
    {
        private readonly ILogger<AzureKeyVaultService> _logger;
        private readonly DefaultAzureCredential _credential;

        public AzureKeyVaultService(ILogger<AzureKeyVaultService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            // DefaultAzureCredential tries multiple authentication methods in sequence
            // It will try: Environment variables, Managed Identity, Visual Studio, Azure CLI, etc.
            _credential = new DefaultAzureCredential();
        }

        /// <summary>
        /// Retrieves a secret from Azure Key Vault
        /// </summary>
        /// <param name="vaultName">The name of the Azure Key Vault (e.g., "progressplaymcp-kv")</param>
        /// <param name="secretName">The name of the secret to retrieve (e.g., "DailyActionsDB--Username")</param>
        /// <returns>The secret value, or null if not found</returns>
        public async Task<string> GetSecretAsync(string vaultName, string secretName)
        {
            if (string.IsNullOrWhiteSpace(vaultName))
            {
                throw new ArgumentException("Vault name cannot be null or empty", nameof(vaultName));
            }

            if (string.IsNullOrWhiteSpace(secretName))
            {
                throw new ArgumentException("Secret name cannot be null or empty", nameof(secretName));
            }

            try
            {
                _logger.LogInformation("Retrieving secret '{SecretName}' from Azure Key Vault '{VaultName}'", secretName, vaultName);

                // Create a client for the specified vault
                var vaultUri = new Uri($"https://{vaultName}.vault.azure.net/");
                var secretClient = new SecretClient(vaultUri, _credential);

                // Get the secret
                var secret = await secretClient.GetSecretAsync(secretName);

                if (secret?.Value != null)
                {
                    // Only log the first few characters of the secret if it's a password
                    string logValue = secretName.Contains("Password") ? 
                        secret.Value.Value.Substring(0, Math.Min(3, secret.Value.Value.Length)) + "***" : 
                        secret.Value.Value;
                    
                    _logger.LogInformation("Successfully retrieved secret '{SecretName}' from Azure Key Vault '{VaultName}': {Value}", 
                        secretName, vaultName, logValue);
                    
                    return secret.Value.Value;
                }
                else
                {
                    _logger.LogWarning("Secret '{SecretName}' not found in Azure Key Vault '{VaultName}' or has null value", 
                        secretName, vaultName);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving secret '{SecretName}' from Azure Key Vault '{VaultName}'", 
                    secretName, vaultName);
                throw;
            }
        }
    }
}
