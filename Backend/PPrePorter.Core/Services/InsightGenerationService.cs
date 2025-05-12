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
    /// Implementation of IInsightGenerationService that generates narrative insights from dashboard data
    /// </summary>
    public class InsightGenerationService : IInsightGenerationService
    {
        private readonly IAnomalyDetectionService _anomalyDetectionService;
        private readonly ITrendAnalysisService _trendAnalysisService;
        private readonly IContextualExplanationService _contextualExplanationService;
        private readonly ILogger<InsightGenerationService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="InsightGenerationService"/> class
        /// </summary>
        /// <param name="anomalyDetectionService">Anomaly detection service</param>
        /// <param name="trendAnalysisService">Trend analysis service</param>
        /// <param name="contextualExplanationService">Contextual explanation service</param>
        /// <param name="logger">Logger</param>
        public InsightGenerationService(
            IAnomalyDetectionService anomalyDetectionService,
            ITrendAnalysisService trendAnalysisService,
            IContextualExplanationService contextualExplanationService,
            ILogger<InsightGenerationService> logger)
        {
            _anomalyDetectionService = anomalyDetectionService ?? throw new ArgumentNullException(nameof(anomalyDetectionService));
            _trendAnalysisService = trendAnalysisService ?? throw new ArgumentNullException(nameof(trendAnalysisService));
            _contextualExplanationService = contextualExplanationService ?? throw new ArgumentNullException(nameof(contextualExplanationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Generate key insights about dashboard summary statistics
        /// </summary>
        /// <param name="summary">Dashboard summary</param>
        /// <returns>List of insights</returns>
        public async Task<List<DashboardInsight>> GenerateSummaryInsightsAsync(DashboardSummary summary)
        {
            try
            {
                var insights = new List<DashboardInsight>();
                var anomalies = await _anomalyDetectionService.DetectSummaryAnomaliesAsync(summary);

                // Add key performance metrics insights
                if (summary.Revenue > 0)
                {
                    var revenueInsight = CreateInsightFromMetric(
                        "Revenue Performance",
                        $"Revenue is {FormatTrendDirection(summary.RevenueChange)} by {Math.Abs(summary.RevenueChange)}% compared to yesterday.",
                        "Summary",
                        GetImportanceFromChange(summary.RevenueChange, 10, 5),
                        "Revenue",
                        GetTrendDirection(summary.RevenueChange)
                    );
                    insights.Add(revenueInsight);
                }

                if (summary.Registrations > 0)
                {
                    var registrationsInsight = CreateInsightFromMetric(
                        "Player Registrations",
                        $"New player registrations are {FormatTrendDirection(summary.RegistrationsChange)} by {Math.Abs(summary.RegistrationsChange)}% compared to yesterday.",
                        "Summary",
                        GetImportanceFromChange(summary.RegistrationsChange, 9, 4),
                        "Registrations",
                        GetTrendDirection(summary.RegistrationsChange)
                    );
                    insights.Add(registrationsInsight);
                }

                if (summary.FTD > 0)
                {
                    var ftdInsight = CreateInsightFromMetric(
                        "First Time Depositors",
                        $"First time depositors are {FormatTrendDirection(summary.FTDChange)} by {Math.Abs(summary.FTDChange)}% compared to yesterday.",
                        "Summary",
                        GetImportanceFromChange(summary.FTDChange, 9, 4),
                        "FTD",
                        GetTrendDirection(summary.FTDChange)
                    );
                    insights.Add(ftdInsight);
                }

                // Add insights from anomalies
                foreach (var anomaly in anomalies)
                {
                    var anomalyInsight = new DashboardInsight
                    {
                        Title = $"Unusual {anomaly.MetricKey} Activity",
                        Description = anomaly.Description,
                        Category = "Summary",
                        Importance = anomaly.Severity,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.ActualValue > anomaly.ExpectedValue ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "ActualValue", anomaly.ActualValue },
                            { "ExpectedValue", anomaly.ExpectedValue },
                            { "DeviationPercentage", anomaly.DeviationPercentage },
                            { "PossibleCauses", anomaly.PossibleCauses },
                            { "RecommendedActions", anomaly.RecommendedActions }
                        }
                    };
                    insights.Add(anomalyInsight);
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating summary insights");
                return new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Generate insights about revenue trends
        /// </summary>
        /// <param name="revenueData">Revenue data</param>
        /// <returns>List of insights</returns>
        public async Task<List<DashboardInsight>> GenerateRevenueInsightsAsync(List<CasinoRevenueItem> revenueData)
        {
            try
            {
                var insights = new List<DashboardInsight>();

                if (revenueData == null || revenueData.Count < 2)
                    return insights;

                // Detect anomalies in revenue data
                var anomalies = await _anomalyDetectionService.DetectRevenueAnomaliesAsync(revenueData);

                // Analyze revenue trends
                var trendAnalysis = await _trendAnalysisService.AnalyzeRevenueTrendsAsync(revenueData);

                // Add trend insights
                if (trendAnalysis != null)
                {
                    // Overall trend insight
                    var trendDirection = trendAnalysis.OverallTrendSlope > 0 ? "upward" : "downward";
                    var trendStrength = Math.Abs(trendAnalysis.OverallTrendSlope) > 0.05m ? "strong" : "slight";
                    
                    insights.Add(new DashboardInsight
                    {
                        Title = "Revenue Trend",
                        Description = $"Revenue shows a {trendStrength} {trendDirection} trend over the analyzed period.",
                        Category = "Revenue",
                        Importance = Math.Abs(trendAnalysis.OverallTrendSlope) > 0.1m ? 8 : 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Revenue",
                        TrendDirection = trendAnalysis.OverallTrendSlope > 0 ? "Positive" : "Negative",
                        InsightType = "Pattern",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "TrendSlope", trendAnalysis.OverallTrendSlope },
                            { "TrendStrength", trendStrength }
                        }
                    });

                    // Add insights for identified patterns
                    foreach (var pattern in trendAnalysis.IdentifiedPatterns)
                    {
                        insights.Add(new DashboardInsight
                        {
                            Title = $"Revenue {pattern.PatternType}",
                            Description = pattern.Description,
                            Category = "Revenue",
                            Importance = pattern.Significance > 0.7m ? 7 : 4,
                            GeneratedAt = DateTime.UtcNow,
                            MetricKey = "Revenue",
                            TrendDirection = "Neutral",
                            InsightType = "Pattern",
                            AdditionalData = new Dictionary<string, object>
                            {
                                { "PatternType", pattern.PatternType },
                                { "Significance", pattern.Significance }
                            }
                        });
                    }
                }

                // Add anomaly insights
                foreach (var anomaly in anomalies)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Revenue Anomaly Detected",
                        Description = anomaly.Description,
                        Category = "Revenue",
                        Importance = anomaly.Severity,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Revenue",
                        TrendDirection = anomaly.ActualValue > anomaly.ExpectedValue ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "Date", anomaly.Date },
                            { "ActualValue", anomaly.ActualValue },
                            { "ExpectedValue", anomaly.ExpectedValue },
                            { "DeviationPercentage", anomaly.DeviationPercentage },
                            { "PossibleCauses", anomaly.PossibleCauses },
                            { "RecommendedActions", anomaly.RecommendedActions }
                        }
                    });
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating revenue insights");
                return new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Generate insights about player registration patterns
        /// </summary>
        /// <param name="registrationData">Registration data</param>
        /// <returns>List of insights</returns>
        public async Task<List<DashboardInsight>> GenerateRegistrationInsightsAsync(List<PlayerRegistrationItem> registrationData)
        {
            try
            {
                var insights = new List<DashboardInsight>();

                if (registrationData == null || registrationData.Count < 2)
                    return insights;

                // Detect anomalies in registration data
                var anomalies = await _anomalyDetectionService.DetectRegistrationAnomaliesAsync(registrationData);

                // Analyze registration trends
                var trendAnalysis = await _trendAnalysisService.AnalyzeRegistrationTrendsAsync(registrationData);

                // Add trend insights
                if (trendAnalysis != null)
                {
                    // Overall trend insight
                    var trendDirection = trendAnalysis.OverallTrendSlope > 0 ? "upward" : "downward";
                    var trendStrength = Math.Abs(trendAnalysis.OverallTrendSlope) > 0.05m ? "strong" : "slight";
                    
                    insights.Add(new DashboardInsight
                    {
                        Title = "Registration Trend",
                        Description = $"Player registrations show a {trendStrength} {trendDirection} trend over the analyzed period.",
                        Category = "Registration",
                        Importance = Math.Abs(trendAnalysis.OverallTrendSlope) > 0.1m ? 8 : 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Registrations",
                        TrendDirection = trendAnalysis.OverallTrendSlope > 0 ? "Positive" : "Negative",
                        InsightType = "Pattern",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "TrendSlope", trendAnalysis.OverallTrendSlope },
                            { "TrendStrength", trendStrength }
                        }
                    });

                    // Add insights for identified patterns
                    foreach (var pattern in trendAnalysis.IdentifiedPatterns)
                    {
                        insights.Add(new DashboardInsight
                        {
                            Title = $"Registration {pattern.PatternType}",
                            Description = pattern.Description,
                            Category = "Registration",
                            Importance = pattern.Significance > 0.7m ? 7 : 4,
                            GeneratedAt = DateTime.UtcNow,
                            MetricKey = "Registrations",
                            TrendDirection = "Neutral",
                            InsightType = "Pattern",
                            AdditionalData = new Dictionary<string, object>
                            {
                                { "PatternType", pattern.PatternType },
                                { "Significance", pattern.Significance }
                            }
                        });
                    }
                }

                // Add anomaly insights
                foreach (var anomaly in anomalies)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Registration Anomaly Detected",
                        Description = anomaly.Description,
                        Category = "Registration",
                        Importance = anomaly.Severity,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Registrations",
                        TrendDirection = anomaly.ActualValue > anomaly.ExpectedValue ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "Date", anomaly.Date },
                            { "ActualValue", anomaly.ActualValue },
                            { "ExpectedValue", anomaly.ExpectedValue },
                            { "DeviationPercentage", anomaly.DeviationPercentage },
                            { "PossibleCauses", anomaly.PossibleCauses },
                            { "RecommendedActions", anomaly.RecommendedActions }
                        }
                    });
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating registration insights");
                return new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Generate insights about top performing games
        /// </summary>
        /// <param name="topGames">Top games data</param>
        /// <returns>List of insights</returns>
        public async Task<List<DashboardInsight>> GenerateTopGamesInsightsAsync(List<TopGameItem> topGames)
        {
            try
            {
                var insights = new List<DashboardInsight>();

                if (topGames == null || topGames.Count == 0)
                    return insights;

                // Detect anomalies in game performance
                var anomalies = await _anomalyDetectionService.DetectGamePerformanceAnomaliesAsync(topGames);

                // Add insights about top games
                if (topGames.Count > 0)
                {
                    var topGame = topGames[0];
                    insights.Add(new DashboardInsight
                    {
                        Title = "Top Performing Game",
                        Description = $"'{topGame.GameName}' is the top performing game with {topGame.Revenue:C} in revenue and {topGame.Players} active players.",
                        Category = "Game",
                        Importance = 7,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "GameRevenue",
                        TrendDirection = "Positive",
                        InsightType = "Pattern",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "GameName", topGame.GameName },
                            { "Revenue", topGame.Revenue },
                            { "Players", topGame.Players }
                        }
                    });
                }

                // Add anomaly insights
                foreach (var anomaly in anomalies)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Game Performance Anomaly",
                        Description = anomaly.Description,
                        Category = "Game",
                        Importance = anomaly.Severity,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "GameRevenue",
                        TrendDirection = anomaly.ActualValue > anomaly.ExpectedValue ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "GameName", anomaly.AdditionalData["GameName"] },
                            { "ActualValue", anomaly.ActualValue },
                            { "ExpectedValue", anomaly.ExpectedValue },
                            { "DeviationPercentage", anomaly.DeviationPercentage },
                            { "PossibleCauses", anomaly.PossibleCauses },
                            { "RecommendedActions", anomaly.RecommendedActions }
                        }
                    });
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating top games insights");
                return new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Generate insights about transaction patterns
        /// </summary>
        /// <param name="transactions">Transaction data</param>
        /// <returns>List of insights</returns>
        public async Task<List<DashboardInsight>> GenerateTransactionInsightsAsync(List<RecentTransactionItem> transactions)
        {
            try
            {
                var insights = new List<DashboardInsight>();

                if (transactions == null || transactions.Count == 0)
                    return insights;

                // Detect anomalies in transaction data
                var anomalies = await _anomalyDetectionService.DetectTransactionAnomaliesAsync(transactions);

                // Group transactions by type
                var transactionsByType = transactions
                    .GroupBy(t => t.TransactionType)
                    .ToDictionary(g => g.Key, g => g.ToList());

                // Add insights about transaction types
                foreach (var kvp in transactionsByType)
                {
                    var type = kvp.Key;
                    var typeTransactions = kvp.Value;
                    var totalAmount = typeTransactions.Sum(t => t.Amount);
                    var avgAmount = typeTransactions.Average(t => t.Amount);

                    insights.Add(new DashboardInsight
                    {
                        Title = $"{type} Transactions",
                        Description = $"There were {typeTransactions.Count} {type.ToLower()} transactions with a total of {totalAmount:C} and an average of {avgAmount:C} per transaction.",
                        Category = "Transaction",
                        Importance = 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = $"Transaction_{type}",
                        TrendDirection = "Neutral",
                        InsightType = "Summary",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "TransactionType", type },
                            { "Count", typeTransactions.Count },
                            { "TotalAmount", totalAmount },
                            { "AverageAmount", avgAmount }
                        }
                    });
                }

                // Add anomaly insights
                foreach (var anomaly in anomalies)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Transaction Anomaly",
                        Description = anomaly.Description,
                        Category = "Transaction",
                        Importance = anomaly.Severity,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.ActualValue > anomaly.ExpectedValue ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "TransactionType", anomaly.AdditionalData["TransactionType"] },
                            { "Date", anomaly.Date },
                            { "ActualValue", anomaly.ActualValue },
                            { "ExpectedValue", anomaly.ExpectedValue },
                            { "DeviationPercentage", anomaly.DeviationPercentage },
                            { "PossibleCauses", anomaly.PossibleCauses },
                            { "RecommendedActions", anomaly.RecommendedActions }
                        }
                    });
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating transaction insights");
                return new List<DashboardInsight>();
            }
        }

        /// <summary>
        /// Generate comprehensive dashboard story with insights from all sections
        /// </summary>
        /// <param name="dashboardData">Dashboard data</param>
        /// <returns>Dashboard story</returns>
        public async Task<DashboardStory> GenerateDashboardStoryAsync(DashboardData dashboardData)
        {
            try
            {
                if (dashboardData == null)
                    throw new ArgumentNullException(nameof(dashboardData));

                // Generate insights for each section
                var summaryInsights = await GenerateSummaryInsightsAsync(dashboardData.Summary);
                var revenueInsights = await GenerateRevenueInsightsAsync(dashboardData.CasinoRevenue);
                var registrationInsights = await GenerateRegistrationInsightsAsync(dashboardData.PlayerRegistrations);
                var gameInsights = await GenerateTopGamesInsightsAsync(dashboardData.TopGames);
                var transactionInsights = await GenerateTransactionInsightsAsync(dashboardData.RecentTransactions);

                // Combine all insights
                var allInsights = summaryInsights
                    .Concat(revenueInsights)
                    .Concat(registrationInsights)
                    .Concat(gameInsights)
                    .Concat(transactionInsights)
                    .ToList();

                // Get key insights (most important ones)
                var keyInsights = allInsights
                    .OrderByDescending(i => i.Importance)
                    .Take(5)
                    .ToList();

                // Get significant anomalies
                var significantAnomalies = allInsights
                    .Where(i => i.InsightType == "Anomaly" && i.Importance >= 7)
                    .Select(i => new DataAnomaly
                    {
                        MetricKey = i.MetricKey,
                        Description = i.Description,
                        Severity = i.Importance,
                        ActualValue = (decimal)i.AdditionalData["ActualValue"],
                        ExpectedValue = (decimal)i.AdditionalData["ExpectedValue"],
                        DeviationPercentage = (decimal)i.AdditionalData["DeviationPercentage"]
                    })
                    .ToList();

                // Create highlights
                var highlights = new List<string>();
                if (keyInsights.Any())
                {
                    foreach (var insight in keyInsights)
                    {
                        highlights.Add(insight.Description);
                    }
                }

                // Create the dashboard story
                var story = new DashboardStory
                {
                    Id = 0, // Will be set by the database
                    Title = "Daily Dashboard Overview",
                    Summary = GenerateSummaryText(dashboardData, keyInsights),
                    GeneratedAt = DateTime.UtcNow,
                    KeyInsights = keyInsights,
                    SignificantAnomalies = significantAnomalies,
                    Highlights = highlights,
                    BusinessContext = GenerateBusinessContextText(dashboardData, allInsights),
                    OpportunityAnalysis = GenerateOpportunityAnalysisText(dashboardData, allInsights),
                    RiskAnalysis = GenerateRiskAnalysisText(dashboardData, allInsights),
                    RecommendedActions = GenerateRecommendedActions(dashboardData, allInsights)
                };

                return story;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dashboard story");
                
                // Return a minimal story with error information
                return new DashboardStory
                {
                    Title = "Dashboard Overview (Error)",
                    Summary = "An error occurred while generating the dashboard story.",
                    GeneratedAt = DateTime.UtcNow,
                    KeyInsights = new List<DashboardInsight>(),
                    SignificantAnomalies = new List<DataAnomaly>(),
                    Highlights = new List<string> { "Error generating dashboard story." },
                    BusinessContext = "Not available due to an error.",
                    OpportunityAnalysis = "Not available due to an error.",
                    RiskAnalysis = "Not available due to an error.",
                    RecommendedActions = new List<string> { "Check system logs for errors." }
                };
            }
        }

        #region Helper Methods

        private DashboardInsight CreateInsightFromMetric(
            string title,
            string description,
            string category,
            int importance,
            string metricKey,
            string trendDirection)
        {
            return new DashboardInsight
            {
                Title = title,
                Description = description,
                Category = category,
                Importance = importance,
                GeneratedAt = DateTime.UtcNow,
                MetricKey = metricKey,
                TrendDirection = trendDirection,
                InsightType = "Summary"
            };
        }

        private string FormatTrendDirection(decimal change)
        {
            return change >= 0 ? "up" : "down";
        }

        private string GetTrendDirection(decimal change)
        {
            return change >= 0 ? "Positive" : "Negative";
        }

        private int GetImportanceFromChange(decimal change, int highImportance, int lowImportance)
        {
            return Math.Abs(change) > 10 ? highImportance : lowImportance;
        }

        private string GenerateSummaryText(DashboardData data, List<DashboardInsight> keyInsights)
        {
            var summary = "Today's dashboard shows ";
            
            if (data.Summary.RevenueChange > 0)
            {
                summary += $"an increase in revenue of {data.Summary.RevenueChange:F1}% ";
            }
            else
            {
                summary += $"a decrease in revenue of {Math.Abs(data.Summary.RevenueChange):F1}% ";
            }
            
            if (data.Summary.RegistrationsChange > 0)
            {
                summary += $"and an increase in registrations of {data.Summary.RegistrationsChange:F1}% compared to yesterday. ";
            }
            else
            {
                summary += $"and a decrease in registrations of {Math.Abs(data.Summary.RegistrationsChange):F1}% compared to yesterday. ";
            }

            if (keyInsights.Any())
            {
                summary += "Key insights include: ";
                summary += string.Join(" ", keyInsights.Take(3).Select(i => i.Description));
            }

            return summary;
        }

        private string GenerateBusinessContextText(DashboardData data, List<DashboardInsight> insights)
        {
            // This would typically include more sophisticated analysis
            return "The current business performance should be viewed in the context of ongoing marketing campaigns and seasonal trends. " +
                   "Consider how recent platform changes and promotions may have affected the metrics shown.";
        }

        private string GenerateOpportunityAnalysisText(DashboardData data, List<DashboardInsight> insights)
        {
            var positiveInsights = insights.Where(i => i.TrendDirection == "Positive" && i.Importance >= 6).ToList();
            
            if (!positiveInsights.Any())
            {
                return "No significant opportunities identified in today's data.";
            }

            var text = "Based on today's data, consider the following opportunities: ";
            text += string.Join(" ", positiveInsights.Take(3).Select(i => i.Description));
            
            return text;
        }

        private string GenerateRiskAnalysisText(DashboardData data, List<DashboardInsight> insights)
        {
            var negativeInsights = insights.Where(i => i.TrendDirection == "Negative" && i.Importance >= 6).ToList();
            
            if (!negativeInsights.Any())
            {
                return "No significant risks identified in today's data.";
            }

            var text = "Based on today's data, be aware of the following risks: ";
            text += string.Join(" ", negativeInsights.Take(3).Select(i => i.Description));
            
            return text;
        }

        private List<string> GenerateRecommendedActions(DashboardData data, List<DashboardInsight> insights)
        {
            var actions = new List<string>();
            
            // Add actions from anomaly insights
            var anomalyInsights = insights.Where(i => i.InsightType == "Anomaly" && i.Importance >= 6).ToList();
            foreach (var insight in anomalyInsights)
            {
                if (insight.AdditionalData.ContainsKey("RecommendedActions"))
                {
                    var recommendedActions = (List<string>)insight.AdditionalData["RecommendedActions"];
                    actions.AddRange(recommendedActions);
                }
            }
            
            // Add general actions
            if (data.Summary.RevenueChange < -10)
            {
                actions.Add("Investigate the cause of the significant revenue decrease.");
            }
            
            if (data.Summary.RegistrationsChange < -10)
            {
                actions.Add("Review marketing campaigns and registration process for issues.");
            }
            
            // Deduplicate actions
            return actions.Distinct().ToList();
        }

        #endregion
    }
}
