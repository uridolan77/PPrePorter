using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Exceptions;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Interfaces.DailyActions;
using PPrePorter.Core.Models.Entities;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Domain.Extensions;
using PPrePorter.Infrastructure.Models;

namespace PPrePorter.Infrastructure.Services
{
    public static class StringExtensions
    {
        public static string ToTitleCase(this string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            // Handle special cases
            if (text.Equals("id", StringComparison.OrdinalIgnoreCase))
                return "ID";
            if (text.Equals("ftd", StringComparison.OrdinalIgnoreCase))
                return "FTD";

            // Convert to title case
            var words = text.Split(new[] { ' ', '_', '-' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < words.Length; i++)
            {
                if (words[i].Length > 0)
                {
                    words[i] = char.ToUpper(words[i][0]) + words[i].Substring(1).ToLower();
                }
            }
            return string.Join(" ", words);
        }
    }

    public partial class DashboardService : IDashboardService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly IDataFilterService _dataFilterService;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardService> _logger;
        private readonly IDailyActionsService _dailyActionsService;

        public DashboardService(
            IPPRePorterDbContext dbContext,
            IDataFilterService dataFilterService,
            ICachingService cachingService,
            ILogger<DashboardService> logger,
            IDailyActionsService dailyActionsService)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _dataFilterService = dataFilterService ?? throw new ArgumentNullException(nameof(dataFilterService));
            _cachingService = cachingService ?? throw new ArgumentNullException(nameof(cachingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
        }

        public async Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ValidationException("Dashboard request cannot be null");

            if (string.IsNullOrEmpty(request.UserId))
                throw new ValidationException("User ID is required for dashboard access");

            var cacheKey = $"dashboard:summary:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchDashboardSummaryRealAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex) when (IsDbConnectionException(ex))
            {
                _logger.LogError(ex, "Database connection error while retrieving dashboard summary");
                throw new DbDataAccessException("Unable to connect to the database to fetch dashboard summary data", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard summary for user {UserId}", request.UserId);
                throw;
            }
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
                    .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains((int)da.WhiteLabelID.Value))
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
            if (request == null)
                throw new ValidationException("Dashboard request cannot be null");

            if (string.IsNullOrEmpty(request.UserId))
                throw new ValidationException("User ID is required for dashboard access");

            var cacheKey = $"dashboard:casino-revenue:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchCasinoRevenueChartDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex) when (IsDbConnectionException(ex))
            {
                _logger.LogError(ex, "Database connection error while retrieving casino revenue data");
                throw new DbDataAccessException("Unable to connect to the database to fetch revenue chart data", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving casino revenue chart data for user {UserId}", request.UserId);
                throw;
            }
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
                    .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains((int)da.WhiteLabelID.Value))
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
                    .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains((int)da.WhiteLabelID.Value))
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
                        Registrations = g.Sum(da => da.Registration ?? 0),
                        FirstTimeDepositors = g.Sum(da => da.FTD ?? 0)
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
                }                // Build query
                var query = from game in _dbContext.Games
                            join gameAct in _dbContext.DailyActionsGames on game.GameId equals gameAct.GameId
                            join player in _dbContext.Players on gameAct.PlayerID equals player.PlayerID_Int
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
                            join p in _dbContext.Players on Convert.ToInt32(t.PlayerId) equals p.Id
                            join wl in _dbContext.WhiteLabels on p.CasinoID equals wl.LabelID
                            where whiteLabelIds.Contains(p.CasinoID)
                            select new { t, p, wl };

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    switch (request.PlayMode.ToLower())
                    {
                        case "casino":
                            query = query.Where(x => (x.t.SubDetails ?? "").Contains("Casino"));
                            break;
                        case "live":
                            query = query.Where(x => (x.t.SubDetails ?? "").Contains("Live"));
                            break;
                        case "sport":
                            query = query.Where(x => (x.t.SubDetails ?? "").Contains("Sport"));
                            break;
                        case "bingo":
                            query = query.Where(x => (x.t.SubDetails ?? "").Contains("Bingo"));
                            break;
                    }
                }

                // Get recent transactions
                var recentTransactions = await query                    .OrderByDescending(x => x.t.TransactionDate)
                    .Take(20)
                    .Select(x => new RecentTransactionItem
                    {
                        TransactionID = x.t.Id,
                        PlayerID = Convert.ToInt32(x.t.PlayerId),
                        PlayerAlias = x.p.Username,
                        WhiteLabel = x.wl.LabelName,
                        TransactionDate = x.t.TransactionDate,
                        TransactionType = x.t.TransactionType,
                        Amount = x.t.Amount,
                        CurrencyCode = x.t.Currency,
                        Status = x.t.Status ?? "Unknown",
                        Platform = x.t.Platform ?? "Unknown",
                        PaymentMethod = x.t.PaymentMethod ?? "Unknown"
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

        public async Task<DashboardData> GetDashboardDataAsync(DashboardRequest request)
        {
            try
            {
                // Get all dashboard data in parallel
                var summaryTask = GetDashboardSummaryAsync(request);
                var revenueChartTask = GetCasinoRevenueChartDataAsync(request);
                var registrationsChartTask = GetPlayerRegistrationsChartDataAsync(request);
                var topGamesTask = GetTopGamesDataAsync(request);
                var recentTransactionsTask = GetRecentTransactionsAsync(request);

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

                return dashboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving complete dashboard data for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<List<PlayerJourneySankeyData>> GetPlayerJourneySankeyDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:player-journey:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchPlayerJourneySankeyDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<List<PlayerJourneySankeyData>> FetchPlayerJourneySankeyDataAsync(DashboardRequest request)
        {
            try
            {
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-30); // Get data for the last 30 days
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Get player journey data from transactions and player activities
                var playerJourneyData = new List<PlayerJourneySankeyData>();

                // Get registration to first deposit flow
                var registrationToDeposit = await _dbContext.Players
                    .Where(p => whiteLabelIds.Contains(p.CasinoID) && p.RegistrationDate >= startDate)
                    .GroupBy(p => 1)
                    .Select(g => new
                    {
                        TotalRegistrations = g.Count(),
                        WithFirstDeposit = g.Count(p => p.TotalDeposits > 0)
                    })
                    .FirstOrDefaultAsync();

                if (registrationToDeposit != null)
                {
                    playerJourneyData.Add(new PlayerJourneySankeyData
                    {
                        SourceNode = "Registration",
                        TargetNode = "First Deposit",
                        Value = registrationToDeposit.WithFirstDeposit,
                        Color = "#4caf50"
                    });

                    playerJourneyData.Add(new PlayerJourneySankeyData
                    {
                        SourceNode = "Registration",
                        TargetNode = "No Deposit",
                        Value = registrationToDeposit.TotalRegistrations - registrationToDeposit.WithFirstDeposit,
                        Color = "#f44336"
                    });
                }

                // Get first deposit to first game flow
                var depositToGame = await _dbContext.Players
                    .Where(p => whiteLabelIds.Contains(p.CasinoID) && p.TotalDeposits > 0 && p.RegistrationDate >= startDate)
                    .GroupBy(p => 1)
                    .Select(g => new
                    {
                        TotalFirstDeposits = g.Count(),
                        // Assuming players with transactions have played at least one game
                        WithFirstGame = g.Count(p => p.Transactions.Any())
                    })
                    .FirstOrDefaultAsync();

                if (depositToGame != null)
                {
                    playerJourneyData.Add(new PlayerJourneySankeyData
                    {
                        SourceNode = "First Deposit",
                        TargetNode = "First Game",
                        Value = depositToGame.WithFirstGame,
                        Color = "#2196f3"
                    });

                    playerJourneyData.Add(new PlayerJourneySankeyData
                    {
                        SourceNode = "First Deposit",
                        TargetNode = "No Game",
                        Value = depositToGame.TotalFirstDeposits - depositToGame.WithFirstGame,
                        Color = "#ff9800"
                    });
                }

                return playerJourneyData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching player journey sankey data");
                throw;
            }
        }

        public async Task<HeatmapData> GetHeatmapDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:heatmap:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchHeatmapDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<HeatmapData> FetchHeatmapDataAsync(DashboardRequest request)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var startDate = today.AddDays(-7); // Get data for the last 7 days
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Get daily action games data for heatmap
                var dailyActionGames = await _dbContext.DailyActionsGames
                    .Where(dag => whiteLabelIds.Contains(dag.WhiteLabelID) && dag.Date >= startDate && dag.Date <= today)
                    .AsNoTracking()
                    .ToListAsync();

                // Group by day of week and hour of day
                var groupedData = dailyActionGames
                    .GroupBy(dag => new { DayOfWeek = dag.Date.DayOfWeek, Hour = dag.Date.Hour / 4 }) // Group by 4-hour blocks
                    .Select(g => new
                    {
                        DayOfWeek = g.Key.DayOfWeek,
                        HourBlock = g.Key.Hour,
                        PlayerCount = g.Count(),
                        Revenue = g.Sum(dag => dag.Revenue ?? 0)
                    })
                    .ToList();

                // Create the heatmap data structure
                var xLabels = new List<string> { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
                var yLabels = new List<string> { "00:00-04:00", "04:00-08:00", "08:00-12:00", "12:00-16:00", "16:00-20:00", "20:00-24:00" };

                // Initialize the values matrix with zeros
                var values = new List<List<decimal>>();
                for (int i = 0; i < 6; i++) // 6 time blocks
                {
                    var row = new List<decimal>();
                    for (int j = 0; j < 7; j++) // 7 days of week
                    {
                        row.Add(0);
                    }
                    values.Add(row);
                }

                // Fill in the values from the grouped data
                foreach (var item in groupedData)
                {
                    int dayIndex = ((int)item.DayOfWeek + 6) % 7; // Convert DayOfWeek enum to 0-6 index (Monday = 0)
                    int hourIndex = item.HourBlock;

                    // Use player count or revenue based on request
                    decimal value = request.PlayMode?.ToLower() == "revenue" ? item.Revenue : item.PlayerCount;

                    if (hourIndex < 6 && dayIndex < 7) // Ensure we're within bounds
                    {
                        values[hourIndex][dayIndex] = value;
                    }
                }

                return new HeatmapData
                {
                    Title = "Player Activity by Hour and Day",
                    XLabels = xLabels,
                    YLabels = yLabels,
                    Values = values,
                    MetricName = request.PlayMode?.ToLower() == "revenue" ? "Revenue" : "Active Players"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching heatmap data");
                throw;
            }
        }

        public async Task<SegmentComparisonData> GetSegmentComparisonAsync(SegmentComparisonRequest request)
        {
            var cacheKey = $"dashboard:segment-comparison:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{request.SegmentType}:{request.MetricToCompare}:{DateTime.UtcNow:yyyyMMdd}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchSegmentComparisonDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<SegmentComparisonData> FetchSegmentComparisonDataAsync(SegmentComparisonRequest request)
        {
            try
            {
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-30); // Get data for the last 30 days
                var previousStartDate = startDate.AddDays(-30); // Previous period for comparison
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                var result = new SegmentComparisonData
                {
                    SegmentType = request.SegmentType,
                    MetricName = request.MetricToCompare,
                    Segments = new List<SegmentMetricData>()
                };

                // Process based on segment type
                switch (request.SegmentType?.ToLower())
                {
                    case "country":
                        await ProcessCountrySegmentComparisonAsync(request, result, whiteLabelIds, startDate, endDate, previousStartDate);
                        break;
                    case "platform":
                        await ProcessPlatformSegmentComparisonAsync(request, result, whiteLabelIds, startDate, endDate, previousStartDate);
                        break;
                    case "game_type":
                        await ProcessGameTypeSegmentComparisonAsync(request, result, whiteLabelIds, startDate, endDate, previousStartDate);
                        break;
                    case "player_type":
                        await ProcessPlayerTypeSegmentComparisonAsync(request, result, whiteLabelIds, startDate, endDate, previousStartDate);
                        break;
                    default:
                        // Default to white label comparison
                        await ProcessWhiteLabelSegmentComparisonAsync(request, result, whiteLabelIds, startDate, endDate, previousStartDate);
                        break;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching segment comparison data");
                throw;
            }
        }

        private async Task ProcessWhiteLabelSegmentComparisonAsync(SegmentComparisonRequest request, SegmentComparisonData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate, DateTime previousStartDate)
        {
            // Get current period data by white label
            var currentPeriodData = await _dbContext.DailyActions
                .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value) && da.Date >= startDate && da.Date <= endDate)
                .GroupBy(da => (int)da.WhiteLabelID.Value)
                .Select(g => new
                {
                    WhiteLabelId = g.Key,
                    Value = GetMetricValue(g, request.MetricToCompare)
                })
                .ToListAsync();

            // Get previous period data by white label
            var previousPeriodData = await _dbContext.DailyActions
                .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value) && da.Date >= previousStartDate && da.Date < startDate)
                .GroupBy(da => (int)da.WhiteLabelID.Value)
                .Select(g => new
                {
                    WhiteLabelId = g.Key,
                    Value = GetMetricValue(g, request.MetricToCompare)
                })
                .ToListAsync();

            // Get white label names
            var whiteLabelNames = await _dbContext.WhiteLabels
                .Where(wl => whiteLabelIds.Contains(wl.LabelID))
                .ToDictionaryAsync(wl => wl.LabelID, wl => wl.LabelName);

            // Create segment data
            foreach (var current in currentPeriodData)
            {
                var previous = previousPeriodData.FirstOrDefault(p => p.WhiteLabelId == current.WhiteLabelId);
                var previousValue = previous?.Value ?? 0;
                var percentChange = CalculateChangePercentage(current.Value, previousValue);

                result.Segments.Add(new SegmentMetricData
                {
                    SegmentName = whiteLabelNames.GetValueOrDefault(current.WhiteLabelId, $"White Label {current.WhiteLabelId}"),
                    Value = current.Value,
                    PercentChange = percentChange
                });
            }

            // Sort by value descending
            result.Segments = result.Segments.OrderByDescending(s => s.Value).ToList();
        }

        private decimal GetMetricValue(IGrouping<int, DailyAction> group, string metricName)
        {
            switch (metricName?.ToLower())
            {
                case "revenue":
                    return GetTotalRevenue(group, string.Empty);
                case "bets":
                    return GetTotalBets(group, string.Empty);
                case "wins":
                    return GetTotalWins(group, string.Empty);
                case "deposits":
                    return group.Sum(da => da.Deposits ?? 0);
                case "cashouts":
                    return group.Sum(da => da.PaidCashouts ?? 0);
                case "registrations":
                    return group.Sum(da => da.Registration ?? 0);
                case "ftd":
                    return group.Sum(da => da.FTD ?? 0);
                default:
                    return 0;
            }
        }

        private async Task ProcessCountrySegmentComparisonAsync(SegmentComparisonRequest request, SegmentComparisonData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate, DateTime previousStartDate)
        {
            // Implementation for country segment comparison
            // This would be similar to the white label implementation but grouped by country
            await Task.CompletedTask; // Placeholder until implementation is complete
        }

        private async Task ProcessPlatformSegmentComparisonAsync(SegmentComparisonRequest request, SegmentComparisonData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate, DateTime previousStartDate)
        {
            // Implementation for platform segment comparison
            await Task.CompletedTask; // Placeholder until implementation is complete
        }

        private async Task ProcessGameTypeSegmentComparisonAsync(SegmentComparisonRequest request, SegmentComparisonData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate, DateTime previousStartDate)
        {
            // Implementation for game type segment comparison
            await Task.CompletedTask; // Placeholder until implementation is complete
        }

        private async Task ProcessPlayerTypeSegmentComparisonAsync(SegmentComparisonRequest request, SegmentComparisonData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate, DateTime previousStartDate)
        {
            // Implementation for player type segment comparison
            await Task.CompletedTask; // Placeholder until implementation is complete
        }

        public async Task<List<MicroChartData>> GetMicroChartDataAsync(DashboardRequest request)
        {
            var cacheKey = $"dashboard:micro-charts:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchMicroChartDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<List<MicroChartData>> FetchMicroChartDataAsync(DashboardRequest request)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var startDate = today.AddDays(-7); // Get data for the last 7 days
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Build base query
                var query = _dbContext.DailyActions
                    .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value) && da.Date >= startDate && da.Date <= today)
                    .AsNoTracking();

                // Apply play mode filter if specified
                if (!string.IsNullOrEmpty(request.PlayMode))
                {
                    query = ApplyPlayModeFilter(query, request.PlayMode);
                }

                // Get daily metrics for the last 7 days
                var dailyMetrics = await query
                    .GroupBy(da => da.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Registrations = g.Sum(da => da.Registration ?? 0),
                        Deposits = g.Sum(da => da.Deposits ?? 0),
                        Revenue = GetTotalRevenue(g, request.PlayMode)
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Create micro chart data
                var result = new List<MicroChartData>();

                // Revenue trend
                var revenueValues = dailyMetrics.Select(m => m.Revenue).ToList();
                var currentRevenue = revenueValues.LastOrDefault();
                var targetRevenue = revenueValues.Count > 1 ? revenueValues[revenueValues.Count - 2] * 1.1m : currentRevenue;

                result.Add(new MicroChartData
                {
                    Title = "Revenue Trend",
                    ChartType = "sparkline",
                    Values = revenueValues,
                    CurrentValue = currentRevenue,
                    TargetValue = targetRevenue
                });

                // Registrations trend
                var registrationValues = dailyMetrics.Select(m => (decimal)m.Registrations).ToList();
                var currentRegistrations = registrationValues.LastOrDefault();
                var targetRegistrations = registrationValues.Count > 1 ? registrationValues[registrationValues.Count - 2] * 1.1m : currentRegistrations;

                result.Add(new MicroChartData
                {
                    Title = "Registrations",
                    ChartType = "sparkline",
                    Values = registrationValues,
                    CurrentValue = currentRegistrations,
                    TargetValue = targetRegistrations
                });

                // Deposits trend
                var depositValues = dailyMetrics.Select(m => m.Deposits).ToList();
                var currentDeposits = depositValues.LastOrDefault();
                var targetDeposits = depositValues.Count > 1 ? depositValues[depositValues.Count - 2] * 1.1m : currentDeposits;

                result.Add(new MicroChartData
                {
                    Title = "Deposits",
                    ChartType = "bullet",
                    Values = depositValues,
                    CurrentValue = currentDeposits,
                    TargetValue = targetDeposits
                });

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching micro chart data");
                throw;
            }
        }

        public async Task<DashboardPreferences> GetUserDashboardPreferencesAsync(string userId)
        {
            var cacheKey = $"dashboard:preferences:{userId}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchUserDashboardPreferencesAsync(userId),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<DashboardPreferences> FetchUserDashboardPreferencesAsync(string userId)
        {
            try
            {
                // Try to get user preferences from the database
                int userIdInt;
                if (!int.TryParse(userId, out userIdInt))
                {
                    _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                    userIdInt = 0;
                }

                var userPreferences = await _dbContext.UserPreferences
                    .FirstOrDefaultAsync(up => up.UserId == userIdInt);

                if (userPreferences != null)
                {
                    // Convert from database entity to DTO
                    return new DashboardPreferences
                    {
                        UserId = userId,
                        ColorScheme = new Domain.Entities.PPReporter.Dashboard.ColorSchemePreference
                        {
                            UserId = userId,
                            BaseTheme = userPreferences.BaseTheme ?? "light",
                            ColorMode = userPreferences.ColorMode ?? "standard",
                            PrimaryColor = userPreferences.PrimaryColor ?? "#1976d2",
                            SecondaryColor = userPreferences.SecondaryColor ?? "#dc004e",
                            PositiveColor = userPreferences.PositiveColor ?? "#4caf50",
                            NegativeColor = userPreferences.NegativeColor ?? "#f44336",
                            NeutralColor = userPreferences.NeutralColor ?? "#9e9e9e",
                            ContrastLevel = userPreferences.ContrastLevel ?? 3
                        },
                        InformationDensity = userPreferences.InformationDensity ?? "medium",
                        PreferredChartTypes = userPreferences.PreferredChartTypes != null
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(userPreferences.PreferredChartTypes)
                            : GetDefaultChartTypes(),
                        PinnedMetrics = userPreferences.PinnedMetrics != null
                            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(userPreferences.PinnedMetrics)
                            : new List<string> { "Revenue", "Registrations", "FTD" },
                        ShowAnnotations = userPreferences.ShowAnnotations ?? true,
                        ShowInsights = userPreferences.ShowInsights ?? true,
                        ShowAnomalies = userPreferences.ShowAnomalies ?? true,
                        ShowForecasts = userPreferences.ShowForecasts ?? true,
                        DefaultTimeRange = userPreferences.DefaultTimeRange ?? "week",
                        DefaultDataGranularity = userPreferences.DefaultDataGranularity ?? 7,
                        InsightImportanceThreshold = userPreferences.InsightImportanceThreshold ?? 4,
                        ComponentVisibility = userPreferences.ComponentVisibility != null
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, bool>>(userPreferences.ComponentVisibility)
                            : GetDefaultComponentVisibility(),
                        LastUpdated = userPreferences.LastUpdated ?? DateTime.UtcNow
                    };
                }

                // If no preferences found, return default preferences
                return new DashboardPreferences
                {
                    UserId = userId,
                    ColorScheme = new Domain.Entities.PPReporter.Dashboard.ColorSchemePreference
                    {
                        UserId = userId,
                        BaseTheme = "light",
                        ColorMode = "standard",
                        PrimaryColor = "#1976d2",
                        SecondaryColor = "#dc004e",
                        PositiveColor = "#4caf50",
                        NegativeColor = "#f44336",
                        NeutralColor = "#9e9e9e",
                        ContrastLevel = 3
                    },
                    InformationDensity = "medium",
                    PreferredChartTypes = GetDefaultChartTypes(),
                    PinnedMetrics = new List<string> { "Revenue", "Registrations", "FTD" },
                    ShowAnnotations = true,
                    ShowInsights = true,
                    ShowAnomalies = true,
                    ShowForecasts = true,
                    DefaultTimeRange = "week",
                    DefaultDataGranularity = 7,
                    InsightImportanceThreshold = 4,
                    ComponentVisibility = GetDefaultComponentVisibility(),
                    LastUpdated = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user dashboard preferences for user {UserId}", userId);
                throw;
            }
        }

        private Dictionary<string, string> GetDefaultChartTypes()
        {
            return new Dictionary<string, string>
            {
                { "revenue", "line" },
                { "registrations", "bar" },
                { "topGames", "bar" },
                { "transactions", "table" }
            };
        }

        private Dictionary<string, bool> GetDefaultComponentVisibility()
        {
            return new Dictionary<string, bool>
            {
                { "summary", true },
                { "revenueChart", true },
                { "registrationChart", true },
                { "topGames", true },
                { "transactions", true },
                { "story", true }
            };
        }

        public async Task SaveUserDashboardPreferencesAsync(string userId, DashboardPreferences preferences)
        {
            try
            {
                if (preferences == null)
                {
                    throw new ArgumentNullException(nameof(preferences));
                }

                // Find existing preferences or create new
                int userIdInt;
                if (!int.TryParse(userId, out userIdInt))
                {
                    _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                    userIdInt = 0;
                }

                var userPreferences = await _dbContext.UserPreferences
                    .FirstOrDefaultAsync(up => up.UserId == userIdInt);

                if (userPreferences == null)
                {
                    // Create new preferences
                    userPreferences = new Domain.Entities.PPReporter.UserPreference
                    {
                        UserId = userIdInt,
                        CreatedAt = DateTime.UtcNow
                    };
                    _dbContext.UserPreferences.Add(userPreferences);
                }

                // Update preferences
                userPreferences.BaseTheme = preferences.ColorScheme?.BaseTheme;
                userPreferences.ColorMode = preferences.ColorScheme?.ColorMode;
                userPreferences.PrimaryColor = preferences.ColorScheme?.PrimaryColor;
                userPreferences.SecondaryColor = preferences.ColorScheme?.SecondaryColor;
                userPreferences.PositiveColor = preferences.ColorScheme?.PositiveColor;
                userPreferences.NegativeColor = preferences.ColorScheme?.NegativeColor;
                userPreferences.NeutralColor = preferences.ColorScheme?.NeutralColor;
                userPreferences.ContrastLevel = preferences.ColorScheme?.ContrastLevel;
                userPreferences.InformationDensity = preferences.InformationDensity;
                userPreferences.PreferredChartTypes = preferences.PreferredChartTypes != null
                    ? System.Text.Json.JsonSerializer.Serialize(preferences.PreferredChartTypes)
                    : null;
                userPreferences.PinnedMetrics = preferences.PinnedMetrics != null
                    ? System.Text.Json.JsonSerializer.Serialize(preferences.PinnedMetrics)
                    : null;
                userPreferences.ShowAnnotations = preferences.ShowAnnotations;
                userPreferences.ShowInsights = preferences.ShowInsights;
                userPreferences.ShowAnomalies = preferences.ShowAnomalies;
                userPreferences.ShowForecasts = preferences.ShowForecasts;
                userPreferences.DefaultTimeRange = preferences.DefaultTimeRange;
                userPreferences.DefaultDataGranularity = preferences.DefaultDataGranularity;
                userPreferences.InsightImportanceThreshold = preferences.InsightImportanceThreshold;
                userPreferences.ComponentVisibility = preferences.ComponentVisibility != null
                    ? System.Text.Json.JsonSerializer.Serialize(preferences.ComponentVisibility)
                    : null;
                userPreferences.LastUpdated = DateTime.UtcNow;

                // Save changes
                await _dbContext.SaveChangesAsync();

                // Update the cache
                var cacheKey = $"dashboard:preferences:{userId}";
                await _cachingService.RemoveAsync(cacheKey);

                _logger.LogInformation("Saved dashboard preferences for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving dashboard preferences for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData> GetAccessibilityOptimizedDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request)
        {
            var cacheKey = $"dashboard:accessibility:{request.UserId}:{request.VisualizationType}:{request.MetricKey}:{DateTime.UtcNow:yyyyMMdd}";

            return await _cachingService.GetOrCreateAsync(
                cacheKey,
                async () => await FetchAccessibilityOptimizedDataAsync(request),
                slidingExpiration: TimeSpan.FromMinutes(15),
                absoluteExpiration: TimeSpan.FromHours(1));
        }

        private async Task<Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData> FetchAccessibilityOptimizedDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request)
        {
            try
            {
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-30); // Get data for the last 30 days
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Get data based on metric key
                var result = new Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData
                {
                    Title = $"Accessibility Optimized {request.MetricKey} Data",
                    Description = $"This is an accessibility optimized view of {request.MetricKey} data in {request.VisualizationType} format.",
                    Format = request.VisualizationType,
                    KeyInsights = new List<string>()
                };

                // Process based on metric key
                switch (request.MetricKey?.ToLower())
                {
                    case "revenue":
                        await ProcessRevenueAccessibilityDataAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "registrations":
                        await ProcessRegistrationsAccessibilityDataAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "deposits":
                        await ProcessDepositsAccessibilityDataAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "games":
                        await ProcessGamesAccessibilityDataAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    default:
                        // Default to summary data
                        await ProcessSummaryAccessibilityDataAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching accessibility optimized data");
                throw;
            }
        }

        private async Task ProcessRevenueAccessibilityDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request, Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Get revenue data
            var revenueData = await _dbContext.DailyActions
                .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value) && da.Date >= startDate && da.Date <= endDate)
                .GroupBy(da => da.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = GetTotalRevenue(g, request.PlayMode)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Transform data based on visualization type
            switch (request.VisualizationType?.ToLower())
            {
                case "table":
                    result.Data = revenueData.Select(x => new
                    {
                        Date = x.Date.ToString("yyyy-MM-dd"),
                        Revenue = x.Revenue.ToString("C2")
                    }).ToList();
                    break;
                case "text":
                    result.Data = string.Join("\n", revenueData.Select(x => $"Date: {x.Date:yyyy-MM-dd}, Revenue: {x.Revenue:C2}"));
                    break;
                default:
                    // Default to JSON data
                    result.Data = revenueData;
                    break;
            }

            // Generate insights
            var totalRevenue = revenueData.Sum(x => x.Revenue);
            var averageRevenue = revenueData.Count > 0 ? totalRevenue / revenueData.Count : 0;
            var maxRevenue = revenueData.Count > 0 ? revenueData.Max(x => x.Revenue) : 0;
            var maxRevenueDate = revenueData.FirstOrDefault(x => x.Revenue == maxRevenue)?.Date;

            result.KeyInsights.Add($"Total revenue for the period: {totalRevenue:C2}");
            result.KeyInsights.Add($"Average daily revenue: {averageRevenue:C2}");

            if (maxRevenueDate.HasValue)
            {
                result.KeyInsights.Add($"Highest revenue of {maxRevenue:C2} was recorded on {maxRevenueDate:yyyy-MM-dd}");
            }

            // Calculate trend
            if (revenueData.Count >= 7)
            {
                var lastWeekRevenue = revenueData.TakeLast(7).Sum(x => x.Revenue);
                var previousWeekRevenue = revenueData.Skip(revenueData.Count - 14).Take(7).Sum(x => x.Revenue);
                var percentChange = CalculateChangePercentage(lastWeekRevenue, previousWeekRevenue);

                result.KeyInsights.Add($"Revenue has {(percentChange >= 0 ? "increased" : "decreased")} by {Math.Abs(percentChange):F1}% compared to the previous week");
            }
        }

        private async Task ProcessRegistrationsAccessibilityDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request, Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for registrations accessibility data
            await Task.CompletedTask; // Placeholder until implementation is complete

            // Add default insights
            result.KeyInsights.Add($"Registration data is being processed for accessibility format: {request.VisualizationType}");
            result.Data = new { message = "Registration data processing is not yet implemented" };
        }

        private async Task ProcessDepositsAccessibilityDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request, Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for deposits accessibility data
            await Task.CompletedTask; // Placeholder until implementation is complete

            // Add default insights
            result.KeyInsights.Add($"Deposit data is being processed for accessibility format: {request.VisualizationType}");
            result.Data = new { message = "Deposit data processing is not yet implemented" };
        }

        private async Task ProcessGamesAccessibilityDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request, Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for games accessibility data
            await Task.CompletedTask; // Placeholder until implementation is complete

            // Add default insights
            result.KeyInsights.Add($"Game data is being processed for accessibility format: {request.VisualizationType}");
            result.Data = new { message = "Game data processing is not yet implemented" };
        }

        private async Task ProcessSummaryAccessibilityDataAsync(Domain.Entities.PPReporter.Dashboard.AccessibilityDataRequest request, Domain.Entities.PPReporter.Dashboard.AccessibilityOptimizedData result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for summary accessibility data
            await Task.CompletedTask; // Placeholder until implementation is complete

            // Add default insights
            result.KeyInsights.Add($"Summary data is being processed for accessibility format: {request.VisualizationType}");
            result.Data = new { message = "Summary data processing is not yet implemented" };
        }

        public async Task<ContextualDataExplorerResult> GetContextualDataExplorerResultAsync(ContextualDataExplorerRequest request)
        {
            if (request == null)
                throw new ValidationException("Contextual data explorer request cannot be null");

            if (string.IsNullOrEmpty(request.UserId))
                throw new ValidationException("User ID is required for contextual data exploration");

            var cacheKey = $"dashboard:contextual-explorer:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{request.ExplorationContext}:{request.DrillDownKey}:{request.DrillDownLevel}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchContextualDataExplorerResultAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex) when (IsDbConnectionException(ex))
            {
                _logger.LogError(ex, "Database connection error while retrieving contextual data explorer results");
                throw new DbDataAccessException("Unable to connect to the database to fetch contextual data explorer results", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contextual data explorer results for user {UserId}", request.UserId);
                throw;
            }
        }

        private async Task<ContextualDataExplorerResult> FetchContextualDataExplorerResultAsync(ContextualDataExplorerRequest request)
        {
            try
            {
                // Default dates if not provided
                var endDate = request.EndDate?.Date ?? DateTime.UtcNow.Date;
                var startDate = request.StartDate?.Date ?? endDate.AddDays(-30);

                // Get accessible white labels
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }                // Initialize result
                var result = new ContextualDataExplorerResult
                {
                    ExplorationContext = request.ExplorationContext,
                    DrillDownKey = request.DrillDownKey,
                    DrillDownLevel = request.DrillDownLevel,
                    DataPoints = new List<ExplorerDataPoint>(),
                    Aggregations = new Dictionary<string, decimal>(),
                    Annotations = new List<ExplorerDataAnnotation>(),
                    Insights = new List<DataInsight>()
                };

                // Process based on exploration context
                switch (request.ExplorationContext?.ToLower())
                {
                    case "revenue":
                        await ProcessRevenueExplorationAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "players":
                        await ProcessPlayerExplorationAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "games":
                        await ProcessGameExplorationAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    case "transactions":
                        await ProcessTransactionExplorationAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                    default:
                        // Default to summary exploration
                        await ProcessSummaryExplorationAsync(request, result, whiteLabelIds, startDate, endDate);
                        break;
                }                // Generate trend analysis if enabled
                if (request.Dimensions?.Contains("time") == true || request.Dimensions?.Count > 0)
                {
                    var dataPoints = result.DataPoints.ToDataPoints();
                    result.TrendInfo = await GenerateTrendAnalysisAsync(dataPoints, request);
                }

                // Apply predictive modeling if requested
                if (request.EnablePredictiveModeling && request.ScenarioParameters?.Count > 0)
                {
                    var dataPoints = result.DataPoints.ToDataPoints();
                    result.PredictiveResults = await GeneratePredictiveModelingResultsAsync(request, dataPoints);
                }

                // Generate insights
                result.Insights = await GenerateInsightsAsync(result, request);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contextual data explorer results for user {UserId}", request.UserId);
                throw;
            }
        }

        private async Task ProcessRevenueExplorationAsync(ContextualDataExplorerRequest request, ContextualDataExplorerResult result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Query daily actions for revenue data
            var query = _dbContext.DailyActions
                .Where(da => da.Date >= startDate && da.Date <= endDate)
                .Where(da => da.WhiteLabelID.HasValue && whiteLabelIds.Contains(da.WhiteLabelID.Value))
                .AsNoTracking();

            // Apply play mode filter if specified
            if (!string.IsNullOrEmpty(request.PlayMode))
            {
                query = ApplyPlayModeFilter(query, request.PlayMode);
            }

            // Apply drill down if specified
            if (!string.IsNullOrEmpty(request.DrillDownKey))
            {
                if (request.DrillDownKey.StartsWith("wl_"))
                {
                    // Drill down by white label
                    var whiteLabelId = int.Parse(request.DrillDownKey.Substring(3));
                    query = query.Where(da => da.WhiteLabelID == whiteLabelId);
                }
                // Add more drill down options as needed
            }

            // Process dimensions for grouping
            var dimensionsList = request.Dimensions ?? new List<string> { "time" };

            // Get data based on dimensions and metrics
            if (dimensionsList.Contains("time"))
            {
                // Group by time dimension
                var timeGrouping = request.DrillDownLevel switch
                {
                    1 => "year", // Yearly
                    2 => "month", // Monthly
                    3 => "week", // Weekly
                    4 => "day", // Daily
                    _ => "day" // Default to daily
                };

                var revenueData = await GetRevenueDataByTimeAsync(query, timeGrouping, request.Metrics);                  foreach (var item in revenueData)
                {
                    // Create a DashboardDataPoint to avoid ambiguity
                    var dataPoint = new Domain.Entities.PPReporter.Dashboard.ExplorerDataPoint
                    {
                        Label = item.Key,
                        Timestamp = item.Timestamp,
                        Dimensions = new Dictionary<string, object> { { "time", item.Key } },
                        Metrics = item.Metrics
                    };

                    // Convert to ExplorerDataPoint and add to result
                    result.DataPoints.Add(dataPoint);
                }

                // Calculate aggregations
                result.Aggregations["total_revenue"] = result.DataPoints.Sum(dp => dp.Metrics.GetValueOrDefault("revenue", 0));
                result.Aggregations["total_bets"] = result.DataPoints.Sum(dp => dp.Metrics.GetValueOrDefault("bets", 0));
                result.Aggregations["total_wins"] = result.DataPoints.Sum(dp => dp.Metrics.GetValueOrDefault("wins", 0));
                result.Aggregations["total_deposits"] = result.DataPoints.Sum(dp => dp.Metrics.GetValueOrDefault("deposits", 0));
                result.Aggregations["total_cashouts"] = result.DataPoints.Sum(dp => dp.Metrics.GetValueOrDefault("cashouts", 0));
            }
            else if (dimensionsList.Contains("player_segment"))
            {
                // Implementation for player segment dimension
                // ...
            }
            // Add more dimension options as needed
        }

        private async Task<List<RevenueDataItem>> GetRevenueDataByTimeAsync(IQueryable<DailyAction> query, string timeGrouping, List<string> metrics)
        {
            var result = new List<RevenueDataItem>();

            // Default to basic metrics if none specified
            var metricsList = metrics?.Count > 0 ? metrics : new List<string> { "revenue", "bets", "wins" };

            switch (timeGrouping)
            {
                case "year":
                    var yearlyData = await query
                        .GroupBy(da => da.Date.Year)
                        .Select(g => new
                        {                            Year = g.Key,
                            Revenue = GetTotalRevenue(g, string.Empty),
                            Bets = GetTotalBets(g, string.Empty),
                            Wins = GetTotalWins(g, string.Empty),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Year)
                        .ToListAsync();                    foreach (var item in yearlyData)
                    {
                        var yearlyMetrics = new Dictionary<string, decimal>();

                        if (metricsList.Contains("revenue"))
                            yearlyMetrics["revenue"] = item.Revenue;

                        if (metricsList.Contains("bets"))
                            yearlyMetrics["bets"] = item.Bets;

                        if (metricsList.Contains("wins"))
                            yearlyMetrics["wins"] = item.Wins;

                        if (metricsList.Contains("deposits"))
                            yearlyMetrics["deposits"] = item.Deposits;
                          if (metricsList.Contains("cashouts"))
                            yearlyMetrics["cashouts"] = item.Cashouts;

                        result.Add(new RevenueDataItem
                        {
                            Key = item.Year.ToString(),
                            Timestamp = new DateTime(item.Year, 1, 1),
                            Metrics = yearlyMetrics
                        });
                    }
                    break;

                case "month":                    var monthlyData = await query
                        .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                        .Select(g => new
                        {
                            Year = g.Key.Year,
                            Month = g.Key.Month,
                            Revenue = g.Sum(da =>
                                ((da.BetsCasino ?? 0) - (da.WinsCasino ?? 0)) +
                                ((da.BetsSport ?? 0) - (da.WinsSport ?? 0)) +
                                ((da.BetsLive ?? 0) - (da.WinsLive ?? 0)) +
                                ((da.BetsBingo ?? 0) - (da.WinsBingo ?? 0))),
                            Bets = g.Sum(da =>
                                (da.BetsCasino ?? 0) +
                                (da.BetsSport ?? 0) +
                                (da.BetsLive ?? 0) +
                                (da.BetsBingo ?? 0)),
                            Wins = g.Sum(da =>
                                (da.WinsCasino ?? 0) +
                                (da.WinsSport ?? 0) +
                                (da.WinsLive ?? 0) +
                                (da.WinsBingo ?? 0)),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Year)
                        .ThenBy(x => x.Month)
                        .ToListAsync();                    foreach (var item in monthlyData)
                    {
                        var itemMetrics = new Dictionary<string, decimal>();

                        if (metricsList.Contains("revenue"))
                            itemMetrics["revenue"] = item.Revenue;

                        if (metricsList.Contains("bets"))
                            itemMetrics["bets"] = item.Bets;

                        if (metricsList.Contains("wins"))
                            itemMetrics["wins"] = item.Wins;

                        if (metricsList.Contains("deposits"))
                            itemMetrics["deposits"] = item.Deposits;

                        if (metricsList.Contains("cashouts"))
                            itemMetrics["cashouts"] = item.Cashouts;                        result.Add(new RevenueDataItem
                        {
                            Key = $"{item.Year}-{item.Month:D2}",
                            Timestamp = new DateTime(item.Year, item.Month, 1),
                            Metrics = itemMetrics
                        });
                    }
                    break;

                case "week":
                    // Implementation for weekly grouping
                    // ...
                    break;

                case "day":
                default:                    var dailyData = await query
                        .GroupBy(da => da.Date.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            Revenue = g.Sum(da =>
                                ((da.BetsCasino ?? 0) - (da.WinsCasino ?? 0)) +
                                ((da.BetsSport ?? 0) - (da.WinsSport ?? 0)) +
                                ((da.BetsLive ?? 0) - (da.WinsLive ?? 0)) +
                                ((da.BetsBingo ?? 0) - (da.WinsBingo ?? 0))),
                            Bets = g.Sum(da =>
                                (da.BetsCasino ?? 0) +
                                (da.BetsSport ?? 0) +
                                (da.BetsLive ?? 0) +
                                (da.BetsBingo ?? 0)),
                            Wins = g.Sum(da =>
                                (da.WinsCasino ?? 0) +
                                (da.WinsSport ?? 0) +
                                (da.WinsLive ?? 0) +
                                (da.WinsBingo ?? 0)),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Date)
                        .ToListAsync();

                    foreach (var item in dailyData)
                    {
                        var itemMetrics = new Dictionary<string, decimal>();

                        if (metricsList.Contains("revenue"))
                            itemMetrics["revenue"] = item.Revenue;

                        if (metricsList.Contains("bets"))
                            itemMetrics["bets"] = item.Bets;

                        if (metricsList.Contains("wins"))
                            itemMetrics["wins"] = item.Wins;

                        if (metricsList.Contains("deposits"))
                            itemMetrics["deposits"] = item.Deposits;

                        if (metricsList.Contains("cashouts"))
                            itemMetrics["cashouts"] = item.Cashouts;

                        result.Add(new RevenueDataItem
                        {
                            Key = item.Date.ToString("yyyy-MM-dd"),
                            Timestamp = item.Date,
                            Metrics = itemMetrics
                        });
                    }
                    break;
            }

            return result;
        }

        private class RevenueDataItem
        {
            public string Key { get; set; }
            public DateTime? Timestamp { get; set; }
            public Dictionary<string, decimal> Metrics { get; set; }
        }

        private async Task ProcessPlayerExplorationAsync(ContextualDataExplorerRequest request, ContextualDataExplorerResult result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for player exploration
            // This will query player data and aggregate based on request dimensions
            // For now, return a placeholder implementation

            result.Aggregations["total_players"] = 0;
            result.Aggregations["active_players"] = 0;
            result.Aggregations["new_players"] = 0;

            // Further implementation will be added in the future

            await Task.CompletedTask; // Placeholder for async implementation
        }

        private async Task ProcessGameExplorationAsync(ContextualDataExplorerRequest request, ContextualDataExplorerResult result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for game exploration
            // This will query game data and aggregate based on request dimensions
            // For now, return a placeholder implementation

            result.Aggregations["total_games_played"] = 0;
            result.Aggregations["most_popular_game"] = 0;

            // Further implementation will be added in the future

            await Task.CompletedTask; // Placeholder for async implementation
        }

        private async Task ProcessTransactionExplorationAsync(ContextualDataExplorerRequest request, ContextualDataExplorerResult result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for transaction exploration
            // This will query transaction data and aggregate based on request dimensions
            // For now, return a placeholder implementation

            result.Aggregations["total_transactions"] = 0;
            result.Aggregations["total_transaction_volume"] = 0;

            // Further implementation will be added in the future

            await Task.CompletedTask; // Placeholder for async implementation
        }

        private async Task ProcessSummaryExplorationAsync(ContextualDataExplorerRequest request, ContextualDataExplorerResult result,
            List<int> whiteLabelIds, DateTime startDate, DateTime endDate)
        {
            // Implementation for summary exploration (default context)
            // This will query summary data and aggregate based on request dimensions
            // For now, return a placeholder implementation

            result.Aggregations["total_revenue"] = 0;
            result.Aggregations["total_players"] = 0;
            result.Aggregations["total_games_played"] = 0;

            // Further implementation will be added in the future

            await Task.CompletedTask; // Placeholder for async implementation
        }

        private async Task<TrendAnalysis> GenerateTrendAnalysisAsync(List<DataPoint> dataPoints, ContextualDataExplorerRequest request)
        {
            try
            {
                if (dataPoints == null || dataPoints.Count == 0)
                {
                    return new TrendAnalysis
                    {
                        PrimaryTrend = "unknown",
                        TrendMagnitude = 0,
                        DimensionalTrends = new Dictionary<string, string>(),
                        Anomalies = new List<Anomaly>()
                    };
                }

                // Initialize trend analysis result
                var trendAnalysis = new TrendAnalysis
                {
                    DimensionalTrends = new Dictionary<string, string>(),
                    Anomalies = new List<Anomaly>()
                };

                // Get time-based data points if available
                var timeBasedPoints = dataPoints
                    .Where(dp => dp.Timestamp.HasValue)
                    .OrderBy(dp => dp.Timestamp)
                    .ToList();

                if (timeBasedPoints.Count >= 3)
                {
                    // Calculate trend for time-based data
                    await CalculateTimeBasedTrendAsync(timeBasedPoints, trendAnalysis, request);
                }
                else
                {
                    // Calculate trend for non-time-based data
                    await CalculateNonTimeBasedTrendAsync(dataPoints, trendAnalysis, request);
                }

                // Detect anomalies
                await DetectAnomaliesAsync(dataPoints, trendAnalysis, request);

                return trendAnalysis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating trend analysis");

                // Return a basic trend analysis in case of error
                return new TrendAnalysis
                {
                    PrimaryTrend = "unknown",
                    TrendMagnitude = 0,
                    DimensionalTrends = new Dictionary<string, string>(),
                    Anomalies = new List<Anomaly>()
                };
            }
        }

        private async Task CalculateTimeBasedTrendAsync(List<DataPoint> timeBasedPoints, TrendAnalysis trendAnalysis, ContextualDataExplorerRequest request)
        {
            // Get the primary metric from the request
            var primaryMetric = request.Metrics?.FirstOrDefault() ?? "revenue";

            // Extract values for the primary metric
            var values = timeBasedPoints
                .Select(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                .ToList();

            // Calculate simple linear regression
            var n = values.Count;
            var timestamps = Enumerable.Range(0, n).Select(i => (decimal)i).ToList();
            var sumX = timestamps.Sum();
            var sumY = values.Sum();
            var sumXY = timestamps.Zip(values, (x, y) => x * y).Sum();
            var sumX2 = timestamps.Sum(x => x * x);

            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;

            // Determine trend direction and magnitude
            if (Math.Abs(slope) < 0.01m)
            {
                trendAnalysis.PrimaryTrend = "stable";
                trendAnalysis.TrendMagnitude = 0;
            }
            else if (slope > 0)
            {
                trendAnalysis.PrimaryTrend = "increasing";
                trendAnalysis.TrendMagnitude = Math.Min(10, Math.Abs(slope) * 10); // Scale to 0-10
            }
            else
            {
                trendAnalysis.PrimaryTrend = "decreasing";
                trendAnalysis.TrendMagnitude = Math.Min(10, Math.Abs(slope) * 10); // Scale to 0-10
            }

            // Calculate trends for different dimensions if available
            foreach (var dimension in request.Dimensions ?? new List<string>())
            {
                if (dimension != "time")
                {
                    var dimensionValues = timeBasedPoints
                        .Where(dp => dp.Dimensions.ContainsKey(dimension))
                        .GroupBy(dp => dp.Dimensions[dimension].ToString())
                        .ToDictionary(
                            g => g.Key,
                            g => g.Average(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                        );

                    if (dimensionValues.Count > 0)
                    {
                        var maxValue = dimensionValues.OrderByDescending(kv => kv.Value).First();
                        trendAnalysis.DimensionalTrends[dimension] = $"highest in {maxValue.Key}";
                    }
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task CalculateNonTimeBasedTrendAsync(List<DataPoint> dataPoints, TrendAnalysis trendAnalysis, ContextualDataExplorerRequest request)
        {
            // For non-time-based data, we'll just report the distribution
            var primaryMetric = request.Metrics?.FirstOrDefault() ?? "revenue";

            // Set a neutral trend for non-time-based data
            trendAnalysis.PrimaryTrend = "not_applicable";
            trendAnalysis.TrendMagnitude = 0;

            // Calculate distribution across dimensions
            foreach (var dimension in request.Dimensions ?? new List<string>())
            {
                var dimensionValues = dataPoints
                    .Where(dp => dp.Dimensions.ContainsKey(dimension))
                    .GroupBy(dp => dp.Dimensions[dimension].ToString())
                    .ToDictionary(
                        g => g.Key,
                        g => g.Average(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                    );

                if (dimensionValues.Count > 0)
                {
                    var maxValue = dimensionValues.OrderByDescending(kv => kv.Value).First();
                    trendAnalysis.DimensionalTrends[dimension] = $"highest in {maxValue.Key}";
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task DetectAnomaliesAsync(List<DataPoint> dataPoints, TrendAnalysis trendAnalysis, ContextualDataExplorerRequest request)
        {
            // Simple anomaly detection using Z-score
            var primaryMetric = request.Metrics?.FirstOrDefault() ?? "revenue";

            // Get values for the primary metric
            var values = dataPoints
                .Select(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                .ToList();

            if (values.Count < 3)
            {
                // Not enough data for anomaly detection
                return;
            }

            // Calculate mean and standard deviation
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Average(v => Math.Pow((double)(v - mean), 2)));

            // Detect anomalies (Z-score > 2 or < -2)
            for (int i = 0; i < dataPoints.Count; i++)
            {
                var value = values[i];
                var zScore = stdDev > 0 ? (double)(value - mean) / stdDev : 0;

                if (Math.Abs(zScore) > 2)
                {
                    var anomaly = new Anomaly
                    {
                        Dimension = "time",
                        Metric = primaryMetric,
                        Value = value,
                        ExpectedValue = mean,
                        Deviation = (decimal)zScore,
                        Severity = Math.Abs(zScore) > 3 ? "high" : "medium",
                        Timestamp = dataPoints[i].Timestamp
                    };

                    trendAnalysis.Anomalies.Add(anomaly);
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task<PredictiveModelingResult> GeneratePredictiveModelingResultsAsync(ContextualDataExplorerRequest request, List<DataPoint> dataPoints)
        {
            try
            {
                if (dataPoints == null || dataPoints.Count == 0 || request.ScenarioParameters == null || request.ScenarioParameters.Count == 0)
                {
                    return new PredictiveModelingResult
                    {
                        ScenarioName = "Default Scenario",
                        InputParameters = request.ScenarioParameters ?? new Dictionary<string, object>(),
                        PredictedDataPoints = new List<PredictedDataPoint>(),
                        PredictedAggregations = new Dictionary<string, decimal>(),
                        ConfidenceScore = 0.5m,
                        SensitivityAnalysis = new Dictionary<string, decimal>()
                    };
                }

                // Get time-based data points if available
                var timeBasedPoints = dataPoints
                    .Where(dp => dp.Timestamp.HasValue)
                    .OrderBy(dp => dp.Timestamp)
                    .ToList();

                // Initialize result
                var result = new PredictiveModelingResult
                {
                    ScenarioName = request.ScenarioParameters.GetValueOrDefault("scenario_name", "Default Scenario").ToString(),
                    InputParameters = request.ScenarioParameters,
                    PredictedDataPoints = new List<PredictedDataPoint>(),
                    PredictedAggregations = new Dictionary<string, decimal>(),
                    ConfidenceScore = 0.7m, // Default confidence score
                    SensitivityAnalysis = new Dictionary<string, decimal>()
                };

                // Get the primary metric from the request
                var primaryMetric = request.Metrics?.FirstOrDefault() ?? "revenue";

                if (timeBasedPoints.Count >= 3)
                {
                    // Generate predictions for time-based data
                    await GenerateTimeBasedPredictionsAsync(timeBasedPoints, result, request, primaryMetric);
                }
                else
                {
                    // Generate predictions for non-time-based data
                    await GenerateNonTimeBasedPredictionsAsync(dataPoints, result, request, primaryMetric);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating predictive modeling results");

                // Return a basic result in case of error
                return new PredictiveModelingResult
                {
                    ScenarioName = "Default Scenario",
                    InputParameters = request.ScenarioParameters ?? new Dictionary<string, object>(),
                    PredictedDataPoints = new List<PredictedDataPoint>(),
                    PredictedAggregations = new Dictionary<string, decimal>(),
                    ConfidenceScore = 0.5m,
                    SensitivityAnalysis = new Dictionary<string, decimal>()
                };
            }
        }

        private async Task GenerateTimeBasedPredictionsAsync(List<DataPoint> timeBasedPoints, PredictiveModelingResult result,
            ContextualDataExplorerRequest request, string primaryMetric)
        {
            // Extract values for the primary metric
            var values = timeBasedPoints
                .Select(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                .ToList();

            // Calculate simple linear regression for prediction
            var n = values.Count;
            var timestamps = Enumerable.Range(0, n).Select(i => (decimal)i).ToList();
            var sumX = timestamps.Sum();
            var sumY = values.Sum();
            var sumXY = timestamps.Zip(values, (x, y) => x * y).Sum();
            var sumX2 = timestamps.Sum(x => x * x);

            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;

            // Get prediction horizon from scenario parameters
            var horizon = 7; // Default to 7 days
            if (request.ScenarioParameters.TryGetValue("prediction_horizon", out var horizonObj) &&
                int.TryParse(horizonObj.ToString(), out var parsedHorizon))
            {
                horizon = parsedHorizon;
            }

            // Get growth factor from scenario parameters
            var growthFactor = 1.0m; // Default to no adjustment
            if (request.ScenarioParameters.TryGetValue("growth_factor", out var growthObj) &&
                decimal.TryParse(growthObj.ToString(), out var parsedGrowth))
            {
                growthFactor = parsedGrowth;
            }

            // Generate predictions
            var lastTimestamp = timeBasedPoints.Last().Timestamp.Value;
            for (int i = 1; i <= horizon; i++)
            {
                var predictedValue = (intercept + slope * (n + i - 1)) * growthFactor;
                predictedValue = Math.Max(0, predictedValue); // Ensure non-negative values

                var predictedPoint = new PredictedDataPoint
                {
                    Timestamp = lastTimestamp.AddDays(i),
                    Metrics = new Dictionary<string, decimal>
                    {
                        { primaryMetric, predictedValue }
                    },
                    Dimensions = new Dictionary<string, object>(),
                    ConfidenceInterval = 0.1m // 10% confidence interval
                };

                result.PredictedDataPoints.Add(predictedPoint);
            }

            // Calculate predicted aggregations
            result.PredictedAggregations[$"total_{primaryMetric}"] = result.PredictedDataPoints.Sum(dp => dp.Metrics[primaryMetric]);
            result.PredictedAggregations[$"average_{primaryMetric}"] = result.PredictedDataPoints.Count > 0
                ? result.PredictedDataPoints.Average(dp => dp.Metrics[primaryMetric])
                : 0;

            // Calculate sensitivity analysis
            result.SensitivityAnalysis["growth_factor"] = 0.5m; // High sensitivity to growth factor
            result.SensitivityAnalysis["seasonality"] = 0.3m; // Medium sensitivity to seasonality
            result.SensitivityAnalysis["external_factors"] = 0.2m; // Low sensitivity to external factors

            // Adjust confidence score based on data quality
            result.ConfidenceScore = CalculatePredictionConfidence(timeBasedPoints.Count, slope, growthFactor);

            await Task.CompletedTask; // For async compatibility
        }

        private async Task GenerateNonTimeBasedPredictionsAsync(List<DataPoint> dataPoints, PredictiveModelingResult result,
            ContextualDataExplorerRequest request, string primaryMetric)
        {
            // For non-time-based data, we'll use a simple average-based prediction
            var avgValue = dataPoints.Average(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0));

            // Get growth factor from scenario parameters
            var growthFactor = 1.0m; // Default to no adjustment
            if (request.ScenarioParameters.TryGetValue("growth_factor", out var growthObj) &&
                decimal.TryParse(growthObj.ToString(), out var parsedGrowth))
            {
                growthFactor = parsedGrowth;
            }

            // Generate a single prediction
            var predictedValue = avgValue * growthFactor;

            var predictedPoint = new PredictedDataPoint
            {
                Timestamp = DateTime.UtcNow.AddDays(1),
                Metrics = new Dictionary<string, decimal>
                {
                    { primaryMetric, predictedValue }
                },
                Dimensions = new Dictionary<string, object>(),
                ConfidenceInterval = 0.2m // 20% confidence interval
            };

            result.PredictedDataPoints.Add(predictedPoint);

            // Calculate predicted aggregations
            result.PredictedAggregations[$"predicted_{primaryMetric}"] = predictedValue;

            // Set a lower confidence score for non-time-based predictions
            result.ConfidenceScore = 0.5m;

            await Task.CompletedTask; // For async compatibility
        }

        private decimal CalculatePredictionConfidence(int dataPointCount, decimal trendSlope, decimal growthFactor)
        {
            // Calculate confidence score based on data quality and prediction parameters
            var baseConfidence = 0.7m; // Base confidence

            // Adjust based on data point count
            var dataPointFactor = Math.Min(1.0m, dataPointCount / 30.0m); // More data points = higher confidence

            // Adjust based on trend stability
            var trendFactor = Math.Max(0.5m, 1.0m - Math.Abs(trendSlope) * 0.5m); // More stable trend = higher confidence

            // Adjust based on growth factor deviation from 1.0
            var growthFactorDeviation = Math.Abs(growthFactor - 1.0m);
            var growthFactorConfidence = Math.Max(0.5m, 1.0m - growthFactorDeviation); // More extreme growth factors = lower confidence

            // Calculate final confidence score
            var confidenceScore = baseConfidence * dataPointFactor * trendFactor * growthFactorConfidence;

            // Ensure confidence is between 0.1 and 0.95
            return Math.Max(0.1m, Math.Min(0.95m, confidenceScore));
        }

        private async Task<List<DataInsight>> GenerateInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request)
        {
            try
            {
                if (result.DataPoints == null || result.DataPoints.Count == 0)
                {
                    return new List<DataInsight>
                    {
                        new DataInsight
                        {
                            Id = Guid.NewGuid().ToString(),
                            Title = "Insufficient Data",
                            Description = "There is not enough data to generate meaningful insights.",
                            Importance = "low",
                            RelatedDimensions = request.Dimensions ?? new List<string>(),
                            RelatedMetrics = request.Metrics ?? new List<string>(),
                            SupportingData = new Dictionary<string, object>()
                        }
                    };
                }

                var insights = new List<DataInsight>();
                var primaryMetric = request.Metrics?.FirstOrDefault() ?? "revenue";

                // Generate insights based on the data
                await GenerateMetricInsightsAsync(result, request, insights, primaryMetric);
                await GenerateDimensionalInsightsAsync(result, request, insights, primaryMetric);
                await GenerateAnomalyInsightsAsync(result, request, insights, primaryMetric);
                await GenerateTrendInsightsAsync(result, request, insights, primaryMetric);

                // Sort insights by importance
                insights = insights
                    .OrderByDescending(i => i.Importance == "high" ? 3 : i.Importance == "medium" ? 2 : 1)
                    .ToList();

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights");

                // Return a basic insight in case of error
                return new List<DataInsight>
                {
                    new DataInsight
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "Error Generating Insights",
                        Description = "An error occurred while generating insights. Please try again later.",
                        Importance = "low",
                        RelatedDimensions = request.Dimensions ?? new List<string>(),
                        RelatedMetrics = request.Metrics ?? new List<string>(),
                        SupportingData = new Dictionary<string, object>()
                    }
                };
            }
        }

        private async Task GenerateMetricInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request,
            List<DataInsight> insights, string primaryMetric)
        {
            // Generate insights based on metric aggregations
            if (result.Aggregations.Count > 0)
            {
                // Get total and average values
                if (result.Aggregations.TryGetValue($"total_{primaryMetric}", out var totalValue) ||
                    result.Aggregations.TryGetValue($"total_revenue", out totalValue))
                {
                    insights.Add(new DataInsight
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = $"Total {primaryMetric.ToTitleCase()}",
                        Description = $"The total {primaryMetric} for the selected period is {totalValue:C2}.",
                        Importance = "medium",
                        RelatedMetrics = new List<string> { primaryMetric },
                        SupportingData = new Dictionary<string, object>
                        {
                            { "value", totalValue }
                        }
                    });
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task GenerateDimensionalInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request,
            List<DataInsight> insights, string primaryMetric)
        {
            // Generate insights based on dimensions
            if (request.Dimensions?.Count > 0 && result.DataPoints.Count > 0)
            {
                foreach (var dimension in request.Dimensions)
                {
                    if (dimension != "time")
                    {
                        // Group data points by dimension value
                        var dimensionValues = result.DataPoints
                            .Where(dp => dp.Dimensions.ContainsKey(dimension))
                            .GroupBy(dp => dp.Dimensions[dimension].ToString())
                            .ToDictionary(
                                g => g.Key,
                                g => g.Sum(dp => dp.Metrics.GetValueOrDefault(primaryMetric, 0))
                            );

                        if (dimensionValues.Count > 0)
                        {
                            // Find top and bottom performers
                            var topPerformer = dimensionValues.OrderByDescending(kv => kv.Value).First();
                            var bottomPerformer = dimensionValues.OrderBy(kv => kv.Value).First();

                            // Add insight for top performer
                            insights.Add(new DataInsight
                            {
                                Id = Guid.NewGuid().ToString(),
                                Title = $"Top {dimension.ToTitleCase()} Performance",
                                Description = $"{topPerformer.Key} has the highest {primaryMetric} at {topPerformer.Value:C2}.",
                                Importance = "high",
                                RelatedDimensions = new List<string> { dimension },
                                RelatedMetrics = new List<string> { primaryMetric },
                                SupportingData = new Dictionary<string, object>
                                {
                                    { "dimension", dimension },
                                    { "value", topPerformer.Key },
                                    { "metric", primaryMetric },
                                    { "amount", topPerformer.Value }
                                }
                            });

                            // Add insight for bottom performer if different from top
                            if (topPerformer.Key != bottomPerformer.Key)
                            {
                                insights.Add(new DataInsight
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Title = $"Lowest {dimension.ToTitleCase()} Performance",
                                    Description = $"{bottomPerformer.Key} has the lowest {primaryMetric} at {bottomPerformer.Value:C2}.",
                                    Importance = "medium",
                                    RelatedDimensions = new List<string> { dimension },
                                    RelatedMetrics = new List<string> { primaryMetric },
                                    SupportingData = new Dictionary<string, object>
                                    {
                                        { "dimension", dimension },
                                        { "value", bottomPerformer.Key },
                                        { "metric", primaryMetric },
                                        { "amount", bottomPerformer.Value }
                                    }
                                });
                            }
                        }
                    }
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task GenerateAnomalyInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request,
            List<DataInsight> insights, string primaryMetric)
        {
            // Generate insights based on anomalies
            if (result.TrendInfo?.Anomalies?.Count > 0)
            {
                foreach (var anomaly in result.TrendInfo.Anomalies)
                {
                    // Only report high severity anomalies as insights
                    if (anomaly.Severity == "high")
                    {
                        insights.Add(new DataInsight
                        {
                            Id = Guid.NewGuid().ToString(),
                            Title = "Anomaly Detected",
                            Description = $"An unusual {primaryMetric} value of {anomaly.Value:C2} was detected (expected around {anomaly.ExpectedValue:C2}).",
                            Importance = "high",
                            RelatedMetrics = new List<string> { primaryMetric },
                            SupportingData = new Dictionary<string, object>
                            {
                                { "anomaly", anomaly }
                            }
                        });
                    }
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        private async Task GenerateTrendInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request,
            List<DataInsight> insights, string primaryMetric)
        {
            // Generate insights based on trend information
            if (result.TrendInfo != null)
            {
                // Report primary trend
                if (!string.IsNullOrEmpty(result.TrendInfo.PrimaryTrend) && result.TrendInfo.PrimaryTrend != "unknown" && result.TrendInfo.PrimaryTrend != "not_applicable")
                {
                    var trendDescription = result.TrendInfo.PrimaryTrend switch
                    {
                        "increasing" => "increasing",
                        "decreasing" => "decreasing",
                        "stable" => "stable",
                        _ => "changing"
                    };

                    var importance = result.TrendInfo.PrimaryTrend switch
                    {
                        "increasing" => "high",
                        "decreasing" => "high",
                        "stable" => "medium",
                        _ => "low"
                    };

                    insights.Add(new DataInsight
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = $"{primaryMetric.ToTitleCase()} Trend",
                        Description = $"The {primaryMetric} is {trendDescription} over the selected period.",
                        Importance = importance,
                        RelatedMetrics = new List<string> { primaryMetric },
                        SupportingData = new Dictionary<string, object>
                        {
                            { "trend", result.TrendInfo.PrimaryTrend },
                            { "magnitude", result.TrendInfo.TrendMagnitude }
                        }
                    });
                }

                // Report dimensional trends
                foreach (var dimensionalTrend in result.TrendInfo.DimensionalTrends)
                {
                    insights.Add(new DataInsight
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = $"{dimensionalTrend.Key.ToTitleCase()} Distribution",
                        Description = $"{primaryMetric.ToTitleCase()} is {dimensionalTrend.Value}.",
                        Importance = "medium",
                        RelatedDimensions = new List<string> { dimensionalTrend.Key },
                        RelatedMetrics = new List<string> { primaryMetric },
                        SupportingData = new Dictionary<string, object>
                        {
                            { "dimension", dimensionalTrend.Key },
                            { "trend", dimensionalTrend.Value }
                        }
                    });
                }
            }

            await Task.CompletedTask; // For async compatibility
        }

        // Helper methods

        private IQueryable<DailyAction> ApplyPlayModeFilter(IQueryable<DailyAction> query, string playMode)
        {
            switch (playMode.ToLower())
            {
                case "casino":
                    return query.Where(da => (da.BetsCasino ?? 0) > 0 || (da.WinsCasino ?? 0) > 0);
                case "sport":
                    return query.Where(da => (da.BetsSport ?? 0) > 0 || (da.WinsSport ?? 0) > 0);
                case "live":
                    return query.Where(da => (da.BetsLive ?? 0) > 0 || (da.WinsLive ?? 0) > 0);
                case "bingo":
                    return query.Where(da => (da.BetsBingo ?? 0) > 0 || (da.WinsBingo ?? 0) > 0);
                default:
                    return query;
            }
        }

        // This interface defines the properties required for entities that can be filtered by play mode
        private interface IPlayModeFilterable
        {
            decimal? BetsCasino { get; }
            decimal? BetsSport { get; }
            decimal? BetsLive { get; }
            decimal? BetsBingo { get; }
            decimal? WinsCasino { get; }
            decimal? WinsSport { get; }
            decimal? WinsLive { get; }
            decimal? WinsBingo { get; }
        }

        // This interface defines the properties required for entities that have a date
        private interface IDateEntity
        {
            DateTime Date { get; }
        }

        // Interface definitions moved to a single location in the class

        // ApplyPlayModeFilter method is defined elsewhere in the class

        private static decimal CalculateChangePercentage(decimal current, decimal previous)
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

        private static decimal GetTotalRevenue(IGrouping<DateTime, DailyAction> group, string playMode)
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

        // No generic versions needed - we'll use the specific DailyAction versions

        // Fallback methods for non-IPlayModeFilterable entities are not needed
        // The generic methods with constraints will be used when applicable

        // Helper method to detect database connection errors
        private bool IsDbConnectionException(Exception ex)
        {
            return ex is SqlException ||
                   ex is DbUpdateException ||
                   ex.InnerException != null && IsDbConnectionException(ex.InnerException);
        }
    }
}