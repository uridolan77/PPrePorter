using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Service for providing contextual explanations of dashboard metrics and insights
    /// </summary>
    public interface IContextualExplanationService
    {
        /// <summary>
        /// Get explanation for a specific metric based on user context
        /// </summary>
        Task<MetricExplanation> GetMetricExplanationAsync(string metricKey, string userRole, int experienceLevel);
        
        /// <summary>
        /// Get explanations for all summary metrics on the dashboard
        /// </summary>
        Task<Dictionary<string, MetricExplanation>> GetSummaryMetricExplanationsAsync(string userRole, int experienceLevel);
        
        /// <summary>
        /// Get contextual explanation for a specific insight
        /// </summary>
        Task<string> GetInsightExplanationAsync(DashboardInsight insight, string userRole, int experienceLevel);
        
        /// <summary>
        /// Get explanation for why a specific anomaly is significant
        /// </summary>
        Task<string> GetAnomalyExplanationAsync(DataAnomaly anomaly, string userRole, int experienceLevel);
        
        /// <summary>
        /// Get business impact explanation for a metric or anomaly
        /// </summary>
        Task<string> GetBusinessImpactExplanationAsync(string metricKey, decimal value, decimal change, string userRole);
        
        /// <summary>
        /// Get explanations for industry terminology used in the dashboard
        /// </summary>
        Task<Dictionary<string, string>> GetTerminologyExplanationsAsync(string userRole, int experienceLevel);
    }
}