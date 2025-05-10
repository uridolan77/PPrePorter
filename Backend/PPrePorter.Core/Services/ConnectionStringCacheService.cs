using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Singleton service to pre-resolve and cache connection strings at application startup
    /// </summary>
    public class ConnectionStringCacheService : IConnectionStringCacheService
    {
        private readonly ILogger<ConnectionStringCacheService> _logger;
        private readonly IAzureKeyVaultService _keyVaultService;
        private readonly IConfiguration _configuration;

        // Cache to store resolved secrets from Azure Key Vault
        private readonly ConcurrentDictionary<string, string> _secretCache = new();

        // Resolved connection string cache - stores fully resolved connection strings
        private readonly ConcurrentDictionary<string, string> _connectionStringCache = new();

        // Regex to find placeholders like {azurevault:vaultName:secretName}
        private static readonly Regex AzureVaultPlaceholderRegex = new(@"\{azurevault:([^:]+):([^}]+)\}", RegexOptions.IgnoreCase);

        // Flag to track if initialization has been completed
        private bool _isInitialized = false;

        /// <summary>
        /// Constructor
        /// </summary>
        public ConnectionStringCacheService(
            ILogger<ConnectionStringCacheService> logger,
            IAzureKeyVaultService keyVaultService,
            IConfiguration configuration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _keyVaultService = keyVaultService ?? throw new ArgumentNullException(nameof(keyVaultService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        /// <summary>
        /// Initialize the cache by pre-resolving all connection strings in the configuration
        /// </summary>
        public async Task InitializeAsync()
        {
            if (_isInitialized)
            {
                _logger.LogInformation("Connection string cache already initialized");
                return;
            }

            _logger.LogInformation("Initializing connection string cache");

            try
            {
                // Get all connection strings from configuration
                var connectionStrings = _configuration.GetSection("ConnectionStrings");
                if (connectionStrings == null)
                {
                    _logger.LogWarning("No ConnectionStrings section found in configuration");
                    _isInitialized = true;
                    return;
                }

                // Pre-resolve all connection strings
                foreach (var connectionString in connectionStrings.GetChildren())
                {
                    string name = connectionString.Key;
                    string template = connectionString.Value;

                    if (string.IsNullOrEmpty(template))
                    {
                        _logger.LogWarning("Connection string '{Name}' is null or empty", name);
                        continue;
                    }

                    _logger.LogInformation("Pre-resolving connection string '{Name}'", name);
                    string resolved = await ResolveConnectionStringAsync(template);

                    // Log the resolved connection string (without sensitive info)
                    string sanitizedConnectionString = SanitizeConnectionString(resolved);
                    _logger.LogInformation("Pre-resolved connection string '{Name}': {ConnectionString}", name, sanitizedConnectionString);
                }

                _isInitialized = true;
                _logger.LogInformation("Connection string cache initialized successfully with {Count} connection strings", _connectionStringCache.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing connection string cache");
                throw;
            }
        }

        /// <summary>
        /// Get a resolved connection string from the cache
        /// </summary>
        public string GetConnectionString(string connectionStringName)
        {
            if (string.IsNullOrEmpty(connectionStringName))
            {
                throw new ArgumentException("Connection string name cannot be null or empty", nameof(connectionStringName));
            }

            // Get the connection string template from configuration
            string template = _configuration.GetConnectionString(connectionStringName);
            if (string.IsNullOrEmpty(template))
            {
                _logger.LogWarning("Connection string '{Name}' not found in configuration", connectionStringName);
                return null;
            }

            // Check if the connection string is already resolved and cached
            if (_connectionStringCache.TryGetValue(template, out string resolved))
            {
                _logger.LogDebug("Using cached resolved connection string for '{Name}'", connectionStringName);
                return resolved;
            }

            // If not in cache, resolve it synchronously (this should rarely happen after initialization)
            _logger.LogWarning("Connection string '{Name}' not found in cache, resolving synchronously", connectionStringName);
            return ResolveConnectionStringAsync(template).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Resolve a connection string template by replacing Azure Key Vault placeholders with actual values
        /// </summary>
        public async Task<string> ResolveConnectionStringAsync(string connectionStringTemplate)
        {
            if (string.IsNullOrWhiteSpace(connectionStringTemplate))
            {
                return connectionStringTemplate;
            }

            // Check if this connection string template has already been resolved and cached
            if (_connectionStringCache.TryGetValue(connectionStringTemplate, out string cachedConnectionString))
            {
                _logger.LogDebug("Using cached resolved connection string");
                return cachedConnectionString;
            }

            _logger.LogInformation("Resolving connection string template");

            string resolvedConnectionString = connectionStringTemplate;
            MatchCollection matches = AzureVaultPlaceholderRegex.Matches(connectionStringTemplate);

            if (matches.Count == 0)
            {
                _logger.LogInformation("No Azure Key Vault placeholders found in the connection string template");
                _connectionStringCache.TryAdd(connectionStringTemplate, connectionStringTemplate);
                return connectionStringTemplate;
            }

            _logger.LogInformation("Found {MatchCount} Azure Key Vault placeholder(s) to resolve", matches.Count);

            foreach (Match match in matches)
            {
                string placeholder = match.Value; // e.g., {azurevault:vaultName:secretName}
                string vaultName = match.Groups[1].Value;
                string secretName = match.Groups[2].Value;
                string cacheKey = $"{vaultName}:{secretName}";

                _logger.LogInformation("Resolving placeholder: {Placeholder} (Vault: {VaultName}, Secret: {SecretName})", placeholder, vaultName, secretName);
                string secretValue;

                // Try to get the secret value from the cache first
                if (_secretCache.TryGetValue(cacheKey, out string cachedSecretValue))
                {
                    _logger.LogDebug("Using cached secret for '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                    secretValue = cachedSecretValue;
                }
                else
                {
                    try
                    {
                        // If not in cache, retrieve from Azure Key Vault
                        _logger.LogInformation("Retrieving secret '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                        secretValue = await _keyVaultService.GetSecretAsync(vaultName, secretName);

                        if (string.IsNullOrEmpty(secretValue))
                        {
                            _logger.LogWarning("Secret '{SecretName}' from vault '{VaultName}' is null or empty", secretName, vaultName);
                            continue; // Skip this placeholder if the secret value is null or empty
                        }

                        // Add to cache
                        _secretCache.TryAdd(cacheKey, secretValue);
                        _logger.LogInformation("Added secret '{SecretName}' from vault '{VaultName}' to cache", secretName, vaultName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving secret '{SecretName}' from vault '{VaultName}'", secretName, vaultName);
                        throw;
                    }
                }

                // Replace the placeholder with the actual value
                resolvedConnectionString = resolvedConnectionString.Replace(placeholder, secretValue);
            }

            // Cache the fully resolved connection string
            _connectionStringCache.TryAdd(connectionStringTemplate, resolvedConnectionString);

            // Log the resolved connection string (without sensitive info)
            string sanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
            _logger.LogInformation("Finished resolving connection string template. Result: {ConnectionString}", sanitizedConnectionString);

            return resolvedConnectionString;
        }

        /// <summary>
        /// Helper method to sanitize connection strings by hiding sensitive information
        /// </summary>
        private static string SanitizeConnectionString(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return connectionString;

            if (connectionString.Contains("password="))
            {
                // Simple string replacement
                int startIndex = connectionString.IndexOf("password=");
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
