using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.API.Features.Dashboard.Controllers
{
    [ApiController]
    [Route("api/dashboard-insights")]
    [Authorize]
    public class DashboardInsightsController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IInsightGenerationService _insightGenerationService;
        private readonly IAnomalyDetectionService _anomalyDetectionService;
        private readonly IContextualExplanationService _contextualExplanationService;
        private readonly ITrendAnalysisService _trendAnalysisService;
        private readonly IDataAnnotationService _dataAnnotationService;
        private readonly IDashboardPersonalizationService _personalizationService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<DashboardInsightsController> _logger;

        public DashboardInsightsController(
            IDashboardService dashboardService,
            IInsightGenerationService insightGenerationService,
            IAnomalyDetectionService anomalyDetectionService,
            IContextualExplanationService contextualExplanationService,
            ITrendAnalysisService trendAnalysisService,
            IDataAnnotationService dataAnnotationService,
            IDashboardPersonalizationService personalizationService,
            IUserContextService userContextService,
            ILogger<DashboardInsightsController> logger)
        {
            _dashboardService = dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
            _insightGenerationService = insightGenerationService ?? throw new ArgumentNullException(nameof(insightGenerationService));
            _anomalyDetectionService = anomalyDetectionService ?? throw new ArgumentNullException(nameof(anomalyDetectionService));
            _contextualExplanationService = contextualExplanationService ?? throw new ArgumentNullException(nameof(contextualExplanationService));
            _trendAnalysisService = trendAnalysisService ?? throw new ArgumentNullException(nameof(trendAnalysisService));
            _dataAnnotationService = dataAnnotationService ?? throw new ArgumentNullException(nameof(dataAnnotationService));
            _personalizationService = personalizationService ?? throw new ArgumentNullException(nameof(personalizationService));
            _userContextService = userContextService ?? throw new ArgumentNullException(nameof(userContextService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get complete dashboard story with insights from all sections
        /// </summary>
        [HttpGet("story")]
        public async Task<IActionResult> GetDashboardStory([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                _logger.LogInformation("Generating dashboard story for user {UserId}", currentUser.Id);

                // First get all dashboard data
                var dashboardData = await _dashboardService.GetDashboardDataAsync(request);
                
                // Generate comprehensive dashboard story
                var story = await _insightGenerationService.GenerateDashboardStoryAsync(dashboardData);
                
                // Personalize insights if user has preferences
                var userPreferences = await _personalizationService.GetUserPreferencesAsync(currentUser.Id);
                if (userPreferences != null && story.KeyInsights.Count > 0)
                {
                    story.KeyInsights = await _personalizationService.GetPersonalizedInsightsAsync(
                        currentUser.Id, 
                        story.KeyInsights);
                }
                
                return Ok(story);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dashboard story");
                return StatusCode(500, "An error occurred while generating dashboard story");
            }
        }

        /// <summary>
        /// Get insights about dashboard summary statistics
        /// </summary>
        [HttpGet("summary-insights")]
        public async Task<IActionResult> GetSummaryInsights([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var summary = await _dashboardService.GetDashboardSummaryAsync(request);
                var insights = await _insightGenerationService.GenerateSummaryInsightsAsync(summary);
                
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating summary insights");
                return StatusCode(500, "An error occurred while generating summary insights");
            }
        }

        /// <summary>
        /// Get insights about revenue trends
        /// </summary>
        [HttpGet("revenue-insights")]
        public async Task<IActionResult> GetRevenueInsights([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var revenueData = await _dashboardService.GetCasinoRevenueChartDataAsync(request);
                var insights = await _insightGenerationService.GenerateRevenueInsightsAsync(revenueData);
                
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating revenue insights");
                return StatusCode(500, "An error occurred while generating revenue insights");
            }
        }

        /// <summary>
        /// Get insights about player registration patterns
        /// </summary>
        [HttpGet("registration-insights")]
        public async Task<IActionResult> GetRegistrationInsights([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var registrationData = await _dashboardService.GetPlayerRegistrationsChartDataAsync(request);
                var insights = await _insightGenerationService.GenerateRegistrationInsightsAsync(registrationData);
                
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating registration insights");
                return StatusCode(500, "An error occurred while generating registration insights");
            }
        }

        /// <summary>
        /// Get insights about top performing games
        /// </summary>
        [HttpGet("game-insights")]
        public async Task<IActionResult> GetGameInsights([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var gameData = await _dashboardService.GetTopGamesDataAsync(request);
                var insights = await _insightGenerationService.GenerateTopGamesInsightsAsync(gameData);
                
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating game insights");
                return StatusCode(500, "An error occurred while generating game insights");
            }
        }

        /// <summary>
        /// Get insights about transaction patterns
        /// </summary>
        [HttpGet("transaction-insights")]
        public async Task<IActionResult> GetTransactionInsights([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var transactionData = await _dashboardService.GetRecentTransactionsAsync(request);
                var insights = await _insightGenerationService.GenerateTransactionInsightsAsync(transactionData);
                
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating transaction insights");
                return StatusCode(500, "An error occurred while generating transaction insights");
            }
        }

        /// <summary>
        /// Get trend analysis for revenue data
        /// </summary>
        [HttpGet("revenue-trends")]
        public async Task<IActionResult> GetRevenueTrends([FromQuery] DashboardRequest request, 
            [FromQuery] TrendAnalysisOptions options = null)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var revenueData = await _dashboardService.GetCasinoRevenueChartDataAsync(request);
                var analysis = await _trendAnalysisService.AnalyzeRevenueTrendsAsync(revenueData, options);
                
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing revenue trends");
                return StatusCode(500, "An error occurred while analyzing revenue trends");
            }
        }

        /// <summary>
        /// Get trend analysis for registration data
        /// </summary>
        [HttpGet("registration-trends")]
        public async Task<IActionResult> GetRegistrationTrends([FromQuery] DashboardRequest request, 
            [FromQuery] TrendAnalysisOptions options = null)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var registrationData = await _dashboardService.GetPlayerRegistrationsChartDataAsync(request);
                var analysis = await _trendAnalysisService.AnalyzeRegistrationTrendsAsync(registrationData, options);
                
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing registration trends");
                return StatusCode(500, "An error occurred while analyzing registration trends");
            }
        }

        /// <summary>
        /// Get correlations between different metrics
        /// </summary>
        [HttpGet("metric-correlations")]
        public async Task<IActionResult> GetMetricCorrelations([FromQuery] DashboardRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                request.UserId = currentUser.Id;

                var dashboardData = await _dashboardService.GetDashboardDataAsync(request);
                var correlations = await _trendAnalysisService.AnalyzeMetricCorrelationsAsync(dashboardData);
                
                return Ok(correlations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing metric correlations");
                return StatusCode(500, "An error occurred while analyzing metric correlations");
            }
        }

        /// <summary>
        /// Get explanation for a specific metric
        /// </summary>
        [HttpGet("metric-explanation/{metricKey}")]
        public async Task<IActionResult> GetMetricExplanation(string metricKey)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var explanation = await _contextualExplanationService.GetMetricExplanationAsync(
                    metricKey, 
                    currentUser.Role, 
                    currentUser.ExperienceLevel);
                
                return Ok(explanation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metric explanation");
                return StatusCode(500, "An error occurred while retrieving metric explanation");
            }
        }

        /// <summary>
        /// Get explanations for all dashboard metrics
        /// </summary>
        [HttpGet("metric-explanations")]
        public async Task<IActionResult> GetAllMetricExplanations()
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var explanations = await _contextualExplanationService.GetSummaryMetricExplanationsAsync(
                    currentUser.Role, 
                    currentUser.ExperienceLevel);
                
                return Ok(explanations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metric explanations");
                return StatusCode(500, "An error occurred while retrieving metric explanations");
            }
        }

        /// <summary>
        /// Add annotation to dashboard data
        /// </summary>
        [HttpPost("annotations")]
        public async Task<IActionResult> AddAnnotation([FromBody] DataAnnotation annotation)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                annotation.UserId = currentUser.Id;
                annotation.CreatedAt = DateTime.UtcNow;
                annotation.ModifiedAt = DateTime.UtcNow;
                
                var savedAnnotation = await _dataAnnotationService.AddAnnotationAsync(annotation);
                return Ok(savedAnnotation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding annotation");
                return StatusCode(500, "An error occurred while adding annotation");
            }
        }

        /// <summary>
        /// Get annotations by date range
        /// </summary>
        [HttpGet("annotations")]
        public async Task<IActionResult> GetAnnotations([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var annotations = await _dataAnnotationService.GetAnnotationsForDateRangeAsync(startDate, endDate, currentUser.Id);
                
                return Ok(annotations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving annotations");
                return StatusCode(500, "An error occurred while retrieving annotations");
            }
        }

        /// <summary>
        /// Share annotation with another user
        /// </summary>
        [HttpPost("annotations/{annotationId}/share")]
        public async Task<IActionResult> ShareAnnotation(int annotationId, [FromBody] string targetUserId)
        {
            try
            {
                await _dataAnnotationService.ShareAnnotationAsync(annotationId, targetUserId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing annotation");
                return StatusCode(500, "An error occurred while sharing annotation");
            }
        }

        /// <summary>
        /// Get user dashboard preferences
        /// </summary>
        [HttpGet("preferences")]
        public async Task<IActionResult> GetUserPreferences()
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var preferences = await _personalizationService.GetUserPreferencesAsync(currentUser.Id);
                
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user preferences");
                return StatusCode(500, "An error occurred while retrieving user preferences");
            }
        }

        /// <summary>
        /// Save user dashboard preferences
        /// </summary>
        [HttpPost("preferences")]
        public async Task<IActionResult> SaveUserPreferences([FromBody] DashboardPreferences preferences)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                preferences.UserId = currentUser.Id;
                preferences.LastUpdated = DateTime.UtcNow;
                
                await _personalizationService.SaveUserPreferencesAsync(currentUser.Id, preferences);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving user preferences");
                return StatusCode(500, "An error occurred while saving user preferences");
            }
        }

        /// <summary>
        /// Track user interaction with dashboard component
        /// </summary>
        [HttpPost("interactions")]
        public async Task<IActionResult> TrackUserInteraction([FromBody] DashboardInteraction interaction)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                interaction.UserId = currentUser.Id;
                interaction.Timestamp = DateTime.UtcNow;
                
                await _personalizationService.TrackUserInteractionAsync(currentUser.Id, interaction);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking user interaction");
                return StatusCode(500, "An error occurred while tracking user interaction");
            }
        }

        /// <summary>
        /// Get recommended dashboard components
        /// </summary>
        [HttpGet("recommendations")]
        public async Task<IActionResult> GetRecommendedComponents()
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var recommendations = await _personalizationService.GetRecommendedComponentsAsync(
                    currentUser.Id, 
                    currentUser.Role);
                
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving component recommendations");
                return StatusCode(500, "An error occurred while retrieving component recommendations");
            }
        }
    }
}