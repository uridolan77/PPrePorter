using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Mock implementation of ITrendAnalysisService for development purposes
    /// </summary>
    public class MockTrendAnalysisService : ITrendAnalysisService
    {
        public Task<List<MetricCorrelation>> AnalyzeMetricCorrelationsAsync(DashboardData dashboardData)
        {
            // Return a simple correlation result for mock implementation
            return Task.FromResult(new List<MetricCorrelation>
            {
                new MetricCorrelation
                {
                    PrimaryMetricKey = "Revenue",
                    SecondaryMetricKey = "Registrations",
                    CorrelationCoefficient = 0.75,
                    CorrelationStrength = "Strong",
                    CorrelationType = "Positive",
                    IsSignificant = true,
                    Explanation = "Strong positive correlation between revenue and registrations."
                }
            });
        }

        public Task<TrendAnalysisResult> AnalyzeRegistrationTrendsAsync(List<PlayerRegistrationItem> registrationData, TrendAnalysisOptions? options = null)
        {
            // Return a simple trend analysis result for mock implementation
            return Task.FromResult(new TrendAnalysisResult
            {
                MetricKey = "registrations",
                TrendDirection = "Increasing",
                PercentageChange = 5.2m,
                OverallTrendSlope = 0.17m,
                IdentifiedPatterns = new List<TrendPattern>
                {
                    new TrendPattern
                    {
                        PatternType = "Linear",
                        StartDate = DateTime.UtcNow.AddDays(-30),
                        EndDate = DateTime.UtcNow,
                        Description = "Steady growth in registrations over the past month.",
                        IsSignificant = true,
                        ConfidenceScore = 0.85,
                        Magnitude = 5.2m
                    }
                },
                SeasonalityDetected = false,
                SegmentGrowthRates = new Dictionary<string, decimal>
                {
                    { "mobile", 6.3m },
                    { "desktop", 4.1m }
                }
            });
        }

        public Task<TrendAnalysisResult> AnalyzeRevenueTrendsAsync(List<CasinoRevenueItem> revenueData, TrendAnalysisOptions? options = null)
        {
            // Return a simple trend analysis result for mock implementation
            return Task.FromResult(new TrendAnalysisResult
            {
                MetricKey = "revenue",
                TrendDirection = "Increasing",
                PercentageChange = 7.8m,
                OverallTrendSlope = 0.26m,
                IdentifiedPatterns = new List<TrendPattern>
                {
                    new TrendPattern
                    {
                        PatternType = "Linear",
                        StartDate = DateTime.UtcNow.AddDays(-30),
                        EndDate = DateTime.UtcNow,
                        Description = "Strong growth in revenue over the past month.",
                        IsSignificant = true,
                        ConfidenceScore = 0.9,
                        Magnitude = 7.8m
                    }
                },
                SeasonalityDetected = true,
                SeasonalCycleDays = 7,
                SegmentGrowthRates = new Dictionary<string, decimal>
                {
                    { "slots", 9.2m },
                    { "table-games", 6.5m },
                    { "live-casino", 8.1m }
                }
            });
        }

        public Task<List<ForecastPoint>> GenerateForecastAsync(string metricKey, List<DataPoint> historicalData, int daysToForecast)
        {
            // Return a simple forecast for mock implementation
            var result = new List<ForecastPoint>();
            var baseDate = DateTime.UtcNow;
            var baseValue = 100m;

            // Try to get the last data point if available
            if (historicalData != null && historicalData.Count > 0)
            {
                var lastPoint = historicalData[historicalData.Count - 1];
                if (lastPoint.Timestamp.HasValue)
                {
                    baseDate = lastPoint.Timestamp.Value;
                }

                if (lastPoint.Metrics != null && lastPoint.Metrics.ContainsKey(metricKey))
                {
                    baseValue = lastPoint.Metrics[metricKey];
                }
            }

            for (int i = 1; i <= daysToForecast; i++)
            {
                var forecastValue = baseValue * (1 + (0.01m * i));

                result.Add(new ForecastPoint
                {
                    Timestamp = baseDate.AddDays(i),
                    Metrics = new Dictionary<string, decimal> { { metricKey, forecastValue } },
                    Label = baseDate.AddDays(i).ToString("yyyy-MM-dd"),
                    LowerBound = forecastValue * 0.9m,
                    UpperBound = forecastValue * 1.1m,
                    ConfidenceInterval = 0.9
                });
            }

            return Task.FromResult(result);
        }

        public Task<BenchmarkComparisonResult> CompareToBenchmarksAsync(string metricKey, List<DataPoint> data, string segment = null)
        {
            // Return a simple benchmark comparison for mock implementation
            return Task.FromResult(new BenchmarkComparisonResult
            {
                MetricKey = metricKey,
                IndustrySegment = segment ?? "Gaming",
                AverageValue = 125.5m,
                IndustryAverage = 100.0m,
                PercentageDifference = 25.5m,
                PerformanceCategory = "Above Average",
                CompetitorValues = new Dictionary<string, decimal>
                {
                    { "Competitor A", 110.2m },
                    { "Competitor B", 95.7m },
                    { "Competitor C", 105.3m }
                },
                Recommendation = "Current performance is strong compared to industry benchmarks."
            });
        }

        public Task<SeasonalityResult> DetectSeasonalityAsync(List<DataPoint> data, SeasonalityOptions options)
        {
            // Return a simple seasonality result for mock implementation
            return Task.FromResult(new SeasonalityResult
            {
                SeasonalityDetected = true,
                PrimaryCycleDays = 7,
                SecondaryCycleDays = 30,
                SeasonalityStrength = 0.85,
                DayOfWeekPatterns = new Dictionary<string, double>
                {
                    { "Monday", 0.8 },
                    { "Tuesday", 0.7 },
                    { "Wednesday", 0.75 },
                    { "Thursday", 0.9 },
                    { "Friday", 1.1 },
                    { "Saturday", 1.4 },
                    { "Sunday", 1.3 }
                },
                MonthPatterns = new Dictionary<string, double>
                {
                    { "January", 0.9 },
                    { "February", 0.85 },
                    { "March", 0.95 },
                    { "April", 1.0 },
                    { "May", 1.05 },
                    { "June", 1.1 },
                    { "July", 1.15 },
                    { "August", 1.2 },
                    { "September", 1.1 },
                    { "October", 1.0 },
                    { "November", 1.05 },
                    { "December", 1.3 }
                },
                IdentifiedPeaks = new List<SeasonalPeak>
                {
                    new SeasonalPeak
                    {
                        Description = "Weekend Peak",
                        TimePeriod = "Weekly",
                        AverageIncrease = 0.4,
                        Significance = 0.9
                    },
                    new SeasonalPeak
                    {
                        Description = "Holiday Season",
                        TimePeriod = "December",
                        AverageIncrease = 0.3,
                        Significance = 0.85
                    }
                },
                Explanation = "Strong weekly seasonality with peaks on weekends, and annual seasonality with December holiday peak."
            });
        }

        public Task<List<ChangeDriver>> IdentifyChangesDriversAsync(string metricKey, DateTime startDate, DateTime endDate)
        {
            // Return a simple list of change drivers for mock implementation
            return Task.FromResult(new List<ChangeDriver>
            {
                new ChangeDriver
                {
                    DriverMetric = "marketing_spend",
                    ContributionPercentage = 65.0m,
                    Direction = "Positive",
                    Explanation = "Recent marketing campaign has driven significant growth.",
                    IsActionable = true
                },
                new ChangeDriver
                {
                    DriverMetric = "seasonal_factors",
                    ContributionPercentage = 25.0m,
                    Direction = "Positive",
                    Explanation = "Seasonal increase in activity.",
                    IsActionable = false
                },
                new ChangeDriver
                {
                    DriverMetric = "new_game_releases",
                    ContributionPercentage = 10.0m,
                    Direction = "Positive",
                    Explanation = "New game releases have attracted additional players.",
                    IsActionable = true
                }
            });
        }
    }
}
