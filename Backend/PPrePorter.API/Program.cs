using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.RegularExpressions;
using OfficeOpenXml;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using PPrePorter.API.Features.Configuration;
using PPrePorter.API.Middleware;
using PPrePorter.Core;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;
using PPrePorter.Infrastructure;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Services;
using PPrePorter.API.Features.Dashboard.Insights;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.NLP.Extensions;
using PPrePorter.SemanticLayer.Extensions;
using PPrePorter.DailyActionsDB;
using PPrePorter.AzureServices;
using System;
using System.Text;
using System.Threading.Tasks;
using PPrePorter.API.Extensions;
using HealthChecks.UI.Client;
using PPrePorter.Infrastructure.Repositories;
using PPrePorter.CQRS.Common;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Configure EPPlus license
// For EPPlus version 8 and later
ExcelPackage.License.SetNonCommercialPersonal("PPrePorter");

// Add services to the container.
// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Define the security scheme for JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n" +
                      "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                      "Example: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    // Add operation filter to set default values for parameters
    c.OperationFilter<SwaggerDefaultValueOperationFilter>();

    // Ignore obsolete actions and resolve conflicts
    c.IgnoreObsoleteActions();
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());

    // Include all endpoints in the v1 document
    c.DocInclusionPredicate((docName, apiDesc) => true);
});

// Configure Swagger versioning
builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, SwaggerVersioningConfiguration>();

// Register core services including the ConnectionStringResolverService
builder.Services.AddCoreServices();

// Register infrastructure services
builder.Services.AddInfrastructureServices(builder.Configuration);

// Determine whether to use the real Azure Key Vault service or the development mock
bool useRealAzureKeyVault = builder.Environment.IsProduction() ||
                           builder.Configuration.GetValue<bool>("UseRealAzureKeyVault", true); // Default to true

// Register Azure services
builder.Services.AddAzureServices(useRealAzureKeyVault);

// Log which Azure Key Vault implementation is being used
Console.WriteLine($"Using {(useRealAzureKeyVault ? "REAL" : "DEVELOPMENT")} Azure Key Vault implementation");

// Log Azure Key Vault configuration
Console.WriteLine("Azure Key Vault Configuration:");
Console.WriteLine($"  Environment.IsProduction(): {builder.Environment.IsProduction()}");
Console.WriteLine($"  UseRealAzureKeyVault setting: {builder.Configuration.GetValue<bool>("UseRealAzureKeyVault", false)}");
Console.WriteLine($"  Final useRealAzureKeyVault value: {useRealAzureKeyVault}");

// If not using real Azure Key Vault, we need to implement a proper development service
// The mock implementation has been removed during code cleanup

// Configure database contexts with local development connection strings
string ppReporterConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=PPrePorterDB;Integrated Security=True;Connect Timeout=30;";

// Register connection string templates
builder.Services.AddSingleton(ppReporterConnectionString);

// Register PPRePorterDbContext
builder.Services.AddDbContext<PPRePorterDbContext>(options =>
{
    options.UseSqlServer(ppReporterConnectionString);
});

// Register interfaces
builder.Services.AddScoped<IPPRePorterDbContext>(provider => provider.GetRequiredService<PPRePorterDbContext>());

// Configure application settings
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
bool enableAuthentication = appSettings?.EnableAuthentication ?? true;

// Configure rate limiting settings
builder.Services.Configure<RateLimitingSettings>(builder.Configuration.GetSection("RateLimitingSettings"));

// Configure cache settings
builder.Services.Configure<CacheSettings>(builder.Configuration.GetSection("CacheSettings"));

// Configure JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Always configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key is not configured");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey))
    };

    // If authentication is disabled, override the events to always succeed
    if (!enableAuthentication)
    {
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context => Task.CompletedTask,
            OnAuthenticationFailed = context => Task.CompletedTask,
            OnChallenge = context =>
            {
                // Skip the default logic and allow the request to proceed
                context.HandleResponse();
                return Task.CompletedTask;
            },
            OnForbidden = context => Task.CompletedTask
        };
    }
    else
    {
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Append("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    }
});

