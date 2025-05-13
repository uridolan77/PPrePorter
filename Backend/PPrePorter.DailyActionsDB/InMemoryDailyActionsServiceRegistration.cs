using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Services.DailyActions;

namespace PPrePorter.DailyActionsDB
{
    /// <summary>
    /// Extension methods for registering the InMemoryDailyActionsService
    /// </summary>
    public static class InMemoryDailyActionsServiceRegistration
    {
        /// <summary>
        /// Adds the InMemoryDailyActionsService to the service collection
        /// </summary>
        public static IServiceCollection AddInMemoryDailyActionsService(this IServiceCollection services)
        {
            // Register the in-memory daily actions service as a singleton
            services.AddSingleton<IInMemoryDailyActionsService, InMemoryDailyActionsService>();

            return services;
        }
    }
}
