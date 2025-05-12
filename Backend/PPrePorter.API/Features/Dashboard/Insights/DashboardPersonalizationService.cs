using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Entities;
using PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Implementation of IDashboardPersonalizationService that personalizes the dashboard experience
    /// </summary>
    public class DashboardPersonalizationService : IDashboardPersonalizationService
    {
        private readonly PPRePorterDbContext _dbContext;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardPersonalizationService> _logger;

        public DashboardPersonalizationService(
            PPRePorterDbContext dbContext,
            ICachingService cachingService,
            ILogger<DashboardPersonalizationService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _cachingService = cachingService ?? throw new ArgumentNullException(nameof(cachingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get user's dashboard preferences
        /// </summary>
        public async Task<DashboardPreferences> GetUserPreferencesAsync(string userId)
        {
            try
            {
                var cacheKey = $"dashboard:personalization:preferences";

                // Since we're using a single cache key for all users, we need to filter the results by userId
                var allPreferences = await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchAllUserPreferencesAsync(),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));

                // Find the preferences for the specified user
                var userPreferences = allPreferences.FirstOrDefault(p => p.UserId == userId);

                // If not found, fetch directly for this user
                if (userPreferences == null)
                {
                    userPreferences = await FetchUserPreferencesAsync(userId);
                }

                return userPreferences;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user preferences for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Fetch all user preferences from the database
        /// </summary>
        private async Task<List<DashboardPreferences>> FetchAllUserPreferencesAsync()
        {
            try
            {
                // Get all user preferences from the database
                var userPreferences = await _dbContext.UserPreferences.ToListAsync();

                // Convert to domain entities
                return userPreferences.Select(up => {
                    var colorScheme = new ColorSchemePreference
                    {
                        BaseTheme = up.BaseTheme ?? "light",
                        ColorMode = up.ColorMode ?? "standard",
                        PrimaryColor = up.PrimaryColor ?? "#1976d2",
                        SecondaryColor = up.SecondaryColor ?? "#dc004e",
                        PositiveColor = up.PositiveColor ?? "#4caf50",
                        NegativeColor = up.NegativeColor ?? "#f44336",
                        NeutralColor = up.NeutralColor ?? "#9e9e9e",
                        ContrastLevel = up.ContrastLevel ?? 1
                    };

                    return new DashboardPreferences
                    {
                        UserId = up.UserId.ToString(),
                        ColorScheme = colorScheme,
                        InformationDensity = up.InformationDensity ?? "medium",
                        PreferredChartTypes = !string.IsNullOrEmpty(up.PreferredChartTypes)
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(up.PreferredChartTypes)
                            : GetDefaultChartTypes(),
                        PinnedMetrics = !string.IsNullOrEmpty(up.PinnedMetrics)
                            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(up.PinnedMetrics)
                            : new List<string> { "Revenue", "Registrations", "FTD" },
                        ShowAnnotations = up.ShowAnnotations ?? true,
                        ShowInsights = up.ShowInsights ?? true,
                        ShowAnomalies = up.ShowAnomalies ?? true,
                        ShowForecasts = up.ShowForecasts ?? true,
                        DefaultTimeRange = up.DefaultTimeRange ?? "week",
                        DefaultDataGranularity = up.DefaultDataGranularity ?? 7,
                        InsightImportanceThreshold = up.InsightImportanceThreshold ?? 4,
                        ComponentVisibility = !string.IsNullOrEmpty(up.ComponentVisibility)
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, bool>>(up.ComponentVisibility)
                            : GetDefaultComponentVisibility(),
                        LastUpdated = up.LastUpdated ?? up.UpdatedAt
                    };
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all user preferences");
                return new List<DashboardPreferences>();
            }
        }

        private async Task<DashboardPreferences> FetchUserPreferencesAsync(string userId)
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
                    // Convert to domain entity
                    var colorScheme = new ColorSchemePreference
                    {
                        BaseTheme = userPreferences.BaseTheme ?? "light",
                        ColorMode = userPreferences.ColorMode ?? "standard",
                        PrimaryColor = userPreferences.PrimaryColor ?? "#1976d2",
                        SecondaryColor = userPreferences.SecondaryColor ?? "#dc004e",
                        PositiveColor = userPreferences.PositiveColor ?? "#4caf50",
                        NegativeColor = userPreferences.NegativeColor ?? "#f44336",
                        NeutralColor = userPreferences.NeutralColor ?? "#9e9e9e",
                        ContrastLevel = userPreferences.ContrastLevel ?? 1
                    };

                    return new DashboardPreferences
                    {
                        UserId = userId,
                        ColorScheme = colorScheme,
                        InformationDensity = userPreferences.InformationDensity ?? "medium",
                        PreferredChartTypes = !string.IsNullOrEmpty(userPreferences.PreferredChartTypes)
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(userPreferences.PreferredChartTypes)
                            : GetDefaultChartTypes(),
                        PinnedMetrics = !string.IsNullOrEmpty(userPreferences.PinnedMetrics)
                            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(userPreferences.PinnedMetrics)
                            : new List<string> { "Revenue", "Registrations", "FTD" },
                        ShowAnnotations = userPreferences.ShowAnnotations ?? true,
                        ShowInsights = userPreferences.ShowInsights ?? true,
                        ShowAnomalies = userPreferences.ShowAnomalies ?? true,
                        ShowForecasts = userPreferences.ShowForecasts ?? true,
                        DefaultTimeRange = userPreferences.DefaultTimeRange ?? "week",
                        DefaultDataGranularity = userPreferences.DefaultDataGranularity ?? 7,
                        InsightImportanceThreshold = userPreferences.InsightImportanceThreshold ?? 4,
                        ComponentVisibility = !string.IsNullOrEmpty(userPreferences.ComponentVisibility)
                            ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, bool>>(userPreferences.ComponentVisibility)
                            : GetDefaultComponentVisibility(),
                        LastUpdated = userPreferences.LastUpdated ?? userPreferences.UpdatedAt
                    };
                }

                // Return default preferences if not found
                return new DashboardPreferences
                {
                    UserId = userId,
                    ColorScheme = new ColorSchemePreference
                    {
                        BaseTheme = "light",
                        ColorMode = "standard",
                        PrimaryColor = "#1976d2",
                        SecondaryColor = "#dc004e",
                        PositiveColor = "#4caf50",
                        NegativeColor = "#f44336",
                        NeutralColor = "#9e9e9e",
                        ContrastLevel = 1
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
                _logger.LogError(ex, "Error fetching user preferences for user {UserId}", userId);
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
                { "registrationsChart", true },
                { "topGames", true },
                { "recentTransactions", true },
                { "insights", true }
            };
        }

        /// <summary>
        /// Save user's dashboard preferences
        /// </summary>
        public async Task SaveUserPreferencesAsync(string userId, DashboardPreferences preferences)
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
                    userPreferences = new UserPreference
                    {
                        UserId = userIdInt,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _dbContext.UserPreferences.Add(userPreferences);
                }

                // Update properties
                if (preferences.ColorScheme != null)
                {
                    userPreferences.BaseTheme = preferences.ColorScheme.BaseTheme;
                    userPreferences.ColorMode = preferences.ColorScheme.ColorMode;
                    userPreferences.PrimaryColor = preferences.ColorScheme.PrimaryColor;
                    userPreferences.SecondaryColor = preferences.ColorScheme.SecondaryColor;
                    userPreferences.PositiveColor = preferences.ColorScheme.PositiveColor;
                    userPreferences.NegativeColor = preferences.ColorScheme.NegativeColor;
                    userPreferences.NeutralColor = preferences.ColorScheme.NeutralColor;
                    userPreferences.ContrastLevel = preferences.ColorScheme.ContrastLevel;
                }

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
                userPreferences.UpdatedAt = DateTime.UtcNow;

                // Save changes
                await _dbContext.SaveChangesAsync();

                // Clear cache
                var cacheKey = $"dashboard:personalization:preferences";
                await _cachingService.RemoveAsync(cacheKey);

                _logger.LogInformation("Saved dashboard preferences for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving dashboard preferences for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Get personalized metric importance rankings for a user
        /// </summary>
        public async Task<Dictionary<string, int>> GetMetricImportanceRankingsAsync(string userId, string userRole)
        {
            try
            {
                // For simplicity, we'll just calculate this on the fly without caching
                return await FetchMetricImportanceRankingsAsync(userId, userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting metric importance rankings for user {UserId}", userId);
                return GetDefaultMetricImportanceRankings(userRole);
            }
        }

        private async Task<Dictionary<string, int>> FetchMetricImportanceRankingsAsync(string userId, string userRole)
        {
            // Get user preferences
            var preferences = await GetUserPreferencesAsync(userId);

            // Get user interactions
            var interactions = await GetUserInteractionsAsync(userId);

            // Calculate importance based on preferences and interactions
            var rankings = GetDefaultMetricImportanceRankings(userRole);

            // Adjust rankings based on pinned metrics
            if (preferences.PinnedMetrics != null)
            {
                foreach (var metric in preferences.PinnedMetrics)
                {
                    if (rankings.ContainsKey(metric))
                    {
                        rankings[metric] += 3;
                    }
                }
            }

            // Adjust rankings based on interactions
            foreach (var interaction in interactions)
            {
                if (!string.IsNullOrEmpty(interaction.MetricKey) && rankings.ContainsKey(interaction.MetricKey))
                {
                    rankings[interaction.MetricKey] += 1;
                }
            }

            return rankings;
        }

        private Dictionary<string, int> GetDefaultMetricImportanceRankings(string userRole)
        {
            // Default rankings based on user role
            switch (userRole?.ToLower())
            {
                case "admin":
                    return new Dictionary<string, int>
                    {
                        { "Revenue", 10 },
                        { "Registrations", 8 },
                        { "FTD", 9 },
                        { "Deposits", 7 },
                        { "Cashouts", 6 },
                        { "Bets", 5 },
                        { "Wins", 4 }
                    };
                case "marketing":
                    return new Dictionary<string, int>
                    {
                        { "Revenue", 8 },
                        { "Registrations", 10 },
                        { "FTD", 9 },
                        { "Deposits", 7 },
                        { "Cashouts", 5 },
                        { "Bets", 6 },
                        { "Wins", 4 }
                    };
                default:
                    return new Dictionary<string, int>
                    {
                        { "Revenue", 10 },
                        { "Registrations", 9 },
                        { "FTD", 8 },
                        { "Deposits", 7 },
                        { "Cashouts", 6 },
                        { "Bets", 5 },
                        { "Wins", 4 }
                    };
            }
        }

        /// <summary>
        /// Track user interaction with dashboard components
        /// </summary>
        public async Task TrackUserInteractionAsync(string userId, DashboardInteraction interaction)
        {
            try
            {
                if (interaction == null)
                {
                    throw new ArgumentNullException(nameof(interaction));
                }

                // Create a new entity
                var entity = new Infrastructure.Entities.UserInteraction
                {
                    UserId = int.TryParse(userId, out var userIdInt) ? userIdInt : 0,
                    ComponentId = interaction.ComponentId,
                    InteractionType = interaction.InteractionType,
                    MetricKey = interaction.MetricKey,
                    Timestamp = interaction.Timestamp,
                    AdditionalData = interaction.AdditionalData != null
                        ? System.Text.Json.JsonSerializer.Serialize(interaction.AdditionalData)
                        : null
                };

                // Add to database
                _dbContext.UserInteractions.Add(entity);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Tracked user interaction for user {UserId} with component {ComponentId}", userId, interaction.ComponentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking user interaction for user {UserId}", userId);
                throw;
            }
        }

        private async Task<List<Infrastructure.Entities.UserInteraction>> GetUserInteractionsAsync(string userId)
        {
            try
            {
                int userIdInt;
                if (!int.TryParse(userId, out userIdInt))
                {
                    _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                    userIdInt = 0;
                }

                // Get recent interactions (last 30 days)
                var cutoffDate = DateTime.UtcNow.AddDays(-30);
                return await _dbContext.UserInteractions
                    .Where(ui => ui.UserId == userIdInt && ui.Timestamp >= cutoffDate)
                    .OrderByDescending(ui => ui.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user interactions for user {UserId}", userId);
                return new List<Infrastructure.Entities.UserInteraction>();
            }
        }

        /// <summary>
        /// Get recommended dashboard components based on user behavior and role
        /// </summary>
        public async Task<List<DashboardComponentRecommendation>> GetRecommendedComponentsAsync(string userId, string userRole)
        {
            try
            {
                // For simplicity, we'll just generate recommendations on the fly without caching
                return await GenerateRecommendationsAsync(userId, userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting component recommendations for user {UserId}", userId);
                return new List<DashboardComponentRecommendation>();
            }
        }

        private async Task<List<DashboardComponentRecommendation>> GenerateRecommendationsAsync(string userId, string userRole)
        {
            // Get user preferences
            var preferences = await GetUserPreferencesAsync(userId);

            // Get metric importance rankings
            var metricRankings = await GetMetricImportanceRankingsAsync(userId, userRole);

            // Generate recommendations based on preferences and rankings
            var recommendations = new List<DashboardComponentRecommendation>();

            // Add recommendations for top metrics
            foreach (var metric in metricRankings.OrderByDescending(m => m.Value).Take(3))
            {
                recommendations.Add(new DashboardComponentRecommendation
                {
                    ComponentId = $"{metric.Key.ToLower()}-chart",
                    ComponentType = "Chart",
                    Title = $"{metric.Key} Trend",
                    Description = $"Shows the trend of {metric.Key.ToLower()} over time",
                    RelevanceScore = metric.Value / 10.0,
                    RecommendationReason = $"Based on your role and interaction history, {metric.Key.ToLower()} is an important metric for you",
                    RelatedMetrics = new List<string> { metric.Key },
                    TargetUserRole = userRole,
                    VisualizationType = GetRecommendedVisualizationType(metric.Key, preferences),
                    ConfigurationParams = new Dictionary<string, object>
                    {
                        { "metric", metric.Key },
                        { "timeRange", preferences.DefaultTimeRange },
                        { "granularity", preferences.DefaultDataGranularity }
                    }
                });
            }

            return recommendations;
        }

        private string GetRecommendedVisualizationType(string metricKey, DashboardPreferences preferences)
        {
            // Check if user has a preferred chart type for this metric
            if (preferences.PreferredChartTypes != null &&
                preferences.PreferredChartTypes.TryGetValue(metricKey.ToLower(), out var chartType))
            {
                return chartType;
            }

            // Default chart types based on metric
            switch (metricKey.ToLower())
            {
                case "revenue":
                case "deposits":
                case "cashouts":
                case "bets":
                case "wins":
                    return "line";
                case "registrations":
                case "ftd":
                    return "bar";
                default:
                    return "line";
            }
        }

        /// <summary>
        /// Get the most relevant insights for a specific user
        /// </summary>
        public async Task<List<DashboardInsight>> GetPersonalizedInsightsAsync(string userId, List<DashboardInsight> allInsights)
        {
            try
            {
                if (allInsights == null || allInsights.Count == 0)
                {
                    return new List<DashboardInsight>();
                }

                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);

                // Get metric importance rankings
                var metricRankings = await GetMetricImportanceRankingsAsync(userId, "default");

                // Filter and sort insights based on user preferences and metric rankings
                var personalizedInsights = allInsights
                    .Where(insight => insight.Importance >= preferences.InsightImportanceThreshold)
                    .ToList();

                // Adjust importance based on metric rankings
                foreach (var insight in personalizedInsights)
                {
                    if (!string.IsNullOrEmpty(insight.MetricKey) && metricRankings.TryGetValue(insight.MetricKey, out var importance))
                    {
                        insight.Importance = Math.Min(10, insight.Importance + (importance / 2));
                    }
                }

                // Sort by adjusted importance
                return personalizedInsights
                    .OrderByDescending(insight => insight.Importance)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error personalizing insights for user {UserId}", userId);
                return allInsights;
            }
        }

        /// <summary>
        /// Get user's preferred visualization types for different metrics
        /// </summary>
        public async Task<Dictionary<string, string>> GetPreferredVisualizationTypesAsync(string userId)
        {
            try
            {
                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);

                // Return preferred chart types or defaults
                return preferences.PreferredChartTypes ?? GetDefaultChartTypes();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting preferred visualization types for user {UserId}", userId);
                return GetDefaultChartTypes();
            }
        }

        /// <summary>
        /// Get user's information density preference (compact vs spacious)
        /// </summary>
        public async Task<string> GetUserDensityPreferenceAsync(string userId)
        {
            try
            {
                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);

                // Return information density or default
                return preferences.InformationDensity ?? "medium";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting density preference for user {UserId}", userId);
                return "medium";
            }
        }

        /// <summary>
        /// Get user's preferred color scheme
        /// </summary>
        public async Task<ColorSchemePreference> GetUserColorSchemeAsync(string userId)
        {
            try
            {
                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);

                // Return color scheme or default
                return preferences.ColorScheme ?? new ColorSchemePreference
                {
                    BaseTheme = "light",
                    ColorMode = "standard",
                    PrimaryColor = "#1976d2",
                    SecondaryColor = "#dc004e",
                    PositiveColor = "#4caf50",
                    NegativeColor = "#f44336",
                    NeutralColor = "#9e9e9e",
                    ContrastLevel = 1
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting color scheme for user {UserId}", userId);
                return new ColorSchemePreference
                {
                    BaseTheme = "light",
                    ColorMode = "standard",
                    PrimaryColor = "#1976d2",
                    SecondaryColor = "#dc004e",
                    PositiveColor = "#4caf50",
                    NegativeColor = "#f44336",
                    NeutralColor = "#9e9e9e",
                    ContrastLevel = 1
                };
            }
        }
    }
}
