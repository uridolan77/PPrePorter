using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using PPrePorter.API.Middleware;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Services;
using PPrePorter.API.Features.Dashboard.Services;
using PPrePorter.API.Features.Dashboard.Insights;
using PPrePorter.NLP.Extensions;
using PPrePorter.SemanticLayer.Extensions;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register the ConnectionStringResolverService
builder.Services.AddScoped<IConnectionStringResolverService, ConnectionStringResolverService>();

// Temporary Azure Key Vault service implementation (to be replaced with actual implementation)
builder.Services.AddScoped<IAzureKeyVaultService, DevelopmentAzureKeyVaultService>();

// Configure database contexts
string dailyActionsConnectionString = "data source=185.64.56.157;initial catalog=DailyActionsDB;persist security info=True;user id={azurevault:progressplaymcp-kv:DailyActionsDB--Username};password={azurevault:progressplaymcp-kv:DailyActionsDB--Password};";
string ppReporterConnectionString = "Server=tcp:progressplay-server.database.windows.net,1433;Initial Catalog=ProgressPlayDB;Persist Security Info=False;User ID={azurevault:progressplaymcp-kv:ProgressPlayDBAzure--Username};Password={azurevault:progressplaymcp-kv:ProgressPlayDBAzure--Password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

// Register DailyActionsDbContext
builder.Services.AddDbContext<DailyActionsDbContext>((serviceProvider, options) =>
{
    var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
    options.UseSqlServer(connectionStringResolver.ResolveConnectionStringAsync(dailyActionsConnectionString).Result);
});

// Register PPRePorterDbContext
builder.Services.AddDbContext<PPRePorterDbContext>((serviceProvider, options) =>
{
    var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
    options.UseSqlServer(connectionStringResolver.ResolveConnectionStringAsync(ppReporterConnectionString).Result);
});

// Register interfaces
builder.Services.AddScoped<IDailyActionsDbContext>(provider => provider.GetRequiredService<DailyActionsDbContext>());
builder.Services.AddScoped<IPPRePorterDbContext>(provider => provider.GetRequiredService<PPRePorterDbContext>());

// Configure JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<IJwtService, JwtService>();

// Add JWT Authentication
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
});

// Add Authorization
builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();

// Register dashboard services
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDataFilterService, DataFilterService>();

// Register Data Storytelling related services
builder.Services.AddScoped<IInsightGenerationService, InsightGenerationService>();
builder.Services.AddScoped<IDataAnnotationService, DataAnnotationService>();
builder.Services.AddScoped<IAnomalyDetectionService, AnomalyDetectionService>();
builder.Services.AddScoped<IContextualExplanationService, ContextualExplanationService>();
builder.Services.AddScoped<ITrendAnalysisService, TrendAnalysisService>();
builder.Services.AddScoped<IDashboardPersonalizationService, DashboardPersonalizationService>();

// Register Redis caching service
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "PPrePorter:";
});
builder.Services.AddScoped<ICachingService, RedisCachingService>();

// Register the User Context Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Register NLP services
builder.Services.AddNLPServices(builder.Configuration);

// Register Semantic Layer services
builder.Services.AddSemanticLayer(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.MapControllers();

app.Run();
