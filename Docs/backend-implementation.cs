// Backend Implementation - Key Components

// --------------------------
// 1. API Controllers
// --------------------------

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Services;
using System.Threading.Tasks;

namespace ProgressPlay.Reporting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IUserContextService _userContextService;

        public ReportsController(
            IReportService reportService,
            IUserContextService userContextService)
        {
            _reportService = reportService;
            _userContextService = userContextService;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetReportTemplates()
        {
            var templates = await _reportService.GetAvailableReportTemplatesAsync(
                _userContextService.GetCurrentUser());
            return Ok(templates);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateReport([FromBody] ReportRequest request)
        {
            var currentUser = _userContextService.GetCurrentUser();
            var report = await _reportService.GenerateReportAsync(request, currentUser);
            return Ok(report);
        }

        [HttpPost("save-configuration")]
        public async Task<IActionResult> SaveReportConfiguration([FromBody] SavedReportConfiguration config)
        {
            var currentUser = _userContextService.GetCurrentUser();
            await _reportService.SaveReportConfigurationAsync(config, currentUser.UserId);
            return Ok();
        }

        [HttpGet("configurations")]
        public async Task<IActionResult> GetSavedConfigurations()
        {
            var currentUser = _userContextService.GetCurrentUser();
            var configurations = await _reportService.GetSavedConfigurationsAsync(currentUser.UserId);
            return Ok(configurations);
        }

        [HttpGet("export/{reportId}")]
        public async Task<IActionResult> ExportReport(string reportId, [FromQuery] string format)
        {
            var currentUser = _userContextService.GetCurrentUser();
            var exportResult = await _reportService.ExportReportAsync(reportId, format, currentUser);
            
            return File(exportResult.Data, exportResult.ContentType, exportResult.FileName);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlayerReportController : ControllerBase
    {
        private readonly IPlayerReportService _playerReportService;
        private readonly IUserContextService _userContextService;

        public PlayerReportController(
            IPlayerReportService playerReportService,
            IUserContextService userContextService)
        {
            _playerReportService = playerReportService;
            _userContextService = userContextService;
        }

        [HttpPost("summary")]
        public async Task<IActionResult> GetPlayerSummary([FromBody] PlayerReportRequest request)
        {
            var currentUser = _userContextService.GetCurrentUser();
            var report = await _playerReportService.GetPlayerSummaryAsync(request, currentUser);
            return Ok(report);
        }

        [HttpPost("details")]
        public async Task<IActionResult> GetPlayerDetails([FromBody] PlayerReportRequest request)
        {
            var currentUser = _userContextService.GetCurrentUser();
            var report = await _playerReportService.GetPlayerDetailsAsync(request, currentUser);
            return Ok(report);
        }

        [HttpPost("games")]
        public async Task<IActionResult> GetPlayerGames([FromBody] PlayerGamesReportRequest request)
        {
            var currentUser = _userContextService.GetCurrentUser();
            var report = await _playerReportService.GetPlayerGamesAsync(request, currentUser);
            return Ok(report);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreationRequest request)
        {
            var result = await _adminService.CreateUserAsync(request);
            return Ok(result);
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UserUpdateRequest request)
        {
            await _adminService.UpdateUserAsync(userId, request);
            return Ok();
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            await _adminService.DeleteUserAsync(userId);
            return Ok();
        }
    }
}

// --------------------------
// 2. Service Layer Implementation
// --------------------------

using Microsoft.Extensions.Caching.Distributed;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProgressPlay.Reporting.Core.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IReportConfigurationRepository _configRepository;
        private readonly IDistributedCache _cache;

        public ReportService(
            IReportRepository reportRepository,
            IReportConfigurationRepository configRepository,
            IDistributedCache cache)
        {
            _reportRepository = reportRepository;
            _configRepository = configRepository;
            _cache = cache;
        }

        public async Task<IEnumerable<ReportTemplate>> GetAvailableReportTemplatesAsync(User user)
        {
            // Get templates based on user role
            var templates = await _reportRepository.GetReportTemplatesAsync();
            return FilterTemplatesByUserRole(templates, user);
        }

        public async Task<ReportResult> GenerateReportAsync(ReportRequest request, User user)
        {
            // Apply data access filters based on user role
            ApplyUserRoleFilters(request, user);

            // Try to get from cache first
            var cacheKey = GenerateCacheKey(request, user);
            var cachedResult = await _cache.GetStringAsync(cacheKey);
            
            if (!string.IsNullOrEmpty(cachedResult))
            {
                return System.Text.Json.JsonSerializer.Deserialize<ReportResult>(cachedResult);
            }

            // Generate report
            var reportResult = await _reportRepository.GenerateReportAsync(request);

            // Cache result
            await _cache.SetStringAsync(
                cacheKey,
                System.Text.Json.JsonSerializer.Serialize(reportResult),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
                });

            return reportResult;
        }

        public async Task SaveReportConfigurationAsync(SavedReportConfiguration config, string userId)
        {
            config.UserId = userId;
            config.CreatedAt = DateTime.UtcNow;
            
            await _configRepository.SaveConfigurationAsync(config);
        }

        public async Task<IEnumerable<SavedReportConfiguration>> GetSavedConfigurationsAsync(string userId)
        {
            return await _configRepository.GetConfigurationsForUserAsync(userId);
        }

        public async Task<ExportResult> ExportReportAsync(string reportId, string format, User user)
        {
            var report = await _reportRepository.GetReportByIdAsync(reportId);
            
            // Verify user has access
            EnsureUserHasAccessToReport(report, user);
            
            // Generate export in requested format
            return format.ToLower() switch
            {
                "csv" => await GenerateCsvExport(report),
                "excel" => await GenerateExcelExport(report),
                "pdf" => await GeneratePdfExport(report),
                _ => throw new ArgumentException($"Unsupported export format: {format}")
            };
        }

        private void ApplyUserRoleFilters(ReportRequest request, User user)
        {
            switch (user.Role)
            {
                case UserRole.Admin:
                    // Admin has full access, no filters needed
                    break;
                
                case UserRole.Partner:
                    // Partner can only see their whitelabels
                    request.Filters.Add(new ReportFilter 
                    { 
                        Field = "WhiteLabelIDs", 
                        Operator = "in", 
                        Value = string.Join(",", user.WhiteLabelIds) 
                    });
                    break;
                
                case UserRole.Subpartner:
                    // Subpartner can only see specific whitelabel and tracker
                    request.Filters.Add(new ReportFilter 
                    { 
                        Field = "WhiteLabelID", 
                        Operator = "equals", 
                        Value = user.WhiteLabelId.ToString() 
                    });
                    
                    if (!string.IsNullOrEmpty(user.Tracker))
                    {
                        request.Filters.Add(new ReportFilter 
                        { 
                            Field = "Tracker", 
                            Operator = "equals", 
                            Value = user.Tracker 
                        });
                    }
                    break;
            }
        }

        private string GenerateCacheKey(ReportRequest request, User user)
        {
            // Generate a unique key based on request parameters and user
            return $"report:{request.TemplateId}:{user.UserId}:{System.Text.Json.JsonSerializer.Serialize(request)}";
        }

        // Additional helper methods would be implemented here
    }

    public class PlayerReportService : IPlayerReportService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly IGameRepository _gameRepository;
        private readonly IUserContextService _userContextService;

        public PlayerReportService(
            IPlayerRepository playerRepository,
            IGameRepository gameRepository,
            IUserContextService userContextService)
        {
            _playerRepository = playerRepository;
            _gameRepository = gameRepository;
            _userContextService = userContextService;
        }

        public async Task<PlayerSummaryResult> GetPlayerSummaryAsync(PlayerReportRequest request, User user)
        {
            // Apply data access filters based on user role
            ApplyUserRoleFilters(request, user);

            // Get player summary data
            return await _playerRepository.GetPlayerSummaryAsync(request);
        }

        public async Task<PlayerDetailsResult> GetPlayerDetailsAsync(PlayerReportRequest request, User user)
        {
            // Apply data access filters based on user role
            ApplyUserRoleFilters(request, user);

            // Get player details data
            return await _playerRepository.GetPlayerDetailsAsync(request);
        }

        public async Task<PlayerGamesResult> GetPlayerGamesAsync(PlayerGamesReportRequest request, User user)
        {
            // Apply data access filters based on user role
            ApplyUserRoleFilters(request, user);

            // Get player games data
            return await _playerRepository.GetPlayerGamesAsync(request);
        }

        private void ApplyUserRoleFilters(BasePlayerRequest request, User user)
        {
            // Similar to ReportService's implementation, add role-based filters
            // ...
        }
    }
}

