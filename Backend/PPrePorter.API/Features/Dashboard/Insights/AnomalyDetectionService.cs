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
    /// Implementation of IAnomalyDetectionService that detects anomalies in dashboard data
    /// </summary>
    public class AnomalyDetectionService : IAnomalyDetectionService
    {
        private readonly ILogger<AnomalyDetectionService> _logger;

        public AnomalyDetectionService(ILogger<AnomalyDetectionService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Detect anomalies in revenue data
        /// </summary>
        public async Task<List<DataAnomaly>> DetectRevenueAnomaliesAsync(List<CasinoRevenueItem> revenueData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (revenueData == null || revenueData.Count < 3)
                    return anomalies;

                // Get revenue values
                var values = revenueData.Select(r => r.Revenue).ToList();
                var dates = revenueData.Select(r => r.Date).ToList();

                // Detect anomalies using Z-score method
                var anomalyIndices = DetectAnomaliesUsingZScore(values, 2.0);

                // Create anomaly objects
                foreach (var index in anomalyIndices)
                {
                    var value = values[index];
                    var date = dates[index];
                    var expectedValue = CalculateExpectedValue(values, index);
                    var deviation = value - expectedValue;
                    var deviationPercentage = expectedValue != 0 ? (value - expectedValue) / expectedValue * 100 : 0;

                    anomalies.Add(new DataAnomaly
                    {
                        Title = $"Revenue Anomaly on {date:yyyy-MM-dd}",
                        Description = $"Revenue of {value:C2} is {Math.Abs(deviationPercentage):F1}% {(deviationPercentage >= 0 ? "higher" : "lower")} than expected.",
                        Category = "Revenue",
                        MetricKey = "Revenue",
                        DetectedAt = DateTime.UtcNow,
                        Date = date,
                        ActualValue = value,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviationPercentage,
                        Severity = Math.Abs(deviationPercentage) > 30 ? 5 : Math.Abs(deviationPercentage) > 20 ? 4 : 3,
                        PossibleCauses = new List<string> { GeneratePotentialCause("Revenue", deviationPercentage) },
                        RecommendedActions = new List<string> { "Monitor for continued pattern", "Review recent promotions" }
                    });
                }

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting revenue anomalies");
                return new List<DataAnomaly>();
            }
        }

        /// <summary>
        /// Detect anomalies in player registration data
        /// </summary>
        public async Task<List<DataAnomaly>> DetectRegistrationAnomaliesAsync(List<PlayerRegistrationItem> registrationData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (registrationData == null || registrationData.Count < 3)
                    return anomalies;

                // Detect registration anomalies
                var regValues = registrationData.Select(r => (decimal)r.Registrations).ToList();
                var regDates = registrationData.Select(r => r.Date).ToList();
                var regAnomalyIndices = DetectAnomaliesUsingZScore(regValues, 2.0);

                foreach (var index in regAnomalyIndices)
                {
                    var value = regValues[index];
                    var date = regDates[index];
                    var expectedValue = CalculateExpectedValue(regValues, index);
                    var deviation = value - expectedValue;
                    var deviationPercentage = expectedValue != 0 ? (value - expectedValue) / expectedValue * 100 : 0;

                    anomalies.Add(new DataAnomaly
                    {
                        Title = $"Registration Anomaly on {date:yyyy-MM-dd}",
                        Description = $"Registrations of {value} is {Math.Abs(deviationPercentage):F1}% {(deviationPercentage >= 0 ? "higher" : "lower")} than expected.",
                        Category = "Registration",
                        MetricKey = "Registrations",
                        DetectedAt = DateTime.UtcNow,
                        Date = date,
                        ActualValue = value,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviationPercentage,
                        Severity = Math.Abs(deviationPercentage) > 30 ? 5 : Math.Abs(deviationPercentage) > 20 ? 4 : 3,
                        PossibleCauses = new List<string> { GeneratePotentialCause("Registrations", deviationPercentage) },
                        RecommendedActions = new List<string> { "Review marketing campaigns", "Check registration process" }
                    });
                }

                // Detect FTD anomalies
                var ftdValues = registrationData.Select(r => (decimal)r.FirstTimeDepositors).ToList();
                var ftdAnomalyIndices = DetectAnomaliesUsingZScore(ftdValues, 2.0);

                foreach (var index in ftdAnomalyIndices)
                {
                    var value = ftdValues[index];
                    var date = regDates[index];
                    var expectedValue = CalculateExpectedValue(ftdValues, index);
                    var deviation = value - expectedValue;
                    var deviationPercentage = expectedValue != 0 ? (value - expectedValue) / expectedValue * 100 : 0;

                    anomalies.Add(new DataAnomaly
                    {
                        Title = $"First Time Depositor Anomaly on {date:yyyy-MM-dd}",
                        Description = $"First time depositors of {value} is {Math.Abs(deviationPercentage):F1}% {(deviationPercentage >= 0 ? "higher" : "lower")} than expected.",
                        Category = "Registration",
                        MetricKey = "FTD",
                        DetectedAt = DateTime.UtcNow,
                        Date = date,
                        ActualValue = value,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviationPercentage,
                        Severity = Math.Abs(deviationPercentage) > 30 ? 5 : Math.Abs(deviationPercentage) > 20 ? 4 : 3,
                        PossibleCauses = new List<string> { GeneratePotentialCause("FTD", deviationPercentage) },
                        RecommendedActions = new List<string> { "Review deposit bonuses", "Check payment processing" }
                    });
                }

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting registration anomalies");
                return new List<DataAnomaly>();
            }
        }

        /// <summary>
        /// Detect anomalies in top games performance
        /// </summary>
        public async Task<List<DataAnomaly>> DetectGamePerformanceAnomaliesAsync(List<TopGameItem> gameData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (gameData == null || gameData.Count < 3)
                    return anomalies;

                // For simplicity, we'll just check for games with unusually high or low revenue
                var revenues = gameData.Select(g => g.Revenue).ToList();
                var mean = revenues.Average();
                var stdDev = Math.Sqrt(revenues.Average(v => Math.Pow((double)(v - mean), 2)));

                foreach (var game in gameData)
                {
                    var zScore = stdDev > 0 ? (double)(game.Revenue - mean) / stdDev : 0;

                    if (Math.Abs(zScore) > 2)
                    {
                        var deviationPercentage = mean != 0 ? (game.Revenue - mean) / mean * 100 : 0;

                        anomalies.Add(new DataAnomaly
                        {
                            Title = $"Unusual Performance: {game.GameName}",
                            Description = $"{game.GameName} has {Math.Abs(deviationPercentage):F1}% {(deviationPercentage >= 0 ? "higher" : "lower")} revenue than average.",
                            Category = "Game",
                            MetricKey = "GameRevenue",
                            DetectedAt = DateTime.UtcNow,
                            Date = DateTime.UtcNow.Date,
                            ActualValue = game.Revenue,
                            ExpectedValue = mean,
                            DeviationPercentage = deviationPercentage,
                            Severity = Math.Abs(deviationPercentage) > 50 ? 5 : Math.Abs(deviationPercentage) > 30 ? 4 : 3,
                            PossibleCauses = new List<string> {
                                deviationPercentage > 0
                                    ? $"{game.GameName} is performing exceptionally well."
                                    : $"{game.GameName} is underperforming."
                            },
                            RecommendedActions = new List<string> {
                                deviationPercentage > 0
                                    ? "Consider featuring it more prominently."
                                    : "Check for technical issues or player feedback."
                            }
                        });
                    }
                }

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting game performance anomalies");
                return new List<DataAnomaly>();
            }
        }

        /// <summary>
        /// Detect anomalies in transaction data
        /// </summary>
        public async Task<List<DataAnomaly>> DetectTransactionAnomaliesAsync(List<RecentTransactionItem> transactionData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (transactionData == null || transactionData.Count < 3)
                    return anomalies;

                // Check for unusual transaction amounts
                var amounts = transactionData.Select(t => t.Amount).ToList();
                var mean = amounts.Average();
                var stdDev = Math.Sqrt(amounts.Average(v => Math.Pow((double)(v - mean), 2)));

                foreach (var transaction in transactionData)
                {
                    var zScore = stdDev > 0 ? (double)(transaction.Amount - mean) / stdDev : 0;

                    if (Math.Abs(zScore) > 3) // Higher threshold for transactions
                    {
                        var deviationPercentage = mean != 0 ? (transaction.Amount - mean) / mean * 100 : 0;

                        anomalies.Add(new DataAnomaly
                        {
                            Title = $"Unusual Transaction Amount",
                            Description = $"Transaction {transaction.TransactionID} has an amount of {transaction.Amount:C2}, which is {Math.Abs(deviationPercentage):F1}% {(deviationPercentage >= 0 ? "higher" : "lower")} than average.",
                            Category = "Transaction",
                            MetricKey = "TransactionAmount",
                            DetectedAt = DateTime.UtcNow,
                            Date = transaction.TransactionDate.Date,
                            ActualValue = transaction.Amount,
                            ExpectedValue = mean,
                            DeviationPercentage = deviationPercentage,
                            Severity = Math.Abs(deviationPercentage) > 100 ? 5 : Math.Abs(deviationPercentage) > 50 ? 4 : 3,
                            PossibleCauses = new List<string> { $"Unusual {transaction.TransactionType.ToLower()} amount detected." },
                            RecommendedActions = new List<string> { "Review transaction details", "Check for potential fraud" }
                        });
                    }
                }

                // Check for unusual number of failed transactions
                var failedCount = transactionData.Count(t => t.Status == "Failed");
                var failedPercentage = (decimal)failedCount / transactionData.Count * 100;

                if (failedPercentage > 10) // More than 10% failed transactions is unusual
                {
                    anomalies.Add(new DataAnomaly
                    {
                        Title = "High Transaction Failure Rate",
                        Description = $"{failedCount} transactions ({failedPercentage:F1}%) have failed status, which is higher than normal.",
                        Category = "Transaction",
                        MetricKey = "FailedTransactions",
                        DetectedAt = DateTime.UtcNow,
                        Date = DateTime.UtcNow.Date,
                        ActualValue = failedPercentage,
                        ExpectedValue = 5, // Expect around 5% failure rate
                        DeviationPercentage = failedPercentage - 5,
                        Severity = failedPercentage > 20 ? 5 : failedPercentage > 15 ? 4 : 3,
                        PossibleCauses = new List<string> { "High transaction failure rate may indicate payment processing issues or fraud attempts." },
                        RecommendedActions = new List<string> { "Check payment gateway status", "Review recent failed transactions" }
                    });
                }

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting transaction anomalies");
                return new List<DataAnomaly>();
            }
        }

        /// <summary>
        /// Analyze dashboard summary for significant deviations
        /// </summary>
        public async Task<List<DataAnomaly>> DetectSummaryAnomaliesAsync(DashboardSummary summary)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (summary == null)
                    return anomalies;

                // Check for significant changes in key metrics
                if (Math.Abs(summary.RevenueChange) > 20)
                {
                    anomalies.Add(new DataAnomaly
                    {
                        Title = "Significant Revenue Change",
                        Description = $"Revenue has {(summary.RevenueChange >= 0 ? "increased" : "decreased")} by {Math.Abs(summary.RevenueChange)}%, which is a significant change.",
                        Category = "Summary",
                        MetricKey = "Revenue",
                        DetectedAt = DateTime.UtcNow,
                        Date = summary.Date,
                        ActualValue = summary.Revenue,
                        ExpectedValue = 0, // We don't have the expected value
                        DeviationPercentage = summary.RevenueChange,
                        Severity = Math.Abs(summary.RevenueChange) > 30 ? 5 : 4,
                        PossibleCauses = new List<string> { GeneratePotentialCause("Revenue", summary.RevenueChange) },
                        RecommendedActions = new List<string> { "Analyze revenue sources", "Review recent promotions" }
                    });
                }

                if (Math.Abs(summary.RegistrationsChange) > 20)
                {
                    anomalies.Add(new DataAnomaly
                    {
                        Title = "Significant Registration Change",
                        Description = $"Registrations have {(summary.RegistrationsChange >= 0 ? "increased" : "decreased")} by {Math.Abs(summary.RegistrationsChange)}%, which is a significant change.",
                        Category = "Summary",
                        MetricKey = "Registrations",
                        DetectedAt = DateTime.UtcNow,
                        Date = summary.Date,
                        ActualValue = summary.Registrations,
                        ExpectedValue = 0, // We don't have the expected value
                        DeviationPercentage = summary.RegistrationsChange,
                        Severity = Math.Abs(summary.RegistrationsChange) > 30 ? 5 : 4,
                        PossibleCauses = new List<string> { GeneratePotentialCause("Registrations", summary.RegistrationsChange) },
                        RecommendedActions = new List<string> { "Review marketing campaigns", "Check registration process" }
                    });
                }

                if (Math.Abs(summary.FTDChange) > 20)
                {
                    anomalies.Add(new DataAnomaly
                    {
                        Title = "Significant First Time Depositor Change",
                        Description = $"First time depositors have {(summary.FTDChange >= 0 ? "increased" : "decreased")} by {Math.Abs(summary.FTDChange)}%, which is a significant change.",
                        Category = "Summary",
                        MetricKey = "FTD",
                        DetectedAt = DateTime.UtcNow,
                        Date = summary.Date,
                        ActualValue = summary.FTD,
                        ExpectedValue = 0, // We don't have the expected value
                        DeviationPercentage = summary.FTDChange,
                        Severity = Math.Abs(summary.FTDChange) > 30 ? 5 : 4,
                        PossibleCauses = new List<string> { GeneratePotentialCause("FTD", summary.FTDChange) },
                        RecommendedActions = new List<string> { "Review deposit bonuses", "Check payment processing" }
                    });
                }

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting summary anomalies");
                return new List<DataAnomaly>();
            }
        }

        #region Helper Methods

        private List<int> DetectAnomaliesUsingZScore(List<decimal> values, double threshold)
        {
            var anomalyIndices = new List<int>();

            if (values.Count < 3)
                return anomalyIndices;

            // Calculate mean and standard deviation
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Average(v => Math.Pow((double)(v - mean), 2)));

            // Detect anomalies (Z-score > threshold or < -threshold)
            for (int i = 0; i < values.Count; i++)
            {
                var zScore = stdDev > 0 ? (double)(values[i] - mean) / stdDev : 0;
                if (Math.Abs(zScore) > threshold)
                {
                    anomalyIndices.Add(i);
                }
            }

            return anomalyIndices;
        }

        private decimal CalculateExpectedValue(List<decimal> values, int index)
        {
            // Simple method: use the average of surrounding values
            var surroundingValues = new List<decimal>();

            // Add values before the current index
            for (int i = Math.Max(0, index - 3); i < index; i++)
            {
                surroundingValues.Add(values[i]);
            }

            // Add values after the current index
            for (int i = index + 1; i < Math.Min(values.Count, index + 4); i++)
            {
                surroundingValues.Add(values[i]);
            }

            return surroundingValues.Count > 0 ? surroundingValues.Average() : 0;
        }

        private string GeneratePotentialCause(string metric, decimal deviationPercentage)
        {
            if (deviationPercentage >= 0)
            {
                return metric switch
                {
                    "Revenue" => "Possible causes include successful promotions, new game releases, or increased player activity.",
                    "Registrations" => "Possible causes include successful marketing campaigns, promotions, or seasonal effects.",
                    "FTD" => "Possible causes include effective welcome bonuses, improved onboarding, or targeted promotions.",
                    _ => "Investigating potential causes for this positive change."
                };
            }
            else
            {
                return metric switch
                {
                    "Revenue" => "Possible causes include technical issues, decreased player activity, or competitive pressures.",
                    "Registrations" => "Possible causes include marketing issues, website problems, or seasonal effects.",
                    "FTD" => "Possible causes include payment processing issues, onboarding problems, or less attractive welcome offers.",
                    _ => "Investigating potential causes for this negative change."
                };
            }
        }

        #endregion
    }
}
