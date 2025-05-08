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
            { "progressplaymcp-kv:DailyActionsDB--Username", "dev_daily_user" },
            { "progressplaymcp-kv:DailyActionsDB--Password", "dev_daily_pass" },
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
            _logger.LogInformation("Development mode: Retrieving secret for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);

            if (_developmentSecrets.TryGetValue(key, out string value))
            {
                _logger.LogDebug("Development mode: Found secret for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                return Task.FromResult(value);
            }

            _logger.LogWarning("Development mode: No secret found for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
            return Task.FromResult<string>(null);
        }
    }
}