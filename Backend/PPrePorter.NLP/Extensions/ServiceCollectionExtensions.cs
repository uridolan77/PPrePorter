using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Services;

namespace PPrePorter.NLP.Extensions
{
    /// <summary>
    /// Extension methods for registering NLP services
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds all NLP services to the service collection
        /// </summary>
        public static IServiceCollection AddNLPServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register configuration
            services.Configure<NLPConfiguration>(configuration.GetSection("NLP"));
            
            // Register services
            services.AddScoped<IEntityExtractionService, EntityExtractionService>();
            services.AddScoped<IDomainKnowledgeService, GamingDomainKnowledgeService>();
            services.AddScoped<IClarificationService, ClarificationService>();
            services.AddScoped<INaturalLanguageQueryService, NaturalLanguageQueryService>();
            
            return services;
        }
        
        /// <summary>
        /// Adds just the core NLP services (minimal configuration)
        /// </summary>
        public static IServiceCollection AddNLPCoreServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register configuration
            services.Configure<NLPConfiguration>(configuration.GetSection("NLP"));
            
            // Register essential services only
            services.AddScoped<IEntityExtractionService, EntityExtractionService>();
            services.AddScoped<INaturalLanguageQueryService, NaturalLanguageQueryService>();
            
            return services;
        }
    }
}