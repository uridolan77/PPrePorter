using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Python;
using PPrePorter.SemanticLayer.Services;

namespace PPrePorter.SemanticLayer.Extensions
{
    /// <summary>
    /// Extension methods for registering semantic layer services
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds the semantic layer services to the service collection
        /// </summary>
        public static IServiceCollection AddSemanticLayer(this IServiceCollection services, IConfiguration configuration)
        {
            // Register configuration
            var section = configuration.GetSection("SemanticLayer");
            services.Configure<SemanticLayerConfig>(options =>
            {
                options.DefaultConnectionStringName = section["DefaultConnectionStringName"] ?? "PPRePorterDB";
                options.MaxQueryRows = int.TryParse(section["MaxQueryRows"], out int maxRows) ? maxRows : 50000;
                options.QueryTimeoutSeconds = int.TryParse(section["QueryTimeoutSeconds"], out int timeout) ? timeout : 60;
                options.DefaultCacheDurationMinutes = int.TryParse(section["DefaultCacheDurationMinutes"], out int cacheDuration) ? cacheDuration : 15;
                options.EnableQueryCaching = bool.TryParse(section["EnableQueryCaching"], out bool enableCache) ? enableCache : true;
            });

            // Register services
            services.AddScoped<ISemanticLayerService, SemanticLayerService>();
            services.AddScoped<IDataModelService, DataModelService>();
            services.AddScoped<IEntityMappingService, EntityMappingService>();
            services.AddScoped<ISqlTranslationService, SqlTranslationService>();
            services.AddSingleton<ICacheService, MemoryCacheService>();
            services.AddScoped<IPythonIntegrationService, PythonIntegrationService>();

            return services;
        }

        /// <summary>
        /// Adds just the core semantic layer services (minimal configuration)
        /// </summary>
        public static IServiceCollection AddSemanticLayerCore(this IServiceCollection services, IConfiguration configuration)
        {
            // Register configuration
            var section = configuration.GetSection("SemanticLayer");
            services.Configure<SemanticLayerConfig>(options =>
            {
                options.DefaultConnectionStringName = section["DefaultConnectionStringName"] ?? "PPRePorterDB";
                options.MaxQueryRows = int.TryParse(section["MaxQueryRows"], out int maxRows) ? maxRows : 50000;
                options.QueryTimeoutSeconds = int.TryParse(section["QueryTimeoutSeconds"], out int timeout) ? timeout : 60;
                options.DefaultCacheDurationMinutes = int.TryParse(section["DefaultCacheDurationMinutes"], out int cacheDuration) ? cacheDuration : 15;
                options.EnableQueryCaching = bool.TryParse(section["EnableQueryCaching"], out bool enableCache) ? enableCache : true;
            });

            // Register essential services only
            services.AddScoped<ISemanticLayerService, SemanticLayerService>();
            services.AddScoped<IDataModelService, DataModelService>();
            services.AddScoped<IEntityMappingService, EntityMappingService>();
            services.AddScoped<ISqlTranslationService, SqlTranslationService>();

            return services;
        }

        /// <summary>
        /// Adds the semantic layer with Python integration
        /// </summary>
        public static IServiceCollection AddSemanticLayerWithPython(this IServiceCollection services, IConfiguration configuration)
        {
            // Add core semantic layer
            services.AddSemanticLayer(configuration);

            // Add Python-specific services
            services.AddScoped<IPythonIntegrationService, PythonIntegrationService>();

            return services;
        }
    }
}