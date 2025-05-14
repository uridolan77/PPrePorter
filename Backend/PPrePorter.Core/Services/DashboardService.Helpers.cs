using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Helper methods for the DashboardService
    ///
    /// NOTE: This class is now obsolete. Use PPrePorter.Infrastructure.Services.DashboardService instead,
    /// which provides real data implementation using the DailyActionsService, GameService, and PlayerService.
    /// </summary>
    public partial class DashboardService
    {
        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchDashboardSummaryAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<DashboardSummary> FetchDashboardSummaryMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new DashboardSummary
            {
                TotalRevenue = 0,
                TotalRegistrations = 0,
                TotalDeposits = 0,
                TotalWithdrawals = 0,
                AverageDepositAmount = 0,
                AverageWithdrawalAmount = 0,
                ActivePlayers = 0,
                ConversionRate = 0
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchCasinoRevenueChartDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<CasinoRevenueItem>> FetchCasinoRevenueChartDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<CasinoRevenueItem>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchPlayerRegistrationsChartDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<PlayerRegistrationItem>> FetchPlayerRegistrationsChartDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<PlayerRegistrationItem>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchTopGamesDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<TopGameItem>> FetchTopGamesDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<TopGameItem>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchRecentTransactionsAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<RecentTransactionItem>> FetchRecentTransactionsMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<RecentTransactionItem>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchContextualDataExplorerResultAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<ContextualDataExplorerResult> FetchContextualDataExplorerResultMockAsync(ContextualDataExplorerRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new ContextualDataExplorerResult
            {
                Context = request.Context,
                Dimension = request.Dimension,
                DataPoints = new List<ExplorerDataPoint>(),
                Annotations = new List<ExplorerDataAnnotation>(),
                RelatedMetrics = new List<string>(),
                Insights = new List<DataInsight>()
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchDashboardDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<DashboardData> FetchDashboardDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use Infrastructure.Services.DashboardService instead.
            return new DashboardData
            {
                Summary = await FetchDashboardSummaryMockAsync(request),
                RevenueData = await FetchCasinoRevenueChartDataMockAsync(request),
                RegistrationsData = await FetchPlayerRegistrationsChartDataMockAsync(request),
                TopGames = await FetchTopGamesDataMockAsync(request),
                RecentTransactions = await FetchRecentTransactionsMockAsync(request)
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchPlayerJourneySankeyDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<PlayerJourneySankeyData>> FetchPlayerJourneySankeyDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<PlayerJourneySankeyData>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchHeatmapDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<HeatmapData> FetchHeatmapDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new HeatmapData
            {
                Title = "Activity Heatmap",
                XLabels = new List<string>(),
                YLabels = new List<string>(),
                Values = new List<List<decimal>>()
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchSegmentComparisonDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<SegmentComparisonData> FetchSegmentComparisonDataMockAsync(SegmentComparisonRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new SegmentComparisonData
            {
                SegmentType = request.SegmentType,
                Segments = new List<SegmentMetricData>(),
                Segments_String = new List<string>(),
                Values = new Dictionary<string, Dictionary<string, decimal>>()
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchMicroChartDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<List<MicroChartData>> FetchMicroChartDataMockAsync(DashboardRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new List<MicroChartData>();
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchUserDashboardPreferencesAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<DashboardPreferences> FetchUserDashboardPreferencesMockAsync(string userId)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new DashboardPreferences
            {
                UserId = userId,
                ColorScheme = new ColorSchemePreference
                {
                    Mode = "Light",
                    PrimaryColor = "#1976D2",
                    SecondaryColor = "#424242",
                    AccentColor = "#82B1FF"
                },
                InformationDensity = "Medium",
                PreferredChartTypes = new Dictionary<string, string>
                {
                    ["Revenue"] = "LineChart",
                    ["Registrations"] = "BarChart",
                    ["FTD"] = "BarChart"
                },
                PinnedMetrics = new List<string> { "Revenue", "Registrations", "FTD" },
                ShowAnnotations = true,
                ShowInsights = true,
                ShowAnomalies = true,
                ShowForecasts = true
            };
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.SaveUserDashboardPreferencesToDatabaseAsync instead.
        /// This method does nothing.
        /// </summary>
        private async Task SaveUserDashboardPreferencesToDatabaseMockAsync(string userId, DashboardPreferences preferences)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
        }

        /// <summary>
        /// OBSOLETE: Use Infrastructure.Services.DashboardService.FetchAccessibilityOptimizedDataAsync instead.
        /// This method returns mock data.
        /// </summary>
        private async Task<AccessibilityOptimizedData> FetchAccessibilityOptimizedDataMockAsync(AccessibilityDataRequest request)
        {
            // This implementation is obsolete. Use DashboardServiceWithRealData instead.
            return new AccessibilityOptimizedData
            {
                MetricKey = request.MetricKey,
                VisualizationType = request.VisualizationType,
                TextualDescription = $"Data for {request.MetricKey} in {request.VisualizationType} format",
                TabularData = new List<Dictionary<string, string>>(),
                AudioDescription = $"Audio description for {request.MetricKey}"
            };
        }
    }
}
