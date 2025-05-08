// Dashboard and Data Visualization Implementation

// --------------------------
// 1. Backend Dashboard Service
// --------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Data;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Security.Services;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request);
        Task<List<CasinoRevenueItem>> GetCasinoRevenueChartDataAsync(DashboardRequest request);
        Task<List<PlayerRegistrationItem>> GetPlayerRegistrationsChartDataAsync(DashboardRequest request);
        Task<List<TopGameItem>> GetTopGamesDataAsync(DashboardRequest request);
        Task<List<RecentTransactionItem>> GetRecentTransactionsAsync(DashboardRequest request);
    }

    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IDataFilterService _dataFilterService;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            ApplicationDbContext dbContext,
            IDataFilterService dataFilterService,
            ICachingService cachingService,
            ILogger<DashboardService> logger)
        {
            _dbContext = dbContext;
            _dataFilterService = dataFilterService;
            _cachingService = cachingService;
            _logger = logger;
        }

        public async Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:summary:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";
            
            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchDashboardSummaryAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<DashboardSummary> FetchDashboardSummaryAsync(DashboardRequest request)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);
                
                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build query
                var query = _dbContext.DailyActions
                    .Where(da => whiteLabelIds.Contains(da.WhiteLabelID))
                    .AsNoTracking();

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    query = ApplyPlayModeFilter(query, request.PlayMode);
                }

                // Get today's metrics
                var todayMetrics = await query
                    .Where(da => da.Date >= today && da.Date < today.AddDays(1))
                    .GroupBy(da => 1)
                    .Select(g => new
                    {
                        Registrations = g.Sum(da => da.Registration),
                        FTD = g.Sum(da => da.FTD),
                        Deposits = g.Sum(da => da.Deposits ?? 0),
                        Cashouts = g.Sum(da => da.PaidCashouts ?? 0),
                        Bets = GetTotalBets(g, request.PlayMode),
                        Wins = GetTotalWins(g, request.PlayMode),
                        Revenue = GetTotalRevenue(g, request.PlayMode)
                    })
                    .FirstOrDefaultAsync();

                // Get yesterday's metrics for comparison
                var yesterdayMetrics = await query
                    .Where(da => da.Date >= yesterday && da.Date < today)
                    .GroupBy(da => 1)
                    .Select(g => new
                    {
                        Registrations = g.Sum(da => da.Registration),
                        FTD = g.Sum(da => da.FTD),
                        Deposits = g.Sum(da => da.Deposits ?? 0),
                        Cashouts = g.Sum(da => da.PaidCashouts ?? 0),
                        Bets = GetTotalBets(g, request.PlayMode),
                        Wins = GetTotalWins(g, request.PlayMode),
                        Revenue = GetTotalRevenue(g, request.PlayMode)
                    })
                    .FirstOrDefaultAsync();

                // Create summary with change percentages
                var summary = new DashboardSummary
                {
                    Date = today,
                    Registrations = todayMetrics?.Registrations ?? 0,
                    RegistrationsChange = CalculateChangePercentage(
                        todayMetrics?.Registrations ?? 0, 
                        yesterdayMetrics?.Registrations ?? 0),
                    FTD = todayMetrics?.FTD ?? 0,
                    FTDChange = CalculateChangePercentage(
                        todayMetrics?.FTD ?? 0, 
                        yesterdayMetrics?.FTD ?? 0),
                    Deposits = todayMetrics?.Deposits ?? 0,
                    DepositsChange = CalculateChangePercentage(
                        todayMetrics?.Deposits ?? 0, 
                        yesterdayMetrics?.Deposits ?? 0),
                    Cashouts = todayMetrics?.Cashouts ?? 0,
                    CashoutsChange = CalculateChangePercentage(
                        todayMetrics?.Cashouts ?? 0, 
                        yesterdayMetrics?.Cashouts ?? 0),
                    Bets = todayMetrics?.Bets ?? 0,
                    BetsChange = CalculateChangePercentage(
                        todayMetrics?.Bets ?? 0, 
                        yesterdayMetrics?.Bets ?? 0),
                    Wins = todayMetrics?.Wins ?? 0,
                    WinsChange = CalculateChangePercentage(
                        todayMetrics?.Wins ?? 0, 
                        yesterdayMetrics?.Wins ?? 0),
                    Revenue = todayMetrics?.Revenue ?? 0,
                    RevenueChange = CalculateChangePercentage(
                        todayMetrics?.Revenue ?? 0, 
                        yesterdayMetrics?.Revenue ?? 0)
                };

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard summary for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<List<CasinoRevenueItem>> GetCasinoRevenueChartDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:casino-revenue:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";
            
            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchCasinoRevenueChartDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<List<CasinoRevenueItem>> FetchCasinoRevenueChartDataAsync(DashboardRequest request)
        {
            try
            {
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-7);
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);
                
                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build query
                var query = _dbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date < endDate.AddDays(1))
                    .Where(da => whiteLabelIds.Contains(da.WhiteLabelID))
                    .AsNoTracking();

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    query = ApplyPlayModeFilter(query, request.PlayMode);
                }

                // Group by date and calculate revenue
                var revenueData = await query
                    .GroupBy(da => da.Date.Date)
                    .Select(g => new CasinoRevenueItem
                    {
                        Date = g.Key,
                        Revenue = GetTotalRevenue(g, request.PlayMode)
                    })
                    .OrderBy(item => item.Date)
                    .ToListAsync();

                // Ensure all dates are present (fill gaps)
                var result = new List<CasinoRevenueItem>();
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    var existingItem = revenueData.FirstOrDefault(item => item.Date.Date == date.Date);
                    
                    if (existingItem != null)
                    {
                        result.Add(existingItem);
                    }
                    else
                    {
                        result.Add(new CasinoRevenueItem
                        {
                            Date = date,
                            Revenue = 0
                        });
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching casino revenue chart data for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<List<PlayerRegistrationItem>> GetPlayerRegistrationsChartDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:player-registrations:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";
            
            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchPlayerRegistrationsChartDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<List<PlayerRegistrationItem>> FetchPlayerRegistrationsChartDataAsync(DashboardRequest request)
        {
            try
            {
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-7);
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);
                
                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build query
                var query = _dbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date < endDate.AddDays(1))
                    .Where(da => whiteLabelIds.Contains(da.WhiteLabelID))
                    .AsNoTracking();

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    query = ApplyPlayModeFilter(query, request.PlayMode);
                }

                // Group by date and calculate registrations
                var registrationData = await query
                    .GroupBy(da => da.Date.Date)
                    .Select(g => new PlayerRegistrationItem
                    {
                        Date = g.Key,
                        Registrations = g.Sum(da => da.Registration),
                        FirstTimeDepositors = g.Sum(da => da.FTD)
                    })
                    .OrderBy(item => item.Date)
                    .ToListAsync();

                // Ensure all dates are present (fill gaps)
                var result = new List<PlayerRegistrationItem>();
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    var existingItem = registrationData.FirstOrDefault(item => item.Date.Date == date.Date);
                    
                    if (existingItem != null)
                    {
                        result.Add(existingItem);
                    }
                    else
                    {
                        result.Add(new PlayerRegistrationItem
                        {
                            Date = date,
                            Registrations = 0,
                            FirstTimeDepositors = 0
                        });
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching player registrations chart data for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<List<TopGameItem>> GetTopGamesDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:top-games:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";
            
            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchTopGamesDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<List<TopGameItem>> FetchTopGamesDataAsync(DashboardRequest request)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);
                
                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build query
                var query = from game in _dbContext.Games
                            join gameAct in _dbContext.DailyActionsGames on game.GameID equals gameAct.GameID
                            join player in _dbContext.Players on gameAct.PlayerID equals player.PlayerID
                            where gameAct.GameDate.Date == today
                            && whiteLabelIds.Contains(player.CasinoID)
                            select new { game, gameAct, player };

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    switch (request.PlayMode.ToLower())
                    {
                        case "casino":
                            query = query.Where(x => 
                                x.game.GameType == "Slots" || 
                                x.game.GameType == "Table Games" || 
                                x.game.GameType == "Casual Games" || 
                                x.game.GameType == "Jackpots" || 
                                x.game.GameType == "Featured");
                            break;
                        case "live":
                            query = query.Where(x => x.game.GameType == "Live");
                            break;
                        case "sport":
                            query = query.Where(x => x.game.GameType == "Sport");
                            break;
                        case "bingo":
                            query = query.Where(x => x.game.GameType == "Bingo");
                            break;
                    }
                }

                // Group by game and calculate revenue
                var topGames = await query
                    .GroupBy(x => new { x.game.GameID, x.game.GameName, x.game.Provider, x.game.GameType })
                    .Select(g => new TopGameItem
                    {
                        GameID = g.Key.GameID,
                        GameName = g.Key.GameName,
                        Provider = g.Key.Provider,
                        GameType = g.Key.GameType,
                        Bets = g.Sum(x => (x.gameAct.RealBetAmount ?? 0) + (x.gameAct.BonusBetAmount ?? 0)),
                        Wins = g.Sum(x => (x.gameAct.RealWinAmount ?? 0) + (x.gameAct.BonusWinAmount ?? 0)),
                        Revenue = g.Sum(x => 
                            (x.gameAct.RealBetAmount ?? 0) + 
                            (x.gameAct.BonusBetAmount ?? 0) - 
                            (x.gameAct.RealWinAmount ?? 0) - 
                            (x.gameAct.BonusWinAmount ?? 0))
                    })
                    .OrderByDescending(x => x.Revenue)
                    .Take(10)
                    .ToListAsync();

                return topGames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching top games data for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<List<RecentTransactionItem>> GetRecentTransactionsAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:recent-transactions:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMddHH}";
            
            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchRecentTransactionsAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(5),
                absoluteExpiration: TimeSpan.FromMinutes(15));
        }

        private async Task<List<RecentTransactionItem>> FetchRecentTransactionsAsync(DashboardRequest request)
        {
            try
            {
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);
                
                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build query
                var query = from t in _dbContext.Transactions
                            join p in _dbContext.Players on t.PlayerID equals p.PlayerID
                            join wl in _dbContext.WhiteLabels on p.CasinoID equals wl.LabelID
                            where whiteLabelIds.Contains(p.CasinoID)
                            select new { t, p, wl };

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    switch (request.PlayMode.ToLower())
                    {
                        case "casino":
                            query = query.Where(x => x.t.TransactionSubDetails.Contains("Casino"));
                            break;
                        case "live":
                            query = query.Where(x => x.t.TransactionSubDetails.Contains("Live"));
                            break;
                        case "sport":
                            query = query.Where(x => x.t.TransactionSubDetails.Contains("Sport"));
                            break;
                        case "bingo":
                            query = query.Where(x => x.t.TransactionSubDetails.Contains("Bingo"));
                            break;
                    }
                }

                // Get recent transactions
                var recentTransactions = await query
                    .OrderByDescending(x => x.t.TransactionDate)
                    .Take(20)
                    .Select(x => new RecentTransactionItem
                    {
                        TransactionID = x.t.TransactionID,
                        PlayerID = x.t.PlayerID,
                        PlayerAlias = x.p.Alias,
                        WhiteLabel = x.wl.LabelName,
                        TransactionDate = x.t.TransactionDate,
                        TransactionType = x.t.TransactionType,
                        Amount = x.t.TransactionAmount,
                        CurrencyCode = x.t.CurrencyCode,
                        Status = x.t.Status,
                        Platform = x.t.Platform,
                        PaymentMethod = x.t.PaymentMethod
                    })
                    .ToListAsync();

                return recentTransactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent transactions for user {UserId}", request.UserId);
                throw;
            }
        }

        // Helper methods
        private IQueryable<DailyAction> ApplyPlayModeFilter(IQueryable<DailyAction> query, string playMode)
        {
            switch (playMode.ToLower())
            {
                case "casino":
                    return query.Where(da => da.BetsCasino > 0 || da.WinsCasino > 0);
                case "sport":
                    return query.Where(da => da.BetsSport > 0 || da.WinsSport > 0);
                case "live":
                    return query.Where(da => da.BetsLive > 0 || da.WinsLive > 0);
                case "bingo":
                    return query.Where(da => da.BetsBingo > 0 || da.WinsBingo > 0);
                default:
                    return query;
            }
        }

        private decimal CalculateChangePercentage(decimal current, decimal previous)
        {
            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }

            return Math.Round(((current - previous) / previous) * 100, 2);
        }

        private static decimal GetTotalBets(IGrouping<int, DailyAction> group, string playMode)
        {
            switch (playMode?.ToLower())
            {
                case "casino":
                    return group.Sum(da => da.BetsCasino ?? 0);
                case "sport":
                    return group.Sum(da => da.BetsSport ?? 0);
                case "live":
                    return group.Sum(da => da.BetsLive ?? 0);
                case "bingo":
                    return group.Sum(da => da.BetsBingo ?? 0);
                default:
                    return group.Sum(da => 
                        (da.BetsCasino ?? 0) + 
                        (da.BetsSport ?? 0) + 
                        (da.BetsLive ?? 0) + 
                        (da.BetsBingo ?? 0));
            }
        }

        private static decimal GetTotalWins(IGrouping<int, DailyAction> group, string playMode)
        {
            switch (playMode?.ToLower())
            {
                case "casino":
                    return group.Sum(da => da.WinsCasino ?? 0);
                case "sport":
                    return group.Sum(da => da.WinsSport ?? 0);
                case "live":
                    return group.Sum(da => da.WinsLive ?? 0);
                case "bingo":
                    return group.Sum(da => da.WinsBingo ?? 0);
                default:
                    return group.Sum(da => 
                        (da.WinsCasino ?? 0) + 
                        (da.WinsSport ?? 0) + 
                        (da.WinsLive ?? 0) + 
                        (da.WinsBingo ?? 0));
            }
        }

        private static decimal GetTotalRevenue(IGrouping<int, DailyAction> group, string playMode)
        {
            switch (playMode?.ToLower())
            {
                case "casino":
                    return group.Sum(da => (da.BetsCasino ?? 0) - (da.WinsCasino ?? 0));
                case "sport":
                    return group.Sum(da => (da.BetsSport ?? 0) - (da.WinsSport ?? 0));
                case "live":
                    return group.Sum(da => (da.BetsLive ?? 0) - (da.WinsLive ?? 0));
                case "bingo":
                    return group.Sum(da => (da.BetsBingo ?? 0) - (da.WinsBingo ?? 0));
                default:
                    return group.Sum(da => 
                        ((da.BetsCasino ?? 0) - (da.WinsCasino ?? 0)) + 
                        ((da.BetsSport ?? 0) - (da.WinsSport ?? 0)) + 
                        ((da.BetsLive ?? 0) - (da.WinsLive ?? 0)) + 
                        ((da.BetsBingo ?? 0) - (da.WinsBingo ?? 0)));
            }
        }
    }
}

