using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Service for detecting anomalies in dashboard data
    /// </summary>
    public interface IAnomalyDetectionService
    {
        /// <summary>
        /// Detect anomalies in revenue data
        /// </summary>
        Task<List<DataAnomaly>> DetectRevenueAnomaliesAsync(List<CasinoRevenueItem> revenueData);
        
        /// <summary>
        /// Detect anomalies in player registration data
        /// </summary>
        Task<List<DataAnomaly>> DetectRegistrationAnomaliesAsync(List<PlayerRegistrationItem> registrationData);
        
        /// <summary>
        /// Detect anomalies in top games performance
        /// </summary>
        Task<List<DataAnomaly>> DetectGamePerformanceAnomaliesAsync(List<TopGameItem> gameData);
        
        /// <summary>
        /// Detect anomalies in transaction data
        /// </summary>
        Task<List<DataAnomaly>> DetectTransactionAnomaliesAsync(List<RecentTransactionItem> transactionData);
        
        /// <summary>
        /// Analyze dashboard summary for significant deviations
        /// </summary>
        Task<List<DataAnomaly>> DetectSummaryAnomaliesAsync(DashboardSummary summary);
    }
}