using System;
using System.Collections.Generic;
using System.Linq;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Helper methods for TrendAnalysisService
    /// </summary>
    public partial class TrendAnalysisService
    {
        #region Revenue Analysis Helpers

        /// <summary>
        /// Identify patterns in revenue data
        /// </summary>
        /// <param name="data">Revenue data</param>
        /// <param name="result">Trend analysis result</param>
        private void IdentifyPatterns(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 5)
                return;

            // Check for consistent upward trend
            var consistentUpward = true;
            for (int i = 1; i < data.Count; i++)
            {
                if (data[i].Revenue <= data[i - 1].Revenue)
                {
                    consistentUpward = false;
                    break;
                }
            }

            if (consistentUpward)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Consistent Upward Trend",
                    Description = "Revenue has been consistently increasing day over day.",
                    Significance = 0.9m
                });
            }

            // Check for consistent downward trend
            var consistentDownward = true;
            for (int i = 1; i < data.Count; i++)
            {
                if (data[i].Revenue >= data[i - 1].Revenue)
                {
                    consistentDownward = false;
                    break;
                }
            }

            if (consistentDownward)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Consistent Downward Trend",
                    Description = "Revenue has been consistently decreasing day over day.",
                    Significance = 0.9m
                });
            }

            // Check for weekend effect
            var weekendEffect = CheckWeekendEffect(data);
            if (weekendEffect.Item1)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Weekend Effect",
                    Description = $"Revenue tends to be {(weekendEffect.Item2 ? "higher" : "lower")} on weekends.",
                    Significance = 0.7m
                });
            }

            // Check for volatility
            var values = data.Select(d => d.Revenue).ToList();
            var volatility = CalculateVolatility(values);
            if (volatility > 0.2m)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "High Volatility",
                    Description = "Revenue shows significant day-to-day fluctuations.",
                    Significance = 0.6m
                });
            }
        }

        /// <summary>
        /// Detect outliers in revenue data
        /// </summary>
        /// <param name="data">Revenue data</param>
        /// <param name="result">Trend analysis result</param>
        private void DetectOutliers(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 3)
                return;

            var values = data.Select(d => d.Revenue).ToList();
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Select(v => Math.Pow((double)(v - mean), 2)).Average());

            // Identify outliers using Z-score
            for (int i = 0; i < data.Count; i++)
            {
                var zScore = Math.Abs((double)(data[i].Revenue - mean) / stdDev);
                if (zScore > 2.0) // Points with Z-score > 2 are considered outliers
                {
                    result.OutlierPoints.Add(new DataPoint
                    {
                        Label = data[i].Date.ToString("yyyy-MM-dd"),
                        Metrics = new Dictionary<string, decimal> { { "Revenue", data[i].Revenue } },
                        Timestamp = data[i].Date,
                        Dimensions = new Dictionary<string, object> { { "ZScore", zScore } }
                    });
                }
            }
        }

        /// <summary>
        /// Detect seasonality in revenue data
        /// </summary>
        /// <param name="data">Revenue data</param>
        /// <param name="result">Trend analysis result</param>
        private void DetectSeasonality(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 14) // Need at least 2 weeks of data
                return;

            // Check for day of week patterns
            var dayOfWeekAverages = data
                .GroupBy(d => d.Date.DayOfWeek)
                .ToDictionary(
                    g => g.Key.ToString(),
                    g => g.Average(d => d.Revenue)
                );

            var overallAverage = data.Average(d => d.Revenue);
            var dayOfWeekVariation = dayOfWeekAverages.Values.Max() - dayOfWeekAverages.Values.Min();

            if (dayOfWeekVariation > overallAverage * 0.2m)
            {
                var highestDay = dayOfWeekAverages.OrderByDescending(kvp => kvp.Value).First().Key;
                var lowestDay = dayOfWeekAverages.OrderBy(kvp => kvp.Value).First().Key;

                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Day of Week Pattern",
                    Description = $"Revenue tends to be highest on {highestDay} and lowest on {lowestDay}.",
                    Significance = 0.8m
                });
            }
        }

        /// <summary>
        /// Calculate segment growth rates for revenue data
        /// </summary>
        /// <param name="data">Revenue data</param>
        /// <param name="result">Trend analysis result</param>
        private void CalculateSegmentGrowthRates(List<CasinoRevenueItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 4) // Need at least 4 days of data
                return;

            // Calculate week-over-week growth
            if (data.Count >= 14)
            {
                var currentWeek = data.TakeLast(7).Sum(d => d.Revenue);
                var previousWeek = data.Skip(data.Count - 14).Take(7).Sum(d => d.Revenue);

                if (previousWeek > 0)
                {
                    var weekOverWeekGrowth = (currentWeek - previousWeek) / previousWeek * 100;
                    result.SegmentGrowthRates["WeekOverWeek"] = weekOverWeekGrowth;
                }
            }

            // Calculate day-over-day growth for the last day
            var lastDay = data.Last().Revenue;
            var previousDay = data[data.Count - 2].Revenue;

            if (previousDay > 0)
            {
                var dayOverDayGrowth = (lastDay - previousDay) / previousDay * 100;
                result.SegmentGrowthRates["DayOverDay"] = dayOverDayGrowth;
            }
        }

        #endregion

        #region Registration Analysis Helpers

        /// <summary>
        /// Identify patterns in registration data
        /// </summary>
        /// <param name="data">Registration data</param>
        /// <param name="result">Trend analysis result</param>
        private void IdentifyRegistrationPatterns(List<PlayerRegistrationItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 5)
                return;

            // Check for consistent upward trend
            var consistentUpward = true;
            for (int i = 1; i < data.Count; i++)
            {
                if (data[i].Registrations <= data[i - 1].Registrations)
                {
                    consistentUpward = false;
                    break;
                }
            }

            if (consistentUpward)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Consistent Upward Trend",
                    Description = "Registrations have been consistently increasing day over day.",
                    Significance = 0.9m
                });
            }

            // Check for consistent downward trend
            var consistentDownward = true;
            for (int i = 1; i < data.Count; i++)
            {
                if (data[i].Registrations >= data[i - 1].Registrations)
                {
                    consistentDownward = false;
                    break;
                }
            }

            if (consistentDownward)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Consistent Downward Trend",
                    Description = "Registrations have been consistently decreasing day over day.",
                    Significance = 0.9m
                });
            }

            // Check for weekend effect
            var weekendEffect = CheckRegistrationWeekendEffect(data);
            if (weekendEffect.Item1)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Weekend Effect",
                    Description = $"Registrations tend to be {(weekendEffect.Item2 ? "higher" : "lower")} on weekends.",
                    Significance = 0.7m
                });
            }

            // Check for volatility
            var values = data.Select(d => (decimal)d.Registrations).ToList();
            var volatility = CalculateVolatility(values);
            if (volatility > 0.2m)
            {
                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "High Volatility",
                    Description = "Registrations show significant day-to-day fluctuations.",
                    Significance = 0.6m
                });
            }
        }

        /// <summary>
        /// Detect outliers in registration data
        /// </summary>
        /// <param name="data">Registration data</param>
        /// <param name="result">Trend analysis result</param>
        private void DetectRegistrationOutliers(List<PlayerRegistrationItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 3)
                return;

            var values = data.Select(d => (decimal)d.Registrations).ToList();
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Select(v => Math.Pow((double)(v - mean), 2)).Average());

            // Identify outliers using Z-score
            for (int i = 0; i < data.Count; i++)
            {
                var zScore = Math.Abs((double)(data[i].Registrations - mean) / stdDev);
                if (zScore > 2.0) // Points with Z-score > 2 are considered outliers
                {
                    result.OutlierPoints.Add(new DataPoint
                    {
                        Label = data[i].Date.ToString("yyyy-MM-dd"),
                        Metrics = new Dictionary<string, decimal> { { "Registrations", data[i].Registrations } },
                        Timestamp = data[i].Date,
                        Dimensions = new Dictionary<string, object> { { "ZScore", zScore } }
                    });
                }
            }
        }

        /// <summary>
        /// Detect seasonality in registration data
        /// </summary>
        /// <param name="data">Registration data</param>
        /// <param name="result">Trend analysis result</param>
        private void DetectRegistrationSeasonality(List<PlayerRegistrationItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 14) // Need at least 2 weeks of data
                return;

            // Check for day of week patterns
            var dayOfWeekAverages = data
                .GroupBy(d => d.Date.DayOfWeek)
                .ToDictionary(
                    g => g.Key.ToString(),
                    g => g.Average(d => d.Registrations)
                );

            var overallAverage = data.Average(d => d.Registrations);
            var dayOfWeekVariation = dayOfWeekAverages.Values.Max() - dayOfWeekAverages.Values.Min();

            if (dayOfWeekVariation > overallAverage * 0.2)
            {
                var highestDay = dayOfWeekAverages.OrderByDescending(kvp => kvp.Value).First().Key;
                var lowestDay = dayOfWeekAverages.OrderBy(kvp => kvp.Value).First().Key;

                result.IdentifiedPatterns.Add(new TrendPattern
                {
                    PatternType = "Day of Week Pattern",
                    Description = $"Registrations tend to be highest on {highestDay} and lowest on {lowestDay}.",
                    Significance = 0.8m
                });
            }
        }

        /// <summary>
        /// Calculate segment growth rates for registration data
        /// </summary>
        /// <param name="data">Registration data</param>
        /// <param name="result">Trend analysis result</param>
        private void CalculateRegistrationSegmentGrowthRates(List<PlayerRegistrationItem> data, TrendAnalysisResult result)
        {
            if (data.Count < 4) // Need at least 4 days of data
                return;

            // Calculate week-over-week growth
            if (data.Count >= 14)
            {
                var currentWeek = data.TakeLast(7).Sum(d => d.Registrations);
                var previousWeek = data.Skip(data.Count - 14).Take(7).Sum(d => d.Registrations);

                if (previousWeek > 0)
                {
                    var weekOverWeekGrowth = (decimal)(currentWeek - previousWeek) / previousWeek * 100;
                    result.SegmentGrowthRates["WeekOverWeek"] = weekOverWeekGrowth;
                }
            }

            // Calculate day-over-day growth for the last day
            var lastDay = data.Last().Registrations;
            var previousDay = data[data.Count - 2].Registrations;

            if (previousDay > 0)
            {
                var dayOverDayGrowth = (decimal)(lastDay - previousDay) / previousDay * 100;
                result.SegmentGrowthRates["DayOverDay"] = dayOverDayGrowth;
            }
        }

        #endregion

        #region Common Helper Methods

        /// <summary>
        /// Calculate linear regression
        /// </summary>
        /// <param name="xValues">X values</param>
        /// <param name="yValues">Y values</param>
        /// <returns>Slope and intercept</returns>
        private (double Slope, double Intercept) CalculateLinearRegression(double[] xValues, double[] yValues)
        {
            if (xValues.Length != yValues.Length || xValues.Length < 2)
                return (0, 0);

            var n = xValues.Length;
            var sumX = xValues.Sum();
            var sumY = yValues.Sum();
            var sumXY = xValues.Zip(yValues, (x, y) => x * y).Sum();
            var sumX2 = xValues.Select(x => x * x).Sum();

            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;

            return (slope, intercept);
        }

        /// <summary>
        /// Calculate correlation coefficient
        /// </summary>
        /// <param name="xValues">X values</param>
        /// <param name="yValues">Y values</param>
        /// <returns>Correlation coefficient</returns>
        private double CalculateCorrelation(double[] xValues, double[] yValues)
        {
            if (xValues.Length != yValues.Length || xValues.Length < 3)
                return 0;

            var n = xValues.Length;
            var sumX = xValues.Sum();
            var sumY = yValues.Sum();
            var sumXY = xValues.Zip(yValues, (x, y) => x * y).Sum();
            var sumX2 = xValues.Select(x => x * x).Sum();
            var sumY2 = yValues.Select(y => y * y).Sum();

            var numerator = n * sumXY - sumX * sumY;
            var denominator = Math.Sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

            if (denominator == 0)
                return 0;

            return numerator / denominator;
        }

        /// <summary>
        /// Calculate median of a list of values
        /// </summary>
        /// <param name="values">Values</param>
        /// <returns>Median</returns>
        private decimal CalculateMedian(List<decimal> values)
        {
            if (values == null || values.Count == 0)
                return 0;

            var sortedValues = values.OrderBy(v => v).ToList();
            var count = sortedValues.Count;

            if (count % 2 == 0)
            {
                // Even number of elements
                return (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2;
            }
            else
            {
                // Odd number of elements
                return sortedValues[count / 2];
            }
        }

        /// <summary>
        /// Calculate volatility (coefficient of variation)
        /// </summary>
        /// <param name="values">Values</param>
        /// <returns>Volatility</returns>
        private decimal CalculateVolatility(List<decimal> values)
        {
            if (values == null || values.Count < 2)
                return 0;

            var mean = values.Average();
            if (mean == 0)
                return 0;

            var variance = values.Select(v => Math.Pow((double)(v - mean), 2)).Average();
            var stdDev = (decimal)Math.Sqrt(variance);

            return stdDev / mean;
        }

        /// <summary>
        /// Check for weekend effect in revenue data
        /// </summary>
        /// <param name="data">Revenue data</param>
        /// <returns>Tuple with (effect detected, higher on weekends)</returns>
        private (bool, bool) CheckWeekendEffect(List<CasinoRevenueItem> data)
        {
            if (data.Count < 7) // Need at least a week of data
                return (false, false);

            var weekdayData = data.Where(d => d.Date.DayOfWeek != DayOfWeek.Saturday && d.Date.DayOfWeek != DayOfWeek.Sunday).ToList();
            var weekendData = data.Where(d => d.Date.DayOfWeek == DayOfWeek.Saturday || d.Date.DayOfWeek == DayOfWeek.Sunday).ToList();

            if (weekdayData.Count == 0 || weekendData.Count == 0)
                return (false, false);

            var weekdayAvg = weekdayData.Average(d => d.Revenue);
            var weekendAvg = weekendData.Average(d => d.Revenue);

            // Check if the difference is significant (more than 20%)
            var difference = Math.Abs(weekendAvg - weekdayAvg) / weekdayAvg;
            if (difference > 0.2m)
            {
                return (true, weekendAvg > weekdayAvg);
            }

            return (false, false);
        }

        /// <summary>
        /// Check for weekend effect in registration data
        /// </summary>
        /// <param name="data">Registration data</param>
        /// <returns>Tuple with (effect detected, higher on weekends)</returns>
        private (bool, bool) CheckRegistrationWeekendEffect(List<PlayerRegistrationItem> data)
        {
            if (data.Count < 7) // Need at least a week of data
                return (false, false);

            var weekdayData = data.Where(d => d.Date.DayOfWeek != DayOfWeek.Saturday && d.Date.DayOfWeek != DayOfWeek.Sunday).ToList();
            var weekendData = data.Where(d => d.Date.DayOfWeek == DayOfWeek.Saturday || d.Date.DayOfWeek == DayOfWeek.Sunday).ToList();

            if (weekdayData.Count == 0 || weekendData.Count == 0)
                return (false, false);

            var weekdayAvg = weekdayData.Average(d => d.Registrations);
            var weekendAvg = weekendData.Average(d => d.Registrations);

            // Check if the difference is significant (more than 20%)
            var difference = Math.Abs(weekendAvg - weekdayAvg) / weekdayAvg;
            if (difference > 0.2)
            {
                return (true, weekendAvg > weekdayAvg);
            }

            return (false, false);
        }

        /// <summary>
        /// Get correlation strength description
        /// </summary>
        /// <param name="correlation">Correlation coefficient</param>
        /// <returns>Correlation strength</returns>
        private string GetCorrelationStrength(double correlation)
        {
            var absCorrelation = Math.Abs(correlation);

            if (absCorrelation > 0.8)
                return "Very Strong";
            if (absCorrelation > 0.6)
                return "Strong";
            if (absCorrelation > 0.4)
                return "Moderate";
            if (absCorrelation > 0.2)
                return "Weak";
            return "Very Weak";
        }

        /// <summary>
        /// Generate correlation description
        /// </summary>
        /// <param name="metricA">First metric</param>
        /// <param name="metricB">Second metric</param>
        /// <param name="correlation">Correlation coefficient</param>
        /// <returns>Correlation description</returns>
        private string GenerateCorrelationDescription(string metricA, string metricB, double correlation)
        {
            var strength = GetCorrelationStrength(correlation);
            var direction = correlation >= 0 ? "positive" : "negative";

            return $"There is a {strength.ToLower()} {direction} correlation ({correlation:F2}) between {metricA} and {metricB}.";
        }

        #endregion
    }
}