// --------------------------
// 2. Dashboard Controller
// --------------------------

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Services;

namespace ProgressPlay.Reporting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardService dashboardService,
            IUserContextService userContextService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching dashboard data for user {UserId}", currentUser.Id);

                // Get all dashboard data in parallel
                var summaryTask = _dashboardService.GetDashboardSummaryAsync(request);
                var revenueChartTask = _dashboardService.GetCasinoRevenueChartDataAsync(request);
                var registrationsChartTask = _dashboardService.GetPlayerRegistrationsChartDataAsync(request);
                var topGamesTask = _dashboardService.GetTopGamesDataAsync(request);
                var recentTransactionsTask = _dashboardService.GetRecentTransactionsAsync(request);

                await Task.WhenAll(
                    summaryTask,
                    revenueChartTask,
                    registrationsChartTask,
                    topGamesTask,
                    recentTransactionsTask);

                var dashboard = new DashboardData
                {
                    Summary = await summaryTask,
                    CasinoRevenue = await revenueChartTask,
                    PlayerRegistrations = await registrationsChartTask,
                    TopGames = await topGamesTask,
                    RecentTransactions = await recentTransactionsTask
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard data");
                return StatusCode(500, "An error occurred while retrieving dashboard data");
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var summary = await _dashboardService.GetDashboardSummaryAsync(request);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard summary");
                return StatusCode(500, "An error occurred while retrieving dashboard summary");
            }
        }

        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChart([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var chartData = await _dashboardService.GetCasinoRevenueChartDataAsync(request);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving revenue chart data");
                return StatusCode(500, "An error occurred while retrieving revenue chart data");
            }
        }

        [HttpGet("registrations-chart")]
        public async Task<IActionResult> GetRegistrationsChart([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var chartData = await _dashboardService.GetPlayerRegistrationsChartDataAsync(request);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registrations chart data");
                return StatusCode(500, "An error occurred while retrieving registrations chart data");
            }
        }

        [HttpGet("top-games")]
        public async Task<IActionResult> GetTopGames([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var topGames = await _dashboardService.GetTopGamesDataAsync(request);
                return Ok(topGames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top games data");
                return StatusCode(500, "An error occurred while retrieving top games data");
            }
        }

        [HttpGet("recent-transactions")]
        public async Task<IActionResult> GetRecentTransactions([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var transactions = await _dashboardService.GetRecentTransactionsAsync(request);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent transactions");
                return StatusCode(500, "An error occurred while retrieving recent transactions");
            }
        }
    }
}

