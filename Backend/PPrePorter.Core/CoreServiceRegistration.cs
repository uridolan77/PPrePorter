using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;

namespace PPrePorter.Core
{
    /// <summary>
    /// Extension methods for registering core services with the dependency injection container
    /// </summary>
    public static class CoreServiceRegistration
    {
        /// <summary>
        /// Add core services to the service collection
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>Service collection</returns>
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            // Register the global cache service as a singleton
            services.AddSingleton<IGlobalCacheService, GlobalCacheService>();

            // Register the memory cache adapter that uses the global cache service
            services.AddSingleton<IMemoryCache, MemoryCacheAdapter>();

            // Register the connection string cache service as a singleton to ensure it persists across requests
            services.AddSingleton<IConnectionStringCacheService, ConnectionStringCacheService>();

            // Register other core services
            services.AddScoped<IConnectionStringResolverService, ConnectionStringResolverService>();

            return services;
        }
    }
}
