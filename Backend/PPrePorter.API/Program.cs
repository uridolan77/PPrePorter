using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using PPrePorter.API.Features.Configuration;
using PPrePorter.API.Middleware;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Services;
using PPrePorter.API.Features.Dashboard.Insights;
using PPrePorter.API.Features.Database;
using PPrePorter.API.Features.Caching;
using PPrePorter.NLP.Extensions;
using PPrePorter.SemanticLayer.Extensions;
using PPrePorter.DailyActionsDB;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PPrePorter API",
        Version = "v1",
        Description = "API for PPrePorter application"
    });

    // Define the security scheme for JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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
});

// Register the real ConnectionStringResolverService to handle Azure Key Vault placeholders
builder.Services.AddScoped<IConnectionStringResolverService, ConnectionStringResolverService>();

// Register the development Azure Key Vault service implementation
builder.Services.AddScoped<IAzureKeyVaultService, DevelopmentAzureKeyVaultService>();

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
builder.Services.AddScoped<IDailyActionsDbContext>(provider => provider.GetRequiredService<DailyActionsDbContext>());
builder.Services.AddScoped<IPPRePorterDbContext>(provider => provider.GetRequiredService<PPRePorterDbContext>());

// Configure application settings
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
bool enableAuthentication = appSettings?.EnableAuthentication ?? true;

// Configure JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<IJwtService, JwtService>();

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

// Register caching service for development
builder.Services.AddDistributedMemoryCache(); // Use in-memory cache for development
builder.Services.AddScoped<ICachingService, MockCachingService>();

// Register Data Storytelling related services
builder.Services.AddScoped<IInsightGenerationService, InsightGenerationService>();

// Register mock implementations for development
builder.Services.AddScoped<IDataAnnotationService, MockDataAnnotationService>();
builder.Services.AddScoped<IAnomalyDetectionService, MockAnomalyDetectionService>();
builder.Services.AddScoped<IContextualExplanationService, MockContextualExplanationService>();
builder.Services.AddScoped<ITrendAnalysisService, MockTrendAnalysisService>();
builder.Services.AddScoped<IDashboardPersonalizationService, MockDashboardPersonalizationService>();

// Register the User Context Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Register NLP services
builder.Services.AddNLPServices(builder.Configuration);

// Register Semantic Layer services
builder.Services.AddSemanticLayer(builder.Configuration);

// Register DailyActionsDB services
// Use the local DailyActionsDB for development
bool useLocalDatabase = false; // Use local database for now
builder.Services.AddDailyActionsServices(builder.Configuration, useLocalDatabase);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PPrePorter API v1");
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(-1); // Hide schemas section
        c.DisplayRequestDuration();
        c.EnableFilter();
        c.EnableDeepLinking();
    });
}

app.UseHttpsRedirection();

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

app.MapControllers();

app.Run();
