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

            try
            {
                _logger.LogInformation("Initializing DefaultAzureCredential");

                // DefaultAzureCredential tries multiple authentication methods in sequence
                // It will try: Environment variables, Managed Identity, Visual Studio, Azure CLI, etc.
                var options = new DefaultAzureCredentialOptions
                {
                    ExcludeEnvironmentCredential = false,
                    ExcludeManagedIdentityCredential = false,
                    ExcludeSharedTokenCacheCredential = false,
                    ExcludeVisualStudioCredential = false,
                    ExcludeVisualStudioCodeCredential = false,
                    ExcludeAzureCliCredential = false,
                    ExcludeInteractiveBrowserCredential = true
                };

                _credential = new DefaultAzureCredential(options);

                _logger.LogInformation("DefaultAzureCredential initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize DefaultAzureCredential");
                throw;
            }
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
                _logger.LogInformation("Creating SecretClient for vault URI: {VaultUri}", vaultUri);

                var secretClient = new SecretClient(vaultUri, _credential);
                _logger.LogInformation("SecretClient created successfully");

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

                throw;
            }
        }
    }
}
