using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces.Metadata;
using PPrePorter.DailyActionsDB.Repositories;
using PPrePorter.DailyActionsDB.Repositories.Metadata;
using PPrePorter.DailyActionsDB.Services;
using PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching;
using System.Data;

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

            // Get the connection string from the cache service
            var serviceProvider = services.BuildServiceProvider();
            var connectionStringCacheService = serviceProvider.GetRequiredService<IConnectionStringCacheService>();
            var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
            var logger = loggerFactory?.CreateLogger("DailyActionsDB");

            // Get the resolved connection string from the cache
            string resolvedConnectionString = connectionStringCacheService.GetConnectionString(connectionStringName);

            if (string.IsNullOrEmpty(resolvedConnectionString))
            {
                // Fallback to getting from configuration if not in cache
                logger?.LogWarning("Connection string '{Name}' not found in cache, getting from configuration", connectionStringName);
                resolvedConnectionString = configuration.GetConnectionString(connectionStringName)
                    ?? throw new InvalidOperationException($"Connection string '{connectionStringName}' not found.");
            }

            // Log the resolved connection string (without sensitive info)
            string sanitizedConnectionString = SanitizeConnectionString(resolvedConnectionString);
            logger?.LogInformation("Resolved connection string: {ConnectionString}", sanitizedConnectionString);

            // Log connection string (without sensitive info)
            logger?.LogInformation("Connecting to DailyActionsDB with connection string: {ConnectionString}, using {DatabaseType} database",
                sanitizedConnectionString, connectionStringName == "DailyActionsDB" ? "REAL" : "LOCAL");

            // Register DbContext with pooling
            services.AddDbContextPool<DailyActionsDbContext>(options =>
            {
                options.UseSqlServer(resolvedConnectionString, sqlServerOptions =>
                {
                    sqlServerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery); // Changed to SingleQuery
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

                // Add our improved SQL command interceptor to add NOLOCK hints to all tables in SELECT queries
                options.AddInterceptors(new SqlCommandInterceptor(
                    serviceProvider.GetService<ILogger<SqlCommandInterceptor>>()));

                // Add the IsolationLevelInterceptor to apply READ UNCOMMITTED isolation level to all queries
                options.AddInterceptors(new IsolationLevelInterceptor(
                    IsolationLevel.ReadUncommitted,
                    serviceProvider.GetService<ILogger<IsolationLevelInterceptor>>()));
            }, 32); // Set pool size to 32

            // We've removed the simplified DbContext as part of code cleanup

            // We're now using the MemoryCacheAdapter from PPrePorter.Core
            // No need to register memory cache here

            // Register repositories
            services.AddScoped<IWhiteLabelRepository, WhiteLabelRepository>();
            services.AddScoped<ICountryRepository, CountryRepository>();
            services.AddScoped<ICurrencyRepository, CurrencyRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IDailyActionGameRepository, DailyActionGameRepository>();

            // Register the DailyActionsMetadata repository
            // Note: This repository uses PPRePorterDbContext which should be registered separately
            // in the Infrastructure services registration
            services.AddScoped<IDailyActionsMetadataRepository, DailyActionsMetadataRepository>();

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

            // We're now using the Infrastructure's MetadataService via the adapter
            // This is registered in Program.cs

            // Register the smart cache service as a singleton
            services.AddSingleton<IDailyActionsSmartCacheService, DailyActionsSmartCacheService>();

            // Register the traditional DailyActionsService as a scoped service
            services.AddScoped<IDailyActionsService>(provider =>
            {
                var logger = provider.GetRequiredService<ILogger<DailyActionsService>>();
                var cache = provider.GetRequiredService<IGlobalCacheService>();
                var smartCache = provider.GetRequiredService<IDailyActionsSmartCacheService>();
                var dbContext = provider.GetRequiredService<DailyActionsDbContext>();
                var whiteLabelService = provider.GetRequiredService<IWhiteLabelService>();
                var metadataService = provider.GetService<IMetadataService>(); // Optional service

                return new DailyActionsService(
                    logger,
                    cache,
                    smartCache,
                    dbContext,
                    whiteLabelService,
                    metadataService);
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

            // We've removed the simplified services as part of code cleanup

            // Register the NoLockDbContextFactory as a singleton
            services.AddSingleton<NoLockDbContextFactory>();

            // Metadata service is registered above

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
