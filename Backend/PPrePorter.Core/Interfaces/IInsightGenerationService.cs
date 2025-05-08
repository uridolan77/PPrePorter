using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Service for generating narrative insights from dashboard data
    /// </summary>
    public interface IInsightGenerationService
    {
        /// <summary>
        /// Generate key insights about dashboard summary statistics
        /// </summary>
        Task<List<DashboardInsight>> GenerateSummaryInsightsAsync(DashboardSummary summary);
        
        /// <summary>
        /// Generate insights about revenue trends
        /// </summary>
        Task<List<DashboardInsight>> GenerateRevenueInsightsAsync(List<CasinoRevenueItem> revenueData);
        
        /// <summary>
        /// Generate insights about player registration patterns
        /// </summary>
        Task<List<DashboardInsight>> GenerateRegistrationInsightsAsync(List<PlayerRegistrationItem> registrationData);
        
        /// <summary>
        /// Generate insights about top performing games
        /// </summary>
        Task<List<DashboardInsight>> GenerateTopGamesInsightsAsync(List<TopGameItem> topGames);
        
        /// <summary>
        /// Generate insights about transaction patterns
        /// </summary>
        Task<List<DashboardInsight>> GenerateTransactionInsightsAsync(List<RecentTransactionItem> transactions);
        
        /// <summary>
        /// Generate comprehensive dashboard story with insights from all sections
        /// </summary>
        Task<DashboardStory> GenerateDashboardStoryAsync(DashboardData dashboardData);
    }
}