using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Implementation of the IDashboardService interface
    /// </summary>
    public partial class DashboardService : IDashboardService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly IDataFilterService _dataFilterService;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardService"/> class
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="dataFilterService">Data filter service</param>
        /// <param name="cachingService">Caching service</param>
        /// <param name="logger">Logger</param>
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

        /// <summary>
        /// Gets the dashboard summary
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Dashboard summary</returns>
        public async Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:summary:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchDashboardSummaryAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard summary for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets the casino revenue chart data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Casino revenue chart data</returns>
        public async Task<List<CasinoRevenueItem>> GetCasinoRevenueChartDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:casino-revenue:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchCasinoRevenueChartDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting casino revenue chart data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets the player registrations chart data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Player registrations chart data</returns>
        public async Task<List<PlayerRegistrationItem>> GetPlayerRegistrationsChartDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:player-registrations:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchPlayerRegistrationsChartDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player registrations chart data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets the top games data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Top games data</returns>
        public async Task<List<TopGameItem>> GetTopGamesDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:top-games:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchTopGamesDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top games data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets the recent transactions
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Recent transactions</returns>
        public async Task<List<RecentTransactionItem>> GetRecentTransactionsAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:recent-transactions:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchRecentTransactionsAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent transactions for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets the contextual data explorer result
        /// </summary>
        /// <param name="request">Contextual data explorer request</param>
        /// <returns>Contextual data explorer result</returns>
        public async Task<ContextualDataExplorerResult> GetContextualDataExplorerResultAsync(ContextualDataExplorerRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:contextual-data:{request.UserId}:{request.Context}:{request.Dimension}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchContextualDataExplorerResultAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contextual data explorer result for user {UserId}", request.UserId);
                throw;
            }
        }

        // Additional methods needed by controllers
        public async Task<DashboardData> GetDashboardDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:data:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchDashboardDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard data for user {UserId}", request.UserId);
                throw;
            }
        }

        // Implementation of other interface methods will be added in a separate file
        // due to file size limitations
    }
}
