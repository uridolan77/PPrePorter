using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Mock implementation of IAnomalyDetectionService for development purposes
    /// </summary>
    public class MockAnomalyDetectionService : IAnomalyDetectionService
    {
        public Task<List<DataAnomaly>> DetectGamePerformanceAnomaliesAsync(List<TopGameItem> topGames)
        {
            // Return empty list for mock implementation
            return Task.FromResult(new List<DataAnomaly>());
        }

        public Task<List<DataAnomaly>> DetectRegistrationAnomaliesAsync(List<PlayerRegistrationItem> registrationData)
        {
            // Return empty list for mock implementation
            return Task.FromResult(new List<DataAnomaly>());
        }

        public Task<List<DataAnomaly>> DetectRevenueAnomaliesAsync(List<CasinoRevenueItem> revenueData)
        {
            // Return empty list for mock implementation
            return Task.FromResult(new List<DataAnomaly>());
        }

        public Task<List<DataAnomaly>> DetectTransactionAnomaliesAsync(List<RecentTransactionItem> transactions)
        {
            // Return empty list for mock implementation
            return Task.FromResult(new List<DataAnomaly>());
        }

        public Task<List<DataAnomaly>> DetectSummaryAnomaliesAsync(DashboardSummary summary)
        {
            // Return empty list for mock implementation
            return Task.FromResult(new List<DataAnomaly>());
        }
    }
}
