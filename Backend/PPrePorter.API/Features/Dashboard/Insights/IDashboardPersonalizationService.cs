using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Service for personalizing the dashboard experience
    /// </summary>
    public interface IDashboardPersonalizationService
    {
        /// <summary>
        /// Get user's dashboard preferences
        /// </summary>
        Task<DashboardPreferences> GetUserPreferencesAsync(string userId);

        /// <summary>
        /// Save user's dashboard preferences
        /// </summary>
        Task SaveUserPreferencesAsync(string userId, DashboardPreferences preferences);

        /// <summary>
        /// Get personalized metric importance rankings for a user
        /// </summary>
        Task<Dictionary<string, int>> GetMetricImportanceRankingsAsync(string userId, string userRole);

        /// <summary>
        /// Track user interaction with dashboard components
        /// </summary>
        Task TrackUserInteractionAsync(string userId, DashboardInteraction interaction);

        /// <summary>
        /// Get recommended dashboard components based on user behavior and role
        /// </summary>
        Task<List<DashboardComponentRecommendation>> GetRecommendedComponentsAsync(string userId, string userRole);

        /// <summary>
        /// Get the most relevant insights for a specific user
        /// </summary>
        Task<List<DashboardInsight>> GetPersonalizedInsightsAsync(string userId, List<DashboardInsight> allInsights);

        /// <summary>
        /// Get user's preferred visualization types for different metrics
        /// </summary>
        Task<Dictionary<string, string>> GetPreferredVisualizationTypesAsync(string userId);
    }
}