// Add Authorization
if (!enableAuthentication)
{
    // When authentication is disabled, configure authorization to allow anonymous access
    builder.Services.AddAuthorization(options =>
    {
        // Create a policy that allows anonymous access
        options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
            .RequireAssertion(_ => true)
            .Build();
    });
}
else
{
    // Normal authorization
    builder.Services.AddAuthorization();
}

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://localhost:3000",
                "https://localhost:3001",
                "https://localhost:7075"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Controllers with cache filter
builder.Services.AddControllers(options =>
{
    // Add cache control filter to properly set cache headers
    options.Filters.Add<PPrePorter.API.Filters.CacheControlFilter>();
});

// Add Response Caching
builder.Services.AddResponseCaching(options =>
{
    // Get cache settings from configuration or use defaults
    var cacheSettings = builder.Configuration.GetSection("CacheSettings").Get<CacheSettings>() ?? new CacheSettings();

    options.MaximumBodySize = cacheSettings.MaxResponseBodySizeMB * 1024 * 1024; // Convert MB to bytes
    options.UseCaseSensitivePaths = cacheSettings.UseCaseSensitivePaths;
});

// Register dashboard services
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDataFilterService, DataFilterService>();

// Register caching service
// Configure Redis for distributed caching
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    // Use Redis for distributed caching in production
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "PPrePorter:";
    });
    Console.WriteLine("Using Redis for distributed caching");
}
else
{
    // Fallback to in-memory cache for development
    builder.Services.AddDistributedMemoryCache();
    Console.WriteLine("Using in-memory distributed cache (Redis not configured)");
}

// Register the real caching service implementation
builder.Services.AddScoped<ICachingService, RedisCachingService>();

// Register Data Storytelling related services
builder.Services.AddScoped<IInsightGenerationService, InsightGenerationService>();
builder.Services.AddScoped<IAnomalyDetectionService, AnomalyDetectionService>();
builder.Services.AddScoped<ITrendAnalysisService, TrendAnalysisService>();
builder.Services.AddScoped<IContextualExplanationService, ContextualExplanationService>();

// These services now have real implementations

// Register the User Context Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Register NLP services
builder.Services.AddNLPServices(builder.Configuration);

// Register Semantic Layer services
builder.Services.AddSemanticLayer(builder.Configuration);

// Initialize the connection string cache before registering DailyActionsDB services
Console.WriteLine("\n=== PRE-INITIALIZING CONNECTION STRING CACHE ===");
Console.WriteLine($"Using {(useRealAzureKeyVault ? "REAL" : "DEVELOPMENT")} Azure Key Vault implementation");

// Create a temporary service provider to initialize the connection string cache
using (var tempServiceProvider = builder.Services.BuildServiceProvider())
{
    var logger = tempServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Get the connection string cache service
        var connectionStringCacheService = tempServiceProvider.GetRequiredService<IConnectionStringCacheService>();
        logger.LogInformation("Pre-initializing connection string cache");

        // Initialize the cache
        connectionStringCacheService.InitializeAsync().GetAwaiter().GetResult();

        // Verify that the DailyActionsDB connection string is cached
        string dailyActionsDbConnectionString = connectionStringCacheService.GetConnectionString("DailyActionsDB");
        if (!string.IsNullOrEmpty(dailyActionsDbConnectionString))
        {
            logger.LogInformation("DailyActionsDB connection string is pre-cached successfully");

            // Log the connection string (without sensitive info)
            string sanitizedConnectionString = dailyActionsDbConnectionString;
            if (sanitizedConnectionString != null && sanitizedConnectionString.Contains("password="))
            {
                sanitizedConnectionString = System.Text.RegularExpressions.Regex.Replace(
                    sanitizedConnectionString,
                    "password=[^;]*",
                    "password=***");
            }
            Console.WriteLine($"Using connection string from cache: {sanitizedConnectionString}");

            // Dump the cache contents for debugging
            connectionStringCacheService.DumpCacheContents();
        }
        else
        {
            logger.LogWarning("DailyActionsDB connection string is not pre-cached");
        }

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("CONNECTION STRING CACHE PRE-INITIALIZED SUCCESSFULLY");
        Console.ResetColor();
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("CONNECTION STRING CACHE PRE-INITIALIZATION FAILED");
        Console.ResetColor();

        logger.LogError(ex, "Failed to pre-initialize connection string cache");
    }

    Console.WriteLine("=== CONNECTION STRING CACHE PRE-INITIALIZATION COMPLETE ===\n");
}

