using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.API.Features.Dashboard.Insights
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
                    
                    if (Math.Abs(summary.RevenueChange) >= 15)
                    {
                        revenueInsight.DetailedExplanation = $"This represents a significant {(summary.RevenueChange >= 0 ? "increase" : "decrease")} in revenue that warrants attention.";
                        revenueInsight.RecommendedAction = summary.RevenueChange >= 0 
                            ? "Consider analyzing which games or promotions are driving this increase."
                            : "Investigate potential causes for the revenue decline and consider targeted promotions.";
                    }
                    
                    insights.Add(revenueInsight);
                }
                
                if (summary.Registrations > 0)
                {
                    var registrationsInsight = CreateInsightFromMetric(
                        "Player Acquisition",
                        $"New registrations are {FormatTrendDirection(summary.RegistrationsChange)} by {Math.Abs(summary.RegistrationsChange)}% compared to yesterday.",
                        "Summary",
                        GetImportanceFromChange(summary.RegistrationsChange, 8, 4),
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
                        GetImportanceFromChange(summary.FTDChange, 9, 5),
                        "FTD",
                        GetTrendDirection(summary.FTDChange)
                    );
                    
                    insights.Add(ftdInsight);
                }
                
                // Add deposit/withdrawal ratio insight if both are present
                if (summary.Deposits > 0 && summary.Cashouts > 0)
                {
                    var ratio = Math.Round(summary.Deposits / summary.Cashouts, 2);
                    string ratioDescription = ratio > 1.5 ? "healthy" : ratio > 1.0 ? "balanced" : "concerning";
                    
                    insights.Add(new DashboardInsight
                    {
                        Title = "Deposit to Withdrawal Ratio",
                        Description = $"The deposit to withdrawal ratio is {ratio} which is {ratioDescription}.",
                        Category = "Summary",
                        Importance = ratio < 1.0 ? 8 : 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "DepositWithdrawalRatio",
                        TrendDirection = ratio >= 1.0 ? "Positive" : "Negative",
                        InsightType = "Pattern",
                        RecommendedAction = ratio < 1.0 ? "Review player withdrawal patterns and consider retention strategies." : null
                    });
                }
                
                // Add insights from detected anomalies
                foreach (var anomaly in anomalies.Where(a => a.Severity >= 3).Take(2))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = anomaly.Title,
                        Description = anomaly.Description,
                        Category = "Summary",
                        Importance = anomaly.Severity * 2,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.IsPositive ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        DetailedExplanation = $"Expected value: {anomaly.ExpectedValue}, Actual value: {anomaly.ActualValue}, Deviation: {anomaly.DeviationPercentage}%",
                        RecommendedAction = anomaly.PotentialCause
                    });
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
                
                // Add trend direction insight
                insights.Add(new DashboardInsight
                {
                    Title = "Revenue Trend",
                    Description = $"The overall revenue trend is {trendAnalysis.TrendDirection.ToLower()} " +
                                  $"with a {Math.Abs(trendAnalysis.PercentageChange ?? 0)}% " +
                                  $"{(trendAnalysis.PercentageChange >= 0 ? "increase" : "decrease")} over the period.",
                    Category = "Revenue",
                    Importance = GetImportanceFromChange(trendAnalysis.PercentageChange ?? 0, 8, 4),
                    GeneratedAt = DateTime.UtcNow,
                    MetricKey = "Revenue",
                    TrendDirection = GetTrendDirection(trendAnalysis.PercentageChange ?? 0),
                    InsightType = "Pattern"
                });
                
                // Add insights from identified patterns
                foreach (var pattern in trendAnalysis.IdentifiedPatterns.Where(p => p.IsSignificant).Take(2))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = $"Revenue {pattern.PatternType}",
                        Description = pattern.Description,
                        Category = "Revenue",
                        Importance = pattern.PatternType == "Spike" || pattern.PatternType == "Dip" ? 9 : 7,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Revenue",
                        TrendDirection = pattern.PatternType == "Spike" ? "Positive" : pattern.PatternType == "Dip" ? "Negative" : "Neutral",
                        InsightType = "Pattern",
                        DetailedExplanation = $"Pattern detected from {pattern.StartDate.ToShortDateString()} to {pattern.EndDate.ToShortDateString()} with a confidence score of {pattern.ConfidenceScore:P0}."
                    });
                }
                
                // Add anomaly insights
                foreach (var anomaly in anomalies.Where(a => a.Severity >= 3).Take(2))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = anomaly.Title,
                        Description = anomaly.Description,
                        Category = "Revenue",
                        Importance = anomaly.Severity * 2,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Revenue",
                        TrendDirection = anomaly.IsPositive ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        DetailedExplanation = $"On {anomaly.AnomalyDate.ToShortDateString()}, revenue was {Math.Abs(anomaly.DeviationPercentage)}% {(anomaly.DeviationPercentage >= 0 ? "higher" : "lower")} than expected.",
                        RecommendedAction = anomaly.PotentialCause
                    });
                }
                
                // Add seasonality insight if detected
                if (trendAnalysis.SeasonalityDetected && trendAnalysis.SeasonalCycleDays.HasValue)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Revenue Seasonality",
                        Description = $"A {trendAnalysis.SeasonalCycleDays}-day seasonality pattern has been detected in revenue data.",
                        Category = "Revenue",
                        Importance = 7,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Revenue",
                        TrendDirection = "Neutral",
                        InsightType = "Pattern",
                        DetailedExplanation = "Understanding this pattern can help with forecasting and planning promotional activities.",
                        RecommendedAction = "Consider aligning promotional campaigns with expected seasonal peaks."
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
                
                // Add trend direction insight
                if (trendAnalysis.PercentageChange.HasValue)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Registration Trend",
                        Description = $"Player registrations are {trendAnalysis.TrendDirection.ToLower()} " +
                                      $"with a {Math.Abs(trendAnalysis.PercentageChange.Value)}% " +
                                      $"{(trendAnalysis.PercentageChange >= 0 ? "increase" : "decrease")} over the period.",
                        Category = "Registration",
                        Importance = GetImportanceFromChange(trendAnalysis.PercentageChange.Value, 7, 4),
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Registrations",
                        TrendDirection = GetTrendDirection(trendAnalysis.PercentageChange.Value),
                        InsightType = "Pattern"
                    });
                }
                
                // Calculate conversion rate (FTD / Registrations)
                var totalRegistrations = registrationData.Sum(d => d.Registrations);
                var totalFTD = registrationData.Sum(d => d.FirstTimeDepositors);
                
                if (totalRegistrations > 0)
                {
                    var conversionRate = (decimal)totalFTD / totalRegistrations * 100;
                    string conversionQuality = conversionRate >= 25 ? "excellent" : 
                                              conversionRate >= 15 ? "good" : 
                                              conversionRate >= 10 ? "average" : "below average";
                    
                    insights.Add(new DashboardInsight
                    {
                        Title = "Registration Conversion Rate",
                        Description = $"The conversion rate from registration to first deposit is {conversionRate:F1}%, which is {conversionQuality}.",
                        Category = "Registration",
                        Importance = conversionRate < 10 ? 9 : 6,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "ConversionRate",
                        TrendDirection = conversionRate >= 15 ? "Positive" : conversionRate >= 10 ? "Neutral" : "Negative",
                        InsightType = "Pattern",
                        RecommendedAction = conversionRate < 15 ? "Consider optimizing the registration to deposit journey and welcome bonuses." : null
                    });
                }
                
                // Add anomaly insights
                foreach (var anomaly in anomalies.Where(a => a.Severity >= 3).Take(2))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = anomaly.Title,
                        Description = anomaly.Description,
                        Category = "Registration",
                        Importance = anomaly.Severity * 2,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.IsPositive ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        DetailedExplanation = $"On {anomaly.AnomalyDate.ToShortDateString()}, {anomaly.MetricKey} was {Math.Abs(anomaly.DeviationPercentage)}% {(anomaly.DeviationPercentage >= 0 ? "higher" : "lower")} than expected.",
                        RecommendedAction = anomaly.PotentialCause
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
        public async Task<List<DashboardInsight>> GenerateTopGamesInsightsAsync(List<TopGameItem> topGames)
        {
            try
            {
                var insights = new List<DashboardInsight>();
                
                if (topGames == null || !topGames.Any())
                    return insights;
                
                // Detect anomalies in game performance
                var anomalies = await _anomalyDetectionService.DetectGamePerformanceAnomaliesAsync(topGames);
                
                // Top game by revenue
                var topGame = topGames.OrderByDescending(g => g.Revenue).FirstOrDefault();
                if (topGame != null)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Top Performing Game",
                        Description = $"{topGame.GameName} is the top performing game with £{topGame.Revenue:N2} in revenue.",
                        Category = "Game",
                        Importance = 7,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "TopGame",
                        TrendDirection = "Positive",
                        InsightType = "Pattern",
                        DetailedExplanation = $"Provided by {topGame.Provider}, this game has generated significant revenue today."
                    });
                }
                
                // Group games by provider and find top provider
                var providerGroups = topGames
                    .GroupBy(g => g.Provider)
                    .Select(g => new { Provider = g.Key, Revenue = g.Sum(game => game.Revenue), Count = g.Count() })
                    .OrderByDescending(g => g.Revenue)
                    .ToList();
                
                if (providerGroups.Any())
                {
                    var topProvider = providerGroups.First();
                    insights.Add(new DashboardInsight
                    {
                        Title = "Top Game Provider",
                        Description = $"{topProvider.Provider} is the top performing provider with £{topProvider.Revenue:N2} in revenue across {topProvider.Count} games.",
                        Category = "Game",
                        Importance = 6,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "TopProvider",
                        TrendDirection = "Positive",
                        InsightType = "Pattern"
                    });
                }
                
                // Group games by type
                var typeGroups = topGames
                    .GroupBy(g => g.GameType)
                    .Select(g => new { GameType = g.Key, Revenue = g.Sum(game => game.Revenue), Count = g.Count() })
                    .OrderByDescending(g => g.Revenue)
                    .ToList();
                
                if (typeGroups.Any())
                {
                    var topType = typeGroups.First();
                    insights.Add(new DashboardInsight
                    {
                        Title = "Popular Game Type",
                        Description = $"{topType.GameType} games are generating the most revenue with £{topType.Revenue:N2} across {topType.Count} games.",
                        Category = "Game",
                        Importance = 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "GameType",
                        TrendDirection = "Positive",
                        InsightType = "Pattern"
                    });
                }
                
                // Add anomaly insights
                foreach (var anomaly in anomalies.Where(a => a.Severity >= 4).Take(2))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = anomaly.Title,
                        Description = anomaly.Description,
                        Category = "Game",
                        Importance = anomaly.Severity * 2,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.IsPositive ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        DetailedExplanation = anomaly.PotentialCause,
                        RecommendedAction = anomaly.IsPositive ? 
                            "Consider featuring this game more prominently on the platform." : 
                            "Investigate potential technical or player experience issues with this game."
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
        public async Task<List<DashboardInsight>> GenerateTransactionInsightsAsync(List<RecentTransactionItem> transactions)
        {
            try
            {
                var insights = new List<DashboardInsight>();
                
                if (transactions == null || !transactions.Any())
                    return insights;
                
                // Detect anomalies in transaction data
                var anomalies = await _anomalyDetectionService.DetectTransactionAnomaliesAsync(transactions);
                
                // Group transactions by type
                var transactionsByType = transactions
                    .GroupBy(t => t.TransactionType)
                    .Select(g => new { Type = g.Key, Count = g.Count(), Amount = g.Sum(t => t.Amount) })
                    .OrderByDescending(g => g.Amount)
                    .ToList();
                
                if (transactionsByType.Any())
                {
                    var topType = transactionsByType.First();
                    insights.Add(new DashboardInsight
                    {
                        Title = "Transaction Patterns",
                        Description = $"{topType.Type} is the most common transaction type with {topType.Count} transactions totaling £{topType.Amount:N2}.",
                        Category = "Transaction",
                        Importance = 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "TransactionType",
                        TrendDirection = "Neutral",
                        InsightType = "Pattern"
                    });
                }
                
                // Group transactions by status
                var transactionsByStatus = transactions
                    .GroupBy(t => t.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count(), Percentage = (double)g.Count() / transactions.Count * 100 })
                    .OrderByDescending(g => g.Count)
                    .ToList();
                
                // Check for failed transactions
                var failedTransactions = transactionsByStatus.FirstOrDefault(t => t.Status == "Failed");
                if (failedTransactions != null && failedTransactions.Percentage > 5)
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = "Failed Transactions",
                        Description = $"{failedTransactions.Count} transactions ({failedTransactions.Percentage:F1}%) have failed status.",
                        Category = "Transaction",
                        Importance = failedTransactions.Percentage > 10 ? 9 : 7,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "FailedTransactions",
                        TrendDirection = "Negative",
                        InsightType = "Pattern",
                        RecommendedAction = "Investigate payment processing systems and player communication regarding failed transactions."
                    });
                }
                
                // Group transactions by platform
                var transactionsByPlatform = transactions
                    .GroupBy(t => t.Platform)
                    .Select(g => new { Platform = g.Key, Count = g.Count(), Percentage = (double)g.Count() / transactions.Count * 100 })
                    .OrderByDescending(g => g.Count)
                    .ToList();
                
                if (transactionsByPlatform.Count > 1)
                {
                    var topPlatform = transactionsByPlatform.First();
                    insights.Add(new DashboardInsight
                    {
                        Title = "Platform Usage",
                        Description = $"{topPlatform.Platform} is the most used platform with {topPlatform.Percentage:F1}% of transactions.",
                        Category = "Transaction",
                        Importance = 5,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = "Platform",
                        TrendDirection = "Neutral",
                        InsightType = "Pattern"
                    });
                }
                
                // Add anomaly insights
                foreach (var anomaly in anomalies.Where(a => a.Severity >= 4).Take(1))
                {
                    insights.Add(new DashboardInsight
                    {
                        Title = anomaly.Title,
                        Description = anomaly.Description,
                        Category = "Transaction",
                        Importance = anomaly.Severity * 2,
                        GeneratedAt = DateTime.UtcNow,
                        MetricKey = anomaly.MetricKey,
                        TrendDirection = anomaly.IsPositive ? "Positive" : "Negative",
                        InsightType = "Anomaly",
                        DetailedExplanation = anomaly.PotentialCause
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
                
                // Get key insights (highest importance)
                var keyInsights = allInsights
                    .OrderByDescending(i => i.Importance)
                    .Take(5)
                    .ToList();
                
                // Create dashboard story
                var story = new DashboardStory
                {
                    Title = $"Dashboard Insights for {dashboardData.Summary.Date.ToShortDateString()}",
                    Summary = GenerateStorySummary(dashboardData.Summary, keyInsights),
                    GeneratedAt = DateTime.UtcNow,
                    KeyInsights = keyInsights,
                    SignificantAnomalies = GetSignificantAnomalies(allInsights),
                    Highlights = GenerateHighlights(dashboardData, allInsights),
                    BusinessContext = GenerateBusinessContext(dashboardData.Summary),
                    OpportunityAnalysis = GenerateOpportunityAnalysis(allInsights),
                    RiskAnalysis = GenerateRiskAnalysis(allInsights),
                    RecommendedActions = GenerateRecommendedActions(allInsights)
                };
                
                return story;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dashboard story");
                return new DashboardStory
                {
                    Title = "Dashboard Story",
                    Summary = "Unable to generate complete dashboard story at this time.",
                    GeneratedAt = DateTime.UtcNow,
                    KeyInsights = new List<DashboardInsight>(),
                    SignificantAnomalies = new List<DataAnomaly>(),
                    Highlights = new List<string>(),
                    RecommendedActions = new List<string>()
                };
            }
        }
        
        #region Helper Methods
        
        private DashboardInsight CreateInsightFromMetric(string title, string description, string category, int importance, string metricKey, string trendDirection)
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
                InsightType = "Pattern"
            };
        }
        
        private string FormatTrendDirection(decimal change)
        {
            return change >= 0 ? "up" : "down";
        }
        
        private string GetTrendDirection(decimal change)
        {
            if (change > 0) return "Positive";
            if (change < 0) return "Negative";
            return "Neutral";
        }
        
        private int GetImportanceFromChange(decimal change, int highThreshold, int lowThreshold)
        {
            var absChange = Math.Abs(change);
            
            if (absChange >= 20) return highThreshold;
            if (absChange >= 10) return highThreshold - 1;
            if (absChange >= 5) return lowThreshold + 1;
            return lowThreshold;
        }
        
        private List<DataAnomaly> GetSignificantAnomalies(List<DashboardInsight> insights)
        {
            return insights
                .Where(i => i.InsightType == "Anomaly")
                .Select(i => new DataAnomaly
                {
                    Title = i.Title,
                    Description = i.Description,
                    Category = i.Category,
                    MetricKey = i.MetricKey,
                    DetectedAt = i.GeneratedAt,
                    AnomalyDate = i.GeneratedAt.Date,
                    Severity = i.Importance / 2,
                    IsPositive = i.TrendDirection == "Positive",
                    PotentialCause = i.DetailedExplanation
                })
                .ToList();
        }
        
        private string GenerateStorySummary(DashboardSummary summary, List<DashboardInsight> keyInsights)
        {
            string registrationsText = summary.RegistrationsChange >= 0 
                ? $"increased by {summary.RegistrationsChange}%" 
                : $"decreased by {Math.Abs(summary.RegistrationsChange)}%";
                
            string revenueText = summary.RevenueChange >= 0 
                ? $"increased by {summary.RevenueChange}%" 
                : $"decreased by {Math.Abs(summary.RevenueChange)}%";
                
            string ftdText = summary.FTDChange >= 0 
                ? $"increased by {summary.FTDChange}%" 
                : $"decreased by {Math.Abs(summary.FTDChange)}%";
                
            return $"Today's summary shows that registrations have {registrationsText}, " +
                   $"first time depositors have {ftdText}, and revenue has {revenueText} compared to yesterday. " +
                   $"{(keyInsights.Any() ? "Key insights include: " + keyInsights.First().Description : "")}";
        }
        
        private List<string> GenerateHighlights(DashboardData dashboardData, List<DashboardInsight> allInsights)
        {
            var highlights = new List<string>();
            
            // Add revenue highlight
            if (dashboardData.Summary.Revenue > 0)
            {
                highlights.Add($"Total revenue: £{dashboardData.Summary.Revenue:N2} ({(dashboardData.Summary.RevenueChange >= 0 ? "+" : "")}{dashboardData.Summary.RevenueChange}% vs yesterday)");
            }
            
            // Add registrations highlight
            highlights.Add($"New registrations: {dashboardData.Summary.Registrations} ({(dashboardData.Summary.RegistrationsChange >= 0 ? "+" : "")}{dashboardData.Summary.RegistrationsChange}% vs yesterday)");
            
            // Add FTD highlight
            highlights.Add($"First time depositors: {dashboardData.Summary.FTD} ({(dashboardData.Summary.FTDChange >= 0 ? "+" : "")}{dashboardData.Summary.FTDChange}% vs yesterday)");
            
            // Add top game if available
            var topGame = dashboardData.TopGames?.OrderByDescending(g => g.Revenue).FirstOrDefault();
            if (topGame != null)
            {
                highlights.Add($"Top performing game: {topGame.GameName} (£{topGame.Revenue:N2})");
            }
            
            // Add insights highlights
            highlights.AddRange(
                allInsights
                    .Where(i => i.Importance >= 8 && i.Category != "Summary")
                    .OrderByDescending(i => i.Importance)
                    .Take(2)
                    .Select(i => i.Description)
            );
            
            return highlights;
        }
        
        private string GenerateBusinessContext(DashboardSummary summary)
        {
            var performanceIndicator = summary.RevenueChange >= 5 ? "strong" : 
                                      summary.RevenueChange >= 0 ? "stable" : 
                                      summary.RevenueChange >= -5 ? "slight underperformance" : "significant underperformance";
                                      
            return $"Today's data shows {performanceIndicator} compared to yesterday across key metrics. " +
                   $"Player acquisition is {(summary.RegistrationsChange >= 0 ? "growing" : "declining")} and " +
                   $"monetization is {(summary.RevenueChange >= 0 ? "improving" : "declining")}.";
        }
        
        private string GenerateOpportunityAnalysis(List<DashboardInsight> insights)
        {
            var opportunityInsights = insights
                .Where(i => i.TrendDirection == "Positive" && i.Importance >= 6)
                .OrderByDescending(i => i.Importance)
                .Take(2)
                .ToList();
                
            if (!opportunityInsights.Any())
            {
                return "No significant opportunities identified based on current data.";
            }
            
            return string.Join(" ", opportunityInsights.Select(i => i.Description));
        }
        
        private string GenerateRiskAnalysis(List<DashboardInsight> insights)
        {
            var riskInsights = insights
                .Where(i => i.TrendDirection == "Negative" && i.Importance >= 7)
                .OrderByDescending(i => i.Importance)
                .Take(2)
                .ToList();
                
            if (!riskInsights.Any())
            {
                return "No significant risks identified based on current data.";
            }
            
            return string.Join(" ", riskInsights.Select(i => i.Description));
        }
        
        private List<string> GenerateRecommendedActions(List<DashboardInsight> insights)
        {
            return insights
                .Where(i => !string.IsNullOrEmpty(i.RecommendedAction))
                .OrderByDescending(i => i.Importance)
                .Take(3)
                .Select(i => i.RecommendedAction)
                .ToList();
        }
        
        #endregion
    }
}