using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Caching-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <inheritdoc/>
        public async Task PrewarmCacheAsync()
        {
            try
            {
                _logger.LogInformation("Prewarming cache with commonly accessed data...");

                // Get today and yesterday dates
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);

                // Prewarm metadata (this is essential and relatively small)
                var startTime = DateTime.UtcNow;

                // Prewarm metadata using the metadata service if available
                if (_metadataService != null)
                {
                    await _metadataService.PreloadMetadataAsync();
                }
                else
                {
                    _logger.LogWarning("No metadata service available, skipping metadata prewarming");
                }

                // Also prewarm the daily actions metadata
                var metadata = await GetDailyActionsMetadataAsync();

                var metadataTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("Prewarmed metadata cache with {WhiteLabelCount} white labels, {CountryCount} countries, {CurrencyCount} currencies in {ElapsedMs}ms",
                    metadata.WhiteLabels.Count,
                    metadata.Countries.Count,
                    metadata.Currencies.Count,
                    metadataTime.TotalMilliseconds);

                // Prewarm yesterday's summary metrics (small and frequently accessed)
                startTime = DateTime.UtcNow;

                // Use a smaller date range for prewarming to avoid loading too much data
                var yesterdayStart = yesterday;
                var yesterdayEnd = today;

                _logger.LogInformation("Prewarming summary metrics for date range {StartDate} to {EndDate}",
                    yesterdayStart.ToString("yyyy-MM-dd"), yesterdayEnd.ToString("yyyy-MM-dd"));

                var yesterdaySummary = await GetSummaryMetricsAsync(yesterdayStart, yesterdayEnd);
                var yesterdaySummaryTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("Prewarmed yesterday's summary metrics cache in {ElapsedMs}ms",
                    yesterdaySummaryTime.TotalMilliseconds);

                // Log cache statistics
                var cacheService = _cache as IGlobalCacheService;
                int cacheCount = cacheService?.GetCount() ?? -1;
                _logger.LogInformation("Cache prewarming completed successfully. Total items in cache: {CacheCount}",
                    cacheCount);

                // Note: We're no longer prewarming the following to reduce startup time and memory usage:
                // - Yesterday's full data (will be loaded on demand)
                // - Last week's full data (will be loaded on demand)
                // - Last week's summary metrics (will be loaded on demand)
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming cache");
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionsSummary> GetSummaryMetricsAsync(
            DateTime startDate,
            DateTime endDate,
            int? whiteLabelId = null,
            IEnumerable<DailyAction>? preloadedData = null)
        {
            try
            {
                // Start performance timer
                var methodStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSummaryMetricsAsync with startDate={StartDate}, endDate={EndDate}, whiteLabelId={WhiteLabelId}, preloadedData={HasPreloadedData}",
                    methodStartTime.ToString("HH:mm:ss.fff"),
                    startDate.ToString("yyyy-MM-dd"),
                    endDate.ToString("yyyy-MM-dd"),
                    whiteLabelId?.ToString() ?? "null (all white labels)",
                    preloadedData != null ? "yes" : "no");

                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create cache key
                var cacheKey = $"{CACHE_KEY_PREFIX}Summary_{start:yyyyMMdd}_{end:yyyyMMdd}_{whiteLabelId ?? 0}";

                // Try to get from cache first (skip if preloaded data is provided)
                if (preloadedData == null && _cache.TryGetValue(cacheKey, out DailyActionsSummary? cachedSummary) && cachedSummary != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved summary metrics from cache, cache key: {CacheKey}", cacheKey);
                    return cachedSummary;
                }

                // Get the daily actions data
                IEnumerable<DailyAction> dailyActions;

                if (preloadedData != null)
                {
                    // Use the preloaded data
                    _logger.LogInformation("Using {Count} preloaded daily actions records", preloadedData.Count());
                    dailyActions = preloadedData;
                }
                else
                {
                    // Need to load the data from database
                    _logger.LogWarning("CACHE MISS: Getting summary metrics from database, cache key: {CacheKey}", cacheKey);

                    // Get the raw data - this makes a single database query
                    _logger.LogInformation("Fetching raw daily actions data for date range {StartDate} to {EndDate}",
                        start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"));

                    var dataFetchStartTime = DateTime.UtcNow;
                    dailyActions = await GetDailyActionsAsync(startDate, endDate, whiteLabelId);
                    var dataFetchEndTime = DateTime.UtcNow;

                    _logger.LogInformation("Retrieved {Count} daily actions records in {ElapsedMs}ms",
                        dailyActions.Count(),
                        (dataFetchEndTime - dataFetchStartTime).TotalMilliseconds);
                }

                // Calculate summary metrics from the raw data
                _logger.LogInformation("Calculating summary metrics from {Count} records", dailyActions.Count());

                var calculateStartTime = DateTime.UtcNow;

                var summary = new DailyActionsSummary
                {
                    TotalRegistrations = dailyActions.Sum(da => da.Registration ?? 0),
                    TotalFTD = dailyActions.Sum(da => da.FTD ?? 0),
                    TotalDeposits = dailyActions.Sum(da => da.Deposits ?? 0),
                    TotalCashouts = dailyActions.Sum(da => da.PaidCashouts ?? 0),
                    TotalBetsCasino = dailyActions.Sum(da => da.BetsCasino ?? 0),
                    TotalWinsCasino = dailyActions.Sum(da => da.WinsCasino ?? 0),
                    TotalBetsSport = dailyActions.Sum(da => da.BetsSport ?? 0),
                    TotalWinsSport = dailyActions.Sum(da => da.WinsSport ?? 0),
                    TotalBetsLive = dailyActions.Sum(da => da.BetsLive ?? 0),
                    TotalWinsLive = dailyActions.Sum(da => da.WinsLive ?? 0),
                    TotalBetsBingo = dailyActions.Sum(da => da.BetsBingo ?? 0),
                    TotalWinsBingo = dailyActions.Sum(da => da.WinsBingo ?? 0)
                };

                // Calculate total GGR
                summary.TotalGGR = summary.TotalBetsCasino - summary.TotalWinsCasino +
                                  summary.TotalBetsSport - summary.TotalWinsSport +
                                  summary.TotalBetsLive - summary.TotalWinsLive +
                                  summary.TotalBetsBingo - summary.TotalWinsBingo;

                var calculateEndTime = DateTime.UtcNow;
                _logger.LogInformation("Calculated summary metrics in {ElapsedMs}ms",
                    (calculateEndTime - calculateStartTime).TotalMilliseconds);

                // Log performance
                var methodEndTime = DateTime.UtcNow;
                var elapsedMs = (methodEndTime - methodStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Completed GetSummaryMetricsAsync in {ElapsedMs}ms",
                    methodEndTime.ToString("HH:mm:ss.fff"),
                    elapsedMs);

                // Cache the result
                var cacheOptions = new Microsoft.Extensions.Caching.Memory.MemoryCacheEntryOptions()
                {
                    Priority = Microsoft.Extensions.Caching.Memory.CacheItemPriority.High,
                    SlidingExpiration = TimeSpan.FromMinutes(30),
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(CACHE_EXPIRATION_MINUTES),
                    Size = 1000 // Small size for summary data
                };

                _cache.Set(cacheKey, summary, cacheOptions);
                _logger.LogInformation("Cached summary metrics with key: {CacheKey}", cacheKey);

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting summary metrics");
                throw;
            }
        }
    }
}
