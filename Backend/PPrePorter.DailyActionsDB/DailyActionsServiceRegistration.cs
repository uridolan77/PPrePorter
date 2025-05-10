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
        public static IServiceCollection AddDailyActionsServices(this IServiceCollection services, IConfiguration configuration, bool useLocalDatabase = true)
        {
            // Get the appropriate connection string
            string connectionStringName = useLocalDatabase ? "DailyActionsDB_Local" : "DailyActionsDB";
            string connectionStringTemplate = configuration.GetConnectionString(connectionStringName)
                ?? throw new InvalidOperationException($"Connection string '{connectionStringName}' not found.");

            // Temporarily disable the NoLock interceptor due to issues with OPENJSON
            // var loggerFactory = services.BuildServiceProvider().GetService<ILoggerFactory>();
            // var noLockInterceptor = new NoLockInterceptor(loggerFactory?.CreateLogger<NoLockInterceptor>());

            // Register DbContext factory to resolve connection string at runtime
            services.AddDbContext<DailyActionsDbContext>((serviceProvider, options) =>
            {
                var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
                var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                var logger = loggerFactory?.CreateLogger("DailyActionsDB");

                string resolvedConnectionString = Task.Run(async () =>
                    await connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate)).Result;

                // Log connection string (without sensitive info)
                string sanitizedConnectionString = resolvedConnectionString;
                if (sanitizedConnectionString.Contains("password="))
                {
                    sanitizedConnectionString = System.Text.RegularExpressions.Regex.Replace(
                        sanitizedConnectionString,
                        "password=[^;]*",
                        "password=***");
                }

                logger?.LogInformation("Connecting to DailyActionsDB with connection string: {ConnectionString}, using {DatabaseType} database",
                    sanitizedConnectionString, connectionStringName == "DailyActionsDB" ? "REAL" : "LOCAL");

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

                // Temporarily disabled: .AddInterceptors(noLockInterceptor);
            });

            // Register simplified DbContext with the same connection string resolution
            services.AddDbContext<DailyActionsSimpleDbContext>((serviceProvider, options) =>
            {
                var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
                var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                var logger = loggerFactory?.CreateLogger("DailyActionsSimpleDB");

                string resolvedConnectionString = Task.Run(async () =>
                    await connectionStringResolver.ResolveConnectionStringAsync(connectionStringTemplate)).Result;

                // Log connection string (without sensitive info)
                string sanitizedConnectionString = resolvedConnectionString;
                if (sanitizedConnectionString.Contains("password="))
                {
                    sanitizedConnectionString = System.Text.RegularExpressions.Regex.Replace(
                        sanitizedConnectionString,
                        "password=[^;]*",
                        "password=***");
                }

                logger?.LogInformation("Connecting to DailyActionsSimpleDB with connection string: {ConnectionString}, using {DatabaseType} database",
                    sanitizedConnectionString, connectionStringName == "DailyActionsDB" ? "REAL" : "LOCAL");

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

                // Temporarily disabled: .AddInterceptors(noLockInterceptor);
            });

            // Register memory cache if not already registered
            services.AddMemoryCache();

            // Register repositories
            services.AddScoped<IWhiteLabelRepository, WhiteLabelRepository>();
            services.AddScoped<ICountryRepository, CountryRepository>();
            services.AddScoped<ICurrencyRepository, CurrencyRepository>();

            // Register services
            services.AddScoped<IDailyActionsService, DailyActionsService>();
            services.AddScoped<IWhiteLabelService, WhiteLabelService>();
            services.AddScoped<ICountryService, CountryService>();
            services.AddScoped<ICurrencyService, CurrencyService>();

            // Register simplified services
            services.AddScoped<IDailyActionsSimpleService, DailyActionsSimpleService>();

            // Register additional metadata repositories and services as needed

            return services;
        }
    }
}
