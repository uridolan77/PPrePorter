using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using PPrePorter.gRPC.Core;
using PPrePorter.gRPC.Core.Configuration;
using PPrePorter.gRPC.Core.Interfaces;
using PPrePorter.PythonML.Configuration;
using PPrePorter.PythonML.Interfaces;
using PPrePorter.PythonML.Services;

namespace PPrePorter.PythonML.Extensions
{
    /// <summary>
    /// Extension methods for setting up PythonML services in an <see cref="IServiceCollection" />.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds PythonML services to the specified <see cref="IServiceCollection" />.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <param name="configureGrpcOptions">An optional action to configure the underlying gRPC client options.</param>
        /// <param name="configurePythonMLOptions">An optional action to configure the PythonML service options.</param>
        /// <returns>The <see cref="IServiceCollection"/> so that additional calls can be chained.</returns>
        public static IServiceCollection AddPythonML(
            this IServiceCollection services,
            Action<PythonMLClientOptions>? configureGrpcOptions = null,
            Action<PythonMLOptions>? configurePythonMLOptions = null)
        {
            // Add memory cache if not already registered
            services.TryAddSingleton<Microsoft.Extensions.Caching.Memory.IMemoryCache, Microsoft.Extensions.Caching.Memory.MemoryCache>();

            // Add gRPC client factory
            if (configureGrpcOptions != null)
            {
                services.Configure(configureGrpcOptions);
            }
            else
            {
                services.Configure<PythonMLClientOptions>(options => { });
            }

            services.TryAddSingleton<IPythonMLClientFactory, PythonMLClientFactory>();

            // Add PythonML service
            if (configurePythonMLOptions != null)
            {
                services.Configure(configurePythonMLOptions);
            }
            else
            {            services.Configure<PythonMLOptions>(options => { });
            }

            services.TryAddScoped<IPythonMLService, PPrePorter.PythonML.Services.PythonMLService>();
            
            return services;
        }
    }
}