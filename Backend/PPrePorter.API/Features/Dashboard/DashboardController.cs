using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.API.Features.Dashboard
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
            _dashboardService = dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
            _userContextService = userContextService ?? throw new ArgumentNullException(nameof(userContextService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
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
                var currentUser = await _userContextService.GetCurrentUserAsync();
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
                var currentUser = await _userContextService.GetCurrentUserAsync();
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
                var currentUser = await _userContextService.GetCurrentUserAsync();
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
                var currentUser = await _userContextService.GetCurrentUserAsync();
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
                var currentUser = await _userContextService.GetCurrentUserAsync();
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

        [HttpPost("contextual-explorer")]
        public async Task<IActionResult> GetContextualDataExplorer([FromBody] ContextualDataExplorerRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching contextual data explorer results for user {UserId}, context: {Context}, drill-down key: {DrillDownKey}", 
                    currentUser.Id, request.ExplorationContext, request.DrillDownKey);

                var result = await _dashboardService.GetContextualDataExplorerResultAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contextual data explorer results");
                return StatusCode(500, "An error occurred while retrieving contextual data explorer results");
            }
        }
        
        [HttpGet("player-journey")]
        public async Task<IActionResult> GetPlayerJourneySankey([FromQuery] PlayerJourneyRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching player journey Sankey diagram data for user {UserId}, timeframe: {TimeFrame}", 
                    currentUser.Id, request.TimeFrame);

                var result = await _dashboardService.GetPlayerJourneySankeyDataAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving player journey Sankey diagram data");
                return StatusCode(500, "An error occurred while retrieving player journey Sankey diagram data");
            }
        }

        [HttpGet("heatmap")]
        public async Task<IActionResult> GetHeatmapData([FromQuery] HeatmapRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching heatmap data for user {UserId}, dimensions: {PrimaryDimension}/{SecondaryDimension}, metric: {Metric}", 
                    currentUser.Id, request.PrimaryDimension, request.SecondaryDimension, request.Metric);

                var result = await _dashboardService.GetHeatmapDataAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving heatmap data");
                return StatusCode(500, "An error occurred while retrieving heatmap data");
            }
        }

        [HttpGet("segment-comparison")]
        public async Task<IActionResult> GetSegmentComparison([FromQuery] SegmentComparisonRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching segment comparison data for user {UserId}, segments: {Segments}, metrics: {Metrics}", 
                    currentUser.Id, string.Join(",", request.Segments), string.Join(",", request.Metrics));

                var result = await _dashboardService.GetSegmentComparisonAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving segment comparison data");
                return StatusCode(500, "An error occurred while retrieving segment comparison data");
            }
        }

        [HttpGet("micro-charts")]
        public async Task<IActionResult> GetMicroChartData([FromQuery] MicroChartRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Fetching micro-chart data for user {UserId}, type: {ChartType}, entities: {EntityCount}", 
                    currentUser.Id, request.ChartType, request.EntityIds?.Length ?? 0);

                var result = await _dashboardService.GetMicroChartDataAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving micro-chart data");
                return StatusCode(500, "An error occurred while retrieving micro-chart data");
            }
        }

        [HttpGet("user-preferences")]
        public async Task<IActionResult> GetUserPreferences()
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                
                _logger.LogInformation("Fetching dashboard preferences for user {UserId}", currentUser.Id);

                var preferences = await _dashboardService.GetUserDashboardPreferencesAsync(currentUser.Id);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user dashboard preferences");
                return StatusCode(500, "An error occurred while retrieving user dashboard preferences");
            }
        }

        [HttpPut("user-preferences")]
        public async Task<IActionResult> UpdateUserPreferences([FromBody] DashboardPreferences preferences)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                preferences.UserId = currentUser.Id;
                
                _logger.LogInformation("Updating dashboard preferences for user {UserId}", currentUser.Id);

                await _dashboardService.SaveUserDashboardPreferencesAsync(preferences);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user dashboard preferences");
                return StatusCode(500, "An error occurred while updating user dashboard preferences");
            }
        }

        [HttpGet("a11y-optimized")]
        public async Task<IActionResult> GetAccessibilityOptimizedData([FromQuery] AccessibilityDataRequest request)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                request.UserId = currentUser.Id;
                
                _logger.LogInformation("Fetching accessibility-optimized data for user {UserId}, visualization: {Visualization}", 
                    currentUser.Id, request.VisualizationType);

                var result = await _dashboardService.GetAccessibilityOptimizedDataAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accessibility-optimized data");
                return StatusCode(500, "An error occurred while retrieving accessibility-optimized data");
            }
        }
    }
}