// --------------------------
// 3. Dashboard Models
// --------------------------

using System;
using System.Collections.Generic;

namespace ProgressPlay.Reporting.Core.Models
{
    public class DashboardRequest
    {
        public string UserId { get; set; }
        public int? WhiteLabelId { get; set; }
        public string PlayMode { get; set; } // "Casino", "Sport", "Live", "Bingo", or null for all
    }

    public class DashboardData
    {
        public DashboardSummary Summary { get; set; }
        public List<CasinoRevenueItem> CasinoRevenue { get; set; }
        public List<PlayerRegistrationItem> PlayerRegistrations { get; set; }
        public List<TopGameItem> TopGames { get; set; }
        public List<RecentTransactionItem> RecentTransactions { get; set; }
    }

    public class DashboardSummary
    {
        public DateTime Date { get; set; }
        public int Registrations { get; set; }
        public decimal RegistrationsChange { get; set; }
        public int FTD { get; set; }
        public decimal FTDChange { get; set; }
        public decimal Deposits { get; set; }
        public decimal DepositsChange { get; set; }
        public decimal Cashouts { get; set; }
        public decimal CashoutsChange { get; set; }
        public decimal Bets { get; set; }
        public decimal BetsChange { get; set; }
        public decimal Wins { get; set; }
        public decimal WinsChange { get; set; }
        public decimal Revenue { get; set; }
        public decimal RevenueChange { get; set; }
    }

