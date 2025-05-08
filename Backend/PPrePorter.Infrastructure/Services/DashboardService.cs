using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Exceptions;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly IDataFilterService _dataFilterService;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            IPPRePorterDbContext dbContext,
            IDataFilterService dataFilterService,
            ICachingService cachingService,
            ILogger<DashboardService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _dataFilterService = dataFilterService ?? throw new ArgumentNullException(nameof(dataFilterService));
            _cachingService = cachingService ?? throw new ArgumentNullException(nameof(cachingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
                    async () => await FetchDashboardSummaryAsync(request),
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
                    Annotations = new List<DataAnnotation>(),
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
                }

                // Generate trend analysis if enabled
                if (request.Dimensions?.Contains("time") == true || request.Dimensions?.Count > 0)
                {
                    result.TrendInfo = await GenerateTrendAnalysisAsync(result.DataPoints, request);
                }

                // Apply predictive modeling if requested
                if (request.EnablePredictiveModeling && request.ScenarioParameters?.Count > 0)
                {
                    result.PredictiveResults = await GeneratePredictiveModelingResultsAsync(request, result.DataPoints);
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
                .Where(da => whiteLabelIds.Contains(da.WhiteLabelID))
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

                var revenueData = await GetRevenueDataByTimeAsync(query, timeGrouping, request.Metrics);
                
                foreach (var item in revenueData)
                {
                    result.DataPoints.Add(new DataPoint
                    {
                        Label = item.Key,
                        Timestamp = item.Timestamp,
                        Dimensions = new Dictionary<string, object> { { "time", item.Key } },
                        Metrics = item.Metrics
                    });
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
                        {
                            Year = g.Key,
                            Revenue = GetTotalRevenue(g, null),
                            Bets = GetTotalBets(g, null),
                            Wins = GetTotalWins(g, null),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Year)
                        .ToListAsync();

                    foreach (var item in yearlyData)
                    {
                        var metrics = new Dictionary<string, decimal>();
                        
                        if (metricsList.Contains("revenue"))
                            metrics["revenue"] = item.Revenue;
                        
                        if (metricsList.Contains("bets"))
                            metrics["bets"] = item.Bets;
                        
                        if (metricsList.Contains("wins"))
                            metrics["wins"] = item.Wins;
                        
                        if (metricsList.Contains("deposits"))
                            metrics["deposits"] = item.Deposits;
                        
                        if (metricsList.Contains("cashouts"))
                            metrics["cashouts"] = item.Cashouts;

                        result.Add(new RevenueDataItem
                        {
                            Key = item.Year.ToString(),
                            Timestamp = new DateTime(item.Year, 1, 1),
                            Metrics = metrics
                        });
                    }
                    break;
                
                case "month":
                    var monthlyData = await query
                        .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                        .Select(g => new
                        {
                            Year = g.Key.Year,
                            Month = g.Key.Month,
                            Revenue = GetTotalRevenue(g, null),
                            Bets = GetTotalBets(g, null),
                            Wins = GetTotalWins(g, null),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Year)
                        .ThenBy(x => x.Month)
                        .ToListAsync();

                    foreach (var item in monthlyData)
                    {
                        var metrics = new Dictionary<string, decimal>();
                        
                        if (metricsList.Contains("revenue"))
                            metrics["revenue"] = item.Revenue;
                        
                        if (metricsList.Contains("bets"))
                            metrics["bets"] = item.Bets;
                        
                        if (metricsList.Contains("wins"))
                            metrics["wins"] = item.Wins;
                        
                        if (metricsList.Contains("deposits"))
                            metrics["deposits"] = item.Deposits;
                        
                        if (metricsList.Contains("cashouts"))
                            metrics["cashouts"] = item.Cashouts;

                        result.Add(new RevenueDataItem
                        {
                            Key = $"{item.Year}-{item.Month:D2}",
                            Timestamp = new DateTime(item.Year, item.Month, 1),
                            Metrics = metrics
                        });
                    }
                    break;
                
                case "week":
                    // Implementation for weekly grouping
                    // ...
                    break;
                
                case "day":
                default:
                    var dailyData = await query
                        .GroupBy(da => da.Date.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            Revenue = GetTotalRevenue(g, null),
                            Bets = GetTotalBets(g, null),
                            Wins = GetTotalWins(g, null),
                            Deposits = g.Sum(da => da.Deposits ?? 0),
                            Cashouts = g.Sum(da => da.PaidCashouts ?? 0)
                        })
                        .OrderBy(x => x.Date)
                        .ToListAsync();

                    foreach (var item in dailyData)
                    {
                        var metrics = new Dictionary<string, decimal>();
                        
                        if (metricsList.Contains("revenue"))
                            metrics["revenue"] = item.Revenue;
                        
                        if (metricsList.Contains("bets"))
                            metrics["bets"] = item.Bets;
                        
                        if (metricsList.Contains("wins"))
                            metrics["wins"] = item.Wins;
                        
                        if (metricsList.Contains("deposits"))
                            metrics["deposits"] = item.Deposits;
                        
                        if (metricsList.Contains("cashouts"))
                            metrics["cashouts"] = item.Cashouts;

                        result.Add(new RevenueDataItem
                        {
                            Key = item.Date.ToString("yyyy-MM-dd"),
                            Timestamp = item.Date,
                            Metrics = metrics
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
            // Implementation for trend analysis
            // This will analyze the data points and identify trends
            // For now, return a placeholder implementation
            
            var trendAnalysis = new TrendAnalysis
            {
                PrimaryTrend = "stable",
                TrendMagnitude = 0,
                DimensionalTrends = new Dictionary<string, string>(),
                Anomalies = new List<Anomaly>()
            };
            
            // Further implementation will be added in the future
            
            await Task.CompletedTask; // Placeholder for async implementation
            
            return trendAnalysis;
        }

        private async Task<PredictiveModelingResult> GeneratePredictiveModelingResultsAsync(ContextualDataExplorerRequest request, List<DataPoint> dataPoints)
        {
            // Implementation for predictive modeling
            // This will generate predictions based on the scenario parameters
            // For now, return a placeholder implementation
            
            var predictiveResult = new PredictiveModelingResult
            {
                ScenarioName = "Default Scenario",
                InputParameters = request.ScenarioParameters,
                PredictedDataPoints = new List<PredictedDataPoint>(),
                PredictedAggregations = new Dictionary<string, decimal>(),
                ConfidenceScore = 0.5m,
                SensitivityAnalysis = new Dictionary<string, decimal>()
            };
            
            // Further implementation will be added in the future
            
            await Task.CompletedTask; // Placeholder for async implementation
            
            return predictiveResult;
        }

        private async Task<List<DataInsight>> GenerateInsightsAsync(ContextualDataExplorerResult result, ContextualDataExplorerRequest request)
        {
            // Implementation for insight generation
            // This will analyze the data and generate insights
            // For now, return a placeholder implementation
            
            var insights = new List<DataInsight>
            {
                new DataInsight
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = "Sample Insight",
                    Description = "This is a placeholder insight. Actual insights will be generated based on data analysis.",
                    Importance = "medium",
                    RelatedDimensions = request.Dimensions ?? new List<string>(),
                    RelatedMetrics = request.Metrics ?? new List<string>(),
                    SupportingData = new Dictionary<string, object>()
                }
            };
            
            // Further implementation will be added in the future
            
            await Task.CompletedTask; // Placeholder for async implementation
            
            return insights;
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

        // Helper method to detect database connection errors
        private bool IsDbConnectionException(Exception ex)
        {
            return ex is SqlException || 
                   ex is DbUpdateException || 
                   ex.InnerException != null && IsDbConnectionException(ex.InnerException);
        }
    }
}