// Register DailyActionsDB services
// Always use the real database
bool useLocalDatabase = false; // Set to false to use the real database

// Register the Infrastructure's IMetadataService first
builder.Services.AddScoped<PPrePorter.Infrastructure.Interfaces.IMetadataService, PPrePorter.Infrastructure.Services.MetadataService>();

// Create an adapter that implements DailyActionsDB's IMetadataService but uses Infrastructure's IMetadataService
builder.Services.AddScoped<PPrePorter.DailyActionsDB.Interfaces.IMetadataService, PPrePorter.API.Services.MetadataServiceAdapter>();

// Register the SimpleCachePrewarmingService as a hosted service
// This doesn't depend on the Infrastructure project
builder.Services.AddHostedService<PPrePorter.API.Services.SimpleCachePrewarmingService>();

// Also register it as a singleton so it can be injected into controllers
builder.Services.AddSingleton<PPrePorter.API.Services.SimpleCachePrewarmingService>();

builder.Services.AddDailyActionsServices(builder.Configuration);

// Log which database we're using
Console.WriteLine($"Using {(useLocalDatabase ? "local" : "real")} DailyActionsDB");

// Now that the connection string cache is pre-initialized, register health checks
Console.WriteLine("\n=== REGISTERING HEALTH CHECKS ===");
builder.Services.AddApplicationHealthChecks(builder.Configuration);
builder.Services.AddHealthCheckUI();
Console.WriteLine("=== HEALTH CHECKS REGISTERED ===\n");

// Add performance monitoring
builder.Services.AddSingleton<PPrePorter.API.Features.Monitoring.IMetricsService, PPrePorter.API.Features.Monitoring.MetricsService>();

// Add repositories
builder.Services.AddRepositories();

// Add MediatR
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(BaseCommand).Assembly);
});

// Register validators
builder.Services.AddTransient<PPrePorter.CQRS.Common.IValidator<PPrePorter.CQRS.Users.Commands.CreateUserCommand>, PPrePorter.CQRS.Users.Commands.CreateUserCommandValidator>();
builder.Services.AddTransient<PPrePorter.CQRS.Common.IValidator<PPrePorter.CQRS.Users.Queries.GetUserByIdQuery>, PPrePorter.CQRS.Users.Queries.GetUserByIdQueryValidator>();
builder.Services.AddTransient<PPrePorter.CQRS.Common.IValidator<PPrePorter.CQRS.Users.Queries.GetAllUsersQuery>, PPrePorter.CQRS.Users.Queries.GetAllUsersQueryValidator>();

// Add API versioning
builder.Services.AddApiVersioningConfiguration();

var app = builder.Build();

