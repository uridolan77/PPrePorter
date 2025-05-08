using Microsoft.Extensions.DependencyInjection;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Services;

namespace PPrePorter.NLP.Configuration;

/// <summary>
/// Extensions for registering NLP services with the dependency injection container
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds all NLP services to the service collection
    /// </summary>
    public static IServiceCollection AddNlpServices(this IServiceCollection services)
    {
        // Register domain knowledge service
        services.AddSingleton<IDomainKnowledgeService, GamingDomainKnowledgeService>();
        
        // Register entity extraction service
        services.AddScoped<IEntityExtractionService, EntityExtractionService>();
        
        // Register clarification service
        services.AddScoped<IClarificationService, ClarificationService>();
        
        // Register the main facade service
        services.AddScoped<NaturalLanguageQueryService>();
        
        return services;
    }
}