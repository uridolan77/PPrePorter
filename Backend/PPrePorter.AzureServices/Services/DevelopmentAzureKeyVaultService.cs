using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.AzureServices.Services
{
    /// <summary>
    /// Development mock implementation of IAzureKeyVaultService for local development
    /// </summary>
    public class DevelopmentAzureKeyVaultService : IAzureKeyVaultService
    {
        private readonly ILogger<DevelopmentAzureKeyVaultService> _logger;
        private readonly Dictionary<string, string> _mockSecrets;

        public DevelopmentAzureKeyVaultService(ILogger<DevelopmentAzureKeyVaultService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Initialize mock secrets dictionary with development values
            _mockSecrets = new Dictionary<string, string>
            {
                // DailyActionsDB credentials - use the actual username from Azure Key Vault
                { "progressplaymcp-kv:DailyActionsDB--Username", "ReportsUser" },
                { "progressplaymcp-kv:DailyActionsDB--Password", "Pp@123456" },

                // JWT Secret Key
                { "progressplaymcp-kv:JWT--SecretKey", "ThisIsAVeryLongSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm_ThisIsAVeryLongSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm" },

                // NLP API Key
                { "progressplaymcp-kv:NLP--ApiKey", "dev-api-key-for-nlp-service" }
            };

            _logger.LogWarning("Using development mock secrets - NOT FOR PRODUCTION USE");
            _logger.LogInformation("DevelopmentAzureKeyVaultService initialized with {Count} mock secrets", _mockSecrets.Count);
        }

        /// <summary>
        /// Retrieves a mock secret for development purposes
        /// </summary>
        /// <param name="vaultName">The name of the Azure Key Vault (e.g., "progressplaymcp-kv")</param>
        /// <param name="secretName">The name of the secret to retrieve (e.g., "DailyActionsDB--Username")</param>
        /// <returns>The mock secret value, or null if not found</returns>
        public Task<string?> GetSecretAsync(string vaultName, string secretName)
        {
            if (string.IsNullOrWhiteSpace(vaultName))
            {
                throw new ArgumentException("Vault name cannot be null or empty", nameof(vaultName));
            }

            if (string.IsNullOrWhiteSpace(secretName))
            {
                throw new ArgumentException("Secret name cannot be null or empty", nameof(secretName));
            }

            _logger.LogInformation("Retrieving mock secret '{SecretName}' from vault '{VaultName}'", secretName, vaultName);

            string key = $"{vaultName}:{secretName}";

            // For development purposes, use the values from the dictionary
            // This is only for development and should be replaced with proper Azure Key Vault in production
            string secretValue = null;

            // Look up the secret in the dictionary
            if (_mockSecrets.TryGetValue(key, out secretValue))
            {
                _logger.LogInformation("Found mock secret for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
            }
            else
            {
                _logger.LogWarning("No mock secret found for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                secretValue = null;
            }

            // Only log the first few characters of the secret if it's a password
            if (secretValue != null && secretName.Contains("Password"))
            {
                string logValue = secretValue.Substring(0, Math.Min(3, secretValue.Length)) + "***";
                _logger.LogInformation("Returning mock secret value: {Value}", logValue);
            }

            return Task.FromResult(secretValue);
        }
    }
}
