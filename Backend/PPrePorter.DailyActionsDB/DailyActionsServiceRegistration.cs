using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using PPrePorter.DailyActionsDB.Repositories;
using PPrePorter.DailyActionsDB.Services;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB
{
    /// <summary>
    /// Extension methods for registering daily actions services with the dependency injection container
    /// </summary>
    public static class DailyActionsServiceRegistration
    {
        /// <summary>
        /// Add daily actions services to the service collection
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <param name="configuration">Configuration</param>
        /// <returns>Service collection</returns>
        public static IServiceCollection AddDailyActionsServices(this IServiceCollection services, IConfiguration configuration, bool useLocalDatabase = false)
        {
            // Always use the remote database
            string connectionStringName = "DailyActionsDB";
            string connectionStringTemplate = configuration.GetConnectionString(connectionStringName)
                ?? throw new InvalidOperationException($"Connection string '{connectionStringName}' not found.");

            // Temporarily disable the NoLock interceptor due to issues with OPENJSON
            // var loggerFactory = services.BuildServiceProvider().GetService<ILoggerFactory>();
            // var noLockInterceptor = new NoLockInterceptor(loggerFactory?.CreateLogger<NoLockInterceptor>());

            // Register DbContext factory with pooling to resolve connection string at runtime
            services.AddDbContextPool<DailyActionsDbContext>((serviceProvider, options) =>
            {
                var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
                var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                var logger = loggerFactory?.CreateLogger("DailyActionsDB");

                // Get the connection string synchronously but properly
                // This is acceptable in the DbContext configuration since it's only called once during startup
                string resolvedConnectionString = connectionStringTemplate;

                try
                {
                    // Create a scope to resolve the connection string
                    using var scope = new System.Threading.CancellationTokenSource();
                    resolvedConnectionString = connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate)
                        .ConfigureAwait(false).GetAwaiter().GetResult();

                    // Log the resolved connection string (without sensitive info)
                    string sanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
                    logger?.LogInformation("Resolved connection string: {ConnectionString}", sanitizedConnectionString);
                }
                catch (Exception ex)
                {
                    logger?.LogError(ex, "Failed to resolve connection string. Using original template.");
                }

                // Log connection string (without sensitive info)
                string finalSanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
                logger?.LogInformation("Connecting to DailyActionsDB with connection string: {ConnectionString}, using {DatabaseType} database",
                    finalSanitizedConnectionString, connectionStringName == "DailyActionsDB" ? "REAL" : "LOCAL");

                options.UseSqlServer(resolvedConnectionString, sqlServerOptions =>
                {
                    sqlServerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    sqlServerOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    sqlServerOptions.CommandTimeout(60); // Increase command timeout
                });

                // Enable sensitive data logging in development
                if (connectionStringName == "DailyActionsDB_Local")
                {
                    options.EnableSensitiveDataLogging();
                }
            });

            // Register simplified DbContext with pooling and the same connection string resolution
            services.AddDbContextPool<DailyActionsSimpleDbContext>((serviceProvider, options) =>
            {
                var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
                var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                var logger = loggerFactory?.CreateLogger("DailyActionsSimpleDB");

                // Get the connection string synchronously but properly
                // This is acceptable in the DbContext configuration since it's only called once during startup
                string resolvedConnectionString = connectionStringTemplate;

                try
                {
                    // Create a scope to resolve the connection string
                    using var scope = new System.Threading.CancellationTokenSource();
                    resolvedConnectionString = connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate)
                        .ConfigureAwait(false).GetAwaiter().GetResult();

                    // Log the resolved connection string (without sensitive info)
                    string sanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
                    logger?.LogInformation("Resolved connection string for SimpleDbContext: {ConnectionString}", sanitizedConnectionString);
                }
                catch (Exception ex)
                {
                    logger?.LogError(ex, "Failed to resolve connection string for SimpleDbContext. Using original template.");
                }

                // Log connection string (without sensitive info)
                string finalSanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
                logger?.LogInformation("Connecting to DailyActionsSimpleDB with connection string: {ConnectionString}, using {DatabaseType} database",
                    finalSanitizedConnectionString, connectionStringName == "DailyActionsDB" ? "REAL" : "LOCAL");

                options.UseSqlServer(resolvedConnectionString, sqlServerOptions =>
                {
                    sqlServerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    sqlServerOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    sqlServerOptions.CommandTimeout(60); // Increase command timeout
                });

                // Enable sensitive data logging in development
                if (connectionStringName == "DailyActionsDB_Local")
                {
                    options.EnableSensitiveDataLogging();
                }
            });

            // We're now using the MemoryCacheAdapter from PPrePorter.Core
            // No need to register memory cache here

            // Register repositories
            services.AddScoped<IWhiteLabelRepository, WhiteLabelRepository>();
            services.AddScoped<ICountryRepository, CountryRepository>();
            services.AddScoped<ICurrencyRepository, CurrencyRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IDailyActionGameRepository, DailyActionGameRepository>();

            // We'll implement the DailyActionRepository later

            // Register remaining repositories
            // For now, register them with the traditional way until we update them all to use the Unit of Work pattern
            services.AddScoped<ITransactionRepository, TransactionRepository>();
            services.AddScoped<IBonusRepository, BonusRepository>();
            services.AddScoped<IBonusBalanceRepository, BonusBalanceRepository>();
            services.AddScoped<ICurrencyHistoryRepository, CurrencyHistoryRepository>();
            services.AddScoped<IGameCasinoSessionRepository, GameCasinoSessionRepository>();
            services.AddScoped<IGameDescriptionRepository, GameDescriptionRepository>();
            services.AddScoped<IGameExcludedByCountryRepository, GameExcludedByCountryRepository>();
            services.AddScoped<IGameExcludedByJurisdictionRepository, GameExcludedByJurisdictionRepository>();
            services.AddScoped<IGameExcludedByLabelRepository, GameExcludedByLabelRepository>();
            services.AddScoped<ISportBetTypeRepository, SportBetTypeRepository>();
            services.AddScoped<ISportSportRepository, SportSportRepository>();
            services.AddScoped<ISportRegionRepository, SportRegionRepository>();
            services.AddScoped<ISportCompetitionRepository, SportCompetitionRepository>();
            services.AddScoped<ISportMatchRepository, SportMatchRepository>();
            services.AddScoped<ISportMarketRepository, SportMarketRepository>();
            services.AddScoped<ISportOddsTypeRepository, SportOddsTypeRepository>();
            services.AddScoped<ISportBetStateRepository, SportBetStateRepository>();
            services.AddScoped<ISportBetEnhancedRepository, SportBetEnhancedRepository>();

            // Register services
            // Use scoped for DailyActionsService since we're using the GlobalCacheService for cache persistence
            services.AddScoped<IDailyActionsService>(provider =>
            {
                var logger = provider.GetRequiredService<ILogger<DailyActionsService>>();
                var cache = provider.GetRequiredService<IGlobalCacheService>();
                var dbContext = provider.GetRequiredService<DailyActionsDbContext>();
                var whiteLabelService = provider.GetRequiredService<IWhiteLabelService>();

                return new DailyActionsService(
                    logger,
                    cache,
                    dbContext,
                    whiteLabelService);
            });
            services.AddScoped<IWhiteLabelService, WhiteLabelService>();
            services.AddScoped<ICountryService, CountryService>();
            services.AddScoped<ICurrencyService, CurrencyService>();
            services.AddScoped<IGameService, GameService>();
            services.AddScoped<IPlayerService, PlayerService>();
            // We'll implement the DailyActionService later
            services.AddScoped<IDailyActionGameService, DailyActionGameService>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<IBonusService, BonusService>();
            services.AddScoped<IBonusBalanceService, BonusBalanceService>();
            services.AddScoped<ICurrencyHistoryService, CurrencyHistoryService>();
            services.AddScoped<IGameCasinoSessionService, GameCasinoSessionService>();
            services.AddScoped<IGameDescriptionService, GameDescriptionService>();
            services.AddScoped<IGameExcludedByCountryService, GameExcludedByCountryService>();
            services.AddScoped<IGameExcludedByJurisdictionService, GameExcludedByJurisdictionService>();
            services.AddScoped<IGameExcludedByLabelService, GameExcludedByLabelService>();
            services.AddScoped<ISportBetTypeService, SportBetTypeService>();
            services.AddScoped<ISportSportService, SportSportService>();
            services.AddScoped<ISportRegionService, SportRegionService>();
            services.AddScoped<ISportCompetitionService, SportCompetitionService>();
            services.AddScoped<ISportMatchService, SportMatchService>();
            services.AddScoped<ISportMarketService, SportMarketService>();
            services.AddScoped<ISportOddsTypeService, SportOddsTypeService>();
            services.AddScoped<ISportBetStateService, SportBetStateService>();
            services.AddScoped<ISportBetEnhancedService, SportBetEnhancedService>();

            // Register simplified services
            services.AddScoped<IDailyActionsSimpleService, DailyActionsSimpleService>();

            // Register additional metadata repositories and services as needed

            // Detect schema and ensure tables exist in the database
            using (var scope = services.BuildServiceProvider().CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<DailyActionsDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<DailyActionsDbContext>>();

                try
                {
                    // Check if tables exist
                    logger.LogInformation("Checking database tables");
                    dbContext.EnsureTablesExistAsync().GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error detecting schema or ensuring tables exist in the database");
                }
            }

            return services;
        }

        /// <summary>
        /// Helper method to sanitize connection strings by hiding sensitive information
        /// </summary>
        /// <param name="connectionString">The connection string to sanitize</param>
        /// <returns>A sanitized version of the connection string with password masked</returns>
        private static string SanitizeConnectionString(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return connectionString;

            if (connectionString.Contains("password="))
            {
                // Simple string replacement instead of regex
                int startIndex = connectionString.IndexOf("password=");
                if (startIndex >= 0)
                {
                    int endIndex = connectionString.IndexOf(';', startIndex);
                    if (endIndex < 0)
                        endIndex = connectionString.Length;

                    return connectionString.Substring(0, startIndex) + "password=***" +
                           (endIndex < connectionString.Length ? connectionString.Substring(endIndex) : "");
                }
            }

            return connectionString;
        }
    }
}