// --------------------------
// 3. Repository Layer Implementation
// --------------------------

using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using ProgressPlay.Reporting.Core.Models;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace ProgressPlay.Reporting.Core.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly string _connectionString;

        public ReportRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ReportingDatabase");
        }

        public async Task<IEnumerable<ReportTemplate>> GetReportTemplatesAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            return await connection.QueryAsync<ReportTemplate>(
                "SELECT * FROM ReportTemplates WHERE IsActive = 1 ORDER BY DisplayOrder");
        }

        public async Task<ReportResult> GenerateReportAsync(ReportRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Build dynamic SQL based on request parameters
            var (sql, parameters) = BuildReportQuery(request);

            // Execute query
            var data = await connection.QueryAsync(sql, parameters);

            // Get total count for pagination
            var countSql = BuildCountQuery(request);
            var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

            return new ReportResult
            {
                ReportId = System.Guid.NewGuid().ToString(),
                Data = data,
                TotalCount = totalCount,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber
            };
        }

        public async Task<ReportData> GetReportByIdAsync(string reportId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // In a real implementation, this might retrieve from a reports table or cache
            // For simplicity, we'll assume a dummy implementation
            return new ReportData
            {
                ReportId = reportId,
                Name = "Sample Report",
                CreatedAt = System.DateTime.UtcNow,
                Data = new List<dynamic>() // Sample data would go here
            };
        }

        private (string sql, DynamicParameters parameters) BuildReportQuery(ReportRequest request)
        {
            var parameters = new DynamicParameters();
            var sqlBuilder = new SqlBuilder();

            // Get base query template based on report type
            var template = GetQueryTemplateForReport(request.TemplateId);
            var selector = sqlBuilder.AddTemplate(template);

            // Apply filters
            foreach (var filter in request.Filters)
            {
                ApplyFilter(sqlBuilder, filter, parameters);
            }

            // Apply grouping
            if (request.GroupBy != null && request.GroupBy.Count > 0)
            {
                sqlBuilder.GroupBy(string.Join(", ", request.GroupBy));
            }

            // Apply sorting
            if (request.OrderBy != null && request.OrderBy.Count > 0)
            {
                foreach (var orderBy in request.OrderBy)
                {
                    sqlBuilder.OrderBy($"{orderBy.Field} {(orderBy.Ascending ? "ASC" : "DESC")}");
                }
            }

            // Apply pagination
            var offset = (request.PageNumber - 1) * request.PageSize;
            selector.RawSql += $" OFFSET {offset} ROWS FETCH NEXT {request.PageSize} ROWS ONLY";
            
            return (selector.RawSql, parameters);
        }

        private string BuildCountQuery(ReportRequest request)
        {
            // Similar to BuildReportQuery but returns count only
            // Implementation details omitted for brevity
            return "SELECT COUNT(*) FROM ...";
        }

        private string GetQueryTemplateForReport(string templateId)
        {
            // Return SQL template based on report type
            return templateId switch
            {
                "player-summary" => "SELECT * FROM vw_PlayerSummaryReport /**where**/",
                "player-details" => "SELECT * FROM vw_PlayerDetailsReport /**where**/",
                "player-games" => "SELECT * FROM vw_PlayerGamesReport /**where**/",
                "transactions" => "SELECT * FROM vw_TransactionsReport /**where**/",
                "bonuses" => "SELECT * FROM vw_BonusesReport /**where**/",
                _ => throw new System.ArgumentException($"Unknown report template: {templateId}")
            };
        }

        private void ApplyFilter(SqlBuilder sqlBuilder, ReportFilter filter, DynamicParameters parameters)
        {
            var paramName = $"@{filter.Field}_{System.Guid.NewGuid().ToString().Replace("-", "")}";
            
            switch (filter.Operator.ToLower())
            {
                case "equals":
                    sqlBuilder.Where($"{filter.Field} = {paramName}");
                    parameters.Add(paramName, filter.Value);
                    break;
                
                case "contains":
                    sqlBuilder.Where($"{filter.Field} LIKE {paramName}");
                    parameters.Add(paramName, $"%{filter.Value}%");
                    break;
                
                case "startswith":
                    sqlBuilder.Where($"{filter.Field} LIKE {paramName}");
                    parameters.Add(paramName, $"{filter.Value}%");
                    break;
                
                case "endswith":
                    sqlBuilder.Where($"{filter.Field} LIKE {paramName}");
                    parameters.Add(paramName, $"%{filter.Value}");
                    break;
                
                case "in":
                    var values = filter.Value.Split(',');
                    sqlBuilder.Where($"{filter.Field} IN {paramName}");
                    parameters.Add(paramName, values);
                    break;
                
                case "between":
                    var parts = filter.Value.Split(',');
                    if (parts.Length == 2)
                    {
                        sqlBuilder.Where($"{filter.Field} BETWEEN {paramName}_1 AND {paramName}_2");
                        parameters.Add($"{paramName}_1", parts[0]);
                        parameters.Add($"{paramName}_2", parts[1]);
                    }
                    break;
                
                // Additional operators would be implemented here
            }
        }
    }

    public class PlayerRepository : IPlayerRepository
    {
        private readonly string _connectionString;

        public PlayerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ReportingDatabase");
        }

        public async Task<PlayerSummaryResult> GetPlayerSummaryAsync(PlayerReportRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Build SQL query from request
            var builder = new SqlBuilder();
            var template = builder.AddTemplate(@"
                SELECT 
                    p.PlayerID, 
                    p.Alias, 
                    p.FirstName, 
                    p.LastName, 
                    p.Country, 
                    p.Currency, 
                    p.RegisteredDate, 
                    p.FirstDepositDate,
                    p.LastLoginDate,
                    p.TotalDeposits,
                    p.TotalWithdrawals,
                    p.TotalBetsCasino,
                    p.TotalBetsSport,
                    p.Wagered,
                    p.RevenueEUR,
                    wl.LabelName AS WhiteLabel,
                    COALESCE(p.AffiliateID, '') AS AffiliateID,
                    COALESCE(p.DynamicParameter, '') AS Tracker
                FROM common.tbl_Daily_actions_players p
                LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
                /**where**/
                /**orderby**/
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY");

            var parameters = new DynamicParameters();
            parameters.Add("@Offset", (request.PageNumber - 1) * request.PageSize);
            parameters.Add("@PageSize", request.PageSize);

            // Apply filters
            ApplyPlayerFilters(builder, parameters, request);

            // Get data
            var players = await connection.QueryAsync<PlayerSummary>(template.RawSql, parameters);

            // Count total for pagination
            var countTemplate = builder.AddTemplate(@"
                SELECT COUNT(*)
                FROM common.tbl_Daily_actions_players p
                LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
                /**where**/");

            var totalCount = await connection.ExecuteScalarAsync<int>(countTemplate.RawSql, parameters);

            return new PlayerSummaryResult
            {
                Players = players,
                TotalCount = totalCount,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber
            };
        }

        public async Task<PlayerDetailsResult> GetPlayerDetailsAsync(PlayerReportRequest request)
        {
            // Similar to GetPlayerSummaryAsync but with different query
            // Implementation details omitted for brevity
            return new PlayerDetailsResult();
        }

        public async Task<PlayerGamesResult> GetPlayerGamesAsync(PlayerGamesReportRequest request)
        {
            // Similar to GetPlayerSummaryAsync but with different query
            // Implementation details omitted for brevity
            return new PlayerGamesResult();
        }

        private void ApplyPlayerFilters(SqlBuilder builder, DynamicParameters parameters, BasePlayerRequest request)
        {
            // Apply various filters based on request properties
            if (request.WhiteLabelId.HasValue)
            {
                builder.Where("p.CasinoID = @WhiteLabelId");
                parameters.Add("@WhiteLabelId", request.WhiteLabelId.Value);
            }

            if (!string.IsNullOrEmpty(request.PlayerIdFilter))
            {
                builder.Where("p.PlayerID = @PlayerId");
                parameters.Add("@PlayerId", request.PlayerIdFilter);
            }

            if (!string.IsNullOrEmpty(request.AffiliateId))
            {
                builder.Where("p.AffiliateID = @AffiliateId");
                parameters.Add("@AffiliateId", request.AffiliateId);
            }

            if (!string.IsNullOrEmpty(request.Tracker))
            {
                builder.Where("p.DynamicParameter = @Tracker");
                parameters.Add("@Tracker", request.Tracker);
            }

            if (!string.IsNullOrEmpty(request.RegistrationDateFrom))
            {
                builder.Where("p.RegisteredDate >= @RegDateFrom");
                parameters.Add("@RegDateFrom", request.RegistrationDateFrom);
            }

            if (!string.IsNullOrEmpty(request.RegistrationDateTo))
            {
                builder.Where("p.RegisteredDate <= @RegDateTo");
                parameters.Add("@RegDateTo", request.RegistrationDateTo);
            }

            // Additional filters would be applied here
        }
    }
}

