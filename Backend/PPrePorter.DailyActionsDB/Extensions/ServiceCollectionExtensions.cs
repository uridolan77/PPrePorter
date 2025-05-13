using Microsoft.Extensions.DependencyInjection;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Services;
using PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching;
using System;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for IServiceCollection
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds DailyActionsDB services to the service collection
        /// </summary>
        public static IServiceCollection AddDailyActionsServices(this IServiceCollection services)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            // Register the smart cache service as a singleton
            services.AddSingleton<IDailyActionsSmartCacheService, DailyActionsSmartCacheService>();

            // Register the daily actions service
            services.AddScoped<IDailyActionsService, DailyActionsService>();

            // Register the white label service
            services.AddScoped<IWhiteLabelService, WhiteLabelService>();

            // Register the metadata service
            services.AddScoped<IMetadataService, MetadataService>();

            return services;
        }
    }
}