    public class CasinoRevenueItem
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
    }

    public class PlayerRegistrationItem
    {
        public DateTime Date { get; set; }
        public int Registrations { get; set; }
        public int FirstTimeDepositors { get; set; }
    }

    public class TopGameItem
    {
        public int GameID { get; set; }
        public string GameName { get; set; }
        public string Provider { get; set; }
        public string GameType { get; set; }
        public decimal Bets { get; set; }
        public decimal Wins { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RecentTransactionItem
    {
        public long TransactionID { get; set; }
        public long PlayerID { get; set; }
        public string PlayerAlias { get; set; }
        public string WhiteLabel { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; }
        public string Status { get; set; }
        public string Platform { get; set; }
        public string PaymentMethod { get; set; }
    }
}

// --------------------------
// 4. Frontend Dashboard Components
// --------------------------

// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

import StatCard from '../components/dashboard/StatCard';
import CasinoRevenueChart from '../components/dashboard/CasinoRevenueChart';
import PlayerRegistrationsChart from '../components/dashboard/PlayerRegistrationsChart';
import TopGamesChart from '../components/dashboard/TopGamesChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';

import { fetchDashboardData } from '../redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { 
    summaryStats, 
    casinoRevenue,
    playerRegistrations,
    topGames,
    recentTransactions,
    isLoading 
  } = useSelector((state) => state.dashboard);
  
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    dispatch(fetchDashboardData({
      playMode: getPlayModeFromTab(tabValue)
    }));
  }, [dispatch, tabValue]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRefresh = () => {
    dispatch(fetchDashboardData({
      playMode: getPlayModeFromTab(tabValue)
    }));
  };
  
  const getPlayModeFromTab = (tab) => {
    switch (tab) {
      case 0: return null; // All
      case 1: return 'Casino';
      case 2: return 'Sport';
      case 3: return 'Live';
      case 4: return 'Bingo';
      default: return null;
    }
  };
  
  if (isLoading && !summaryStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Today Summary
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={handleRefresh}
          >
            <RefreshIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">Refresh</Typography>
          </Box>
        </Box>
      </Box>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="All" />
        <Tab label="Casino" />
        <Tab label="Sport" />
        <Tab label="Live" />
        <Tab label="Bingo" />
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registrations"
            value={summaryStats?.registrations || 0}
            icon={<PersonAddIcon />}
            change={summaryStats?.registrationsChange || 0}
            changeIcon={
              (summaryStats?.registrationsChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.registrationsChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="FTD"
            value={summaryStats?.ftd || 0}
            icon={<PersonAddIcon />}
            change={summaryStats?.ftdChange || 0}
            changeIcon={
              (summaryStats?.ftdChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.ftdChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Deposits"
            value={summaryStats?.deposits || 0}
            prefix="£"
            icon={<AttachMoneyIcon />}
            change={summaryStats?.depositsChange || 0}
            changeIcon={
              (summaryStats?.depositsChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.depositsChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={summaryStats?.revenue || 0}
            prefix="£"
            icon={<AttachMoneyIcon />}
            change={summaryStats?.revenueChange || 0}
            changeIcon={
              (summaryStats?.revenueChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.revenueChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Casino Revenue (Last 7 days)
              </Typography>
              <CasinoRevenueChart data={casinoRevenue} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Player Registrations (Last 7 days)
              </Typography>
              <PlayerRegistrationsChart data={playerRegistrations} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Games
              </Typography>
              <TopGamesChart data={topGames} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>
              <RecentTransactionsTable data={recentTransactions} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

// --------------------------
// 5. Dashboard Chart Components
// --------------------------

// src/components/dashboard/CasinoRevenueChart.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CasinoRevenueChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    revenue: parseFloat(item.revenue)
  }));
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), 'Revenue']}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name="Revenue" 
            stroke="#2e7d32" 
            fill="#4caf50" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CasinoRevenueChart;

// src/components/dashboard/PlayerRegistrationsChart.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PlayerRegistrationsChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    registrations: item.registrations,
    ftd: item.firstTimeDepositors
  }));
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="registrations" 
            name="Registrations" 
            fill="#1976d2" 
          />
          <Bar 
            dataKey="ftd" 
            name="First Time Depositors" 
            fill="#4caf50" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PlayerRegistrationsChart;

