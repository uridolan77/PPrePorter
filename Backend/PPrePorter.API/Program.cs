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
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Services;
using PPrePorter.API.Features.Dashboard.Insights;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.NLP.Extensions;
using PPrePorter.SemanticLayer.Extensions;
using PPrePorter.DailyActionsDB;
using PPrePorter.AzureServices;
using System.Text;
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
    // Security definitions are now configured in SwaggerVersioningConfiguration

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

    // Add the security requirement for JWT
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Add operation filter to add authorization header to all endpoints
    c.OperationFilter<SwaggerAuthorizationOperationFilter>();
});

// Register the real ConnectionStringResolverService to handle Azure Key Vault placeholders
builder.Services.AddScoped<IConnectionStringResolverService, ConnectionStringResolverService>();

// Determine whether to use the real Azure Key Vault service or the development mock
bool useRealAzureKeyVault = builder.Environment.IsProduction() ||
                           builder.Configuration.GetValue<bool>("UseRealAzureKeyVault", false);

// Register Azure services
builder.Services.AddAzureServices(useRealAzureKeyVault);

// Log which Azure Key Vault implementation is being used
Console.WriteLine($"Using {(useRealAzureKeyVault ? "REAL" : "DEVELOPMENT")} Azure Key Vault implementation");

// If not using real Azure Key Vault, register the development mock implementation
if (!useRealAzureKeyVault)
{
    builder.Services.AddScoped<IAzureKeyVaultService, DevelopmentAzureKeyVaultService>();
}

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
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Controllers
builder.Services.AddControllers();

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

// TODO: Replace with real implementations
// These mock services have been removed during code cleanup

// Register the User Context Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Register NLP services
builder.Services.AddNLPServices(builder.Configuration);

// Register Semantic Layer services
builder.Services.AddSemanticLayer(builder.Configuration);

// Register DailyActionsDB services
// Use the real database with the correct credentials
bool useLocalDatabase = false; // Set to false to use the real database

// Log the connection string we're going to use (without sensitive info)
string connectionStringName = useLocalDatabase ? "DailyActionsDB_Local" : "DailyActionsDB";
string connectionString = builder.Configuration.GetConnectionString(connectionStringName) ?? "";

// Log the template connection string
string sanitizedConnectionString = connectionString;
if (sanitizedConnectionString.Contains("password="))
{
    sanitizedConnectionString = System.Text.RegularExpressions.Regex.Replace(
        sanitizedConnectionString,
        "password=[^;]*",
        "password=***");
}
Console.WriteLine($"Using {connectionStringName} connection string template: {sanitizedConnectionString}");

// Check if the connection string contains Azure Key Vault placeholders
if (connectionString.Contains("{azurevault:"))
{
    Console.WriteLine("Connection string contains Azure Key Vault placeholders that will be resolved at runtime");

    // Log the placeholders
    var placeholderRegex = new Regex(@"\{azurevault:([^:]+):([^}]+)\}", RegexOptions.IgnoreCase);
    var matches = placeholderRegex.Matches(connectionString);
    foreach (Match match in matches)
    {
        string placeholder = match.Value;
        string vaultName = match.Groups[1].Value;
        string secretName = match.Groups[2].Value;
        Console.WriteLine($"  Found placeholder: {placeholder} (Vault: {vaultName}, Secret: {secretName})");
    }
}

builder.Services.AddDailyActionsServices(builder.Configuration, useLocalDatabase);

// Log which database we're using
Console.WriteLine($"Using {(useLocalDatabase ? "local" : "real")} DailyActionsDB");

// Add health checks
builder.Services.AddApplicationHealthChecks(builder.Configuration);
builder.Services.AddHealthCheckUI();

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

// Configure Swagger versioning
builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, SwaggerVersioningConfiguration>();

var app = builder.Build();

