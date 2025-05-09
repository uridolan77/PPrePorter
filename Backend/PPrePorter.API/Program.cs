using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
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
});

// Register the mock ConnectionStringResolverService for development
builder.Services.AddScoped<IConnectionStringResolverService, MockConnectionStringResolverService>();

// Temporary Azure Key Vault service implementation (to be replaced with actual implementation)
builder.Services.AddScoped<IAzureKeyVaultService, DevelopmentAzureKeyVaultService>();

// Configure database contexts with local development connection strings
string dailyActionsConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=DailyActionsDB;Integrated Security=True;Connect Timeout=30;";
string ppReporterConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=PPrePorterDB;Integrated Security=True;Connect Timeout=30;";

// Register connection string templates
builder.Services.AddSingleton(dailyActionsConnectionString);
builder.Services.AddSingleton(ppReporterConnectionString);

// Register DailyActionsDbContext
builder.Services.AddDbContext<DailyActionsDbContext>(options =>
{
    options.UseSqlServer(dailyActionsConnectionString);
});

// Register PPRePorterDbContext
builder.Services.AddDbContext<PPRePorterDbContext>(options =>
{
    options.UseSqlServer(ppReporterConnectionString);
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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "PPrePorter API v1"));
}

app.UseHttpsRedirection();

// Enable Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.MapControllers();

app.Run();
