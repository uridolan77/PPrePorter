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
            services.Configure<SemanticLayerConfig>(configuration.GetSection("SemanticLayer"));
            
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
            services.Configure<SemanticLayerConfig>(configuration.GetSection("SemanticLayer"));
            
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