// Verify database connection by checking if we can retrieve currencies
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PPrePorter.DailyActionsDB.Data.DailyActionsDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Log the actual connection string being used (without sensitive info)
        var actualConnectionString = dbContext.Database.GetConnectionString();
        if (actualConnectionString != null)
        {
            var actualSanitizedConnectionString = Regex.Replace(
                actualConnectionString,
                "password=[^;]*",
                "password=***");
            logger.LogInformation("Actual connection string being used: {ConnectionString}", actualSanitizedConnectionString);
        }

        logger.LogInformation("Verifying database connection by retrieving currencies...");
        var currencies = dbContext.Currencies.Take(5).ToList();
        logger.LogInformation("Successfully connected to DailyActionsDB and retrieved {Count} currencies", currencies.Count);

        // Also check if we can access the tbl_Daily_actions table
        logger.LogInformation("Verifying access to tbl_Daily_actions table...");
        var dailyActions = dbContext.DailyActions.Take(1).ToList();
        logger.LogInformation("Successfully accessed tbl_Daily_actions table and retrieved {Count} records", dailyActions.Count);

        // Check database schema information using raw SQL
        logger.LogInformation("Checking database schema information...");
        var connection = dbContext.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            connection.Open();
        }

        using (var command = connection.CreateCommand())
        {
            // Check if the common schema exists
            command.CommandText = "SELECT SCHEMA_ID('common') AS SchemaID";
            var schemaId = command.ExecuteScalar();
            logger.LogInformation("Schema 'common' exists: {Exists}", schemaId != DBNull.Value && Convert.ToInt32(schemaId) > 0);

            // Check if the tbl_Daily_actions table exists in the common schema
            command.CommandText = "SELECT OBJECT_ID('common.tbl_Daily_actions') AS TableID";
            var tableId = command.ExecuteScalar();
            logger.LogInformation("Table 'common.tbl_Daily_actions' exists: {Exists}", tableId != DBNull.Value && Convert.ToInt32(tableId) > 0);

            // Get column information for the daily actions table
            command.CommandText = @"
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'common' AND TABLE_NAME = 'tbl_Daily_actions'
                ORDER BY ORDINAL_POSITION";

            using (var reader = command.ExecuteReader())
            {
                logger.LogInformation("Columns in common.tbl_Daily_actions:");
                while (reader.Read())
                {
                    var columnName = reader.GetString(0);
                    var dataType = reader.GetString(1);
                    var maxLength = reader.IsDBNull(2) ? "NULL" : reader.GetInt32(2).ToString();
                    logger.LogInformation("  {ColumnName} ({DataType}, MaxLength: {MaxLength})", columnName, dataType, maxLength);
                }
            }

            // Check if the tbl_White_labels table exists in the common schema
            command.CommandText = "SELECT OBJECT_ID('common.tbl_White_labels') AS TableID";
            var whiteLabelsTableId = command.ExecuteScalar();
            logger.LogInformation("Table 'common.tbl_White_labels' exists: {Exists}",
                whiteLabelsTableId != DBNull.Value && Convert.ToInt32(whiteLabelsTableId) > 0);

            // Try to retrieve some white labels
            logger.LogInformation("Retrieving white labels from the database...");
            var whiteLabels = dbContext.WhiteLabels.Take(5).ToList();
            logger.LogInformation("Successfully retrieved {Count} white labels", whiteLabels.Count);
            foreach (var whiteLabel in whiteLabels)
            {
                logger.LogInformation("  White Label: ID={Id}, Name={Name}", whiteLabel.Id, whiteLabel.Name);
            }

            // Check if the tbl_Countries table exists in the common schema
            command.CommandText = "SELECT OBJECT_ID('common.tbl_Countries') AS TableID";
            var countriesTableId = command.ExecuteScalar();
            logger.LogInformation("Table 'common.tbl_Countries' exists: {Exists}",
                countriesTableId != DBNull.Value && Convert.ToInt32(countriesTableId) > 0);

            // Try to retrieve some countries
            logger.LogInformation("Retrieving countries from the database...");
            var countries = dbContext.Countries.Take(5).ToList();
            logger.LogInformation("Successfully retrieved {Count} countries", countries.Count);

            // Check if the tbl_Currencies table exists in the common schema
            command.CommandText = "SELECT OBJECT_ID('common.tbl_Currencies') AS TableID";
            var currenciesTableId = command.ExecuteScalar();
            logger.LogInformation("Table 'common.tbl_Currencies' exists: {Exists}",
                currenciesTableId != DBNull.Value && Convert.ToInt32(currenciesTableId) > 0);

            // Display the currencies we retrieved earlier
            logger.LogInformation("Currencies retrieved from the database:");
            foreach (var currency in currencies)
            {
                logger.LogInformation("  Currency: ID={Id}, Code={Code}, Name={Name}",
                    currency.CurrencyID, currency.CurrencyCode, currency.CurrencyName);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to connect to DailyActionsDB or retrieve data");

        // Log more detailed information about the exception
        if (ex is Microsoft.Data.SqlClient.SqlException sqlEx)
        {
            logger.LogError("SQL Exception: Number={Number}, State={State}, Class={Class}, Message={Message}",
                sqlEx.Number, sqlEx.State, sqlEx.Class, sqlEx.Message);

            // Log connection information
            logger.LogError("Connection: Server={Server}",
                sqlEx.Server);

            // Check for specific error numbers
            if (sqlEx.Number == 18456)
            {
                logger.LogError("Login failed. Please check the username and password.");
            }
            else if (sqlEx.Number == 4060)
            {
                logger.LogError("Database does not exist or is not accessible.");
            }
            else if (sqlEx.Number == 208)
            {
                logger.LogError("Object (table or view) does not exist.");
            }
        }

        // Don't throw the exception - we want the application to start even if the check fails
        // This will help with debugging
    }

    logger.LogInformation("Database connection check completed. If no errors were reported, the connection to DailyActionsDB is working correctly.");
    logger.LogInformation("=== END DATABASE CONNECTION CHECK ===");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Get all API versions from the API version description provider
        var apiVersionDescriptionProvider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        // Add a swagger endpoint for each API version
        foreach (var description in apiVersionDescriptionProvider.ApiVersionDescriptions)
        {
            c.SwaggerEndpoint(
                $"/swagger/{description.GroupName}/swagger.json",
                $"PPrePorter API {description.GroupName.ToUpperInvariant()}");
        }

        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(-1); // Hide schemas section
        c.DisplayRequestDuration();
        c.EnableFilter();
        c.EnableDeepLinking();

        // Add custom CSS to improve the UI
        c.InjectStylesheet("/swagger-ui/custom.css");

        // Add custom JavaScript for token handling
        c.InjectJavascript("/swagger-ui/custom.js");

        // Add authentication status information
        var authStatus = builder.Configuration.GetSection("AppSettings").GetValue<bool>("EnableAuthentication", true)
            ? "Authentication is <b>enabled</b>. You need to authenticate to access protected endpoints."
            : "Authentication is <b>disabled</b> for development. All endpoints are accessible without authentication.";

        c.HeadContent = $@"
            <div style='padding: 10px; background-color: #f0f0f0; border-radius: 5px; margin-bottom: 10px;'>
                <p><strong>Authentication Status:</strong> {authStatus}</p>
                <p>To authenticate, use the <code>/api/Auth/login</code> endpoint to get a token, then click the 'Authorize' button and enter it.</p>
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

// Enable CORS
app.UseCors("AllowReactApp");

// Get application settings
var appSettingsOptions = app.Services.GetRequiredService<IOptions<AppSettings>>();
bool authEnabled = appSettingsOptions.Value.EnableAuthentication;

// Always add both middleware, but authentication will be bypassed when disabled
app.UseAuthentication();
app.UseAuthorization();

// Log authentication status
if (authEnabled)
{
    Console.WriteLine("Authentication is ENABLED - API endpoints require valid token");
}
else
{
    Console.WriteLine("Authentication is DISABLED - No token required for API access");
}

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Add rate limiting middleware
app.UseMiddleware<RateLimitingMiddleware>();

// Add performance monitoring middleware
app.UseMiddleware<PerformanceMonitoringMiddleware>();

app.MapControllers();

// Map health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Map health check UI endpoint
app.MapHealthChecksUI(options =>
{
    options.UIPath = "/health-ui";
    options.ApiPath = "/health-ui-api";
});

app.Run();