// --------------------------
// 4. Models
// --------------------------

namespace ProgressPlay.Reporting.Core.Models
{
    public enum UserRole
    {
        Admin,
        Partner,
        Subpartner
    }

    public class User
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public UserRole Role { get; set; }
        public List<int> WhiteLabelIds { get; set; } = new List<int>();
        public int? WhiteLabelId { get; set; }
        public string Tracker { get; set; }
    }

    public class ReportTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<string> AvailableColumns { get; set; }
        public List<string> AvailableFilters { get; set; }
        public List<string> AvailableGroups { get; set; }
    }

    public class ReportRequest
    {
        public string TemplateId { get; set; }
        public List<string> Columns { get; set; } = new List<string>();
        public List<ReportFilter> Filters { get; set; } = new List<ReportFilter>();
        public List<string> GroupBy { get; set; } = new List<string>();
        public List<OrderByItem> OrderBy { get; set; } = new List<OrderByItem>();
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class ReportFilter
    {
        public string Field { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
    }

    public class OrderByItem
    {
        public string Field { get; set; }
        public bool Ascending { get; set; } = true;
    }

    public class ReportResult
    {
        public string ReportId { get; set; }
        public IEnumerable<dynamic> Data { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class SavedReportConfiguration
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string TemplateId { get; set; }
        public ReportRequest Configuration { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsed { get; set; }
    }

    public class ExportResult
    {
        public byte[] Data { get; set; }
        public string ContentType { get; set; }
        public string FileName { get; set; }
    }

    public class ReportData
    {
        public string ReportId { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public IEnumerable<dynamic> Data { get; set; }
    }

    // Player report models
    public class BasePlayerRequest
    {
        public int? WhiteLabelId { get; set; }
        public string PlayerIdFilter { get; set; }
        public string AffiliateId { get; set; }
        public string Tracker { get; set; }
        public string RegistrationDateFrom { get; set; }
        public string RegistrationDateTo { get; set; }
        public string FirstDepositDateFrom { get; set; }
        public string FirstDepositDateTo { get; set; }
        public string LastLoginDateFrom { get; set; }
        public string LastLoginDateTo { get; set; }
        public List<string> Countries { get; set; } = new List<string>();
        public List<string> Currencies { get; set; } = new List<string>();
        public List<string> Statuses { get; set; } = new List<string>();
        public List<string> Platforms { get; set; } = new List<string>();
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class PlayerReportRequest : BasePlayerRequest
    {
        // Additional filters specific to player reports
    }

    public class PlayerGamesReportRequest : BasePlayerRequest
    {
        public List<string> GameTypes { get; set; } = new List<string>();
        public List<string> Providers { get; set; } = new List<string>();
        public List<string> SubProviders { get; set; } = new List<string>();
    }

    public class PlayerSummary
    {
        public long PlayerID { get; set; }
        public string Alias { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Country { get; set; }
        public string Currency { get; set; }
        public DateTime RegisteredDate { get; set; }
        public DateTime? FirstDepositDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public decimal? TotalDeposits { get; set; }
        public decimal? TotalWithdrawals { get; set; }
        public decimal? TotalBetsCasino { get; set; }
        public decimal? TotalBetsSport { get; set; }
        public decimal? Wagered { get; set; }
        public decimal? RevenueEUR { get; set; }
        public string WhiteLabel { get; set; }
        public string AffiliateID { get; set; }
        public string Tracker { get; set; }
    }

    public class PlayerSummaryResult
    {
        public IEnumerable<PlayerSummary> Players { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PlayerDetailsResult
    {
        // Details for player report
    }

    public class PlayerGamesResult
    {
        // Details for player games report
    }

    // User management models
    public class UserCreationRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public List<int> WhiteLabelIds { get; set; } = new List<int>();
        public int? WhiteLabelId { get; set; }
        public string Tracker { get; set; }
    }

    public class UserUpdateRequest
    {
        public string Email { get; set; }
        public UserRole? Role { get; set; }
        public List<int> WhiteLabelIds { get; set; }
        public int? WhiteLabelId { get; set; }
        public string Tracker { get; set; }
    }
}

// --------------------------
// 5. Startup Configuration
// --------------------------

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using ProgressPlay.Reporting.Core.Repositories;
using ProgressPlay.Reporting.Core.Services;
using System.Text;

namespace ProgressPlay.Reporting.Api
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            // Add CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder
                        .WithOrigins(Configuration["AllowedOrigins"].Split(','))
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
            });

            // Add authentication
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                    };
                });

            // Add authorization policies
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("PartnerOrAdmin", policy => 
                    policy.RequireRole("Admin", "Partner"));
                options.AddPolicy("AllUsers", policy => 
                    policy.RequireRole("Admin", "Partner", "Subpartner"));
            });

            // Add distributed cache
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = Configuration.GetConnectionString("Redis");
                options.InstanceName = "ProgressPlay_";
            });

            // Register services
            services.AddScoped<IUserContextService, UserContextService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IPlayerReportService, PlayerReportService>();
            services.AddScoped<IAdminService, AdminService>();

            // Register repositories
            services.AddScoped<IReportRepository, ReportRepository>();
            services.AddScoped<IReportConfigurationRepository, ReportConfigurationRepository>();
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IGameRepository, GameRepository>();

            // Add Swagger
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowSpecificOrigin");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