// Verify the connection string cache is initialized
Console.WriteLine("\n=== VERIFYING CONNECTION STRING CACHE ===");
Console.WriteLine($"Using {(useRealAzureKeyVault ? "REAL" : "DEVELOPMENT")} Azure Key Vault implementation");
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Get the connection string cache service
        var connectionStringCacheService = scope.ServiceProvider.GetRequiredService<IConnectionStringCacheService>();

        // Verify that the DailyActionsDB connection string is cached
        string dailyActionsDbConnectionString = connectionStringCacheService.GetConnectionString("DailyActionsDB");
        if (!string.IsNullOrEmpty(dailyActionsDbConnectionString))
        {
            logger.LogInformation("DailyActionsDB connection string is verified in cache");

            // Dump the cache contents for debugging
            connectionStringCacheService.DumpCacheContents();

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("CONNECTION STRING CACHE VERIFICATION SUCCESSFUL");
            Console.ResetColor();
        }
        else
        {
            logger.LogWarning("DailyActionsDB connection string is not in cache, initializing now");

            // Initialize the cache if needed
            await connectionStringCacheService.InitializeAsync();

            // Verify again
            dailyActionsDbConnectionString = connectionStringCacheService.GetConnectionString("DailyActionsDB");
            if (!string.IsNullOrEmpty(dailyActionsDbConnectionString))
            {
                logger.LogInformation("DailyActionsDB connection string is now cached successfully");

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("CONNECTION STRING CACHE INITIALIZED SUCCESSFULLY");
                Console.ResetColor();
            }
            else
            {
                logger.LogError("DailyActionsDB connection string could not be cached");

                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("CONNECTION STRING CACHE INITIALIZATION FAILED");
                Console.ResetColor();
            }
        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("CONNECTION STRING CACHE VERIFICATION FAILED");
        Console.ResetColor();

        logger.LogError(ex, "Failed to verify connection string cache");
    }

    Console.WriteLine("=== CONNECTION STRING CACHE VERIFICATION COMPLETE ===\n");

    // The connection string cache is now verified
}

// Verify database connection with a clear success/failure message
Console.WriteLine("\n=== CHECKING DATABASE CONNECTION ===");
Console.WriteLine($"Using {(useRealAzureKeyVault ? "REAL" : "DEVELOPMENT")} Azure Key Vault implementation");
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Get the connection string cache service
        var connectionStringCacheService = scope.ServiceProvider.GetRequiredService<IConnectionStringCacheService>();

        // Check which Azure Key Vault service implementation is being used
        var keyVaultService = scope.ServiceProvider.GetRequiredService<IAzureKeyVaultService>();
        logger.LogInformation("Using Azure Key Vault service implementation: {Implementation}", keyVaultService.GetType().Name);

        // Get the connection string name
        string dbConnectionStringName = "DailyActionsDB";

        // Get the connection string from the cache
        Console.WriteLine("Getting connection string from cache...");
        string resolvedConnectionString = connectionStringCacheService.GetConnectionString(dbConnectionStringName);

        if (string.IsNullOrEmpty(resolvedConnectionString))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("ERROR: Connection string not found in cache");
            Console.ResetColor();
            logger.LogError("Connection string '{Name}' not found in cache", dbConnectionStringName);
            return;
        }

        // Log the resolved connection string (without sensitive info)
        string dbSanitizedConnectionString = resolvedConnectionString;
        if (dbSanitizedConnectionString != null && dbSanitizedConnectionString.Contains("password="))
        {
            dbSanitizedConnectionString = Regex.Replace(
                dbSanitizedConnectionString,
                "password=[^;]*",
                "password=***");
        }
        logger.LogInformation("Connection string from cache: {ConnectionString}", dbSanitizedConnectionString);

        // Check if the connection string still contains placeholders
        if (resolvedConnectionString.Contains("{azurevault:"))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("ERROR: Connection string still contains Azure Key Vault placeholders");
            Console.ResetColor();
            logger.LogError("Connection string still contains Azure Key Vault placeholders");
            return;
        }

        // Log the actual values being used (for debugging purposes)
        Console.WriteLine("Connection string successfully resolved with all placeholders replaced.");

        // Create a connection using the resolved connection string
        using (var connection = new Microsoft.Data.SqlClient.SqlConnection(resolvedConnectionString))
        {
            var dataSource = connection.DataSource;
            var database = connection.Database;

            // Simple connection test - no fallbacks
            logger.LogInformation("Testing connection to database server {Server}, database {Database}...", dataSource, database);

            // Try to open the connection
            connection.Open();

            // Execute a simple query to verify database access
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT 1";
                var result = command.ExecuteScalar();

                if (result != null)
                {
                    // Connection successful
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"CONNECTED SUCCESSFULLY TO {dataSource}\\{database}");
                    Console.ResetColor();

                    // Try a simple query to verify we can access a specific table
                    try
                    {
                        command.CommandText = "SELECT TOP 1 * FROM common.tbl_Currencies";
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                logger.LogInformation("Successfully queried the Currencies table");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Connected to database but failed to query the Currencies table");
                    }
                }
                else
                {
                    // This shouldn't happen, but just in case
                    throw new Exception("Database query returned null");
                }
            }
        }
    }
    catch (Exception ex)
    {
        // Connection failed
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("CONNECTION TO DB FAILED");
        Console.ResetColor();

        logger.LogError(ex, "Failed to connect to database");

        // Log more detailed information about the exception
        if (ex is Microsoft.Data.SqlClient.SqlException sqlEx)
        {
            logger.LogError("SQL Exception Number: {Number}, State: {State}, Class: {Class}, Message: {Message}",
                sqlEx.Number, sqlEx.State, sqlEx.Class, sqlEx.Message);
        }
        else if (ex is InvalidOperationException && ex.Message.Contains("Azure Key Vault placeholders"))
        {
            logger.LogError("Connection string resolution error: {Message}", ex.Message);
            logger.LogError("The ConnectionStringResolverService failed to replace Azure Key Vault placeholders");
        }
    }

    Console.WriteLine("=== DATABASE CONNECTION CHECK COMPLETE ===\n");
}

