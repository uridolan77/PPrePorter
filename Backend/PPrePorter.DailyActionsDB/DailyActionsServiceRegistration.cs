using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Repositories;
using PPrePorter.DailyActionsDB.Services;
using System;
using System.Text.RegularExpressions;

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
        public static IServiceCollection AddDailyActionsServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Always use the remote database
            string connectionStringName = "DailyActionsDB";
            string connectionStringTemplate = configuration.GetConnectionString(connectionStringName)
                ?? throw new InvalidOperationException($"Connection string '{connectionStringName}' not found.");

            // Temporarily disable the NoLock interceptor due to issues with OPENJSON
            // var loggerFactory = services.BuildServiceProvider().GetService<ILoggerFactory>();
            // var noLockInterceptor = new NoLockInterceptor(loggerFactory?.CreateLogger<NoLockInterceptor>());

            // Get the connection string from the resolver service
            var serviceProvider = services.BuildServiceProvider();
            var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
            var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
            var logger = loggerFactory?.CreateLogger("DailyActionsDB");

            // Resolve the connection string
            string resolvedConnectionString = connectionStringTemplate;

            try
            {
                // Resolve the connection string synchronously
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

            // Register DbContext with pooling
            services.AddDbContextPool<DailyActionsDbContext>(options =>
            {
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
            }, 32); // Set pool size to 32

            // Register simplified DbContext with pooling using the same connection string
            logger?.LogInformation("Connecting to DailyActionsSimpleDB with connection string: {ConnectionString}", finalSanitizedConnectionString);

            services.AddDbContextPool<DailyActionsSimpleDbContext>(options =>
            {
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
            }, 32); // Set pool size to 32

            // We're now using the MemoryCacheAdapter from PPrePorter.Core
            // No need to register memory cache here

            // Register repositories
            services.AddScoped<IWhiteLabelRepository, WhiteLabelRepository>();
            services.AddScoped<ICountryRepository, CountryRepository>();
            services.AddScoped<ICurrencyRepository, CurrencyRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IDailyActionGameRepository, DailyActionGameRepository>();

            // We'll implement the DailyActionRepository and DailyActionService later
            // services.AddScoped<IDailyActionRepository, DailyActionRepository>();

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
            // services.AddScoped<IDailyActionService, DailyActionService>();
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
            try
            {
                using var dbScope = services.BuildServiceProvider().CreateScope();
                var dbContext = dbScope.ServiceProvider.GetRequiredService<DailyActionsDbContext>();
                var dbLogger = dbScope.ServiceProvider.GetRequiredService<ILogger<DailyActionsDbContext>>();

                try
                {
                    // Check if tables exist
                    dbLogger.LogInformation("Checking database tables");
                    dbContext.EnsureTablesExistAsync().GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    dbLogger.LogError(ex, "Error detecting schema or ensuring tables exist in the database");
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw it to allow the application to start
                var errorLoggerFactory = services.BuildServiceProvider().GetService<ILoggerFactory>();
                var errorLogger = errorLoggerFactory?.CreateLogger("DailyActionsServiceRegistration");
                errorLogger?.LogError(ex, "Error initializing database context");
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
                // Simple string replacement
                int startIndex = connectionString.IndexOf("password=");
                if (startIndex >= 0)
                {
                    int endIndex = connectionString.IndexOf(';', startIndex);
                    if (endIndex < 0)
                        endIndex = connectionString.Length;

                    // Build the sanitized string
                    var prefix = connectionString[..startIndex];
                    var suffix = endIndex < connectionString.Length ? connectionString[endIndex..] : "";
                    return prefix + "password=***" + suffix;
                }
            }

            return connectionString;
        }
    }
}