// src/components/dashboard/TopGamesChart.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const TopGamesChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart - top 10 by revenue
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(item => ({
      name: shortenGameName(item.gameName),
      fullName: item.gameName,
      provider: item.provider,
      revenue: parseFloat(item.revenue)
    }));
  
  // Shorten game names for better display
  function shortenGameName(name) {
    if (name.length <= 20) return name;
    return name.substring(0, 18) + '...';
  }
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={formatCurrency} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => {
              const game = chartData.find(item => item.name === label);
              return `${game.fullName} (${game.provider})`;
            }}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            name="Revenue" 
            fill="#ff9800" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TopGamesChart;

// src/components/dashboard/RecentTransactionsTable.js
import React from 'react';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper
} from '@mui/material';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const RecentTransactionsTable = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No transactions available
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Player</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((transaction) => (
            <TableRow 
              key={transaction.transactionID}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{formatDateTime(transaction.transactionDate)}</TableCell>
              <TableCell>{transaction.playerAlias}</TableCell>
              <TableCell>{transaction.transactionType}</TableCell>
              <TableCell>
                {formatCurrency(transaction.amount, transaction.currencyCode)}
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    backgroundColor: 
                      transaction.status === 'Completed' ? 'success.light' :
                      transaction.status === 'Pending' ? 'warning.light' :
                      transaction.status === 'Failed' ? 'error.light' :
                      'info.light',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    display: 'inline-block'
                  }}
                >
                  {transaction.status}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentTransactionsTable;

