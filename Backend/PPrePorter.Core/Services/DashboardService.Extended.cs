using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Extended implementation of the IDashboardService interface
    /// </summary>
    public partial class DashboardService
    {
        /// <summary>
        /// Gets player journey Sankey diagram data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Player journey Sankey data</returns>
        public async Task<List<PlayerJourneySankeyData>> GetPlayerJourneySankeyDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:player-journey:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchPlayerJourneySankeyDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player journey Sankey data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets heatmap data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Heatmap data</returns>
        public async Task<HeatmapData> GetHeatmapDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:heatmap:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchHeatmapDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting heatmap data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets segment comparison data
        /// </summary>
        /// <param name="request">Segment comparison request</param>
        /// <returns>Segment comparison data</returns>
        public async Task<SegmentComparisonData> GetSegmentComparisonAsync(SegmentComparisonRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:segment-comparison:{request.UserId}:{request.SegmentType}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchSegmentComparisonDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting segment comparison data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets micro chart data
        /// </summary>
        /// <param name="request">Dashboard request</param>
        /// <returns>Micro chart data</returns>
        public async Task<List<MicroChartData>> GetMicroChartDataAsync(DashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:micro-chart:{request.UserId}:{request.WhiteLabelId}:{request.PlayMode}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchMicroChartDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting micro chart data for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Gets user dashboard preferences
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Dashboard preferences</returns>
        public async Task<DashboardPreferences> GetUserDashboardPreferencesAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            var cacheKey = $"dashboard:user-preferences:{userId}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchUserDashboardPreferencesAsync(userId),
                    slidingExpiration: TimeSpan.FromMinutes(30),
                    absoluteExpiration: TimeSpan.FromHours(24));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user dashboard preferences for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Saves user dashboard preferences
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="preferences">Dashboard preferences</param>
        public async Task SaveUserDashboardPreferencesAsync(string userId, DashboardPreferences preferences)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            if (preferences == null)
                throw new ArgumentNullException(nameof(preferences));

            try
            {
                await SaveUserDashboardPreferencesToDatabaseAsync(userId, preferences);
                await _cachingService.RemoveAsync($"dashboard:user-preferences:{userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving user dashboard preferences for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Gets accessibility optimized data
        /// </summary>
        /// <param name="request">Accessibility data request</param>
        /// <returns>Accessibility optimized data</returns>
        public async Task<AccessibilityOptimizedData> GetAccessibilityOptimizedDataAsync(AccessibilityDataRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var cacheKey = $"dashboard:accessibility:{request.UserId}:{request.VisualizationType}:{request.MetricKey}:{DateTime.UtcNow:yyyyMMdd}";

            try
            {
                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchAccessibilityOptimizedDataAsync(request),
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accessibility optimized data for user {UserId}", request.UserId);
                throw;
            }
        }
    }
}
