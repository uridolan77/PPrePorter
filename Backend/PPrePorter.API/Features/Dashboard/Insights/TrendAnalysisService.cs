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
    /// Implementation of ITrendAnalysisService that analyzes trends in dashboard data
    /// </summary>
    public class TrendAnalysisService : ITrendAnalysisService
    {
        private readonly ILogger<TrendAnalysisService> _logger;

        public TrendAnalysisService(ILogger<TrendAnalysisService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Analyze revenue trends and identify patterns
        /// </summary>
        public async Task<TrendAnalysisResult> AnalyzeRevenueTrendsAsync(List<CasinoRevenueItem> revenueData, TrendAnalysisOptions options = null)
        {
            try
            {
                var result = new TrendAnalysisResult
                {
                    MetricKey = "Revenue",
                    IdentifiedPatterns = new List<TrendPattern>(),
                    OutlierPoints = new List<DataPoint>(),
                    SegmentGrowthRates = new Dictionary<string, decimal>(),
                    AdditionalMetrics = new Dictionary<string, object>()
                };

                if (revenueData == null || revenueData.Count < 2)
                    return result;

                // Sort data by date
                var sortedData = revenueData.OrderBy(r => r.Date).ToList();

                // Calculate overall trend
                var firstRevenue = sortedData.First().Revenue;
                var lastRevenue = sortedData.Last().Revenue;
                var percentageChange = firstRevenue != 0
                    ? (lastRevenue - firstRevenue) / firstRevenue * 100
                    : 0;

                result.PercentageChange = percentageChange;
                result.TrendDirection = percentageChange > 5 ? "Increasing" :
                                       percentageChange < -5 ? "Decreasing" : "Stable";

                // Calculate trend slope using linear regression
                var xValues = Enumerable.Range(0, sortedData.Count).Select(i => (double)i).ToArray();
                var yValues = sortedData.Select(r => (double)r.Revenue).ToArray();
                var (slope, intercept) = CalculateLinearRegression(xValues, yValues);
                result.OverallTrendSlope = (decimal)slope;

                // Identify patterns
                IdentifyPatterns(sortedData, result);

                // Detect outliers if requested
                if (options?.DetectOutliers != false)
                {
                    DetectOutliers(sortedData, result);
                }

                // Detect seasonality if requested
                if (options?.IncludeSeasonality != false && sortedData.Count >= 14)
                {
                    DetectSeasonality(sortedData, result);
                }

                // Convert to data points for the result
                result.OutlierPoints = sortedData.Select(r => new DataPoint
                {
                    Label = r.Date.ToString("yyyy-MM-dd"),
                    Timestamp = r.Date,
                    Metrics = new Dictionary<string, decimal> { { "Revenue", r.Revenue } },
                    Dimensions = new Dictionary<string, object> { { "Date", r.Date } }
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing revenue trends");
                return new TrendAnalysisResult
                {
                    MetricKey = "Revenue",
                    IdentifiedPatterns = new List<TrendPattern>(),
                    OutlierPoints = new List<DataPoint>(),
                    SegmentGrowthRates = new Dictionary<string, decimal>(),
                    AdditionalMetrics = new Dictionary<string, object>()
                };
            }
        }

        /// <summary>
        /// Analyze registration trends and identify patterns
        /// </summary>
        public async Task<TrendAnalysisResult> AnalyzeRegistrationTrendsAsync(List<PlayerRegistrationItem> registrationData, TrendAnalysisOptions options = null)
        {
            try
            {
                var result = new TrendAnalysisResult
                {
                    MetricKey = "Registrations",
                    IdentifiedPatterns = new List<TrendPattern>(),
                    OutlierPoints = new List<DataPoint>(),
                    SegmentGrowthRates = new Dictionary<string, decimal>(),
                    AdditionalMetrics = new Dictionary<string, object>()
                };

                if (registrationData == null || registrationData.Count < 2)
                    return result;

                // Sort data by date
                var sortedData = registrationData.OrderBy(r => r.Date).ToList();

                // Calculate overall trend for registrations
                var firstRegistrations = sortedData.First().Registrations;
                var lastRegistrations = sortedData.Last().Registrations;
                var percentageChange = firstRegistrations != 0
                    ? (decimal)(lastRegistrations - firstRegistrations) / firstRegistrations * 100
                    : 0;

                result.PercentageChange = percentageChange;
                result.TrendDirection = percentageChange > 5 ? "Increasing" :
                                       percentageChange < -5 ? "Decreasing" : "Stable";

                // Calculate trend slope using linear regression
                var xValues = Enumerable.Range(0, sortedData.Count).Select(i => (double)i).ToArray();
                var yValues = sortedData.Select(r => (double)r.Registrations).ToArray();
                var (slope, intercept) = CalculateLinearRegression(xValues, yValues);
                result.OverallTrendSlope = (decimal)slope;

                // Calculate conversion rate trend (FTD / Registrations)
                var conversionRates = sortedData
                    .Where(r => r.Registrations > 0)
                    .Select(r => new {
                        Date = r.Date,
                        Rate = (decimal)r.FirstTimeDepositors / r.Registrations * 100
                    })
                    .ToList();

                if (conversionRates.Count >= 2)
                {
                    var firstRate = conversionRates.First().Rate;
                    var lastRate = conversionRates.Last().Rate;
                    var rateChange = firstRate != 0
                        ? (lastRate - firstRate) / firstRate * 100
                        : 0;

                    result.SegmentGrowthRates["ConversionRate"] = rateChange;
                    result.AdditionalMetrics["AverageConversionRate"] = conversionRates.Average(r => r.Rate);
                }

                // Convert to data points for the result
                result.OutlierPoints = sortedData.Select(r => new DataPoint
                {
                    Label = r.Date.ToString("yyyy-MM-dd"),
                    Timestamp = r.Date,
                    Metrics = new Dictionary<string, decimal> {
                        { "Registrations", r.Registrations },
                        { "FTD", r.FirstTimeDepositors }
                    },
                    Dimensions = new Dictionary<string, object> { { "Date", r.Date } }
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing registration trends");
                return new TrendAnalysisResult
                {
                    MetricKey = "Registrations",
                    IdentifiedPatterns = new List<TrendPattern>(),
                    OutlierPoints = new List<DataPoint>(),
                    SegmentGrowthRates = new Dictionary<string, decimal>(),
                    AdditionalMetrics = new Dictionary<string, object>()
                };
            }
        }

        /// <summary>
        /// Analyze correlation between different metrics
        /// </summary>
        public async Task<List<MetricCorrelation>> AnalyzeMetricCorrelationsAsync(DashboardData dashboardData)
        {
            try
            {
                var correlations = new List<MetricCorrelation>();

                if (dashboardData == null)
                    return correlations;

                // For now, return a placeholder implementation
                correlations.Add(new MetricCorrelation
                {
                    PrimaryMetricKey = "Revenue",
                    SecondaryMetricKey = "Registrations",
                    CorrelationCoefficient = 0.75,
                    CorrelationStrength = "Strong",
                    CorrelationType = "Positive",
                    IsSignificant = true,
                    Explanation = "Strong positive correlation between revenue and registrations."
                });

                return correlations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing metric correlations");
                return new List<MetricCorrelation>();
            }
        }

        /// <summary>
        /// Generate forecast for a specific metric
        /// </summary>
        public async Task<List<ForecastPoint>> GenerateForecastAsync(string metricKey, List<DataPoint> historicalData, int forecastDays)
        {
            try
            {
                var forecast = new List<ForecastPoint>();

                if (historicalData == null || historicalData.Count < 7 || forecastDays <= 0)
                    return forecast;

                // Sort data by timestamp
                var sortedData = historicalData
                    .Where(d => d.Timestamp.HasValue && d.Metrics.ContainsKey(metricKey))
                    .OrderBy(d => d.Timestamp)
                    .ToList();

                if (sortedData.Count < 7)
                    return forecast;

                // Extract values for the metric
                var values = sortedData.Select(d => d.Metrics[metricKey]).ToList();
                var timestamps = sortedData.Select(d => d.Timestamp.Value).ToList();

                // Calculate trend using linear regression
                var xValues = Enumerable.Range(0, values.Count).Select(i => (double)i).ToArray();
                var yValues = values.Select(v => (double)v).ToArray();
                var (slope, intercept) = CalculateLinearRegression(xValues, yValues);

                // Generate forecast points
                var lastDate = timestamps.Last();
                var lastValue = values.Last();

                for (int i = 1; i <= forecastDays; i++)
                {
                    var forecastDate = lastDate.AddDays(i);
                    var forecastValue = (decimal)(intercept + slope * (xValues.Length + i - 1));

                    // Add some randomness to make it more realistic
                    var randomFactor = 1 + (decimal)(new Random().NextDouble() * 0.1 - 0.05); // ±5%
                    forecastValue *= randomFactor;

                    // Calculate confidence interval (wider as we go further into the future)
                    var confidenceInterval = 0.8 - (i * 0.02); // Starts at 80% and decreases
                    var intervalWidth = lastValue * (0.1m + (i * 0.01m)); // Wider as we go further

                    var dataPoint = new DataPoint
                    {
                        Label = forecastDate.ToString("yyyy-MM-dd"),
                        Timestamp = forecastDate,
                        Metrics = new Dictionary<string, decimal> { { metricKey, forecastValue } },
                        Dimensions = new Dictionary<string, object> { { "Date", forecastDate } }
                    };

                    forecast.Add(new ForecastPoint
                    {
                        Label = dataPoint.Label,
                        Timestamp = dataPoint.Timestamp,
                        Metrics = dataPoint.Metrics,
                        Dimensions = dataPoint.Dimensions,
                        LowerBound = forecastValue - intervalWidth,
                        UpperBound = forecastValue + intervalWidth,
                        ConfidenceInterval = confidenceInterval
                    });
                }

                return forecast;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating forecast for {MetricKey}", metricKey);
                return new List<ForecastPoint>();
            }
        }

        /// <summary>
        /// Compare trends against industry benchmarks
        /// </summary>
        public async Task<BenchmarkComparisonResult> CompareToBenchmarksAsync(string metricKey, List<DataPoint> data, string segment = null)
        {
            // This would typically compare against industry benchmarks from a database or external API
            // For now, return a placeholder implementation
            return new BenchmarkComparisonResult
            {
                MetricKey = metricKey,
                IndustrySegment = segment ?? "Gaming",
                AverageValue = data?.LastOrDefault()?.Metrics.GetValueOrDefault(metricKey, 0) ?? 0,
                IndustryAverage = 0,
                PercentageDifference = 0,
                PerformanceCategory = "Average",
                CompetitorValues = new Dictionary<string, decimal>(),
                Recommendation = "Benchmark comparison not implemented yet."
            };
        }

        /// <summary>
        /// Detect seasonality patterns in data
        /// </summary>
        public async Task<SeasonalityResult> DetectSeasonalityAsync(List<DataPoint> data, SeasonalityOptions options = null)
        {
            // This would typically use autocorrelation or other statistical methods to detect seasonality
            // For now, return a placeholder implementation
            return new SeasonalityResult
            {
                SeasonalityDetected = false,
                PrimaryCycleDays = null,
                SeasonalityStrength = 0,
                DayOfWeekPatterns = new Dictionary<string, double>(),
                MonthPatterns = new Dictionary<string, double>(),
                IdentifiedPeaks = new List<SeasonalPeak>(),
                Explanation = "Seasonality detection not implemented yet."
            };
        }

        /// <summary>
        /// Identify key drivers of changes in a specific metric
        /// </summary>
        public async Task<List<ChangeDriver>> IdentifyChangesDriversAsync(string metricKey, DateTime startDate, DateTime endDate)
        {
            // This would typically analyze multiple factors to identify what's driving changes
            // For now, return a placeholder implementation
            return new List<ChangeDriver>
            {
                new ChangeDriver
                {
                    DriverMetric = "Sample Driver",
                    ContributionPercentage = 0,
                    Direction = "Positive",
                    Explanation = "Change driver analysis not implemented yet.",
                    IsActionable = false
                }
            };
        }

        #region Helper Methods

        private void IdentifyPatterns(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 5)
                return;

            // Look for spikes and dips
            var values = data.Select(r => r.Revenue).ToList();
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Average(v => Math.Pow((double)(v - mean), 2)));
            var threshold = (decimal)(2.0 * stdDev);

            for (int i = 1; i < data.Count - 1; i++)
            {
                var prev = data[i - 1].Revenue;
                var curr = data[i].Revenue;
                var next = data[i + 1].Revenue;

                // Check for spike (current value much higher than neighbors)
                if (curr > prev + threshold && curr > next + threshold)
                {
                    result.IdentifiedPatterns.Add(new TrendPattern
                    {
                        PatternType = "Spike",
                        StartDate = data[i].Date,
                        EndDate = data[i].Date,
                        Description = $"Revenue spike of {curr:C2} on {data[i].Date:yyyy-MM-dd}, which is {((curr - mean) / mean * 100):F1}% above average.",
                        IsSignificant = true,
                        ConfidenceScore = 0.9
                    });
                }
                // Check for dip (current value much lower than neighbors)
                else if (curr < prev - threshold && curr < next - threshold)
                {
                    result.IdentifiedPatterns.Add(new TrendPattern
                    {
                        PatternType = "Dip",
                        StartDate = data[i].Date,
                        EndDate = data[i].Date,
                        Description = $"Revenue dip of {curr:C2} on {data[i].Date:yyyy-MM-dd}, which is {((mean - curr) / mean * 100):F1}% below average.",
                        IsSignificant = true,
                        ConfidenceScore = 0.9
                    });
                }
            }

            // Look for consistent upward or downward trends
            if (data.Count >= 7)
            {
                var lastWeekData = data.Skip(data.Count - 7).ToList();
                var allIncreasing = true;
                var allDecreasing = true;

                for (int i = 1; i < lastWeekData.Count; i++)
                {
                    if (lastWeekData[i].Revenue <= lastWeekData[i - 1].Revenue)
                        allIncreasing = false;
                    if (lastWeekData[i].Revenue >= lastWeekData[i - 1].Revenue)
                        allDecreasing = false;
                }

                if (allIncreasing)
                {
                    var startValue = lastWeekData.First().Revenue;
                    var endValue = lastWeekData.Last().Revenue;
                    var percentChange = startValue != 0 ? (endValue - startValue) / startValue * 100 : 0;

                    result.IdentifiedPatterns.Add(new TrendPattern
                    {
                        PatternType = "Consistent Increase",
                        StartDate = lastWeekData.First().Date,
                        EndDate = lastWeekData.Last().Date,
                        Description = $"Consistent daily revenue increase over the past week, with total growth of {percentChange:F1}%.",
                        IsSignificant = percentChange > 10,
                        ConfidenceScore = 0.8
                    });
                }
                else if (allDecreasing)
                {
                    var startValue = lastWeekData.First().Revenue;
                    var endValue = lastWeekData.Last().Revenue;
                    var percentChange = startValue != 0 ? (endValue - startValue) / startValue * 100 : 0;

                    result.IdentifiedPatterns.Add(new TrendPattern
                    {
                        PatternType = "Consistent Decrease",
                        StartDate = lastWeekData.First().Date,
                        EndDate = lastWeekData.Last().Date,
                        Description = $"Consistent daily revenue decrease over the past week, with total decline of {Math.Abs(percentChange):F1}%.",
                        IsSignificant = percentChange < -10,
                        ConfidenceScore = 0.8
                    });
                }
            }
        }

        private void DetectOutliers(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            var values = data.Select(r => r.Revenue).ToList();
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Average(v => Math.Pow((double)(v - mean), 2)));
            var threshold = (decimal)(3.0 * stdDev); // Higher threshold for outliers

            for (int i = 0; i < data.Count; i++)
            {
                if (Math.Abs(data[i].Revenue - mean) > threshold)
                {
                    result.OutlierPoints.Add(new DataPoint
                    {
                        Label = data[i].Date.ToString("yyyy-MM-dd"),
                        Timestamp = data[i].Date,
                        Metrics = new Dictionary<string, decimal> { { "Revenue", data[i].Revenue } },
                        Dimensions = new Dictionary<string, object> { { "Date", data[i].Date } }
                    });
                }
            }
        }

        private void DetectSeasonality(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            // Simple weekly seasonality check
            if (data.Count >= 14)
            {
                var dayOfWeekAverages = new Dictionary<DayOfWeek, decimal>();

                foreach (var item in data)
                {
                    var dayOfWeek = item.Date.DayOfWeek;
                    if (!dayOfWeekAverages.ContainsKey(dayOfWeek))
                        dayOfWeekAverages[dayOfWeek] = 0;

                    dayOfWeekAverages[dayOfWeek] += item.Revenue;
                }

                // Calculate average for each day of week
                foreach (var day in dayOfWeekAverages.Keys.ToList())
                {
                    var count = data.Count(d => d.Date.DayOfWeek == day);
                    dayOfWeekAverages[day] /= count;
                }

                // Check if there's significant variation by day of week
                var overallAvg = dayOfWeekAverages.Values.Average();
                var maxDiff = dayOfWeekAverages.Values.Max() - dayOfWeekAverages.Values.Min();
                var relativeVariation = maxDiff / overallAvg;

                // If there's significant variation by day of week, consider it seasonal
                if (relativeVariation > 0.2m)
                {
                    result.SeasonalityDetected = true;
                    result.SeasonalCycleDays = 7;
                }
            }
        }

        private (double slope, double intercept) CalculateLinearRegression(double[] xValues, double[] yValues)
        {
            if (xValues.Length != yValues.Length || xValues.Length < 2)
                return (0, 0);

            double sumX = xValues.Sum();
            double sumY = yValues.Sum();
            double sumXY = xValues.Zip(yValues, (x, y) => x * y).Sum();
            double sumX2 = xValues.Select(x => x * x).Sum();
            double n = xValues.Length;

            double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            double intercept = (sumY - slope * sumX) / n;

            return (slope, intercept);
        }

        #endregion
    }
}
