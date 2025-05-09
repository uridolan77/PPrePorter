using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Mock implementation of IContextualExplanationService for development purposes
    /// </summary>
    public class MockContextualExplanationService : IContextualExplanationService
    {
        public Task<MetricExplanation> GetMetricExplanationAsync(string metricKey, string userRole, int experienceLevel)
        {
            // Return a simple explanation for mock implementation
            return Task.FromResult(new MetricExplanation
            {
                MetricKey = metricKey,
                Name = $"Explanation for {metricKey}",
                Description = "This is a mock explanation for development purposes.",
                Calculation = "No calculation available in mock implementation.",
                BusinessImpact = "No business impact available in mock implementation."
            });
        }

        public Task<Dictionary<string, MetricExplanation>> GetSummaryMetricExplanationsAsync(string userRole, int experienceLevel)
        {
            // Return a dictionary with a single explanation for mock implementation
            return Task.FromResult(new Dictionary<string, MetricExplanation>
            {
                ["revenue"] = new MetricExplanation
                {
                    MetricKey = "revenue",
                    Name = "Revenue Explanation",
                    Description = "This is a mock explanation for development purposes.",
                    Calculation = "No calculation available in mock implementation.",
                    BusinessImpact = "No business impact available in mock implementation."
                }
            });
        }

        public Task<string> GetInsightExplanationAsync(DashboardInsight insight, string userRole, int experienceLevel)
        {
            return Task.FromResult($"This is a mock explanation for the {insight.MetricKey} insight.");
        }

        public Task<string> GetAnomalyExplanationAsync(DataAnomaly anomaly, string userRole, int experienceLevel)
        {
            return Task.FromResult($"This is a mock explanation for the {anomaly.MetricKey} anomaly.");
        }

        public Task<string> GetBusinessImpactExplanationAsync(string metricKey, decimal currentValue, decimal previousValue, string userRole)
        {
            return Task.FromResult($"This is a mock business impact explanation for {metricKey}.");
        }

        public Task<Dictionary<string, string>> GetTerminologyExplanationsAsync(string userRole, int experienceLevel)
        {
            return Task.FromResult(new Dictionary<string, string>
            {
                ["GGR"] = "Gross Gaming Revenue",
                ["NGR"] = "Net Gaming Revenue",
                ["RTP"] = "Return to Player"
            });
        }
    }
}
