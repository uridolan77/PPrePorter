using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Implementation of IContextualExplanationService that provides contextual explanations for dashboard metrics and insights
    /// </summary>
    public class ContextualExplanationService : IContextualExplanationService
    {
        private readonly ICachingService _cachingService;
        private readonly ILogger<ContextualExplanationService> _logger;
        private readonly Dictionary<string, MetricExplanation> _metricExplanations;
        private readonly Dictionary<string, Dictionary<string, string>> _terminologyExplanations;

        /// <summary>
        /// Initializes a new instance of the <see cref="ContextualExplanationService"/> class
        /// </summary>
        /// <param name="cachingService">Caching service</param>
        /// <param name="logger">Logger</param>
        public ContextualExplanationService(
            ICachingService cachingService,
            ILogger<ContextualExplanationService> logger)
        {
            _cachingService = cachingService ?? throw new ArgumentNullException(nameof(cachingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Initialize metric explanations
            _metricExplanations = InitializeMetricExplanations();

            // Initialize terminology explanations
            _terminologyExplanations = InitializeTerminologyExplanations();
        }

        /// <summary>
        /// Get explanation for a specific metric based on user context
        /// </summary>
        /// <param name="metricKey">Metric key</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Metric explanation</returns>
        public async Task<MetricExplanation> GetMetricExplanationAsync(string metricKey, string userRole = null, int? experienceLevel = null)
        {
            try
            {
                var cacheKey = $"explanation:metric:{metricKey}:{userRole}:{experienceLevel}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await Task.FromResult(GetMetricExplanation(metricKey, userRole, experienceLevel)),
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for metric {MetricKey}", metricKey);
                return new MetricExplanation
                {
                    MetricKey = metricKey,
                    Name = metricKey,
                    Description = "Explanation not available."
                };
            }
        }

        /// <summary>
        /// Get explanations for all summary metrics on the dashboard
        /// </summary>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Dictionary of metric explanations</returns>
        public async Task<Dictionary<string, MetricExplanation>> GetSummaryMetricExplanationsAsync(string userRole = null, int? experienceLevel = null)
        {
            try
            {
                var cacheKey = $"explanation:summary-metrics:{userRole}:{experienceLevel}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        var summaryMetrics = new List<string>
                        {
                            "Revenue", "Registrations", "FTD", "Deposits", "Cashouts", "Bets", "Wins"
                        };

                        var explanations = new Dictionary<string, MetricExplanation>();
                        foreach (var metric in summaryMetrics)
                        {
                            explanations[metric] = GetMetricExplanation(metric, userRole, experienceLevel);
                        }

                        return explanations;
                    },
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting summary metric explanations");
                return new Dictionary<string, MetricExplanation>();
            }
        }

        /// <summary>
        /// Get contextual explanation for a specific insight
        /// </summary>
        /// <param name="insight">Dashboard insight</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Insight explanation</returns>
        public async Task<string> GetInsightExplanationAsync(DashboardInsight insight, string userRole = null, int? experienceLevel = null)
        {
            try
            {
                if (insight == null)
                    return "No insight provided.";

                var cacheKey = $"explanation:insight:{insight.Id}:{userRole}:{experienceLevel}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await Task.FromResult(GenerateInsightExplanation(insight, userRole, experienceLevel)),
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for insight {InsightId}", insight?.Id);
                return "Explanation not available.";
            }
        }

        /// <summary>
        /// Get explanation for why a specific anomaly is significant
        /// </summary>
        /// <param name="anomaly">Data anomaly</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Anomaly explanation</returns>
        public async Task<string> GetAnomalyExplanationAsync(DataAnomaly anomaly, string userRole = null, int? experienceLevel = null)
        {
            try
            {
                if (anomaly == null)
                    return "No anomaly provided.";

                var cacheKey = $"explanation:anomaly:{anomaly.MetricKey}:{anomaly.Date:yyyyMMdd}:{userRole}:{experienceLevel}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await Task.FromResult(GenerateAnomalyExplanation(anomaly, userRole, experienceLevel)),
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for anomaly {MetricKey} on {Date}", anomaly?.MetricKey, anomaly?.Date);
                return "Explanation not available.";
            }
        }

        /// <summary>
        /// Get business impact explanation for a metric or anomaly
        /// </summary>
        /// <param name="metricKey">Metric key</param>
        /// <param name="value">Metric value</param>
        /// <param name="change">Percentage change</param>
        /// <param name="userRole">User role</param>
        /// <returns>Business impact explanation</returns>
        public async Task<string> GetBusinessImpactExplanationAsync(string metricKey, decimal value, decimal change, string userRole = null)
        {
            try
            {
                var cacheKey = $"explanation:business-impact:{metricKey}:{value}:{change}:{userRole}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await Task.FromResult(GenerateBusinessImpactExplanation(metricKey, value, change, userRole)),
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business impact explanation for metric {MetricKey}", metricKey);
                return "Business impact explanation not available.";
            }
        }

        /// <summary>
        /// Get explanations for industry terminology used in the dashboard
        /// </summary>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Dictionary of terminology explanations</returns>
        public async Task<Dictionary<string, string>> GetTerminologyExplanationsAsync(string userRole = null, int? experienceLevel = null)
        {
            try
            {
                var cacheKey = $"explanation:terminology:{userRole}:{experienceLevel}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await Task.FromResult(GetTerminologyExplanations(userRole, experienceLevel)),
                    slidingExpiration: TimeSpan.FromHours(24),
                    absoluteExpiration: TimeSpan.FromDays(7));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting terminology explanations");
                return new Dictionary<string, string>();
            }
        }

        #region Helper Methods

        /// <summary>
        /// Initialize metric explanations
        /// </summary>
        /// <returns>Dictionary of metric explanations</returns>
        private Dictionary<string, MetricExplanation> InitializeMetricExplanations()
        {
            return new Dictionary<string, MetricExplanation>
            {
                ["Revenue"] = new MetricExplanation
                {
                    MetricKey = "Revenue",
                    Name = "Revenue",
                    Description = "Total revenue generated from all gaming activities.",
                    Calculation = "Sum of all bets minus sum of all wins.",
                    BusinessImpact = "Primary indicator of business performance and profitability.",
                    BestPractices = "Monitor daily and compare to historical trends. Investigate significant deviations.",
                    InterpretationGuidance = "Consider seasonal patterns and promotional activities when interpreting changes.",
                    RelatedMetrics = new List<string> { "Bets", "Wins", "GGR" },
                    RoleSpecificExplanations = new Dictionary<string, string>
                    {
                        ["Admin"] = "Comprehensive view of business performance across all segments.",
                        ["Manager"] = "Key performance indicator for your area of responsibility.",
                        ["Analyst"] = "Primary metric for trend analysis and forecasting."
                    },
                    ExperienceLevelExplanations = new Dictionary<int, string>
                    {
                        [1] = "The money the business earns after paying out winnings.",
                        [2] = "Net gaming revenue across all products and segments.",
                        [3] = "Gross gaming revenue calculated as the difference between wagers and payouts."
                    }
                },
                ["Registrations"] = new MetricExplanation
                {
                    MetricKey = "Registrations",
                    Name = "Player Registrations",
                    Description = "Number of new player accounts created.",
                    Calculation = "Count of new registrations within the selected time period.",
                    BusinessImpact = "Indicator of acquisition effectiveness and potential future revenue.",
                    BestPractices = "Track conversion from registration to first deposit (FTD).",
                    InterpretationGuidance = "Higher registrations should lead to higher FTDs and revenue if acquisition quality is maintained.",
                    RelatedMetrics = new List<string> { "FTD", "Registration to FTD Conversion Rate" },
                    RoleSpecificExplanations = new Dictionary<string, string>
                    {
                        ["Admin"] = "Measure of marketing and acquisition effectiveness.",
                        ["Manager"] = "Key indicator of growth potential in your segment.",
                        ["Analyst"] = "Leading indicator for future revenue trends."
                    },
                    ExperienceLevelExplanations = new Dictionary<int, string>
                    {
                        [1] = "The number of new players who signed up.",
                        [2] = "New account creations, a key acquisition metric.",
                        [3] = "Player acquisition volume, segmentable by source, platform, and demographics."
                    }
                },
                ["FTD"] = new MetricExplanation
                {
                    MetricKey = "FTD",
                    Name = "First Time Depositors",
                    Description = "Number of players who made their first deposit.",
                    Calculation = "Count of players who made their first deposit within the selected time period.",
                    BusinessImpact = "Critical conversion metric that indicates acquisition quality.",
                    BestPractices = "Analyze by acquisition source to optimize marketing spend.",
                    InterpretationGuidance = "FTD rate should be evaluated against cost of acquisition for ROI analysis.",
                    RelatedMetrics = new List<string> { "Registrations", "Deposits", "Cost Per Acquisition" },
                    RoleSpecificExplanations = new Dictionary<string, string>
                    {
                        ["Admin"] = "Key conversion metric for evaluating acquisition quality.",
                        ["Manager"] = "Important indicator of onboarding effectiveness.",
                        ["Analyst"] = "Critical metric for cohort analysis and LTV predictions."
                    },
                    ExperienceLevelExplanations = new Dictionary<int, string>
                    {
                        [1] = "New players who added money to their account for the first time.",
                        [2] = "First-time depositors, representing successful conversion of registrations.",
                        [3] = "Initial monetary conversion event in the player lifecycle, key for cohort analysis."
                    }
                }
                // Additional metrics would be added here
            };
        }

        /// <summary>
        /// Initialize terminology explanations
        /// </summary>
        /// <returns>Dictionary of terminology explanations</returns>
        private Dictionary<string, Dictionary<string, string>> InitializeTerminologyExplanations()
        {
            return new Dictionary<string, Dictionary<string, string>>
            {
                ["Default"] = new Dictionary<string, string>
                {
                    ["GGR"] = "Gross Gaming Revenue - The difference between wagers and payouts.",
                    ["NGR"] = "Net Gaming Revenue - GGR minus bonuses and promotional costs.",
                    ["LTV"] = "Lifetime Value - The predicted revenue a player will generate over their lifetime.",
                    ["CPA"] = "Cost Per Acquisition - The average cost to acquire a new player.",
                    ["Churn"] = "The rate at which players stop engaging with the platform.",
                    ["Conversion Rate"] = "The percentage of users who complete a desired action (e.g., registration to FTD)."
                }
            };
        }

        /// <summary>
        /// Get metric explanation
        /// </summary>
        /// <param name="metricKey">Metric key</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Metric explanation</returns>
        private MetricExplanation GetMetricExplanation(string metricKey, string userRole = null, int? experienceLevel = null)
        {
            // Get base explanation
            if (!_metricExplanations.TryGetValue(metricKey, out var explanation))
            {
                return new MetricExplanation
                {
                    MetricKey = metricKey,
                    Name = metricKey,
                    Description = "Explanation not available."
                };
            }

            // Create a copy to avoid modifying the original
            var result = new MetricExplanation
            {
                MetricKey = explanation.MetricKey,
                Name = explanation.Name,
                Description = explanation.Description,
                Calculation = explanation.Calculation,
                BusinessImpact = explanation.BusinessImpact,
                BestPractices = explanation.BestPractices,
                InterpretationGuidance = explanation.InterpretationGuidance,
                RelatedMetrics = explanation.RelatedMetrics?.ToList() ?? new List<string>(),
                RoleSpecificExplanations = explanation.RoleSpecificExplanations?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, string>(),
                ExperienceLevelExplanations = explanation.ExperienceLevelExplanations?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<int, string>()
            };

            // Add role-specific explanation if available
            if (!string.IsNullOrEmpty(userRole) && result.RoleSpecificExplanations.TryGetValue(userRole, out var roleExplanation))
            {
                result.Description += $" {roleExplanation}";
            }

            // Add experience level explanation if available
            if (experienceLevel.HasValue && experienceLevel.Value > 0 &&
                result.ExperienceLevelExplanations.TryGetValue(experienceLevel.Value, out var levelExplanation))
            {
                result.Description = levelExplanation;
            }

            return result;
        }

        /// <summary>
        /// Generate insight explanation
        /// </summary>
        /// <param name="insight">Dashboard insight</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Insight explanation</returns>
        private string GenerateInsightExplanation(DashboardInsight insight, string userRole = null, int? experienceLevel = null)
        {
            if (insight == null)
                return "No insight provided.";

            var explanation = $"This insight about {insight.MetricKey} is ";

            // Add importance context
            if (insight.Importance >= 8)
                explanation += "highly important and requires immediate attention. ";
            else if (insight.Importance >= 5)
                explanation += "moderately important and should be monitored. ";
            else
                explanation += "of lower importance but still noteworthy. ";

            // Add type-specific explanation
            switch (insight.InsightType)
            {
                case "Anomaly":
                    explanation += "It highlights an unusual pattern that deviates significantly from expected values. ";
                    break;
                case "Pattern":
                    explanation += "It identifies a recurring pattern or trend in the data. ";
                    break;
                case "Forecast":
                    explanation += "It provides a prediction of future performance based on historical data. ";
                    break;
                case "Correlation":
                    explanation += "It shows a relationship between different metrics that may be causally connected. ";
                    break;
                default:
                    explanation += "It provides information about the current state of this metric. ";
                    break;
            }

            // Add role-specific context
            if (!string.IsNullOrEmpty(userRole))
            {
                switch (userRole.ToLower())
                {
                    case "admin":
                        explanation += "As an administrator, you may want to consider strategic responses to this insight. ";
                        break;
                    case "manager":
                        explanation += "As a manager, you should evaluate how this affects your area of responsibility. ";
                        break;
                    case "analyst":
                        explanation += "As an analyst, you may want to investigate the underlying data further. ";
                        break;
                }
            }

            // Add experience level context
            if (experienceLevel.HasValue && experienceLevel.Value <= 1)
            {
                explanation += "The key takeaway is: " + insight.Description;
            }

            return explanation;
        }

        /// <summary>
        /// Generate anomaly explanation
        /// </summary>
        /// <param name="anomaly">Data anomaly</param>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Anomaly explanation</returns>
        private string GenerateAnomalyExplanation(DataAnomaly anomaly, string userRole = null, int? experienceLevel = null)
        {
            if (anomaly == null)
                return "No anomaly provided.";

            var explanation = $"This anomaly in {anomaly.MetricKey} shows a {anomaly.DeviationPercentage:F1}% deviation from expected values. ";

            // Add severity context
            if (anomaly.Severity >= 8)
                explanation += "This is a major deviation that requires immediate attention. ";
            else if (anomaly.Severity >= 5)
                explanation += "This is a significant deviation that should be investigated. ";
            else
                explanation += "This is a minor deviation that should be monitored. ";

            // Add possible causes
            if (anomaly.PossibleCauses?.Any() == true)
            {
                explanation += "Possible causes include: " + string.Join(", ", anomaly.PossibleCauses) + ". ";
            }

            // Add recommended actions
            if (anomaly.RecommendedActions?.Any() == true)
            {
                explanation += "Recommended actions: " + string.Join(", ", anomaly.RecommendedActions) + ". ";
            }

            // Add role-specific context
            if (!string.IsNullOrEmpty(userRole))
            {
                switch (userRole.ToLower())
                {
                    case "admin":
                        explanation += "As an administrator, you should evaluate the business impact of this anomaly. ";
                        break;
                    case "manager":
                        explanation += "As a manager, you should coordinate a response to address this anomaly. ";
                        break;
                    case "analyst":
                        explanation += "As an analyst, you should perform a detailed analysis to understand the root cause. ";
                        break;
                }
            }

            return explanation;
        }

        /// <summary>
        /// Generate business impact explanation
        /// </summary>
        /// <param name="metricKey">Metric key</param>
        /// <param name="value">Metric value</param>
        /// <param name="change">Percentage change</param>
        /// <param name="userRole">User role</param>
        /// <returns>Business impact explanation</returns>
        private string GenerateBusinessImpactExplanation(string metricKey, decimal value, decimal change, string userRole = null)
        {
            var explanation = "";

            switch (metricKey)
            {
                case "Revenue":
                    explanation = change >= 0
                        ? $"The {change:F1}% increase in revenue positively impacts overall profitability. "
                        : $"The {Math.Abs(change):F1}% decrease in revenue negatively impacts overall profitability. ";

                    explanation += "Revenue is a direct indicator of business performance. ";

                    if (Math.Abs(change) > 10)
                        explanation += "This significant change should be investigated to understand the driving factors. ";
                    break;

                case "Registrations":
                    explanation = change >= 0
                        ? $"The {change:F1}% increase in registrations indicates growing acquisition effectiveness. "
                        : $"The {Math.Abs(change):F1}% decrease in registrations indicates potential issues with acquisition channels. ";

                    explanation += "Registrations are a leading indicator of future revenue potential. ";

                    if (Math.Abs(change) > 20)
                        explanation += "This significant change should be correlated with marketing activities and external factors. ";
                    break;

                case "FTD":
                    explanation = change >= 0
                        ? $"The {change:F1}% increase in first time depositors indicates improving conversion quality. "
                        : $"The {Math.Abs(change):F1}% decrease in first time depositors indicates potential issues with onboarding or trust. ";

                    explanation += "FTD is a critical conversion metric that directly impacts revenue. ";

                    if (Math.Abs(change) > 15)
                        explanation += "This significant change should be analyzed in relation to registration quality and onboarding processes. ";
                    break;

                default:
                    explanation = $"The {Math.Abs(change):F1}% {(change >= 0 ? "increase" : "decrease")} in {metricKey} has business implications that should be analyzed. ";
                    break;
            }

            // Add role-specific context
            if (!string.IsNullOrEmpty(userRole))
            {
                switch (userRole.ToLower())
                {
                    case "admin":
                        explanation += "Consider the strategic implications for overall business performance. ";
                        break;
                    case "manager":
                        explanation += "Evaluate how this impacts your department's KPIs and objectives. ";
                        break;
                    case "analyst":
                        explanation += "Analyze correlations with other metrics to identify potential causality. ";
                        break;
                }
            }

            return explanation;
        }

        /// <summary>
        /// Get terminology explanations
        /// </summary>
        /// <param name="userRole">User role</param>
        /// <param name="experienceLevel">Experience level</param>
        /// <returns>Dictionary of terminology explanations</returns>
        private Dictionary<string, string> GetTerminologyExplanations(string userRole = null, int? experienceLevel = null)
        {
            // Get default explanations
            var explanations = new Dictionary<string, string>(_terminologyExplanations["Default"]);

            // Add role-specific explanations if available
            if (!string.IsNullOrEmpty(userRole) && _terminologyExplanations.TryGetValue(userRole, out var roleExplanations))
            {
                foreach (var kvp in roleExplanations)
                {
                    explanations[kvp.Key] = kvp.Value;
                }
            }

            // Simplify explanations for beginners
            if (experienceLevel.HasValue && experienceLevel.Value <= 1)
            {
                if (explanations.ContainsKey("GGR"))
                    explanations["GGR"] = "The money the business earns from bets after paying out winnings.";

                if (explanations.ContainsKey("LTV"))
                    explanations["LTV"] = "How much money a player is expected to spend over time.";

                if (explanations.ContainsKey("Churn"))
                    explanations["Churn"] = "When players stop using the platform.";
            }

            return explanations;
        }

        #endregion
    }
}
