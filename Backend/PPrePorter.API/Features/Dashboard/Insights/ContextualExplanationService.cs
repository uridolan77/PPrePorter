using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Implementation of IContextualExplanationService that provides explanations for dashboard metrics and insights
    /// </summary>
    public class ContextualExplanationService : IContextualExplanationService
    {
        private readonly ILogger<ContextualExplanationService> _logger;

        public ContextualExplanationService(ILogger<ContextualExplanationService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get explanation for a specific metric based on user context
        /// </summary>
        public async Task<MetricExplanation> GetMetricExplanationAsync(string metricKey, string userRole, int experienceLevel)
        {
            try
            {
                var explanation = new MetricExplanation
                {
                    MetricKey = metricKey,
                    Name = metricKey,
                    Description = GetShortDescription(metricKey),
                    BusinessImpact = GetBusinessContext(metricKey, userRole),
                    RelatedMetrics = GetRelatedMetrics(metricKey),
                    InterpretationGuidance = GetDetailedDescription(metricKey, experienceLevel),
                    RoleSpecificExplanations = new Dictionary<string, string>
                    {
                        { userRole, GetBusinessContext(metricKey, userRole) }
                    },
                    ExperienceLevelExplanations = new Dictionary<int, string>
                    {
                        { experienceLevel, GetDetailedDescription(metricKey, experienceLevel) }
                    }
                };

                return explanation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for metric {MetricKey}", metricKey);
                return new MetricExplanation
                {
                    MetricKey = metricKey,
                    Name = metricKey,
                    Description = $"Explanation for {metricKey} is not available."
                };
            }
        }

        /// <summary>
        /// Get explanations for all summary metrics on the dashboard
        /// </summary>
        public async Task<Dictionary<string, MetricExplanation>> GetSummaryMetricExplanationsAsync(string userRole, int experienceLevel)
        {
            try
            {
                var explanations = new Dictionary<string, MetricExplanation>();

                // Add explanations for common summary metrics
                var metrics = new[] { "Revenue", "Registrations", "FTD", "ActivePlayers" };
                foreach (var metric in metrics)
                {
                    explanations[metric] = await GetMetricExplanationAsync(metric, userRole, experienceLevel);
                }

                return explanations;
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
        public async Task<string> GetInsightExplanationAsync(DashboardInsight insight, string userRole, int experienceLevel)
        {
            try
            {
                if (insight == null)
                    return "No insight provided.";

                // Generate explanation based on insight type and user context
                string explanation = insight.InsightType switch
                {
                    "Anomaly" => ExplainAnomaly(insight, userRole, experienceLevel),
                    "Trend" => ExplainTrend(insight, userRole, experienceLevel),
                    "Correlation" => ExplainCorrelation(insight, userRole, experienceLevel),
                    "Forecast" => ExplainForecast(insight, userRole, experienceLevel),
                    _ => $"This insight shows {insight.Title.ToLower()}."
                };

                return explanation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for insight {InsightTitle}", insight?.Title);
                return "Explanation is not available for this insight.";
            }
        }

        /// <summary>
        /// Get explanation for why a specific anomaly is significant
        /// </summary>
        public async Task<string> GetAnomalyExplanationAsync(DataAnomaly anomaly, string userRole, int experienceLevel)
        {
            try
            {
                if (anomaly == null)
                    return "No anomaly provided.";

                string explanation = $"This {anomaly.Category.ToLower()} anomaly is significant because ";

                // Add explanation based on anomaly severity and type
                if (anomaly.Severity >= 4)
                {
                    explanation += "it represents a major deviation from expected values. ";
                }
                else
                {
                    explanation += "it shows a notable deviation from expected patterns. ";
                }

                // Add business context based on user role
                if (userRole == "Finance" || userRole == "Executive")
                {
                    explanation += $"The financial impact could be significant, with a {Math.Abs(anomaly.DeviationPercentage):F1}% ";
                    explanation += anomaly.DeviationPercentage >= 0 ? "increase " : "decrease ";
                    explanation += $"in {anomaly.MetricKey.ToLower()}.";
                }
                else if (userRole == "Marketing")
                {
                    explanation += $"This may indicate that recent marketing activities have ";
                    explanation += anomaly.DeviationPercentage >= 0 ? "positively " : "negatively ";
                    explanation += $"impacted {anomaly.MetricKey.ToLower()}.";
                }
                else
                {
                    explanation += $"This represents a {Math.Abs(anomaly.DeviationPercentage):F1}% ";
                    explanation += anomaly.DeviationPercentage >= 0 ? "increase " : "decrease ";
                    explanation += $"compared to expected values.";
                }

                // Add potential cause if available
                if (!string.IsNullOrEmpty(anomaly.PotentialCause))
                {
                    explanation += $" {anomaly.PotentialCause}";
                }

                return explanation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting explanation for anomaly {AnomalyTitle}", anomaly?.Title);
                return "Explanation is not available for this anomaly.";
            }
        }

        /// <summary>
        /// Get business impact explanation for a metric or anomaly
        /// </summary>
        public async Task<string> GetBusinessImpactExplanationAsync(string metricKey, decimal value, decimal change, string userRole)
        {
            try
            {
                string impact = "";

                switch (metricKey)
                {
                    case "Revenue":
                        impact = $"A {Math.Abs(change):F1}% {(change >= 0 ? "increase" : "decrease")} in revenue ";

                        if (userRole == "Finance" || userRole == "Executive")
                        {
                            impact += $"directly impacts the bottom line. ";
                            impact += change >= 0
                                ? "This positive trend contributes to improved financial performance."
                                : "This negative trend may require attention to prevent financial impact.";
                        }
                        else if (userRole == "Marketing")
                        {
                            impact += change >= 0
                                ? "suggests that marketing strategies are effective in driving business growth."
                                : "may indicate that marketing strategies need to be reevaluated.";
                        }
                        else
                        {
                            impact += change >= 0
                                ? "is a positive indicator for business performance."
                                : "may require investigation to identify root causes.";
                        }
                        break;

                    case "Registrations":
                        impact = $"A {Math.Abs(change):F1}% {(change >= 0 ? "increase" : "decrease")} in registrations ";

                        if (userRole == "Marketing")
                        {
                            impact += change >= 0
                                ? "indicates effective acquisition strategies and potentially higher future revenue."
                                : "suggests that acquisition strategies may need adjustment to maintain growth.";
                        }
                        else
                        {
                            impact += change >= 0
                                ? "is a leading indicator for future revenue growth."
                                : "may lead to reduced revenue in upcoming periods if not addressed.";
                        }
                        break;

                    case "FTD":
                        impact = $"A {Math.Abs(change):F1}% {(change >= 0 ? "increase" : "decrease")} in first-time depositors ";

                        if (userRole == "Finance")
                        {
                            impact += change >= 0
                                ? "is a strong indicator of future revenue growth and customer lifetime value."
                                : "may signal reduced future revenue streams and customer acquisition issues.";
                        }
                        else
                        {
                            impact += change >= 0
                                ? "indicates effective conversion of registrations to paying customers."
                                : "suggests potential issues with onboarding or initial customer experience.";
                        }
                        break;

                    default:
                        impact = $"The {Math.Abs(change):F1}% {(change >= 0 ? "increase" : "decrease")} in {metricKey} ";
                        impact += change >= 0
                            ? "is generally a positive indicator for business performance."
                            : "may require further investigation to understand root causes.";
                        break;
                }

                return impact;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business impact explanation for {MetricKey}", metricKey);
                return $"The change in {metricKey} may have business implications that require further analysis.";
            }
        }

        /// <summary>
        /// Get explanations for industry terminology used in the dashboard
        /// </summary>
        public async Task<Dictionary<string, string>> GetTerminologyExplanationsAsync(string userRole, int experienceLevel)
        {
            try
            {
                var terminology = new Dictionary<string, string>
                {
                    { "FTD", "First Time Depositor - A player who has made their first deposit." },
                    { "GGR", "Gross Gaming Revenue - Total bets minus total wins, before any deductions." },
                    { "NGR", "Net Gaming Revenue - Gross Gaming Revenue minus bonuses and promotions." },
                    { "Churn", "The rate at which players stop using the platform over a given period." },
                    { "LTV", "Lifetime Value - The predicted revenue a player will generate during their entire relationship." },
                    { "Conversion Rate", "The percentage of visitors or registrants who complete a desired action (e.g., deposit)." },
                    { "ARPU", "Average Revenue Per User - Total revenue divided by the number of users." },
                    { "KPI", "Key Performance Indicator - Metrics used to evaluate success in meeting objectives." }
                };

                // Add more detailed explanations for beginners
                if (experienceLevel <= 2)
                {
                    terminology["Retention Rate"] = "The percentage of players who continue to use the platform after a specific period.";
                    terminology["CPA"] = "Cost Per Acquisition - The average cost to acquire a new player.";
                    terminology["ROI"] = "Return On Investment - The ratio between net profit and cost of investment.";
                }

                // Add role-specific terminology
                if (userRole == "Finance")
                {
                    terminology["EBITDA"] = "Earnings Before Interest, Taxes, Depreciation, and Amortization - A measure of operational profitability.";
                    terminology["Margin"] = "The difference between revenue and cost, expressed as a percentage of revenue.";
                }
                else if (userRole == "Marketing")
                {
                    terminology["CTR"] = "Click-Through Rate - The ratio of users who click on a specific link to the number of total users who view a page or email.";
                    terminology["CPC"] = "Cost Per Click - The amount paid for each click in a pay-per-click marketing campaign.";
                }

                return terminology;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting terminology explanations");
                return new Dictionary<string, string>();
            }
        }

        #region Helper Methods

        private string GetShortDescription(string metricKey)
        {
            return metricKey switch
            {
                "Revenue" => "Total revenue generated from player activity.",
                "Registrations" => "Number of new player registrations.",
                "FTD" => "Number of players who made their first deposit.",
                "ActivePlayers" => "Number of players who have been active in the selected period.",
                "Bets" => "Total amount wagered by players.",
                "Wins" => "Total amount won by players.",
                "GGR" => "Gross Gaming Revenue (bets minus wins).",
                "Bonus" => "Total bonus amount given to players.",
                "NGR" => "Net Gaming Revenue (GGR minus bonuses).",
                _ => $"Measurement of {metricKey.ToLower()}."
            };
        }

        private string GetDetailedDescription(string metricKey, int experienceLevel)
        {
            string baseDescription = metricKey switch
            {
                "Revenue" => "Revenue represents the total monetary value generated from player activity, including bets placed minus wins paid out, adjusted for bonuses and promotions.",
                "Registrations" => "Registrations count the number of new players who have created an account during the selected time period.",
                "FTD" => "First Time Depositors (FTD) are players who have made their first real money deposit during the selected time period.",
                "ActivePlayers" => "Active Players count unique players who have placed at least one bet during the selected time period.",
                _ => $"{metricKey} is a key performance indicator tracked on the dashboard."
            };

            // Add more detailed explanation for beginners
            if (experienceLevel <= 2)
            {
                switch (metricKey)
                {
                    case "Revenue":
                        return baseDescription + " It's a primary indicator of business performance and growth.";
                    case "Registrations":
                        return baseDescription + " This is a leading indicator for future revenue potential and reflects the effectiveness of acquisition strategies.";
                    case "FTD":
                        return baseDescription + " The conversion from registration to first deposit is a critical step in the player journey and a key indicator of acquisition quality.";
                    case "ActivePlayers":
                        return baseDescription + " This metric helps measure player engagement and retention, which are key drivers of sustainable revenue.";
                    default:
                        return baseDescription;
                }
            }

            return baseDescription;
        }

        private string GetBusinessContext(string metricKey, string userRole)
        {
            if (userRole == "Finance" || userRole == "Executive")
            {
                return metricKey switch
                {
                    "Revenue" => "Revenue directly impacts financial performance and is a key component of financial reporting and forecasting.",
                    "Registrations" => "Registrations are a leading indicator for future revenue potential and reflect the effectiveness of player acquisition investments.",
                    "FTD" => "First Time Depositors represent the conversion of marketing spend to revenue-generating customers and are a key indicator of acquisition quality.",
                    "ActivePlayers" => "Active Players represent the engaged customer base that generates ongoing revenue and indicates the health of the player lifecycle.",
                    _ => $"{metricKey} is an important metric for business performance analysis."
                };
            }
            else if (userRole == "Marketing")
            {
                return metricKey switch
                {
                    "Revenue" => "Revenue is the ultimate outcome of marketing efforts and helps measure marketing ROI.",
                    "Registrations" => "Registrations are a direct result of acquisition campaigns and a key performance indicator for marketing effectiveness.",
                    "FTD" => "First Time Depositors measure the quality of acquired players and the effectiveness of onboarding and conversion strategies.",
                    "ActivePlayers" => "Active Players reflect the success of retention strategies and the overall player experience.",
                    _ => $"{metricKey} helps measure the effectiveness of marketing strategies."
                };
            }
            else
            {
                return metricKey switch
                {
                    "Revenue" => "Revenue is a key business metric that indicates overall performance.",
                    "Registrations" => "Registrations show how many new players are joining the platform.",
                    "FTD" => "First Time Depositors show how many new players are converting to paying customers.",
                    "ActivePlayers" => "Active Players indicate how many players are engaged with the platform.",
                    _ => $"{metricKey} is an important metric for business operations."
                };
            }
        }

        private List<string> GetRelatedMetrics(string metricKey)
        {
            return metricKey switch
            {
                "Revenue" => new List<string> { "GGR", "NGR", "ARPU", "Bets", "Wins" },
                "Registrations" => new List<string> { "FTD", "Conversion Rate", "CPA", "Marketing Spend" },
                "FTD" => new List<string> { "Registrations", "Conversion Rate", "Average First Deposit", "Deposit Success Rate" },
                "ActivePlayers" => new List<string> { "DAU", "MAU", "Retention Rate", "Churn Rate", "Session Length" },
                _ => new List<string>()
            };
        }

        private List<string> GetRecommendedActions(string metricKey, string userRole)
        {
            if (userRole == "Finance" || userRole == "Executive")
            {
                return metricKey switch
                {
                    "Revenue" => new List<string> {
                        "Compare against forecast and budget",
                        "Analyze revenue by segment and product",
                        "Review margin and profitability"
                    },
                    "Registrations" => new List<string> {
                        "Analyze acquisition cost and ROI",
                        "Review conversion to FTD",
                        "Compare against marketing spend"
                    },
                    "FTD" => new List<string> {
                        "Analyze conversion rates from registration",
                        "Review average first deposit amount",
                        "Assess early player value"
                    },
                    "ActivePlayers" => new List<string> {
                        "Review retention and churn metrics",
                        "Analyze player lifetime value",
                        "Assess engagement by segment"
                    },
                    _ => new List<string> { "Review trend over time", "Compare against targets" }
                };
            }
            else if (userRole == "Marketing")
            {
                return metricKey switch
                {
                    "Revenue" => new List<string> {
                        "Analyze revenue by marketing channel",
                        "Review marketing ROI",
                        "Identify high-value player segments"
                    },
                    "Registrations" => new List<string> {
                        "Analyze registration sources",
                        "Review acquisition campaign performance",
                        "Optimize landing pages and registration flow"
                    },
                    "FTD" => new List<string> {
                        "Review onboarding experience",
                        "Analyze deposit incentives effectiveness",
                        "Optimize deposit flow and payment methods"
                    },
                    "ActivePlayers" => new List<string> {
                        "Review engagement campaigns",
                        "Analyze retention strategies",
                        "Develop reactivation campaigns for inactive players"
                    },
                    _ => new List<string> { "Analyze by marketing channel", "Review campaign impact" }
                };
            }
            else
            {
                return metricKey switch
                {
                    "Revenue" => new List<string> { "Review trend over time", "Analyze by product and segment" },
                    "Registrations" => new List<string> { "Monitor registration flow", "Review by source" },
                    "FTD" => new List<string> { "Review conversion funnel", "Analyze by player segment" },
                    "ActivePlayers" => new List<string> { "Monitor engagement metrics", "Review by player type" },
                    _ => new List<string> { "Monitor trend over time" }
                };
            }
        }

        private string ExplainAnomaly(DashboardInsight insight, string userRole, int experienceLevel)
        {
            bool isPositive = insight.TrendDirection == "Positive";
            decimal changePercentage = 0;
            if (insight.AdditionalData != null && insight.AdditionalData.ContainsKey("ChangePercentage") &&
                insight.AdditionalData["ChangePercentage"] is decimal change)
            {
                changePercentage = change;
            }

            return $"This anomaly shows an unusual pattern in {insight.MetricKey} that deviates significantly from expected values. " +
                   $"Based on historical data, this {(isPositive ? "positive" : "negative")} change of {Math.Abs(changePercentage):F1}% " +
                   $"is noteworthy and may require attention.";
        }

        private string ExplainTrend(DashboardInsight insight, string userRole, int experienceLevel)
        {
            bool isPositive = insight.TrendDirection == "Positive";
            decimal changePercentage = 0;
            if (insight.AdditionalData != null && insight.AdditionalData.ContainsKey("ChangePercentage") &&
                insight.AdditionalData["ChangePercentage"] is decimal change)
            {
                changePercentage = change;
            }

            return $"This trend shows a consistent {(isPositive ? "upward" : "downward")} movement in {insight.MetricKey} " +
                   $"over the analyzed period. The {Math.Abs(changePercentage):F1}% {(isPositive ? "increase" : "decrease")} " +
                   $"indicates a {(isPositive ? "positive" : "concerning")} direction that may {(isPositive ? "continue" : "require intervention")}.";
        }

        private string ExplainCorrelation(DashboardInsight insight, string userRole, int experienceLevel)
        {
            bool isPositive = insight.TrendDirection == "Positive";
            string relatedMetric = "another metric";
            if (insight.AdditionalData != null && insight.AdditionalData.ContainsKey("RelatedMetric") &&
                insight.AdditionalData["RelatedMetric"] is string related)
            {
                relatedMetric = related;
            }

            return $"This correlation shows a relationship between {insight.MetricKey} and {relatedMetric}. " +
                   $"When one metric changes, the other tends to change in a {(isPositive ? "similar" : "opposite")} direction, " +
                   $"which can help with forecasting and understanding cause-effect relationships.";
        }

        private string ExplainForecast(DashboardInsight insight, string userRole, int experienceLevel)
        {
            bool isPositive = insight.TrendDirection == "Positive";
            decimal changePercentage = 0;
            if (insight.AdditionalData != null && insight.AdditionalData.ContainsKey("ChangePercentage") &&
                insight.AdditionalData["ChangePercentage"] is decimal change)
            {
                changePercentage = change;
            }

            return $"This forecast predicts how {insight.MetricKey} may perform in the coming period based on historical patterns. " +
                   $"The projected {(isPositive ? "increase" : "decrease")} of {Math.Abs(changePercentage):F1}% " +
                   $"can help with planning and setting expectations.";
        }

        #endregion
    }
}
