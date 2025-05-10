using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Infrastructure.Data;

namespace PPrePorter.Infrastructure.Repositories
{
    /// <summary>
    /// Extension methods for registering repositories
    /// </summary>
    public static class RepositoryRegistration
    {
        /// <summary>
        /// Adds repositories to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection</returns>
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            // Register unit of work
            services.AddScoped<IUnitOfWork, UnitOfWork>(provider =>
            {
                var dbContext = provider.GetRequiredService<PPRePorterDbContext>();
                var loggerFactory = provider.GetRequiredService<ILoggerFactory>();
                return new UnitOfWork(dbContext, loggerFactory);
            });

            // Register repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDailyActionRepository, DailyActionRepository>();

            return services;
        }
    }
}
