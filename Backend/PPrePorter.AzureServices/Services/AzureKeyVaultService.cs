using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Azure.Core;
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
        private readonly TokenCredential _credential;

        // Static cache for SecretClient instances to avoid creating new ones for each request
        private static readonly ConcurrentDictionary<string, SecretClient> _secretClientCache = new();

        // Static cache for secrets to avoid retrieving the same secret multiple times
        private static readonly ConcurrentDictionary<string, string> _secretCache = new();

        public AzureKeyVaultService(ILogger<AzureKeyVaultService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            try
            {
                _logger.LogInformation("Initializing Azure Key Vault authentication");

                // Use Azure CLI credential directly since you're already logged in with az login
                _logger.LogInformation("Using AzureCliCredential for authentication");
                _credential = new AzureCliCredential();

                _logger.LogInformation("AzureCliCredential initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize AzureCliCredential");
                throw;
            }
        }

        /// <summary>
        /// Retrieves a secret from Azure Key Vault
        /// </summary>
        /// <param name="vaultName">The name of the Azure Key Vault (e.g., "progressplaymcp-kv")</param>
        /// <param name="secretName">The name of the secret to retrieve (e.g., "DailyActionsDB--Username")</param>
        /// <returns>The secret value, or null if not found</returns>
        public async Task<string?> GetSecretAsync(string vaultName, string secretName)
        {
            if (string.IsNullOrWhiteSpace(vaultName))
            {
                throw new ArgumentException("Vault name cannot be null or empty", nameof(vaultName));
            }

            if (string.IsNullOrWhiteSpace(secretName))
            {
                throw new ArgumentException("Secret name cannot be null or empty", nameof(secretName));
            }

            // Create a cache key for this secret
            string cacheKey = $"{vaultName}:{secretName}";

            // Check if the secret is already in the cache
            if (_secretCache.TryGetValue(cacheKey, out string cachedSecret))
            {
                _logger.LogInformation("Using cached secret for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                return cachedSecret;
            }

            try
            {
                _logger.LogInformation("Retrieving secret '{SecretName}' from Azure Key Vault '{VaultName}'", secretName, vaultName);

                // Get or create a client for the specified vault
                var vaultUri = new Uri($"https://{vaultName}.vault.azure.net/");

                // Try to get the SecretClient from the cache
                if (!_secretClientCache.TryGetValue(vaultName, out SecretClient secretClient))
                {
                    _logger.LogInformation("Creating new SecretClient for vault URI: {VaultUri}", vaultUri);
                    secretClient = new SecretClient(vaultUri, _credential);
                    _secretClientCache.TryAdd(vaultName, secretClient);
                    _logger.LogInformation("SecretClient created and cached successfully");
                }
                else
                {
                    _logger.LogInformation("Using cached SecretClient for vault URI: {VaultUri}", vaultUri);
                }

                // Get the secret
                _logger.LogInformation("Calling GetSecretAsync for secret '{SecretName}'", secretName);
                var secret = await secretClient.GetSecretAsync(secretName);
                _logger.LogInformation("GetSecretAsync call completed for secret '{SecretName}'", secretName);

                if (secret?.Value != null)
                {
                    // Only log the first few characters of the secret if it's a password
                    string logValue = secretName.Contains("Password") ?
                        secret.Value.Value.Substring(0, Math.Min(3, secret.Value.Value.Length)) + "***" :
                        secret.Value.Value;

                    _logger.LogInformation("Successfully retrieved secret '{SecretName}' from Azure Key Vault '{VaultName}': {Value}",
                        secretName, vaultName, logValue);

                    // Cache the secret
                    _secretCache.TryAdd(cacheKey, secret.Value.Value);
                    _logger.LogInformation("Secret '{SecretName}' from vault '{VaultName}' added to cache", secretName, vaultName);

                    return secret.Value.Value;
                }
                else
                {
                    _logger.LogWarning("Secret '{SecretName}' not found in Azure Key Vault '{VaultName}' or has null value",
                        secretName, vaultName);
                    return null;
                }
            }
            catch (Azure.RequestFailedException azEx)
            {
                _logger.LogError(azEx, "Azure Request Failed Exception retrieving secret '{SecretName}' from Azure Key Vault '{VaultName}'. Status: {Status}, Error Code: {ErrorCode}",
                    secretName, vaultName, azEx.Status, azEx.ErrorCode);

                if (azEx.Status == 401)
                {
                    _logger.LogError("Authentication failed (401 Unauthorized). Please check your Azure credentials and permissions.");
                }
                else if (azEx.Status == 403)
                {
                    _logger.LogError("Authorization failed (403 Forbidden). Please check your access policies for the key vault.");
                }
                else if (azEx.Status == 404)
                {
                    _logger.LogError("Resource not found (404). Please check if the vault '{VaultName}' or secret '{SecretName}' exists.", vaultName, secretName);
                }

                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving secret '{SecretName}' from Azure Key Vault '{VaultName}'",
                    secretName, vaultName);

                // Log more detailed information about the exception
                _logger.LogError("Exception type: {ExceptionType}, Message: {Message}", ex.GetType().Name, ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner exception: {InnerExceptionType}, Message: {Message}",
                        ex.InnerException.GetType().Name, ex.InnerException.Message);
                }

                // Fallback to development values for specific secrets
                if (secretName == "ProgressPlayDBAzure--Username")
                {
                    _logger.LogWarning("Falling back to development value for '{SecretName}'", secretName);
                    return "ReportsUser";
                }
                else if (secretName == "ProgressPlayDBAzure--Password")
                {
                    _logger.LogWarning("Falling back to development value for '{SecretName}'", secretName);
                    return "Pp@123456";
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
