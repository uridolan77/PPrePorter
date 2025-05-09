using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Mock implementation of IDashboardPersonalizationService for development purposes
    /// </summary>
    public class MockDashboardPersonalizationService : IDashboardPersonalizationService
    {
        public Task<List<DashboardComponentRecommendation>> GetRecommendedComponentsAsync(string userId, string userRole)
        {
            // Return a list with a couple of recommendations for mock implementation
            return Task.FromResult(new List<DashboardComponentRecommendation>
            {
                new DashboardComponentRecommendation
                {
                    ComponentId = "revenue-chart",
                    ComponentType = "Chart",
                    Title = "Revenue Chart",
                    Description = "Shows revenue trends over time.",
                    RelevanceScore = 0.95,
                    RecommendationReason = "Based on your role and recent activity.",
                    TargetUserRole = userRole,
                    VisualizationType = "LineChart"
                },
                new DashboardComponentRecommendation
                {
                    ComponentId = "player-registrations",
                    ComponentType = "Chart",
                    Title = "Player Registrations",
                    Description = "Shows player registration trends.",
                    RelevanceScore = 0.85,
                    RecommendationReason = "Popular among users with similar roles.",
                    TargetUserRole = userRole,
                    VisualizationType = "BarChart"
                }
            });
        }

        public Task<DashboardPreferences> GetUserPreferencesAsync(string userId)
        {
            // Return mock preferences
            return Task.FromResult(new DashboardPreferences
            {
                UserId = userId,
                DefaultTimeRange = "Month",
                PinnedMetrics = new List<string> { "revenue", "registrations", "active-players" },
                ComponentVisibility = new Dictionary<string, bool>
                {
                    { "revenue-chart", true },
                    { "player-registrations", true },
                    { "top-games", true }
                },
                ColorScheme = new ColorSchemePreference
                {
                    UserId = userId,
                    BaseTheme = "Light",
                    ColorMode = "Standard"
                },
                InformationDensity = "Medium",
                PreferredChartTypes = new Dictionary<string, string>
                {
                    { "revenue", "LineChart" },
                    { "registrations", "BarChart" }
                },
                ShowInsights = true,
                ShowAnnotations = true,
                ShowAnomalies = true,
                ShowForecasts = true,
                DefaultDataGranularity = 30,
                InsightImportanceThreshold = 3,
                LastUpdated = DateTime.UtcNow
            });
        }

        public Task SaveUserPreferencesAsync(string userId, DashboardPreferences preferences)
        {
            // No-op for mock implementation
            return Task.CompletedTask;
        }

        public Task TrackUserInteractionAsync(string userId, DashboardInteraction interaction)
        {
            // No-op for mock implementation
            return Task.CompletedTask;
        }

        public Task<Dictionary<string, int>> GetMetricImportanceRankingsAsync(string userId, string userRole)
        {
            // Return mock metric importance rankings
            return Task.FromResult(new Dictionary<string, int>
            {
                ["revenue"] = 1,
                ["registrations"] = 2,
                ["active_players"] = 3,
                ["conversion_rate"] = 4
            });
        }

        public Task<List<DashboardInsight>> GetPersonalizedInsightsAsync(string userId, List<DashboardInsight> insights)
        {
            // Just return the same insights for mock implementation
            return Task.FromResult(insights);
        }

        public Task<Dictionary<string, string>> GetPreferredVisualizationTypesAsync(string userId)
        {
            // Return mock visualization preferences
            return Task.FromResult(new Dictionary<string, string>
            {
                ["revenue"] = "LineChart",
                ["registrations"] = "BarChart",
                ["active_players"] = "AreaChart",
                ["conversion_rate"] = "PieChart"
            });
        }

        public Task<ColorSchemePreference> GetUserColorSchemeAsync(string userId)
        {
            // Return mock color scheme preference
            return Task.FromResult(new ColorSchemePreference
            {
                UserId = userId,
                BaseTheme = "Light",
                ColorMode = "Standard",
                PrimaryColor = "#1976d2",
                SecondaryColor = "#dc004e",
                PositiveColor = "#4caf50",
                NegativeColor = "#f44336",
                NeutralColor = "#9e9e9e",
                ContrastLevel = 3,
                CategoryColors = new Dictionary<string, string>
                {
                    { "revenue", "#2196f3" },
                    { "registrations", "#4caf50" },
                    { "active-players", "#ff9800" }
                }
            });
        }

        public Task<string> GetUserDensityPreferenceAsync(string userId)
        {
            // Return mock density preference
            return Task.FromResult("medium");
        }
    }
}