// Initialize the cache service (but don't prewarm it yet)
Console.WriteLine("\n=== INITIALIZING CACHE ===");
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Get the cache service
        var cacheService = scope.ServiceProvider.GetRequiredService<IGlobalCacheService>();
        logger.LogInformation("Using cache service implementation: {Implementation}", cacheService.GetType().Name);

        // Get the cache statistics
        var cacheStats = cacheService.GetStatistics();
        logger.LogInformation("Initial cache statistics: {CacheStats}", cacheStats);

        // Get the DailyActionsService
        var dailyActionsService = scope.ServiceProvider.GetRequiredService<PPrePorter.DailyActionsDB.Interfaces.IDailyActionsService>();
        logger.LogInformation("Using DailyActionsService implementation: {Implementation}", dailyActionsService.GetType().Name);

        // Note: Cache prewarming is now handled by the CachePrewarmingService background service
        // This allows the application to start faster and prewarm the cache in the background

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("CACHE SERVICE INITIALIZED - PREWARMING WILL HAPPEN IN BACKGROUND");
        Console.ResetColor();
    }
    catch (Exception ex)
    {
        // Cache initialization failed
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("CACHE INITIALIZATION FAILED");
        Console.ResetColor();

        logger.LogError(ex, "Failed to initialize cache");
    }

    Console.WriteLine("=== CACHE INITIALIZATION COMPLETE ===\n");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Set the default endpoint to show when Swagger UI loads
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "PPrePorter API Documentation";

        // Configure Swagger UI options
        c.DefaultModelExpandDepth(2);
        c.DefaultModelRendering(Swashbuckle.AspNetCore.SwaggerUI.ModelRendering.Model);
        c.DefaultModelsExpandDepth(-1);
        c.DisplayOperationId();
        c.DisplayRequestDuration();
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
        c.EnableValidator();

        // Add a single endpoint for all APIs
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PPrePorter API v1");

        // Add request/response interceptors for debugging
        c.UseRequestInterceptor("(req) => { return req; }");
        c.UseResponseInterceptor("(res) => { return res; }");

        // Add custom CSS to improve the UI
        c.InjectStylesheet("/swagger-ui/custom.css");

        // Add custom JavaScript for token handling
        c.InjectJavascript("/swagger-ui/custom.js");

        // Add custom JavaScript for cache status
        c.InjectJavascript("/swagger-ui/cache-status.js");

        // Add authentication status information
        c.HeadContent = $@"
            <div style='padding: 10px; background-color: #f0f0f0; border-radius: 5px; margin-bottom: 10px;'>
                <p><strong>Authentication Status:</strong> Authentication is <b>enabled</b>. Protected endpoints require a valid JWT token.</p>
                <p>API versioning is supported via:</p>
                <ul>
                    <li>URL path: <code>/api/v1/...</code> or <code>/api/v2/...</code></li>
                    <li>Query string: <code>?api-version=1.0</code> or <code>?api-version=2.0</code></li>
                    <li>Header: <code>X-Api-Version: 1.0</code> or <code>X-Api-Version: 2.0</code></li>
                </ul>
            </div>
        ";
    });
}

