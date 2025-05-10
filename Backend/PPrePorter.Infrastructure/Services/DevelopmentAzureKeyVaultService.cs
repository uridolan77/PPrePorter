using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.Infrastructure.Services
{
    /// <summary>
    /// Development implementation of IAzureKeyVaultService that returns hard-coded values for development purposes.
    /// This should be replaced with a real implementation in production.
    /// </summary>
    public class DevelopmentAzureKeyVaultService : IAzureKeyVaultService
    {
        private readonly ILogger<DevelopmentAzureKeyVaultService> _logger;
        private readonly Dictionary<string, string> _developmentSecrets = new Dictionary<string, string>
        {
            // Format: "{vaultName}:{secretName}" -> "secretValue"
            // Real credentials for DailyActionsDB
            { "progressplaymcp-kv:DailyActionsDB--Username", "sa" },
            { "progressplaymcp-kv:DailyActionsDB--Password", "Pr0gr3ssPlay" },
            { "progressplaymcp-kv:ProgressPlayDBAzure--Username", "dev_ppreporter_user" },
            { "progressplaymcp-kv:ProgressPlayDBAzure--Password", "dev_ppreporter_pass" }
        };

        public DevelopmentAzureKeyVaultService(ILogger<DevelopmentAzureKeyVaultService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public Task<string> GetSecretAsync(string vaultName, string secretName)
        {
            string key = $"{vaultName}:{secretName}";
            _logger.LogInformation("Development mode: Retrieving secret for '{SecretName}' from vault '{VaultName}' with key '{Key}'", secretName, vaultName, key);

            if (_developmentSecrets.TryGetValue(key, out string value))
            {
                // Only log the first few characters of the secret if it's a password
                string logValue = secretName.Contains("Password") ? value.Substring(0, Math.Min(3, value.Length)) + "***" : value;
                _logger.LogInformation("Development mode: Found secret for '{SecretName}' from vault '{VaultName}': {Value}", secretName, vaultName, logValue);
                return Task.FromResult(value);
            }

            _logger.LogWarning("Development mode: No secret found for '{SecretName}' from vault '{VaultName}' with key '{Key}'", secretName, vaultName, key);

            // For debugging, log all available keys
            _logger.LogInformation("Available secret keys: {Keys}", string.Join(", ", _developmentSecrets.Keys));

            return Task.FromResult<string>(null);
        }
    }
}