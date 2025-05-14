using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Interfaces.DailyActions;
using PPrePorter.Core.Interfaces.Games;
using PPrePorter.Core.Interfaces.Players;
using PPrePorter.Core.Interfaces.Transactions;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Interfaces;
using PPrePorter.Infrastructure.Services;
using PPrePorter.Infrastructure.Services.DailyActions;
using PPrePorter.Infrastructure.Services.Games;
using PPrePorter.Infrastructure.Services.Players;
using PPrePorter.Infrastructure.Services.Transactions;

namespace PPrePorter.Infrastructure
{
    /// <summary>
    /// Extension methods for registering infrastructure services with the dependency injection container
    /// </summary>
    public static class InfrastructureServiceRegistration
    {
        /// <summary>
        /// Add infrastructure services to the service collection
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <param name="configuration">Configuration</param>
        /// <returns>Service collection</returns>
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register the PPRePorterDbContext
            services.AddDbContext<PPRePorterDbContext>((serviceProvider, options) =>
            {
                var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
                var connectionStringTemplate = configuration.GetConnectionString("PPRePorterDB");

                options.UseSqlServer(connectionStringTemplate);
            });

            // Register the PPRePorterDbContext as a scoped service
            services.AddScoped<IPPRePorterDbContext>(provider => provider.GetRequiredService<PPRePorterDbContext>());

            // Register the MetadataService
            services.AddScoped<IMetadataService, MetadataService>();

            // Register the DailyActionsMetadataQueryProvider
            services.AddScoped<DailyActionsMetadataQueryProvider>();

            // Register adapter services
            services.AddScoped<IDailyActionsService, DailyActionsServiceAdapter>();
            services.AddScoped<IGameService, GameServiceAdapter>();
            services.AddScoped<IDailyActionGameService, DailyActionGameServiceAdapter>();
            services.AddScoped<IPlayerService, PlayerServiceAdapter>();
            services.AddScoped<ITransactionService, TransactionServiceAdapter>();

            // Register the DashboardService
            services.AddScoped<IDashboardService, DashboardService>();

            return services;
        }
    }
}
