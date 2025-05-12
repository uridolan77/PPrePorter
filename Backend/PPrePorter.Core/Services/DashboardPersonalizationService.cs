using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using Dashboard = PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Implementation of IDashboardPersonalizationService that personalizes the dashboard experience
    /// </summary>
    public class DashboardPersonalizationService : IDashboardPersonalizationService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DashboardPersonalizationService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardPersonalizationService"/> class
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="cachingService">Caching service</param>
        /// <param name="logger">Logger</param>
        public DashboardPersonalizationService(
            IPPRePorterDbContext dbContext,
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
        /// <param name="userId">User ID</param>
        /// <returns>Dashboard preferences</returns>
        public async Task<DashboardPreferences> GetUserPreferencesAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                var cacheKey = $"dashboard:preferences:{userId}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Get user preferences from database
                        var userPreference = await _dbContext.UserPreferences
                            .AsNoTracking()
                            .FirstOrDefaultAsync(p => p.UserId.ToString() == userId && p.PreferenceType == "DashboardPreferences");

                        if (userPreference == null)
                        {
                            // Return default preferences
                            return GetDefaultDashboardPreferences(userId);
                        }

                        // Deserialize preferences
                        var preferences = System.Text.Json.JsonSerializer.Deserialize<DashboardPreferences>(userPreference.PreferenceValue);
                        preferences.UserId = userId;

                        return preferences;
                    },
                    slidingExpiration: TimeSpan.FromMinutes(30),
                    absoluteExpiration: TimeSpan.FromHours(24));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard preferences for user {UserId}", userId);
                return GetDefaultDashboardPreferences(userId);
            }
        }

        /// <summary>
        /// Save user's dashboard preferences
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="preferences">Dashboard preferences</param>
        public async Task SaveUserPreferencesAsync(string userId, DashboardPreferences preferences)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                if (preferences == null)
                    throw new ArgumentNullException(nameof(preferences));

                // Set user ID
                preferences.UserId = userId;

                // Serialize preferences
                var preferencesJson = System.Text.Json.JsonSerializer.Serialize(preferences);

                // Get existing preferences
                var userPreference = await _dbContext.UserPreferences
                    .FirstOrDefaultAsync(p => p.UserId.ToString() == userId && p.PreferenceType == "DashboardPreferences");

                if (userPreference == null)
                {
                    // Create new preferences
                    userPreference = new Domain.Entities.PPReporter.UserPreference
                    {
                        UserId = int.TryParse(userId, out var userIdInt) ? userIdInt : 0,
                        PreferenceType = "DashboardPreferences",
                        PreferenceValue = preferencesJson,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _dbContext.UserPreferences.Add(userPreference);
                }
                else
                {
                    // Update existing preferences
                    userPreference.PreferenceValue = preferencesJson;
                    userPreference.UpdatedAt = DateTime.UtcNow;
                }

                // Save changes
                await _dbContext.SaveChangesAsync();

                // Invalidate cache
                await _cachingService.RemoveAsync($"dashboard:preferences:{userId}");

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
        /// <param name="userId">User ID</param>
        /// <param name="userRole">User role</param>
        /// <returns>Dictionary of metric importance rankings</returns>
        public async Task<Dictionary<string, int>> GetMetricImportanceRankingsAsync(string userId, string userRole)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                var cacheKey = $"dashboard:metric-rankings:{userId}:{userRole}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Get user interactions
                        var interactions = await _dbContext.UserInteractions
                            .AsNoTracking()
                            .Where(i => i.UserId.ToString() == userId && !string.IsNullOrEmpty(i.MetricKey))
                            .ToListAsync();

                        // Calculate importance based on interaction frequency
                        var metricCounts = interactions
                            .GroupBy(i => i.MetricKey)
                            .ToDictionary(
                                g => g.Key,
                                g => g.Count()
                            );

                        // Combine with role-based defaults
                        var roleDefaults = GetRoleBasedMetricImportance(userRole);
                        var result = new Dictionary<string, int>();

                        // Add all metrics from both sources
                        foreach (var metric in metricCounts.Keys.Union(roleDefaults.Keys))
                        {
                            int interactionScore = metricCounts.TryGetValue(metric, out var count) ? count : 0;
                            int roleScore = roleDefaults.TryGetValue(metric, out var importance) ? importance : 5;

                            // Weighted combination (70% role-based, 30% interaction-based)
                            result[metric] = (int)Math.Round(roleScore * 0.7 + Math.Min(interactionScore, 10) * 0.3);
                        }

                        return result;
                    },
                    slidingExpiration: TimeSpan.FromHours(1),
                    absoluteExpiration: TimeSpan.FromDays(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting metric importance rankings for user {UserId}", userId);
                return GetRoleBasedMetricImportance(userRole);
            }
        }

        /// <summary>
        /// Track user interaction with dashboard components
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="interaction">Dashboard interaction</param>
        public async Task TrackUserInteractionAsync(string userId, DashboardInteraction interaction)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                if (interaction == null)
                    throw new ArgumentNullException(nameof(interaction));

                // Set user ID and timestamp if not set
                interaction.UserId = userId;
                if (interaction.Timestamp == default)
                    interaction.Timestamp = DateTime.UtcNow;

                // Create entity
                var entity = new Dashboard.UserInteraction
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
                _dbContext.UserInteractions.Add((Dashboard.UserInteraction)entity);
                await _dbContext.SaveChangesAsync();

                // Invalidate caches
                await _cachingService.RemoveAsync($"dashboard:metric-rankings:{userId}");
                await _cachingService.RemoveAsync($"dashboard:recommended-components:{userId}");
                await _cachingService.RemoveAsync($"dashboard:visualization-types:{userId}");

                _logger.LogInformation("Tracked dashboard interaction for user {UserId} with component {ComponentId}", userId, interaction.ComponentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking dashboard interaction for user {UserId}", userId);
                // Don't throw - this is a non-critical operation
            }
        }

        /// <summary>
        /// Get recommended dashboard components based on user behavior and role
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="userRole">User role</param>
        /// <returns>List of dashboard component recommendations</returns>
        public async Task<List<DashboardComponentRecommendation>> GetRecommendedComponentsAsync(string userId, string userRole)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                var cacheKey = $"dashboard:recommended-components:{userId}:{userRole}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Get metric importance rankings
                        var metricRankings = await GetMetricImportanceRankingsAsync(userId, userRole);

                        // Get user interactions
                        var interactions = await _dbContext.UserInteractions
                            .AsNoTracking()
                            .Where(i => i.UserId.ToString() == userId)
                            .OrderByDescending(i => i.Timestamp)
                            .Take(100)
                            .ToListAsync();

                        // Calculate component scores based on interaction frequency and recency
                        var componentScores = CalculateComponentScores(interactions, metricRankings);

                        // Create recommendations
                        var recommendations = new List<DashboardComponentRecommendation>();
                        foreach (var kvp in componentScores.OrderByDescending(kvp => kvp.Value))
                        {
                            recommendations.Add(new DashboardComponentRecommendation
                            {
                                ComponentId = kvp.Key,
                                Score = kvp.Value,
                                RecommendationReason = GetRecommendationReason(kvp.Key, interactions, metricRankings)
                            });
                        }

                        return recommendations.Take(10).ToList();
                    },
                    slidingExpiration: TimeSpan.FromHours(1),
                    absoluteExpiration: TimeSpan.FromDays(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended components for user {UserId}", userId);
                return new List<DashboardComponentRecommendation>();
            }
        }

        /// <summary>
        /// Get the most relevant insights for a specific user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="allInsights">All available insights</param>
        /// <returns>List of personalized insights</returns>
        public async Task<List<DashboardInsight>> GetPersonalizedInsightsAsync(string userId, List<DashboardInsight> allInsights)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                if (allInsights == null || allInsights.Count == 0)
                    return new List<DashboardInsight>();

                // Get metric importance rankings
                var metricRankings = await GetMetricImportanceRankingsAsync(userId, null);

                // Score insights based on metric importance and insight importance
                var scoredInsights = allInsights.Select(insight =>
                {
                    int metricImportance = metricRankings.TryGetValue(insight.MetricKey, out var importance) ? importance : 5;
                    double score = insight.Importance * 0.7 + metricImportance * 0.3;
                    return new { Insight = insight, Score = score };
                }).ToList();

                // Return top insights
                return scoredInsights
                    .OrderByDescending(si => si.Score)
                    .Select(si => si.Insight)
                    .Take(5)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personalized insights for user {UserId}", userId);
                return allInsights?.OrderByDescending(i => i.Importance).Take(5).ToList() ?? new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Get user's preferred visualization types for different metrics
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Dictionary of preferred visualization types</returns>
        public async Task<Dictionary<string, string>> GetPreferredVisualizationTypesAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                var cacheKey = $"dashboard:visualization-types:{userId}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Get user preferences
                        var preferences = await GetUserPreferencesAsync(userId);
                        if (preferences?.PreferredChartTypes != null)
                            return preferences.PreferredChartTypes;

                        // Get user interactions
                        var interactions = await _dbContext.UserInteractions
                            .AsNoTracking()
                            .Where(i => i.UserId.ToString() == userId && i.InteractionType == "ChartTypeChange")
                            .OrderByDescending(i => i.Timestamp)
                            .ToListAsync();

                        // Get most recent chart type selection for each metric
                        var preferredTypes = new Dictionary<string, string>();
                        foreach (var interaction in interactions)
                        {
                            if (!string.IsNullOrEmpty(interaction.MetricKey) && interaction.AdditionalData != null)
                            {
                                try
                                {
                                    var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(interaction.AdditionalData);
                                    if (data != null && data.TryGetValue("ChartType", out var chartType))
                                    {
                                        preferredTypes[interaction.MetricKey] = chartType;
                                    }
                                }
                                catch
                                {
                                    // Ignore deserialization errors
                                }
                            }
                        }

                        // Add defaults for common metrics if not present
                        if (!preferredTypes.ContainsKey("Revenue"))
                            preferredTypes["Revenue"] = "LineChart";
                        if (!preferredTypes.ContainsKey("Registrations"))
                            preferredTypes["Registrations"] = "BarChart";
                        if (!preferredTypes.ContainsKey("FTD"))
                            preferredTypes["FTD"] = "BarChart";

                        return preferredTypes;
                    },
                    slidingExpiration: TimeSpan.FromHours(1),
                    absoluteExpiration: TimeSpan.FromDays(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting preferred visualization types for user {UserId}", userId);
                return new Dictionary<string, string>
                {
                    ["Revenue"] = "LineChart",
                    ["Registrations"] = "BarChart",
                    ["FTD"] = "BarChart"
                };
            }
        }

        /// <summary>
        /// Get user's information density preference (compact vs spacious)
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Density preference</returns>
        public async Task<string> GetUserDensityPreferenceAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);
                return preferences?.InformationDensity ?? "Medium";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting density preference for user {UserId}", userId);
                return "Medium";
            }
        }

        /// <summary>
        /// Get user's preferred color scheme
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Color scheme preference</returns>
        public async Task<ColorSchemePreference> GetUserColorSchemeAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

                // Get user preferences
                var preferences = await GetUserPreferencesAsync(userId);
                return preferences?.ColorScheme ?? new ColorSchemePreference
                {
                    Mode = "Light",
                    PrimaryColor = "#1976D2",
                    SecondaryColor = "#424242",
                    AccentColor = "#82B1FF"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting color scheme for user {UserId}", userId);
                return new ColorSchemePreference
                {
                    Mode = "Light",
                    PrimaryColor = "#1976D2",
                    SecondaryColor = "#424242",
                    AccentColor = "#82B1FF"
                };
            }
        }

        #region Helper Methods

        /// <summary>
        /// Get default dashboard preferences
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Default dashboard preferences</returns>
        private DashboardPreferences GetDefaultDashboardPreferences(string userId)
        {
            return new DashboardPreferences
            {
                UserId = userId,
                ColorScheme = new ColorSchemePreference
                {
                    Mode = "Light",
                    PrimaryColor = "#1976D2",
                    SecondaryColor = "#424242",
                    AccentColor = "#82B1FF"
                },
                InformationDensity = "Medium",
                PreferredChartTypes = new Dictionary<string, string>
                {
                    ["Revenue"] = "LineChart",
                    ["Registrations"] = "BarChart",
                    ["FTD"] = "BarChart",
                    ["Deposits"] = "LineChart",
                    ["Cashouts"] = "LineChart",
                    ["Bets"] = "LineChart",
                    ["Wins"] = "LineChart"
                },
                PinnedMetrics = new List<string> { "Revenue", "Registrations", "FTD" },
                ShowAnnotations = true,
                ShowInsights = true,
                ShowAnomalies = true,
                ShowForecasts = true
            };
        }

        /// <summary>
        /// Get role-based metric importance
        /// </summary>
        /// <param name="userRole">User role</param>
        /// <returns>Dictionary of metric importance</returns>
        private Dictionary<string, int> GetRoleBasedMetricImportance(string userRole)
        {
            var defaultImportance = new Dictionary<string, int>
            {
                ["Revenue"] = 10,
                ["Registrations"] = 8,
                ["FTD"] = 9,
                ["Deposits"] = 7,
                ["Cashouts"] = 6,
                ["Bets"] = 5,
                ["Wins"] = 5
            };

            if (string.IsNullOrEmpty(userRole))
                return defaultImportance;

            switch (userRole.ToLower())
            {
                case "admin":
                    return new Dictionary<string, int>
                    {
                        ["Revenue"] = 10,
                        ["Registrations"] = 8,
                        ["FTD"] = 9,
                        ["Deposits"] = 7,
                        ["Cashouts"] = 6,
                        ["Bets"] = 5,
                        ["Wins"] = 5
                    };
                case "marketing":
                    return new Dictionary<string, int>
                    {
                        ["Revenue"] = 8,
                        ["Registrations"] = 10,
                        ["FTD"] = 10,
                        ["Deposits"] = 7,
                        ["Cashouts"] = 5,
                        ["Bets"] = 4,
                        ["Wins"] = 4
                    };
                case "finance":
                    return new Dictionary<string, int>
                    {
                        ["Revenue"] = 10,
                        ["Registrations"] = 6,
                        ["FTD"] = 7,
                        ["Deposits"] = 9,
                        ["Cashouts"] = 9,
                        ["Bets"] = 8,
                        ["Wins"] = 8
                    };
                default:
                    return defaultImportance;
            }
        }

        /// <summary>
        /// Calculate component scores based on interactions
        /// </summary>
        /// <param name="interactions">User interactions</param>
        /// <param name="metricRankings">Metric importance rankings</param>
        /// <returns>Dictionary of component scores</returns>
        private Dictionary<string, double> CalculateComponentScores(List<Dashboard.UserInteraction> interactions, Dictionary<string, int> metricRankings)
        {
            var componentScores = new Dictionary<string, double>();
            var now = DateTime.UtcNow;

            foreach (var interaction in interactions)
            {
                if (string.IsNullOrEmpty(interaction.ComponentId))
                    continue;

                // Calculate recency score (higher for more recent interactions)
                var daysSinceInteraction = (now - interaction.Timestamp).TotalDays;
                var recencyScore = Math.Max(0, 1 - (daysSinceInteraction / 30)); // Decay over 30 days

                // Calculate metric importance score
                var metricScore = 0.5; // Default score
                if (!string.IsNullOrEmpty(interaction.MetricKey) && metricRankings.TryGetValue(interaction.MetricKey, out var importance))
                {
                    metricScore = importance / 10.0; // Normalize to 0-1 range
                }

                // Calculate interaction type score
                var typeScore = GetInteractionTypeScore(interaction.InteractionType);

                // Combine scores
                var score = recencyScore * 0.4 + metricScore * 0.4 + typeScore * 0.2;

                // Add to component scores
                if (!componentScores.ContainsKey(interaction.ComponentId))
                    componentScores[interaction.ComponentId] = 0;

                componentScores[interaction.ComponentId] += score;
            }

            return componentScores;
        }

        /// <summary>
        /// Get score for interaction type
        /// </summary>
        /// <param name="interactionType">Interaction type</param>
        /// <returns>Interaction type score</returns>
        private double GetInteractionTypeScore(string interactionType)
        {
            if (string.IsNullOrEmpty(interactionType))
                return 0.5;

            switch (interactionType.ToLower())
            {
                case "view":
                    return 0.5;
                case "click":
                    return 0.6;
                case "drill":
                    return 0.7;
                case "filter":
                    return 0.8;
                case "export":
                    return 0.9;
                case "pin":
                    return 1.0;
                default:
                    return 0.5;
            }
        }

        /// <summary>
        /// Get recommendation reason
        /// </summary>
        /// <param name="componentId">Component ID</param>
        /// <param name="interactions">User interactions</param>
        /// <param name="metricRankings">Metric importance rankings</param>
        /// <returns>Recommendation reason</returns>
        private string GetRecommendationReason(string componentId, List<Dashboard.UserInteraction> interactions, Dictionary<string, int> metricRankings)
        {
            // Get interactions with this component
            var componentInteractions = interactions.Where(i => i.ComponentId == componentId).ToList();
            if (componentInteractions.Count == 0)
                return "Based on your role and preferences";

            // Check if frequently used
            if (componentInteractions.Count > 5)
                return "Frequently used by you";

            // Check if recently used
            var mostRecent = componentInteractions.OrderByDescending(i => i.Timestamp).FirstOrDefault();
            if (mostRecent != null && (DateTime.UtcNow - mostRecent.Timestamp).TotalDays < 7)
                return "Recently viewed by you";

            // Check if contains important metrics
            var metrics = componentInteractions
                .Where(i => !string.IsNullOrEmpty(i.MetricKey))
                .Select(i => i.MetricKey)
                .Distinct()
                .ToList();

            var importantMetrics = metrics
                .Where(m => metricRankings.TryGetValue(m, out var importance) && importance >= 8)
                .ToList();

            if (importantMetrics.Any())
                return $"Contains metrics important to you: {string.Join(", ", importantMetrics)}";

            return "Matches your usage patterns";
        }

        #endregion
    }
}
