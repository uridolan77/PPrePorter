using Microsoft.Extensions.DependencyInjection;
using PPrePorter.AzureServices.Services;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.AzureServices
{
    public static class AzureServicesRegistration
    {
        /// <summary>
        /// Adds Azure services to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <param name="useRealAzureKeyVault">Whether to use the real Azure Key Vault service or the development mock</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection AddAzureServices(this IServiceCollection services, bool useRealAzureKeyVault = false)
        {
            if (useRealAzureKeyVault)
            {
                // Register the real Azure Key Vault service
                services.AddScoped<IAzureKeyVaultService, AzureKeyVaultService>();
            }
            else
            {
                // The development mock implementation has been removed during code cleanup
                // A proper development service needs to be implemented
                throw new System.NotImplementedException("Development Azure Key Vault service is not implemented. Please use the real Azure Key Vault service.");
            }

            return services;
        }
    }
}
