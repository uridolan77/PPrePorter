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
    /// Implementation of IAnomalyDetectionService that detects anomalies in dashboard data
    /// </summary>
    public class AnomalyDetectionService : IAnomalyDetectionService
    {
        private readonly ILogger<AnomalyDetectionService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="AnomalyDetectionService"/> class
        /// </summary>
        /// <param name="logger">Logger</param>
        public AnomalyDetectionService(ILogger<AnomalyDetectionService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Detect anomalies in revenue data
        /// </summary>
        /// <param name="revenueData">Revenue data</param>
        /// <returns>List of detected anomalies</returns>
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
                    var item = revenueData[index];
                    var expectedValue = CalculateExpectedValue(values, index);
                    var deviation = Math.Abs(item.Revenue - expectedValue) / expectedValue * 100;

                    anomalies.Add(new DataAnomaly
                    {
                        Date = item.Date,
                        MetricKey = "Revenue",
                        ActualValue = item.Revenue,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviation,
                        Severity = CalculateSeverity(deviation),
                        Description = $"Revenue on {item.Date:d} is {(item.Revenue > expectedValue ? "higher" : "lower")} than expected by {deviation:F1}%",
                        PossibleCauses = GeneratePossibleCauses(item.Revenue, expectedValue, "Revenue"),
                        RecommendedActions = GenerateRecommendedActions(item.Revenue, expectedValue, "Revenue")
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
        /// <param name="registrationData">Registration data</param>
        /// <returns>List of detected anomalies</returns>
        public async Task<List<DataAnomaly>> DetectRegistrationAnomaliesAsync(List<PlayerRegistrationItem> registrationData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (registrationData == null || registrationData.Count < 3)
                    return anomalies;

                // Get registration values
                var values = registrationData.Select(r => (decimal)r.Registrations).ToList();
                var dates = registrationData.Select(r => r.Date).ToList();

                // Detect anomalies using Z-score method
                var anomalyIndices = DetectAnomaliesUsingZScore(values, 2.0);

                // Create anomaly objects
                foreach (var index in anomalyIndices)
                {
                    var item = registrationData[index];
                    var expectedValue = CalculateExpectedValue(values, index);
                    var deviation = Math.Abs(item.Registrations - expectedValue) / expectedValue * 100;

                    anomalies.Add(new DataAnomaly
                    {
                        Date = item.Date,
                        MetricKey = "Registrations",
                        ActualValue = item.Registrations,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviation,
                        Severity = CalculateSeverity(deviation),
                        Description = $"Registrations on {item.Date:d} is {(item.Registrations > expectedValue ? "higher" : "lower")} than expected by {deviation:F1}%",
                        PossibleCauses = GeneratePossibleCauses(item.Registrations, expectedValue, "Registrations"),
                        RecommendedActions = GenerateRecommendedActions(item.Registrations, expectedValue, "Registrations")
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
        /// <param name="gameData">Game data</param>
        /// <returns>List of detected anomalies</returns>
        public async Task<List<DataAnomaly>> DetectGamePerformanceAnomaliesAsync(List<TopGameItem> gameData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (gameData == null || gameData.Count < 3)
                    return anomalies;

                // Get game revenue values
                var values = gameData.Select(g => g.Revenue).ToList();
                var gameNames = gameData.Select(g => g.GameName).ToList();

                // Detect anomalies using Z-score method
                var anomalyIndices = DetectAnomaliesUsingZScore(values, 2.0);

                // Create anomaly objects
                foreach (var index in anomalyIndices)
                {
                    var item = gameData[index];
                    var expectedValue = CalculateExpectedValue(values, index);
                    var deviation = Math.Abs(item.Revenue - expectedValue) / expectedValue * 100;

                    anomalies.Add(new DataAnomaly
                    {
                        MetricKey = "GameRevenue",
                        ActualValue = item.Revenue,
                        ExpectedValue = expectedValue,
                        DeviationPercentage = deviation,
                        Severity = CalculateSeverity(deviation),
                        Description = $"Game '{item.GameName}' revenue is {(item.Revenue > expectedValue ? "higher" : "lower")} than expected by {deviation:F1}%",
                        PossibleCauses = GeneratePossibleCauses(item.Revenue, expectedValue, "GameRevenue"),
                        RecommendedActions = GenerateRecommendedActions(item.Revenue, expectedValue, "GameRevenue"),
                        AdditionalData = new Dictionary<string, object> { { "GameName", item.GameName } }
                    });
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
        /// <param name="transactionData">Transaction data</param>
        /// <returns>List of detected anomalies</returns>
        public async Task<List<DataAnomaly>> DetectTransactionAnomaliesAsync(List<RecentTransactionItem> transactionData)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (transactionData == null || transactionData.Count < 3)
                    return anomalies;

                // Group transactions by type
                var transactionsByType = transactionData
                    .GroupBy(t => t.TransactionType)
                    .ToDictionary(g => g.Key, g => g.ToList());

                // Detect anomalies for each transaction type
                foreach (var kvp in transactionsByType)
                {
                    var type = kvp.Key;
                    var transactions = kvp.Value;

                    if (transactions.Count < 3)
                        continue;

                    // Get transaction amounts
                    var values = transactions.Select(t => t.Amount).ToList();
                    var dates = transactions.Select(t => t.Date).ToList();

                    // Detect anomalies using Z-score method
                    var anomalyIndices = DetectAnomaliesUsingZScore(values, 2.0);

                    // Create anomaly objects
                    foreach (var index in anomalyIndices)
                    {
                        var item = transactions[index];
                        var expectedValue = CalculateExpectedValue(values, index);
                        var deviation = Math.Abs(item.Amount - expectedValue) / expectedValue * 100;

                        anomalies.Add(new DataAnomaly
                        {
                            Date = item.Date,
                            MetricKey = $"Transaction_{type}",
                            ActualValue = item.Amount,
                            ExpectedValue = expectedValue,
                            DeviationPercentage = deviation,
                            Severity = CalculateSeverity(deviation),
                            Description = $"{type} transaction on {item.Date:d} is {(item.Amount > expectedValue ? "higher" : "lower")} than expected by {deviation:F1}%",
                            PossibleCauses = GeneratePossibleCauses(item.Amount, expectedValue, $"Transaction_{type}"),
                            RecommendedActions = GenerateRecommendedActions(item.Amount, expectedValue, $"Transaction_{type}"),
                            AdditionalData = new Dictionary<string, object> { { "TransactionType", type } }
                        });
                    }
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
        /// <param name="summary">Dashboard summary</param>
        /// <returns>List of detected anomalies</returns>
        public async Task<List<DataAnomaly>> DetectSummaryAnomaliesAsync(DashboardSummary summary)
        {
            try
            {
                var anomalies = new List<DataAnomaly>();

                if (summary == null)
                    return anomalies;

                // Check for significant changes in key metrics
                CheckSummaryMetric(anomalies, "Revenue", summary.Revenue, summary.RevenueChange);
                CheckSummaryMetric(anomalies, "Registrations", summary.Registrations, summary.RegistrationsChange);
                CheckSummaryMetric(anomalies, "FTD", summary.FTD, summary.FTDChange);
                CheckSummaryMetric(anomalies, "Deposits", summary.Deposits, summary.DepositsChange);
                CheckSummaryMetric(anomalies, "Cashouts", summary.Cashouts, summary.CashoutsChange);
                CheckSummaryMetric(anomalies, "Bets", summary.Bets, summary.BetsChange);
                CheckSummaryMetric(anomalies, "Wins", summary.Wins, summary.WinsChange);

                return anomalies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting summary anomalies");
                return new List<DataAnomaly>();
            }
        }

        #region Helper Methods

        /// <summary>
        /// Detect anomalies using Z-score method
        /// </summary>
        /// <param name="values">Values to analyze</param>
        /// <param name="threshold">Z-score threshold</param>
        /// <returns>Indices of anomalies</returns>
        private List<int> DetectAnomaliesUsingZScore(List<decimal> values, double threshold)
        {
            var anomalies = new List<int>();

            if (values.Count < 3)
                return anomalies;

            // Calculate mean and standard deviation
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Select(v => Math.Pow((double)(v - mean), 2)).Average());

            // If standard deviation is too small, return empty list
            if (stdDev < 0.0001)
                return anomalies;

            // Calculate Z-scores and find anomalies
            for (int i = 0; i < values.Count; i++)
            {
                var zScore = Math.Abs((double)(values[i] - mean) / stdDev);
                if (zScore > threshold)
                {
                    anomalies.Add(i);
                }
            }

            return anomalies;
        }

        /// <summary>
        /// Calculate expected value for a data point
        /// </summary>
        /// <param name="values">All values</param>
        /// <param name="index">Index of the current value</param>
        /// <returns>Expected value</returns>
        private decimal CalculateExpectedValue(List<decimal> values, int index)
        {
            // Simple approach: use the average of other values
            var otherValues = values.Where((v, i) => i != index).ToList();
            return otherValues.Average();
        }

        /// <summary>
        /// Calculate severity of an anomaly
        /// </summary>
        /// <param name="deviationPercentage">Deviation percentage</param>
        /// <returns>Severity level (1-10)</returns>
        private int CalculateSeverity(decimal deviationPercentage)
        {
            // Map deviation percentage to severity level (1-10)
            if (deviationPercentage > 100) return 10;
            if (deviationPercentage > 80) return 9;
            if (deviationPercentage > 60) return 8;
            if (deviationPercentage > 40) return 7;
            if (deviationPercentage > 30) return 6;
            if (deviationPercentage > 20) return 5;
            if (deviationPercentage > 15) return 4;
            if (deviationPercentage > 10) return 3;
            if (deviationPercentage > 5) return 2;
            return 1;
        }

        /// <summary>
        /// Generate possible causes for an anomaly
        /// </summary>
        /// <param name="actualValue">Actual value</param>
        /// <param name="expectedValue">Expected value</param>
        /// <param name="metricKey">Metric key</param>
        /// <returns>List of possible causes</returns>
        private List<string> GeneratePossibleCauses(decimal actualValue, decimal expectedValue, string metricKey)
        {
            var causes = new List<string>();
            var isHigher = actualValue > expectedValue;

            switch (metricKey)
            {
                case "Revenue":
                    if (isHigher)
                    {
                        causes.Add("Increased player activity");
                        causes.Add("Successful marketing campaign");
                        causes.Add("New game release");
                        causes.Add("Seasonal effect (weekend, holiday)");
                    }
                    else
                    {
                        causes.Add("Decreased player activity");
                        causes.Add("Technical issues");
                        causes.Add("Increased competition");
                        causes.Add("Seasonal effect (weekday, non-holiday)");
                    }
                    break;

                case "Registrations":
                    if (isHigher)
                    {
                        causes.Add("Successful marketing campaign");
                        causes.Add("Promotion or bonus offer");
                        causes.Add("Seasonal effect (weekend, holiday)");
                        causes.Add("Viral social media activity");
                    }
                    else
                    {
                        causes.Add("Marketing campaign ended");
                        causes.Add("Registration process issues");
                        causes.Add("Seasonal effect (weekday, non-holiday)");
                        causes.Add("Increased competition");
                    }
                    break;

                default:
                    if (isHigher)
                    {
                        causes.Add("Unusual increase in activity");
                        causes.Add("Possible seasonal effect");
                    }
                    else
                    {
                        causes.Add("Unusual decrease in activity");
                        causes.Add("Possible technical issues");
                    }
                    break;
            }

            return causes;
        }

        /// <summary>
        /// Generate recommended actions for an anomaly
        /// </summary>
        /// <param name="actualValue">Actual value</param>
        /// <param name="expectedValue">Expected value</param>
        /// <param name="metricKey">Metric key</param>
        /// <returns>List of recommended actions</returns>
        private List<string> GenerateRecommendedActions(decimal actualValue, decimal expectedValue, string metricKey)
        {
            var actions = new List<string>();
            var isHigher = actualValue > expectedValue;

            switch (metricKey)
            {
                case "Revenue":
                    if (isHigher)
                    {
                        actions.Add("Analyze which games or activities contributed to the increase");
                        actions.Add("Consider extending successful promotions");
                        actions.Add("Monitor for sustainability of the trend");
                    }
                    else
                    {
                        actions.Add("Check for technical issues");
                        actions.Add("Review recent changes to the platform");
                        actions.Add("Consider launching a promotion to boost activity");
                    }
                    break;

                case "Registrations":
                    if (isHigher)
                    {
                        actions.Add("Analyze the source of new registrations");
                        actions.Add("Ensure adequate onboarding for new users");
                        actions.Add("Monitor conversion to active players");
                    }
                    else
                    {
                        actions.Add("Check registration process for issues");
                        actions.Add("Review marketing campaign performance");
                        actions.Add("Consider adjusting acquisition strategy");
                    }
                    break;

                default:
                    actions.Add("Investigate the cause of the anomaly");
                    actions.Add("Monitor the metric for continued deviation");
                    break;
            }

            return actions;
        }

        /// <summary>
        /// Check a summary metric for anomalies
        /// </summary>
        /// <param name="anomalies">List to add anomalies to</param>
        /// <param name="metricKey">Metric key</param>
        /// <param name="value">Metric value</param>
        /// <param name="change">Percentage change</param>
        private void CheckSummaryMetric(List<DataAnomaly> anomalies, string metricKey, decimal value, decimal change)
        {
            // Consider a change significant if it's more than 20%
            if (Math.Abs(change) > 20)
            {
                var expectedValue = value / (1 + change / 100);
                var deviation = Math.Abs(change);

                anomalies.Add(new DataAnomaly
                {
                    Date = DateTime.Today,
                    MetricKey = metricKey,
                    ActualValue = value,
                    ExpectedValue = expectedValue,
                    DeviationPercentage = deviation,
                    Severity = CalculateSeverity(deviation),
                    Description = $"{metricKey} is {(change > 0 ? "up" : "down")} by {Math.Abs(change):F1}% compared to yesterday",
                    PossibleCauses = GeneratePossibleCauses(value, expectedValue, metricKey),
                    RecommendedActions = GenerateRecommendedActions(value, expectedValue, metricKey)
                });
            }
        }

        #endregion
    }
}
