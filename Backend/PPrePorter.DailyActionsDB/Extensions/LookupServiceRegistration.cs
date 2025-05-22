using Microsoft.Extensions.DependencyInjection;
using PPrePorter.DailyActionsDB.Repositories.Lookups;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for registering lookup services
    /// </summary>
    public static class LookupServiceRegistration
    {
        /// <summary>
        /// Adds lookup services to the service collection
        /// </summary>
        public static IServiceCollection AddLookupServices(this IServiceCollection services)
        {
            // Register the lookup repository
            services.AddScoped<ILookupRepository, LookupRepository>();

            return services;
        }
    }
}
