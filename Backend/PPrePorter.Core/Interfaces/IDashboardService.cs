using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummary> GetDashboardSummaryAsync(DashboardRequest request);
        Task<List<CasinoRevenueItem>> GetCasinoRevenueChartDataAsync(DashboardRequest request);
        Task<List<PlayerRegistrationItem>> GetPlayerRegistrationsChartDataAsync(DashboardRequest request);
        Task<List<TopGameItem>> GetTopGamesDataAsync(DashboardRequest request);
        Task<List<RecentTransactionItem>> GetRecentTransactionsAsync(DashboardRequest request);
        Task<ContextualDataExplorerResult> GetContextualDataExplorerResultAsync(ContextualDataExplorerRequest request);
    }
}