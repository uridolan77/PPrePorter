using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Service for analyzing trends and patterns in dashboard data
    /// </summary>
    public interface ITrendAnalysisService
    {
        /// <summary>
        /// Analyze revenue trends and identify patterns
        /// </summary>
        Task<TrendAnalysisResult> AnalyzeRevenueTrendsAsync(List<CasinoRevenueItem> revenueData, TrendAnalysisOptions options = null);
        
        /// <summary>
        /// Analyze registration trends and identify patterns
        /// </summary>
        Task<TrendAnalysisResult> AnalyzeRegistrationTrendsAsync(List<PlayerRegistrationItem> registrationData, TrendAnalysisOptions options = null);
        
        /// <summary>
        /// Analyze correlation between different metrics
        /// </summary>
        Task<List<MetricCorrelation>> AnalyzeMetricCorrelationsAsync(DashboardData dashboardData);
        
        /// <summary>
        /// Generate forecast for a specific metric
        /// </summary>
        Task<List<ForecastPoint>> GenerateForecastAsync(string metricKey, List<DataPoint> historicalData, int forecastDays);
        
        /// <summary>
        /// Compare trends against industry benchmarks
        /// </summary>
        Task<BenchmarkComparisonResult> CompareToBenchmarksAsync(string metricKey, List<DataPoint> data, string segment = null);
        
        /// <summary>
        /// Detect seasonality patterns in data
        /// </summary>
        Task<SeasonalityResult> DetectSeasonalityAsync(List<DataPoint> data, SeasonalityOptions options = null);
        
        /// <summary>
        /// Identify key drivers of changes in a specific metric
        /// </summary>
        Task<List<ChangeDriver>> IdentifyChangesDriversAsync(string metricKey, DateTime startDate, DateTime endDate);
    }
}