app.UseHttpsRedirection();

// Enable static files for Swagger UI customization
app.UseStaticFiles();

// Get application settings
var appSettingsOptions = app.Services.GetRequiredService<IOptions<AppSettings>>();
bool authEnabled = appSettingsOptions.Value.EnableAuthentication;

// Log authentication status
if (authEnabled)
{
    Console.WriteLine("Authentication is ENABLED - API endpoints require valid token");
}
else
{
    Console.WriteLine("Authentication is DISABLED - No token required for API access");
}

// Add global exception handling middleware first
// This ensures it can catch exceptions from other middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Add performance monitoring middleware early in the pipeline
// This ensures it can monitor the performance of other middleware
app.UseMiddleware<PerformanceMonitoringMiddleware>();

// Add routing early in the pipeline
// This is required for the authorization middleware to work correctly
app.UseRouting();

// Enable CORS after routing but before authentication
app.UseCors("AllowReactApp");

// Add authentication and authorization middleware
// These must be after UseRouting() but before UseEndpoints()
app.UseAuthentication();
app.UseAuthorization();

// Log that authentication is enabled
Console.WriteLine("Authentication middleware is ENABLED - Token required for protected API endpoints");

// Add rate limiting middleware after auth but before response caching
// This prevents caching rate-limited responses
app.UseMiddleware<RateLimitingMiddleware>();

// Add response cache diagnostics middleware
// This helps diagnose caching issues
app.UseMiddleware<ResponseCacheDiagnosticsMiddleware>();

// Add response caching middleware
// This allows caching of entire responses for better performance
app.UseResponseCaching();

// Add cache response headers middleware to ensure proper caching
app.Use(async (context, next) =>
{
    // Check if this is a GET or HEAD request (cacheable methods)
    if (context.Request.Method == "GET" || context.Request.Method == "HEAD")
    {
        // Check if the path is for a cache test endpoint
        bool isCacheTestEndpoint = context.Request.Path.StartsWithSegments("/api/cache-test") ||
                                  context.Request.Path.StartsWithSegments("/api/cache-diagnostics");

        if (isCacheTestEndpoint)
        {
            // Add stronger cache control headers for test endpoints
            context.Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = TimeSpan.FromSeconds(60),
                MustRevalidate = false
            };

            // Add debug headers
            context.Response.Headers["X-Response-Cache-Middleware"] = "Applied";
            context.Response.Headers["X-Cache-Test-Endpoint"] = "True";
        }
    }

    await next();
});

// Map controllers after all middleware is configured
// This is the endpoint execution middleware
// The AllowAnonymous attribute on controllers will be respected
app.MapControllers();

// Map health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false // Prevent caching of health check responses
}).RequireCors("AllowReactApp"); // Apply CORS policy to health endpoint

// Map specific health check endpoint for DailyActionsDB
app.MapHealthChecks("/health/dailyactions", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = hc => hc.Name == "DailyActionsDB",
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false // Prevent caching of health check responses
}).RequireCors("AllowReactApp"); // Apply CORS policy to health endpoint

// Map health check UI endpoint
app.MapHealthChecksUI(options =>
{
    options.UIPath = "/health-ui";
    options.ApiPath = "/health-ui-api";
}).RequireCors("AllowReactApp"); // Apply CORS policy to health UI endpoint

app.Run();
