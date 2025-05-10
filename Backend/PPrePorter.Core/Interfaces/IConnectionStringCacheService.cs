using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Interface for a service that pre-resolves and caches connection strings at application startup
    /// </summary>
    public interface IConnectionStringCacheService
    {
        /// <summary>
        /// Initialize the cache by pre-resolving all connection strings in the configuration
        /// </summary>
        Task InitializeAsync();

        /// <summary>
        /// Get a resolved connection string from the cache
        /// </summary>
        string GetConnectionString(string connectionStringName);

        /// <summary>
        /// Resolve a connection string template by replacing Azure Key Vault placeholders with actual values
        /// </summary>
        Task<string> ResolveConnectionStringAsync(string connectionStringTemplate);
    }
}