// src/components/dashboard/StatCard.js
import React from 'react';
import { Card, CardContent, Box, Typography, CircularProgress } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const StatCard = ({ 
  title, 
  value, 
  prefix = '', 
  icon, 
  change, 
  changeIcon, 
  changeText,
  isLoading
}) => {
  const formattedValue = prefix ? formatCurrency(value) : value.toLocaleString();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            borderRadius: '50%',
            width: 40,
            height: 40,
            color: 'white'
          }}>
            {icon}
          </Box>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 80, justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {formattedValue}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {changeIcon}
              <Typography 
                variant="body2" 
                color={change >= 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {changeText}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;

// --------------------------
// 6. Redux Implementation
// --------------------------

// src/redux/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

const initialState = {
  summaryStats: null,
  casinoRevenue: [],
  playerRegistrations: [],
  topGames: [],
  recentTransactions: [],
  isLoading: false,
  error: null
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboard(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchDashboardSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardSummary(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.summaryStats = null;
      state.casinoRevenue = [];
      state.playerRegistrations = [];
      state.topGames = [];
      state.recentTransactions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardData
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summaryStats = action.payload.summary;
        state.casinoRevenue = action.payload.casinoRevenue;
        state.playerRegistrations = action.payload.playerRegistrations;
        state.topGames = action.payload.topGames;
        state.recentTransactions = action.payload.recentTransactions;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchDashboardSummary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summaryStats = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
