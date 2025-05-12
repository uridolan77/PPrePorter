using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Models.Players;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for daily actions operations
    /// </summary>
    public class DailyActionsService : IDailyActionsService
    {
        private readonly ILogger<DailyActionsService> _logger;
        private readonly IGlobalCacheService _cache;
        private readonly DailyActionsDbContext _dbContext;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly IMetadataService? _metadataService;

        // Cache keys
        private const string METADATA_CACHE_KEY = "DailyActions_Metadata";
        private const string DAILY_ACTIONS_CACHE_KEY = "DailyActions_Data_{0}_{1}_{2}"; // Format: startDate_endDate_whiteLabelId
        private const string DAILY_ACTION_BY_ID_CACHE_KEY = "DailyAction_ById_{0}"; // Format: id
        private const string FILTERED_DAILY_ACTIONS_CACHE_KEY = "DailyActions_Filtered_{0}"; // Format: hash of filter
        private const string SUMMARY_METRICS_CACHE_KEY = "DailyActions_Summary_{0}_{1}_{2}"; // Format: startDate_endDate_whiteLabelId
        private const int CACHE_EXPIRATION_MINUTES = 120; // Increase to 2 hours

        public DailyActionsService(
            ILogger<DailyActionsService> logger,
            IGlobalCacheService cache,
            DailyActionsDbContext dbContext,
            IWhiteLabelService whiteLabelService,
            IMetadataService? metadataService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _metadataService = metadataService; // Can be null

            _logger.LogInformation("DailyActionsService initialized with global cache service instance: {CacheHashCode}, DbContext instance: {DbContextHashCode}",
                _cache.GetHashCode(), _dbContext.GetHashCode());
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Start performance timer
                var methodStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetDailyActionsAsync",
                    methodStartTime.ToString("HH:mm:ss.fff"));

                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create cache key
                string cacheKey = string.Format(DAILY_ACTIONS_CACHE_KEY,
                    start.ToString("yyyyMMdd"),
                    end.ToString("yyyyMMdd"),
                    whiteLabelId?.ToString() ?? "all");

                _logger.LogInformation("CACHE KEY GENERATION [{Timestamp}]: Generated cache key for daily actions: {CacheKey} with parameters: startDate={StartDate}, endDate={EndDate}, whiteLabelId={WhiteLabelId}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey, start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), whiteLabelId);

                _logger.LogDebug("CACHE CHECK [{Timestamp}]: Checking cache for daily actions with key: {CacheKey}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey);

                // Log cache statistics before trying to get from cache
                var globalCacheService = _cache as IGlobalCacheService;
                if (globalCacheService != null)
                {
                    var stats = globalCacheService.GetStatistics();
                    _logger.LogDebug("CACHE STATS before retrieval: TotalHits={TotalHits}, TotalMisses={TotalMisses}, CacheCount={CacheCount}",
                        stats["TotalHits"], stats["TotalMisses"], stats["CacheCount"]);
                }

                // Try to get from cache first - measure time
                var cacheCheckStartTime = DateTime.UtcNow;
                bool cacheHit = _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction>? cachedResult);
                var cacheCheckEndTime = DateTime.UtcNow;
                var cacheCheckElapsedMs = (cacheCheckEndTime - cacheCheckStartTime).TotalMilliseconds;

                _logger.LogDebug("CACHE RESULT [{Timestamp}]: TryGetValue returned {Result} for key {CacheKey} in {ElapsedMs}ms",
                    cacheCheckEndTime.ToString("HH:mm:ss.fff"), cacheHit, cacheKey, cacheCheckElapsedMs);

                if (cacheHit && cachedResult != null)
                {
                    var cachedCount = cachedResult.Count();
                    _logger.LogInformation("CACHE HIT [{Timestamp}]: Retrieved daily actions from cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, count: {Count}, retrieval time: {ElapsedMs}ms",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey, cachedCount, cacheCheckElapsedMs);

                    // Log the first few items to verify data integrity
                    if (cachedCount > 0)
                    {
                        var firstItem = cachedResult.First();
                        _logger.LogDebug("CACHE HIT SAMPLE [{Timestamp}]: First item from cache - ID: {Id}, Date: {Date}, WhiteLabelID: {WhiteLabelID}",
                            DateTime.UtcNow.ToString("HH:mm:ss.fff"), firstItem.Id, firstItem.Date, firstItem.WhiteLabelID);
                    }

                    // Log total method time for cache hit
                    var cacheHitEndTime = DateTime.UtcNow;
                    var cacheHitElapsedMs = (cacheHitEndTime - methodStartTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: GetDailyActionsAsync completed with CACHE HIT in {ElapsedMs}ms",
                        cacheHitEndTime.ToString("HH:mm:ss.fff"), cacheHitElapsedMs);

                    return cachedResult;
                }
                else if (cacheHit && cachedResult == null)
                {
                    _logger.LogWarning("CACHE ANOMALY [{Timestamp}]: Cache hit but null result for key {CacheKey}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey);
                }
                else
                {
                    _logger.LogWarning("CACHE MISS [{Timestamp}]: Getting daily actions from database for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey);
                }

                // Calculate date range span in days
                var daySpan = (end.Date - start.Date).Days + 1;

                // Set a reasonable limit based on date range
                // For large date ranges, we'll limit the number of records
                int maxRecords = Math.Min(10000, daySpan * 500); // Limit to 500 records per day, max 10,000

                _logger.LogInformation("Setting max records limit to {MaxRecords} for date range spanning {DaySpan} days",
                    maxRecords, daySpan);

                // Build query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    // .Include(da => da.WhiteLabel) // Commented out for now
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (whiteLabelId.HasValue)
                {
                    // Check both WhiteLabelID and WhiteLabelId fields
                    query = query.Where(da => da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == whiteLabelId.Value);
                }

                // Add ordering and limit
                query = query.OrderBy(da => da.Date).ThenBy(da => da.WhiteLabelID).Take(maxRecords);

                // Execute query - don't use WithNoLock() here since we're using the NoLockInterceptor
                // Measure database query time
                var dbQueryStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting database query for daily actions",
                    dbQueryStartTime.ToString("HH:mm:ss.fff"));

                var result = await query.ToListAsync();

                var dbQueryEndTime = DateTime.UtcNow;
                var dbQueryElapsedMs = (dbQueryEndTime - dbQueryStartTime).TotalMilliseconds;

                // Log the result count and size estimation
                int resultCount = result.Count;
                _logger.LogInformation("PERF [{Timestamp}]: Retrieved {Count} daily actions from database in {ElapsedMs}ms for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    dbQueryEndTime.ToString("HH:mm:ss.fff"), resultCount, dbQueryElapsedMs, startDate, endDate, whiteLabelId);

                // Estimate the size of the result for cache entry
                long estimatedSize = resultCount * 1000; // More accurate estimate: 1000 bytes per DailyAction

                // Log the size of the first item if available
                if (resultCount > 0)
                {
                    var firstItem = result.First();
                    _logger.LogInformation("First DailyAction item has {PropertyCount} properties, ID: {Id}, Date: {Date}",
                        typeof(DailyAction).GetProperties().Length,
                        firstItem.Id,
                        firstItem.Date);
                }

                // Cache the result with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                _logger.LogInformation("Setting cache entry with size: {Size} bytes for {Count} items (average {AvgSize} bytes per item)",
                    estimatedSize, resultCount, resultCount > 0 ? estimatedSize / resultCount : 0);

                try
                {
                    _logger.LogDebug("CACHE SET [{Timestamp}]: About to set cache with key {CacheKey}, value type {ValueType}, value count {ValueCount}, options {@Options}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey, result.GetType().Name, result.Count, new {
                            Priority = cacheOptions.Priority,
                            Size = cacheOptions.Size,
                            SlidingExpiration = cacheOptions.SlidingExpiration,
                            AbsoluteExpiration = cacheOptions.AbsoluteExpiration
                        });

                    // Store the result in a local variable to ensure it's not modified
                    var resultToCache = result.ToList();

                    _logger.LogDebug("CACHE SET DETAILS [{Timestamp}]: Setting cache with key {CacheKey}, value type {ValueType}, value count {ValueCount}, first item ID {FirstItemId}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey, resultToCache.GetType().Name, resultToCache.Count, resultToCache.FirstOrDefault()?.Id);

                    // Set the cache with the local variable - measure time
                    var cacheSetStartTime = DateTime.UtcNow;
                    _logger.LogInformation("PERF [{Timestamp}]: Starting cache set operation",
                        cacheSetStartTime.ToString("HH:mm:ss.fff"));

                    _cache.Set(cacheKey, resultToCache, cacheOptions);

                    var cacheSetEndTime = DateTime.UtcNow;
                    var cacheSetElapsedMs = (cacheSetEndTime - cacheSetStartTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: Cache set operation completed in {ElapsedMs}ms",
                        cacheSetEndTime.ToString("HH:mm:ss.fff"), cacheSetElapsedMs);

                    // Verify the cache was set correctly
                    bool verifySet = _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction>? verifyResult);

                    if (verifySet && verifyResult != null)
                    {
                        var verifyList = verifyResult.ToList();
                        _logger.LogDebug("CACHE VERIFY SUCCESS: After Set, TryGetValue returned {Result} for key {CacheKey}, result is not null with count {Count}, first item ID {FirstItemId}",
                            verifySet, cacheKey, verifyList.Count, verifyList.FirstOrDefault()?.Id);

                        // Verify that the cached result is the same as the original result
                        bool sameCount = verifyList.Count == resultToCache.Count;
                        bool sameFirstId = verifyList.FirstOrDefault()?.Id == resultToCache.FirstOrDefault()?.Id;

                        _logger.LogDebug("CACHE VERIFY DETAILS: Same count: {SameCount}, Same first ID: {SameFirstId}",
                            sameCount, sameFirstId);
                    }
                    else
                    {
                        _logger.LogWarning("CACHE VERIFY FAILED: After Set, TryGetValue returned {Result} for key {CacheKey}, result is {ResultStatus}",
                            verifySet, cacheKey, verifyResult != null ? "not null" : "null");
                    }

                    _logger.LogInformation("CACHE SET SUCCESS [{Timestamp}]: Cached daily actions for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes, count: {Count}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey, estimatedSize, resultToCache.Count);

                    // Log cache statistics after setting
                    var cacheServiceAfterSet = _cache as IGlobalCacheService;
                    if (cacheServiceAfterSet != null)
                    {
                        var stats = cacheServiceAfterSet.GetStatistics();
                        _logger.LogDebug("CACHE STATS [{Timestamp}] after set: TotalHits={TotalHits}, TotalMisses={TotalMisses}, CacheCount={CacheCount}",
                            DateTime.UtcNow.ToString("HH:mm:ss.fff"), stats["TotalHits"], stats["TotalMisses"], stats["CacheCount"]);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "CACHE ERROR [{Timestamp}]: Failed to set cache with key {CacheKey}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey);
                }

                // Log total method time for cache miss
                var cacheMissEndTime = DateTime.UtcNow;
                var cacheMissElapsedMs = (cacheMissEndTime - methodStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: GetDailyActionsAsync completed with CACHE MISS in {ElapsedMs}ms",
                    cacheMissEndTime.ToString("HH:mm:ss.fff"), cacheMissElapsedMs);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction?> GetDailyActionByIdAsync(int id)
        {
            try
            {
                // Create cache key
                string cacheKey = string.Format(DAILY_ACTION_BY_ID_CACHE_KEY, id);

                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out DailyAction? cachedResult) && cachedResult != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved daily action from cache with ID {Id}, cache key: {CacheKey}", id, cacheKey);
                    return cachedResult;
                }

                _logger.LogWarning("CACHE MISS: Getting daily action from database with ID {Id}, cache key: {CacheKey}", id, cacheKey);

                // Get from database
                var result = await _dbContext.DailyActions
                    .AsNoTracking()
                    // .Include(da => da.WhiteLabel) // Commented out for now
                    .FirstOrDefaultAsync(da => da.Id == id);

                // Cache the result if not null
                if (result != null)
                {
                    // Estimate the size of the DailyAction object for cache entry
                    long estimatedSize = 1000; // More accurate estimate for a single DailyAction object

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetPriority(CacheItemPriority.High)
                        .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                        .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                    _cache.Set(cacheKey, result, cacheOptions);
                    _logger.LogInformation("Cached daily action with ID {Id}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                        id, cacheKey, estimatedSize);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action with ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction> AddDailyActionAsync(DailyAction dailyAction)
        {
            try
            {
                _dbContext.DailyActions.Add(dailyAction);
                await _dbContext.SaveChangesAsync();

                // Invalidate relevant caches
                InvalidateCacheForDate(dailyAction.Date, dailyAction.WhiteLabelID);

                return dailyAction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding daily action for date {Date} and white label {WhiteLabelID}",
                    dailyAction.Date, dailyAction.WhiteLabelID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction> UpdateDailyActionAsync(DailyAction dailyAction)
        {
            try
            {
                _dbContext.Entry(dailyAction).State = EntityState.Modified;
                await _dbContext.SaveChangesAsync();

                // Invalidate relevant caches
                InvalidateCacheForDate(dailyAction.Date, dailyAction.WhiteLabelID);

                // Invalidate specific cache for this ID
                string cacheKey = string.Format(DAILY_ACTION_BY_ID_CACHE_KEY, dailyAction.Id);
                _cache.Remove(cacheKey);

                return dailyAction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily action with ID {Id}", dailyAction.Id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteDailyActionAsync(int id)
        {
            try
            {
                var dailyAction = await _dbContext.DailyActions.FindAsync(id);
                if (dailyAction == null)
                {
                    return false;
                }

                // Store date and white label ID before removing
                var date = dailyAction.Date;
                var whiteLabelId = dailyAction.WhiteLabelID;

                _dbContext.DailyActions.Remove(dailyAction);
                await _dbContext.SaveChangesAsync();

                // Invalidate relevant caches
                InvalidateCacheForDate(date, whiteLabelId);

                // Invalidate specific cache for this ID
                string cacheKey = string.Format(DAILY_ACTION_BY_ID_CACHE_KEY, id);
                _cache.Remove(cacheKey);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting daily action with ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionsSummary> GetSummaryMetricsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Start performance timer
                var methodStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSummaryMetricsAsync",
                    methodStartTime.ToString("HH:mm:ss.fff"));

                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create cache key
                string cacheKey = string.Format(SUMMARY_METRICS_CACHE_KEY,
                    start.ToString("yyyyMMdd"),
                    end.ToString("yyyyMMdd"),
                    whiteLabelId?.ToString() ?? "all");

                _logger.LogInformation("CACHE KEY GENERATION [{Timestamp}]: Generated cache key for summary metrics: {CacheKey} with parameters: startDate={StartDate}, endDate={EndDate}, whiteLabelId={WhiteLabelId}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey, start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), whiteLabelId);

                // Try to get from cache first - measure time
                var cacheCheckStartTime = DateTime.UtcNow;
                bool cacheHit = _cache.TryGetValue(cacheKey, out DailyActionsSummary? cachedResult);
                var cacheCheckEndTime = DateTime.UtcNow;
                var cacheCheckElapsedMs = (cacheCheckEndTime - cacheCheckStartTime).TotalMilliseconds;

                _logger.LogDebug("CACHE RESULT [{Timestamp}]: TryGetValue returned {Result} for key {CacheKey} in {ElapsedMs}ms",
                    cacheCheckEndTime.ToString("HH:mm:ss.fff"), cacheHit, cacheKey, cacheCheckElapsedMs);

                if (cacheHit && cachedResult != null)
                {
                    _logger.LogInformation("CACHE HIT [{Timestamp}]: Retrieved summary metrics from cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, retrieval time: {ElapsedMs}ms",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey, cacheCheckElapsedMs);

                    // Log some details about the cached summary
                    _logger.LogDebug("CACHE HIT DETAILS [{Timestamp}]: Summary metrics - TotalRegistrations: {TotalRegistrations}, TotalFTD: {TotalFTD}, TotalGGR: {TotalGGR}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cachedResult.TotalRegistrations, cachedResult.TotalFTD, cachedResult.TotalGGR);

                    // Log total method time for cache hit
                    var summaryHitEndTime = DateTime.UtcNow;
                    var summaryHitElapsedMs = (summaryHitEndTime - methodStartTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: GetSummaryMetricsAsync completed with CACHE HIT in {ElapsedMs}ms",
                        summaryHitEndTime.ToString("HH:mm:ss.fff"), summaryHitElapsedMs);

                    return cachedResult;
                }

                _logger.LogWarning("CACHE MISS [{Timestamp}]: Calculating summary metrics for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey);

                // Get daily actions for the specified date range - measure time
                var getDailyActionsStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetDailyActionsAsync for summary metrics",
                    getDailyActionsStartTime.ToString("HH:mm:ss.fff"));

                var dailyActions = await GetDailyActionsAsync(startDate, endDate, whiteLabelId);

                var getDailyActionsEndTime = DateTime.UtcNow;
                var getDailyActionsElapsedMs = (getDailyActionsEndTime - getDailyActionsStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: GetDailyActionsAsync for summary metrics completed in {ElapsedMs}ms",
                    getDailyActionsEndTime.ToString("HH:mm:ss.fff"), getDailyActionsElapsedMs);

                // Calculate summary metrics - measure time
                var calculateStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting summary metrics calculation",
                    calculateStartTime.ToString("HH:mm:ss.fff"));

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
                var calculateElapsedMs = (calculateEndTime - calculateStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Summary metrics calculation completed in {ElapsedMs}ms",
                    calculateEndTime.ToString("HH:mm:ss.fff"), calculateElapsedMs);

                // Estimate the size of the summary object for cache entry
                long estimatedSize = 1000; // More accurate estimate for summary object

                // Cache the result with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                try
                {
                    _logger.LogDebug("CACHE SET [{Timestamp}]: About to set summary metrics cache with key {CacheKey}, value type {ValueType}, options {@Options}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey, summary.GetType().Name, new {
                            Priority = cacheOptions.Priority,
                            Size = cacheOptions.Size,
                            SlidingExpiration = cacheOptions.SlidingExpiration,
                            AbsoluteExpiration = cacheOptions.AbsoluteExpiration
                        });

                    // Set the cache with the summary - measure time
                    var cacheSetStartTime = DateTime.UtcNow;
                    _logger.LogInformation("PERF [{Timestamp}]: Starting cache set operation for summary metrics",
                        cacheSetStartTime.ToString("HH:mm:ss.fff"));

                    _cache.Set(cacheKey, summary, cacheOptions);

                    var cacheSetEndTime = DateTime.UtcNow;
                    var cacheSetElapsedMs = (cacheSetEndTime - cacheSetStartTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: Cache set operation for summary metrics completed in {ElapsedMs}ms",
                        cacheSetEndTime.ToString("HH:mm:ss.fff"), cacheSetElapsedMs);

                    // Verify the cache was set correctly
                    bool verifySet = _cache.TryGetValue(cacheKey, out DailyActionsSummary? verifyResult);

                    if (verifySet && verifyResult != null)
                    {
                        _logger.LogDebug("CACHE VERIFY SUCCESS [{Timestamp}]: After Set, TryGetValue returned {Result} for key {CacheKey}, result is not null",
                            DateTime.UtcNow.ToString("HH:mm:ss.fff"), verifySet, cacheKey);
                    }
                    else
                    {
                        _logger.LogWarning("CACHE VERIFY FAILED [{Timestamp}]: After Set, TryGetValue returned {Result} for key {CacheKey}, result is {ResultStatus}",
                            DateTime.UtcNow.ToString("HH:mm:ss.fff"), verifySet, cacheKey, verifyResult != null ? "not null" : "null");
                    }

                    _logger.LogInformation("CACHE SET SUCCESS [{Timestamp}]: Cached summary metrics for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), startDate, endDate, whiteLabelId, cacheKey, estimatedSize);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "CACHE ERROR [{Timestamp}]: Failed to set summary metrics cache with key {CacheKey}",
                        DateTime.UtcNow.ToString("HH:mm:ss.fff"), cacheKey);
                }

                // Log total method time for cache miss
                var summaryMissEndTime = DateTime.UtcNow;
                var summaryMissElapsedMs = (summaryMissEndTime - methodStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: GetSummaryMetricsAsync completed with CACHE MISS in {ElapsedMs}ms",
                    summaryMissEndTime.ToString("HH:mm:ss.fff"), summaryMissElapsedMs);

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting summary metrics for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(DailyActionFilterDto filter)
        {
            try
            {
                _logger.LogInformation("Getting filtered daily actions with parameters: {@Filter}", filter);

                // Default date range to last 30 days if not specified
                var today = DateTime.UtcNow.Date;
                var startDate = filter.StartDate?.Date ?? today.AddDays(-30);
                var endDate = filter.EndDate?.Date ?? today;

                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create a hash of the filter for caching
                var filterHash = ComputeFilterHash(filter);
                string cacheKey = string.Format(FILTERED_DAILY_ACTIONS_CACHE_KEY, filterHash);

                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out DailyActionResponseDto? cachedResult) && cachedResult != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved filtered daily actions from cache with hash {FilterHash}, cache key: {CacheKey}", filterHash, cacheKey);
                    return cachedResult;
                }

                _logger.LogWarning("CACHE MISS: Getting filtered daily actions from database with hash {FilterHash}, cache key: {CacheKey}", filterHash, cacheKey);

                // Calculate date range span in days
                var daySpan = (end.Date - start.Date).Days + 1;

                // Set a reasonable limit for the total query
                int maxTotalRecords = Math.Min(50000, daySpan * 1000); // Limit to 1000 records per day, max 50,000

                _logger.LogInformation("Setting max total records limit to {MaxTotalRecords} for date range spanning {DaySpan} days",
                    maxTotalRecords, daySpan);

                _logger.LogInformation("Using optimized query with INNER JOINs and NOLOCK hints");

                // Build base query with NOLOCK hint and include joins with Player, WhiteLabel, Country, and Currency
                // Using INNER JOINs with direct column relationships and explicit NOLOCK hints
                // Select only the fields we actually need
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(da => da.Date >= start && da.Date <= end)
                    // Inner join with Players table - select only needed fields
                    .Join(_dbContext.Players.AsNoTracking().TagWith("WITH (NOLOCK)"),
                        da => da.PlayerID,
                        p => p.PlayerID,
                        (da, player) => new {
                            // DailyAction fields
                            DailyAction = da,
                            // Player fields needed for grouping/display
                            PlayerID = player.PlayerID,
                            PlayerFirstName = player.FirstName,
                            PlayerLastName = player.LastName,
                            PlayerAlias = player.Alias,
                            PlayerEmail = player.Email,
                            PlayerCountryID = player.CountryID,
                            PlayerCurrency = player.Currency,
                            PlayerGender = player.Gender,
                            PlayerStatus = player.Status,
                            PlayerRegisteredDate = player.RegisteredDate,
                            PlayerRegisteredPlatform = player.RegisteredPlatform,
                            PlayerVIPLevel = player.VIPLevel
                        })
                    // Inner join with WhiteLabels table - select only needed fields
                    .Join(_dbContext.WhiteLabels.AsNoTracking().TagWith("WITH (NOLOCK)"),
                        x => x.DailyAction.WhiteLabelID,
                        wl => (short?)wl.Id,
                        (x, whiteLabel) => new {
                            x.DailyAction,
                            x.PlayerID, x.PlayerFirstName, x.PlayerLastName, x.PlayerAlias, x.PlayerEmail,
                            x.PlayerCountryID, x.PlayerCurrency, x.PlayerGender, x.PlayerStatus,
                            x.PlayerRegisteredDate, x.PlayerRegisteredPlatform, x.PlayerVIPLevel,
                            // WhiteLabel fields needed for grouping/display
                            WhiteLabelID = whiteLabel.Id,
                            WhiteLabelName = whiteLabel.Name,
                            WhiteLabelShortName = whiteLabel.Code
                        })
                    // Inner join with Countries table - direct join on CountryID
                    .Join(_dbContext.Countries.AsNoTracking().TagWith("WITH (NOLOCK)"),
                        x => x.PlayerCountryID,
                        c => c.CountryID,
                        (x, country) => new {
                            x.DailyAction,
                            x.PlayerID, x.PlayerFirstName, x.PlayerLastName, x.PlayerAlias, x.PlayerEmail,
                            x.PlayerCurrency, x.PlayerGender, x.PlayerStatus,
                            x.PlayerRegisteredDate, x.PlayerRegisteredPlatform, x.PlayerVIPLevel,
                            x.WhiteLabelID, x.WhiteLabelName, x.WhiteLabelShortName,
                            // Country fields needed for grouping/display
                            CountryID = country.CountryID,
                            CountryName = country.CountryName,
                            CountryCode = country.IsoCode
                        })
                    // Inner join with Currencies table - direct join on Currency code
                    .Join(_dbContext.Currencies.AsNoTracking().TagWith("WITH (NOLOCK)"),
                        x => x.PlayerCurrency,
                        c => c.CurrencyCode,
                        (x, currency) => new {
                            // DailyAction fields - all needed for metrics
                            DailyAction = x.DailyAction,
                            // Player fields needed for grouping/display
                            PlayerID = x.PlayerID,
                            PlayerName = !string.IsNullOrEmpty(x.PlayerFirstName) || !string.IsNullOrEmpty(x.PlayerLastName) ?
                                $"{x.PlayerFirstName ?? ""} {x.PlayerLastName ?? ""}".Trim() :
                                (!string.IsNullOrEmpty(x.PlayerAlias) ? x.PlayerAlias :
                                (!string.IsNullOrEmpty(x.PlayerEmail) ? x.PlayerEmail : $"Player {x.PlayerID}")),
                            PlayerGender = x.PlayerGender,
                            PlayerStatus = x.PlayerStatus,
                            PlayerRegisteredDate = x.PlayerRegisteredDate,
                            PlayerRegisteredPlatform = x.PlayerRegisteredPlatform,
                            PlayerVIPLevel = x.PlayerVIPLevel,
                            // WhiteLabel fields needed for grouping/display
                            WhiteLabelID = x.WhiteLabelID,
                            WhiteLabelName = x.WhiteLabelName,
                            // Country fields needed for grouping/display
                            CountryID = x.CountryID,
                            CountryName = x.CountryName,
                            CountryCode = x.CountryCode,
                            // Currency fields needed for grouping/display
                            CurrencyCode = currency.CurrencyCode,
                            CurrencyName = currency.CurrencyName,
                            CurrencySymbol = currency.CurrencySymbol
                        });

                // Apply white label filter if specified
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    var whiteLabelIds = filter.WhiteLabelIds.ToArray();
                    if (whiteLabelIds.Length == 1)
                    {
                        // Simple case - just one white label ID
                        query = query.Where(x => x.DailyAction.WhiteLabelID.HasValue && x.DailyAction.WhiteLabelID.Value == whiteLabelIds[0]);
                    }
                    else
                    {
                        // Multiple white label IDs
                        query = query.Where(x => x.DailyAction.WhiteLabelID.HasValue && whiteLabelIds.Contains((int)x.DailyAction.WhiteLabelID.Value));
                    }
                }

                // Get total count before pagination, but limit it to avoid performance issues
                var countQuery = query;
                if (maxTotalRecords > 0)
                {
                    // Apply the limit to the count query as well, but ensure we have an OrderBy first
                    countQuery = countQuery
                        .OrderBy(x => x.DailyAction.Date)
                        .ThenBy(x => x.DailyAction.WhiteLabelID)
                        .Take(maxTotalRecords);
                }
                var totalCount = await countQuery.CountAsync();

                // Apply the overall limit first to avoid processing too many records
                // Ensure we have an OrderBy before Take to avoid the warning
                query = query
                    .OrderBy(x => x.DailyAction.Date)
                    .ThenBy(x => x.DailyAction.WhiteLabelID)
                    .Take(maxTotalRecords);

                // Define variables outside the if/else blocks
                var joinedResults = new List<(DailyAction DailyAction, Player? Player, WhiteLabel? WhiteLabel, Country? Country, Currency? Currency)>();
                int pageSize = Math.Max(1, filter.PageSize);
                int pageNumber = Math.Max(1, filter.PageNumber);

                // Check if we're requesting all records (for grouping)
                if (filter.PageSize >= 1000)
                {
                    _logger.LogInformation("Large page size detected ({PageSize}). Retrieving all records up to limit.", filter.PageSize);

                    // Create a query without pagination but with ordering
                    var finalQuery = query
                        .OrderBy(x => x.DailyAction.Date)
                        .ThenBy(x => x.DailyAction.WhiteLabelID);

                    // Get the SQL query string
                    var queryString = finalQuery.ToQueryString();
                    _logger.LogInformation("EXECUTING SQL QUERY (ALL RECORDS): {SqlQuery}", queryString);

                    // Log a simplified version of the query for debugging
                    _logger.LogInformation("SIMPLIFIED SQL QUERY: SELECT " +
                        "t.*, " + // DailyActions fields
                        "t0.PlayerID, t0.FirstName, t0.LastName, t0.Alias, t0.Email, t0.Gender, t0.Status, t0.RegisteredDate, t0.RegisteredPlatform, t0.VIPLevel, " + // Player fields
                        "t1.Id AS WhiteLabelID, t1.Name AS WhiteLabelName, " + // WhiteLabel fields
                        "t2.CountryID, t2.CountryName, t2.IsoCode AS CountryCode, " + // Country fields
                        "t3.CurrencyCode, t3.CurrencyName, t3.CurrencySymbol " + // Currency fields
                        "FROM common.tbl_Daily_actions AS t (NOLOCK) " +
                        "INNER JOIN common.tbl_Daily_actions_players AS t0 (NOLOCK) ON t.PlayerID = t0.PlayerID " +
                        "INNER JOIN common.tbl_White_labels AS t1 (NOLOCK) ON t.WhiteLabelID = CAST(t1.LabelID AS smallint) " +
                        "INNER JOIN common.tbl_Countries AS t2 (NOLOCK) ON t0.CountryID = t2.CountryID " +
                        "INNER JOIN common.tbl_Currencies AS t3 (NOLOCK) ON t0.Currency = t3.CurrencyCode " +
                        $"WHERE t.Date >= '{start:yyyy-MM-dd}' AND t.Date <= '{end:yyyy-MM-dd}'");

                    // Execute the query
                    var results = await finalQuery.ToListAsync();

                    // Convert to our tuple format with the optimized projection
                    joinedResults = results.Select(r => (
                        r.DailyAction,
                        (Player?)null, // We're not using the full Player object anymore
                        (WhiteLabel?)null, // We're not using the full WhiteLabel object anymore
                        (Country?)null, // We're not using the full Country object anymore
                        (Currency?)null // We're not using the full Currency object anymore
                    )).ToList();
                }
                else
                {
                    // Apply normal pagination
                    var skip = (pageNumber - 1) * pageSize;

                    // Create a query with pagination
                    var finalQuery = query
                        .OrderBy(x => x.DailyAction.Date)
                        .ThenBy(x => x.DailyAction.WhiteLabelID)
                        .Skip(skip)
                        .Take(pageSize);

                    // Get the SQL query string
                    var queryString = finalQuery.ToQueryString();
                    _logger.LogInformation("EXECUTING SQL QUERY (PAGINATED): {SqlQuery}", queryString);

                    // Log a simplified version of the query for debugging
                    _logger.LogInformation("SIMPLIFIED SQL QUERY (PAGINATED): SELECT " +
                        "t.*, " + // DailyActions fields
                        "t0.PlayerID, t0.FirstName, t0.LastName, t0.Alias, t0.Email, t0.Gender, t0.Status, t0.RegisteredDate, t0.RegisteredPlatform, t0.VIPLevel, " + // Player fields
                        "t1.Id AS WhiteLabelID, t1.Name AS WhiteLabelName, " + // WhiteLabel fields
                        "t2.CountryID, t2.CountryName, t2.IsoCode AS CountryCode, " + // Country fields
                        "t3.CurrencyCode, t3.CurrencyName, t3.CurrencySymbol " + // Currency fields
                        "FROM common.tbl_Daily_actions AS t (NOLOCK) " +
                        "INNER JOIN common.tbl_Daily_actions_players AS t0 (NOLOCK) ON t.PlayerID = t0.PlayerID " +
                        "INNER JOIN common.tbl_White_labels AS t1 (NOLOCK) ON t.WhiteLabelID = CAST(t1.LabelID AS smallint) " +
                        "INNER JOIN common.tbl_Countries AS t2 (NOLOCK) ON t0.CountryID = t2.CountryID " +
                        "INNER JOIN common.tbl_Currencies AS t3 (NOLOCK) ON t0.Currency = t3.CurrencyCode " +
                        $"WHERE t.Date >= '{start:yyyy-MM-dd}' AND t.Date <= '{end:yyyy-MM-dd}' " +
                        $"ORDER BY t.Date, t.WhiteLabelID OFFSET {(pageNumber - 1) * pageSize} ROWS FETCH NEXT {pageSize} ROWS ONLY");

                    // Execute the query
                    var results = await finalQuery.ToListAsync();

                    // Convert to our tuple format with the optimized projection
                    joinedResults = results.Select(r => (
                        r.DailyAction,
                        (Player?)null, // We're not using the full Player object anymore
                        (WhiteLabel?)null, // We're not using the full WhiteLabel object anymore
                        (Country?)null, // We're not using the full Country object anymore
                        (Currency?)null // We're not using the full Currency object anymore
                    )).ToList();
                }

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map to DTOs
                var mappedDailyActions = joinedResults.Select(result =>
                {
                    var da = result.DailyAction;

                    // Get the WhiteLabel ID and name from our projection
                    int whiteLabelId = 0;
                    string whiteLabelName = "Unknown";

                    if (da.WhiteLabelID.HasValue)
                    {
                        whiteLabelId = (int)da.WhiteLabelID.Value;
                        if (whiteLabelDict.TryGetValue(whiteLabelId, out var name))
                        {
                            whiteLabelName = name;
                        }
                    }

                    // Get player information from our projection
                    string playerName = da.PlayerID.HasValue ? $"Player {da.PlayerID}" : "Unknown";

                    // Get country information from our projection
                    string countryName = "Unknown";

                    // Get currency information from our projection
                    string currencyCode = "Unknown";

                    return new DailyActionDto
                    {
                        Id = (int)da.Id,
                        Date = da.Date,
                        WhiteLabelId = whiteLabelId,
                        WhiteLabelName = whiteLabelName,
                        PlayerId = da.PlayerID,
                        PlayerName = playerName,
                        CountryName = countryName,
                        CurrencyCode = currencyCode,
                        Registrations = da.Registration.HasValue ? (int)da.Registration.Value : 0,
                        FTD = da.FTD.HasValue ? (int)da.FTD.Value : 0,
                        FTDA = da.FTDA.HasValue ? (int)da.FTDA.Value : null,

                        // Deposit-related properties
                        Deposits = da.Deposits ?? 0,
                        DepositsCreditCard = da.DepositsCreditCard,
                        DepositsNeteller = da.DepositsNeteller,
                        DepositsMoneyBookers = da.DepositsMoneyBookers,
                        DepositsOther = da.DepositsOther,
                        DepositsFee = da.DepositsFee,
                        DepositsSport = da.DepositsSport,
                        DepositsLive = da.DepositsLive,
                        DepositsBingo = da.DepositsBingo,

                        // Cashout-related properties
                        CashoutRequests = da.CashoutRequests,
                        PaidCashouts = da.PaidCashouts ?? 0,
                        Chargebacks = da.Chargebacks,
                        Voids = da.Voids,
                        ReverseChargebacks = da.ReverseChargebacks,

                        // Bonus-related properties
                        Bonuses = da.Bonuses,
                        BonusesSport = da.BonusesSport,
                        BonusesLive = da.BonusesLive,
                        BonusesBingo = da.BonusesBingo,
                        CollectedBonuses = da.CollectedBonuses,
                        ExpiredBonuses = da.ExpiredBonuses,
                        BonusConverted = da.BonusConverted,

                        // Casino-related properties
                        BetsCasino = da.BetsCasino ?? 0,
                        BetsCasinoReal = da.BetsCasinoReal,
                        BetsCasinoBonus = da.BetsCasinoBonus,
                        RefundsCasino = da.RefundsCasino,
                        RefundsCasinoReal = da.RefundsCasinoReal,
                        RefundsCasinoBonus = da.RefundsCasinoBonus,
                        WinsCasino = da.WinsCasino ?? 0,
                        WinsCasinoReal = da.WinsCasinoReal,
                        WinsCasinoBonus = da.WinsCasinoBonus,

                        // Sport-related properties
                        BetsSport = da.BetsSport ?? 0,
                        BetsSportReal = da.BetsSportReal,
                        BetsSportBonus = da.BetsSportBonus,
                        RefundsSport = da.RefundsSport,
                        RefundsSportReal = da.RefundsSportReal,
                        RefundsSportBonus = da.RefundsSportBonus,
                        WinsSport = da.WinsSport ?? 0,
                        WinsSportReal = da.WinsSportReal,
                        WinsSportBonus = da.WinsSportBonus,

                        // Live-related properties
                        BetsLive = da.BetsLive ?? 0,
                        BetsLiveReal = da.BetsLiveReal,
                        BetsLiveBonus = da.BetsLiveBonus,
                        RefundsLive = da.RefundsLive,
                        RefundsLiveReal = da.RefundsLiveReal,
                        RefundsLiveBonus = da.RefundsLiveBonus,
                        WinsLive = da.WinsLive ?? 0,
                        WinsLiveReal = da.WinsLiveReal,
                        WinsLiveBonus = da.WinsLiveBonus,

                        // Bingo-related properties
                        BetsBingo = da.BetsBingo ?? 0,
                        BetsBingoReal = da.BetsBingoReal,
                        BetsBingoBonus = da.BetsBingoBonus,
                        RefundsBingo = da.RefundsBingo,
                        RefundsBingoReal = da.RefundsBingoReal,
                        RefundsBingoBonus = da.RefundsBingoBonus,
                        WinsBingo = da.WinsBingo ?? 0,
                        WinsBingoReal = da.WinsBingoReal,
                        WinsBingoBonus = da.WinsBingoBonus,

                        // Side games properties
                        SideGamesBets = da.SideGamesBets,
                        SideGamesRefunds = da.SideGamesRefunds,
                        SideGamesWins = da.SideGamesWins,
                        SideGamesTableGamesBets = da.SideGamesTableGamesBets,
                        SideGamesTableGamesWins = da.SideGamesTableGamesWins,
                        SideGamesCasualGamesBets = da.SideGamesCasualGamesBets,
                        SideGamesCasualGamesWins = da.SideGamesCasualGamesWins,
                        SideGamesSlotsBets = da.SideGamesSlotsBets,
                        SideGamesSlotsWins = da.SideGamesSlotsWins,
                        SideGamesJackpotsBets = da.SideGamesJackpotsBets,
                        SideGamesJackpotsWins = da.SideGamesJackpotsWins,
                        SideGamesFeaturedBets = da.SideGamesFeaturedBets,
                        SideGamesFeaturedWins = da.SideGamesFeaturedWins,

                        // Lotto-related properties
                        LottoBets = da.LottoBets,
                        LottoAdvancedBets = da.LottoAdvancedBets,
                        LottoWins = da.LottoWins,
                        LottoAdvancedWins = da.LottoAdvancedWins,

                        // App-related properties
                        AppBets = da.AppBets,
                        AppRefunds = da.AppRefunds,
                        AppWins = da.AppWins,
                        AppBetsCasino = da.AppBetsCasino,
                        AppRefundsCasino = da.AppRefundsCasino,
                        AppWinsCasino = da.AppWinsCasino,
                        AppBetsSport = da.AppBetsSport,
                        AppRefundsSport = da.AppRefundsSport,
                        AppWinsSport = da.AppWinsSport,

                        // Other financial properties
                        ClubPointsConversion = da.ClubPointsConversion,
                        BankRoll = da.BankRoll,
                        JackpotContribution = da.JackpotContribution,
                        InsuranceContribution = da.InsuranceContribution,
                        Adjustments = da.Adjustments,
                        AdjustmentsAdd = da.AdjustmentsAdd,
                        ClearedBalance = da.ClearedBalance,
                        RevenueAdjustments = da.RevenueAdjustments,
                        RevenueAdjustmentsAdd = da.RevenueAdjustmentsAdd,
                        AdministrativeFee = da.AdministrativeFee,
                        AdministrativeFeeReturn = da.AdministrativeFeeReturn,
                        BetsReal = da.BetsReal,
                        BetsBonus = da.BetsBonus,
                        RefundsReal = da.RefundsReal,
                        RefundsBonus = da.RefundsBonus,
                        WinsReal = da.WinsReal,
                        WinsBonus = da.WinsBonus,
                        EUR2GBP = da.EUR2GBP,
                        UpdatedDate = da.UpdatedDate,

                        // Calculated GGR properties
                        GGRCasino = da.GGRCasino,
                        GGRSport = da.GGRSport,
                        GGRLive = da.GGRLive,
                        GGRBingo = da.GGRBingo,
                        TotalGGR = da.TotalGGR
                    };
                }).ToList();

                // Apply grouping for all GroupByOptions
                List<DailyActionDto> result;

                _logger.LogInformation("Applying grouping by {GroupBy}", filter.GroupBy);

                // Group the data based on the selected option
                var groupedData = filter.GroupBy switch
                {
                    GroupByOption.Day => GroupByDay(mappedDailyActions),
                    GroupByOption.Month => GroupByMonth(mappedDailyActions),
                    GroupByOption.Year => GroupByYear(mappedDailyActions),
                    GroupByOption.Label => GroupByWhiteLabel(mappedDailyActions),
                    GroupByOption.Country => GroupByCountry(mappedDailyActions),
                    GroupByOption.Tracker => GroupByTracker(mappedDailyActions),
                    GroupByOption.Currency => GroupByCurrency(mappedDailyActions),
                    GroupByOption.Gender => GroupByGender(mappedDailyActions),
                    GroupByOption.Platform => GroupByPlatform(mappedDailyActions),
                    GroupByOption.Ranking => GroupByRanking(mappedDailyActions),
                    GroupByOption.Player => GroupByPlayer(mappedDailyActions),
                    _ => mappedDailyActions // Default to no grouping
                };

                result = groupedData;

                // Calculate summary metrics
                var summary = await GetSummaryMetricsAsync(startDate, endDate,
                    filter.WhiteLabelIds?.Count == 1 ? filter.WhiteLabelIds[0] : null);

                // Create response
                var response = new DailyActionResponseDto
                {
                    Data = result,
                    Summary = new DailyActionsSummaryDto
                    {
                        TotalRegistrations = summary.TotalRegistrations,
                        TotalFTD = summary.TotalFTD,
                        TotalDeposits = summary.TotalDeposits,
                        TotalCashouts = summary.TotalCashouts,
                        TotalBetsCasino = summary.TotalBetsCasino,
                        TotalWinsCasino = summary.TotalWinsCasino,
                        TotalBetsSport = summary.TotalBetsSport,
                        TotalWinsSport = summary.TotalWinsSport,
                        TotalBetsLive = summary.TotalBetsLive,
                        TotalWinsLive = summary.TotalWinsLive,
                        TotalBetsBingo = summary.TotalBetsBingo,
                        TotalWinsBingo = summary.TotalWinsBingo,
                        TotalGGR = summary.TotalGGR
                    },
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    StartDate = startDate,
                    EndDate = endDate,
                    AppliedFilters = filter
                };

                // Estimate the size of the response object for cache entry
                long estimatedSize = result.Count * 1000 + 2000; // More accurate estimate: 1000 bytes per DailyActionDto + 2000 bytes for summary and metadata

                // Cache the result with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                _cache.Set(cacheKey, response, cacheOptions);
                _logger.LogInformation("Cached filtered daily actions with hash {FilterHash}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                    filterHash, cacheKey, estimatedSize);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered daily actions");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionMetadataDto> GetDailyActionsMetadataAsync()
        {
            try
            {
                // Try to get metadata from cache first
                if (_cache.TryGetValue(METADATA_CACHE_KEY, out DailyActionMetadataDto? cachedMetadata) && cachedMetadata != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved daily actions metadata from cache, cache key: {CacheKey}", METADATA_CACHE_KEY);
                    return cachedMetadata;
                }

                _logger.LogWarning("CACHE MISS: Getting daily actions metadata from PPrePorterDB database, cache key: {CacheKey}", METADATA_CACHE_KEY);

                // Get white labels from the metadata service if available, otherwise from the database
                List<WhiteLabelDto> whiteLabelDtos = new List<WhiteLabelDto>();
                List<CountryDto> countryDtos = new List<CountryDto>();
                List<CurrencyDto> currencyDtos = new List<CurrencyDto>();

                if (_metadataService != null)
                {
                    try
                    {
                        // Get white labels from metadata service
                        var whiteLabelsMetadata = await _metadataService.GetMetadataByTypeAsync("WhiteLabel", true);
                        whiteLabelDtos = whiteLabelsMetadata.Select(wl => new WhiteLabelDto
                        {
                            Id = wl.Id,
                            Name = wl.Name,
                            Code = wl.Code,
                            IsActive = wl.IsActive
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} white labels from metadata service", whiteLabelDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving white labels from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                    whiteLabelDtos = whiteLabels.Select(wl => new WhiteLabelDto
                    {
                        Id = wl.Id,
                        Name = wl.Name,
                        Code = wl.Code,
                        IsActive = wl.IsActive ?? false
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} white labels from database", whiteLabelDtos.Count);
                }

                // Get countries from the metadata service if available, otherwise from the database
                if (_metadataService != null)
                {
                    try
                    {
                        // Get countries from metadata service
                        var countriesMetadata = await _metadataService.GetMetadataByTypeAsync("Country", true);
                        countryDtos = countriesMetadata.Select(c => new CountryDto
                        {
                            Id = c.Id,
                            Name = c.Name,
                            IsoCode = c.Code
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} countries from metadata service", countryDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving countries from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var countries = await _dbContext.Countries
                        .AsNoTracking()
                        .Where(c => c.IsActive == true)
                        .OrderBy(c => c.CountryName)
                        .ToListAsync();

                    countryDtos = countries.Select(c => new CountryDto
                    {
                        Id = c.CountryID,
                        Name = c.CountryName,
                        IsoCode = c.IsoCode
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} countries from database", countryDtos.Count);
                }

                // Get currencies from the metadata service if available, otherwise from the database
                if (_metadataService != null)
                {
                    try
                    {
                        // Get currencies from metadata service
                        var currenciesMetadata = await _metadataService.GetMetadataByTypeAsync("Currency", true);
                        currencyDtos = currenciesMetadata.Select(c => new CurrencyDto
                        {
                            Id = (byte)c.Id, // Explicit cast from int to byte
                            Name = c.Name,
                            Code = c.Code,
                            Symbol = c.AdditionalData
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} currencies from metadata service", currencyDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving currencies from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var currencies = await _dbContext.Currencies
                        .AsNoTracking()
                        .OrderBy(c => c.CurrencyName)
                        .ToListAsync();

                    currencyDtos = currencies.Select(c => new CurrencyDto
                    {
                        Id = c.CurrencyID,
                        Name = c.CurrencyName,
                        Code = c.CurrencyCode,
                        Symbol = c.CurrencySymbol
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} currencies from database", currencyDtos.Count);
                }

                // Check if we have a metadata service
                List<LanguageDto> languageDtos = new List<LanguageDto>();
                List<string> platforms = new List<string>();
                List<string> genders = new List<string>();
                List<string> statuses = new List<string>();
                List<string> registrationPlayModes = new List<string>();
                List<string> trackers = new List<string>();

                if (_metadataService != null)
                {
                    try
                    {
                        // Get metadata from the Infrastructure's MetadataService
                        // This will use the DailyActionsMetadata table in PPrePorterDB
                        _logger.LogInformation("Getting metadata from PPrePorterDB.DailyActionsMetadata table");

                        try
                        {
                            // Get languages from metadata
                            var languageMetadata = await _metadataService.GetMetadataByTypeAsync("Language");
                            languageDtos = languageMetadata.Select((l, i) => new LanguageDto
                            {
                                Id = l.Id,
                                Name = l.Name,
                                Code = l.Code
                            }).ToList();
                            _logger.LogInformation("Retrieved {Count} languages from metadata service", languageDtos.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving languages from metadata service");
                            languageDtos = new List<LanguageDto>();
                        }

                        try
                        {
                            // Get platforms from metadata
                            var platformMetadata = await _metadataService.GetMetadataByTypeAsync("Platform");
                            platforms = platformMetadata.Select(p => p.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} platforms from metadata service", platforms.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving platforms from metadata service");
                            platforms = new List<string>();
                        }

                        try
                        {
                            // Get genders from metadata
                            var genderMetadata = await _metadataService.GetMetadataByTypeAsync("Gender");
                            genders = genderMetadata.Select(g => g.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} genders from metadata service", genders.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving genders from metadata service");
                            genders = new List<string> { "Male", "Female", "Other" };
                        }

                        try
                        {
                            // Get statuses from metadata
                            var statusMetadata = await _metadataService.GetMetadataByTypeAsync("Status");
                            statuses = statusMetadata.Select(s => s.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} statuses from metadata service", statuses.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving statuses from metadata service");
                            statuses = new List<string> { "Active", "Inactive", "Blocked" };
                        }

                        try
                        {
                            // Get registration play modes from metadata
                            var registrationPlayModeMetadata = await _metadataService.GetMetadataByTypeAsync("RegistrationPlayMode");
                            registrationPlayModes = registrationPlayModeMetadata.Select(r => r.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} registration play modes from metadata service", registrationPlayModes.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving registration play modes from metadata service");
                            registrationPlayModes = new List<string> { "Real", "Fun" };
                        }

                        try
                        {
                            // Get trackers from metadata
                            var trackerMetadata = await _metadataService.GetMetadataByTypeAsync("Tracker");
                            trackers = trackerMetadata.Select(t => t.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} trackers from metadata service", trackers.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving trackers from metadata service");
                            trackers = new List<string>();
                        }

                        _logger.LogInformation("Retrieved metadata from PPrePorterDB.DailyActionsMetadata table");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving metadata from PPrePorterDB.DailyActionsMetadata table. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to querying the database directly
                    _logger.LogWarning("No metadata service available, falling back to querying the database directly");

                    // For languages - use a direct query with DISTINCT
                    var languages = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.Language))
                        .Select(p => p.Language)
                        .Distinct()
                        .OrderBy(l => l)
                        .Take(100) // Limit to top 100 languages
                        .ToListAsync();

                    // Create language DTOs
                    languageDtos = languages.Select((l, i) => new LanguageDto
                    {
                        Id = i + 1,
                        Name = l ?? string.Empty,
                        Code = l ?? string.Empty
                    }).ToList();

                    // For platforms
                    platforms = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.RegisteredPlatform))
                        .Select(p => p.RegisteredPlatform)
                        .Distinct()
                        .OrderBy(p => p)
                        .Take(20) // Limit to top 20 platforms
                        .ToListAsync();

                    // For genders
                    genders = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.Gender))
                        .Select(p => p.Gender)
                        .Distinct()
                        .OrderBy(g => g)
                        .Take(10) // Limit to top 10 genders (should be just a few)
                        .ToListAsync();

                    // For statuses
                    statuses = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.Status))
                        .Select(p => p.Status)
                        .Distinct()
                        .OrderBy(s => s)
                        .Take(20) // Limit to top 20 statuses
                        .ToListAsync();

                    // For registration play modes
                    registrationPlayModes = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.RegistrationPlayMode))
                        .Select(p => p.RegistrationPlayMode)
                        .Distinct()
                        .OrderBy(r => r)
                        .Take(20) // Limit to top 20 registration play modes
                        .ToListAsync();

                    // For trackers (affiliate IDs)
                    trackers = await _dbContext.Players
                        .AsNoTracking()
                        .TagWith("WITH (NOLOCK)")
                        .Where(p => !string.IsNullOrEmpty(p.AffiliateID))
                        .Select(p => p.AffiliateID)
                        .Distinct()
                        .OrderBy(t => t)
                        .Take(100) // Limit to top 100 trackers
                        .ToListAsync();
                }

                // Create group by options
                var groupByOptions = new List<GroupByOptionDto>
                {
                    new() { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                    new() { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                    new() { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" },
                    new() { Id = (int)GroupByOption.Label, Name = "Label", Value = "Label" },
                    new() { Id = (int)GroupByOption.Player, Name = "Player", Value = "Player" },
                    new() { Id = (int)GroupByOption.Country, Name = "Country", Value = "Country" },
                    new() { Id = (int)GroupByOption.Tracker, Name = "Tracker", Value = "Tracker" },
                    new() { Id = (int)GroupByOption.Currency, Name = "Currency", Value = "Currency" },
                    new() { Id = (int)GroupByOption.Gender, Name = "Gender", Value = "Gender" },
                    new() { Id = (int)GroupByOption.Platform, Name = "Platform", Value = "Platform" },
                    new() { Id = (int)GroupByOption.Ranking, Name = "Ranking", Value = "Ranking" }
                };

                // Create metadata response
                var metadata = new DailyActionMetadataDto
                {
                    WhiteLabels = whiteLabelDtos,
                    Countries = countryDtos,
                    Currencies = currencyDtos,
                    Languages = languageDtos,
                    Platforms = platforms.Where(p => p != null).Select(p => p!).ToList(),
                    Genders = genders.Where(g => g != null).Select(g => g!).ToList(),
                    Statuses = statuses.Where(s => s != null).Select(s => s!).ToList(),
                    PlayerTypes = new List<string> { "Real", "Fun" },
                    RegistrationPlayModes = registrationPlayModes.Where(r => r != null).Select(r => r!).ToList(),
                    Trackers = trackers.Where(t => t != null).Select(t => t!).ToList(),
                    GroupByOptions = groupByOptions
                };

                // Estimate the size of the metadata object for cache entry
                long estimatedSize =
                    whiteLabelDtos.Count * 200 +  // White labels
                    countryDtos.Count * 100 +     // Countries
                    currencyDtos.Count * 100 +    // Currencies
                    languageDtos.Count * 50 +     // Languages
                    platforms.Count * 20 +        // Platforms
                    genders.Count * 20 +          // Genders
                    statuses.Count * 20 +         // Statuses
                    registrationPlayModes.Count * 20 + // Registration play modes
                    trackers.Count * 20 +         // Trackers
                    1000;                         // Base size and other properties

                // Cache the metadata with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.NeverRemove) // Metadata rarely changes, so keep it in cache
                    .SetSlidingExpiration(TimeSpan.FromHours(1))
                    .SetAbsoluteExpiration(TimeSpan.FromHours(24)) // Keep for 24 hours max
                    .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                _cache.Set(METADATA_CACHE_KEY, metadata, cacheOptions);
                _logger.LogInformation("Cached daily actions metadata with high priority, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                    METADATA_CACHE_KEY, estimatedSize);

                return metadata;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions metadata");

                // Create a minimal fallback metadata object
                var fallbackMetadata = new DailyActionMetadataDto
                {
                    WhiteLabels = new List<WhiteLabelDto>(),
                    Countries = new List<CountryDto>(),
                    Currencies = new List<CurrencyDto>(),
                    Languages = new List<LanguageDto>(),
                    Platforms = new List<string>(),
                    Genders = new List<string> { "Male", "Female", "Other" },
                    Statuses = new List<string> { "Active", "Inactive", "Blocked" },
                    PlayerTypes = new List<string> { "Real", "Fun" },
                    RegistrationPlayModes = new List<string> { "Real", "Fun" },
                    Trackers = new List<string>(),
                    GroupByOptions = new List<GroupByOptionDto>
                    {
                        new() { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                        new() { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                        new() { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" },
                        new() { Id = (int)GroupByOption.Label, Name = "Label", Value = "Label" },
                        new() { Id = (int)GroupByOption.Player, Name = "Player", Value = "Player" },
                        new() { Id = (int)GroupByOption.Country, Name = "Country", Value = "Country" }
                    }
                };

                _logger.LogWarning("Returning fallback metadata due to error");
                return fallbackMetadata;
            }
        }

        /// <summary>
        /// This method is no longer used - we've integrated the optimized query directly into GetFilteredDailyActionsAsync
        /// </summary>
        private async Task<DailyActionResponseDto> GetFilteredDailyActionsOptimizedAsync(
            DailyActionFilterDto filter,
            DateTime start,
            DateTime end,
            int maxTotalRecords,
            string cacheKey)
        {
            // Build the optimized SQL query
            var sql = @"
                SELECT t.*
                FROM common.tbl_Daily_actions AS t WITH (NOLOCK)
                INNER JOIN common.tbl_Daily_actions_players AS t0 WITH (NOLOCK) ON t.PlayerID = t0.PlayerID
                INNER JOIN common.tbl_White_labels AS t1 WITH (NOLOCK) ON t.WhiteLabelID = CAST(t1.LabelID AS smallint)
                INNER JOIN common.tbl_Countries AS t2 WITH (NOLOCK) ON
                    COALESCE(t0.CountryID,
                        CASE
                            WHEN t0.Country IS NULL OR t0.Country = '' THEN COALESCE(t1.DefaultCountry, 0)
                            ELSE (SELECT TOP 1 CountryID FROM common.tbl_Countries WITH (NOLOCK) WHERE CountryName = t0.Country)
                        END) = t2.CountryID
                INNER JOIN common.tbl_Currencies AS t4 WITH (NOLOCK) ON
                    CASE
                        WHEN t0.Currency IS NULL OR t0.Currency = '' THEN
                            (SELECT TOP 1 CurrencyCode FROM common.tbl_Currencies WITH (NOLOCK) WHERE CurrencyID = COALESCE(t1.DefaultCurrency, 0))
                        ELSE t0.Currency
                    END = t4.CurrencyCode
                WHERE t.Date >= @StartDate AND t.Date <= @EndDate";

            // Add white label filter if specified
            if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
            {
                if (filter.WhiteLabelIds.Count == 1)
                {
                    sql += " AND t.WhiteLabelID = @WhiteLabelId";
                }
                else
                {
                    sql += " AND t.WhiteLabelID IN @WhiteLabelIds";
                }
            }

            // Add ordering
            sql += " ORDER BY t.Date, t.WhiteLabelID";

            // Add pagination if needed
            if (filter.PageSize > 0 && filter.PageNumber > 0)
            {
                int skip = (filter.PageNumber - 1) * filter.PageSize;
                sql += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";
            }
            else
            {
                // Add limit to avoid returning too many records
                sql += " OFFSET 0 ROWS FETCH NEXT @MaxRecords ROWS ONLY";
            }

            _logger.LogInformation("Executing optimized SQL query: {Sql}", sql);

            // Create parameters
            var parameters = new List<Microsoft.Data.SqlClient.SqlParameter>
            {
                new Microsoft.Data.SqlClient.SqlParameter("@StartDate", start),
                new Microsoft.Data.SqlClient.SqlParameter("@EndDate", end)
            };

            if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
            {
                if (filter.WhiteLabelIds.Count == 1)
                {
                    parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@WhiteLabelId", filter.WhiteLabelIds[0]));
                }
                else
                {
                    // For multiple white label IDs, we need to use a table-valued parameter
                    // This is more complex and would require additional setup
                    // For simplicity, let's fall back to the original query for multiple white label IDs
                    throw new NotSupportedException("Multiple white label IDs not supported in optimized query");
                }
            }

            if (filter.PageSize > 0 && filter.PageNumber > 0)
            {
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@Skip", (filter.PageNumber - 1) * filter.PageSize));
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@Take", filter.PageSize));
            }
            else
            {
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@MaxRecords", maxTotalRecords));
            }

            // Execute the query
            var result = await _dbContext.DailyActions
                .FromSqlRaw(sql, parameters.ToArray())
                .AsNoTracking()
                .ToListAsync();

            // Get total count
            var countSql = @"
                SELECT COUNT(*)
                FROM common.tbl_Daily_actions AS t WITH (NOLOCK)
                INNER JOIN common.tbl_Daily_actions_players AS t0 WITH (NOLOCK) ON t.PlayerID = t0.PlayerID
                INNER JOIN common.tbl_White_labels AS t1 WITH (NOLOCK) ON t.WhiteLabelID = CAST(t1.LabelID AS smallint)
                INNER JOIN common.tbl_Countries AS t2 WITH (NOLOCK) ON
                    COALESCE(t0.CountryID,
                        CASE
                            WHEN t0.Country IS NULL OR t0.Country = '' THEN COALESCE(t1.DefaultCountry, 0)
                            ELSE (SELECT TOP 1 CountryID FROM common.tbl_Countries WITH (NOLOCK) WHERE CountryName = t0.Country)
                        END) = t2.CountryID
                INNER JOIN common.tbl_Currencies AS t4 WITH (NOLOCK) ON
                    CASE
                        WHEN t0.Currency IS NULL OR t0.Currency = '' THEN
                            (SELECT TOP 1 CurrencyCode FROM common.tbl_Currencies WITH (NOLOCK) WHERE CurrencyID = COALESCE(t1.DefaultCurrency, 0))
                        ELSE t0.Currency
                    END = t4.CurrencyCode
                WHERE t.Date >= @StartDate AND t.Date <= @EndDate";

            // Add white label filter if specified
            if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
            {
                if (filter.WhiteLabelIds.Count == 1)
                {
                    countSql += " AND t.WhiteLabelID = @WhiteLabelId";
                }
            }

            // Execute the count query
            var countCmd = _dbContext.Database.GetDbConnection().CreateCommand();
            countCmd.CommandText = countSql;
            countCmd.Parameters.AddRange(parameters.ToArray());

            if (_dbContext.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
            {
                await _dbContext.Database.GetDbConnection().OpenAsync();
            }

            var totalCount = (int)await countCmd.ExecuteScalarAsync();

            // Map to DTOs
            var mappedDailyActions = new List<DailyActionDto>();

            // Get white labels for mapping names
            var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
            var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

            // Map to DTOs
            foreach (var da in result)
            {
                // Get the WhiteLabel ID and name
                int whiteLabelId = 0;
                string whiteLabelName = "Unknown";

                if (da.WhiteLabelID.HasValue)
                {
                    whiteLabelId = (int)da.WhiteLabelID.Value;
                    if (whiteLabelDict.TryGetValue(whiteLabelId, out var name))
                    {
                        whiteLabelName = name;
                    }
                }

                // Create the DTO
                mappedDailyActions.Add(new DailyActionDto
                {
                    Id = (int)da.Id,
                    Date = da.Date,
                    WhiteLabelId = whiteLabelId,
                    WhiteLabelName = whiteLabelName,
                    PlayerId = da.PlayerID,
                    PlayerName = $"Player {da.PlayerID}",
                    CountryName = "Unknown", // We'll need to fetch this separately
                    CurrencyCode = "Unknown", // We'll need to fetch this separately
                    Registrations = da.Registration.HasValue ? (int)da.Registration.Value : 0,
                    FTD = da.FTD.HasValue ? (int)da.FTD.Value : 0,
                    FTDA = da.FTDA.HasValue ? (int)da.FTDA.Value : null,
                    Deposits = da.Deposits ?? 0,
                    PaidCashouts = da.PaidCashouts ?? 0,
                    BetsCasino = da.BetsCasino ?? 0,
                    WinsCasino = da.WinsCasino ?? 0,
                    BetsSport = da.BetsSport ?? 0,
                    WinsSport = da.WinsSport ?? 0,
                    BetsLive = da.BetsLive ?? 0,
                    WinsLive = da.WinsLive ?? 0,
                    BetsBingo = da.BetsBingo ?? 0,
                    WinsBingo = da.WinsBingo ?? 0,
                    GGRCasino = da.GGRCasino,
                    GGRSport = da.GGRSport,
                    GGRLive = da.GGRLive,
                    GGRBingo = da.GGRBingo,
                    TotalGGR = da.TotalGGR,
                    UpdatedDate = da.UpdatedDate
                    // Add other properties as needed
                });
            }

            // Create response
            var response = new DailyActionResponseDto
            {
                Data = mappedDailyActions,
                TotalCount = totalCount,
                CurrentPage = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalPages = filter.PageSize > 0 ? (int)Math.Ceiling(totalCount / (double)filter.PageSize) : 1,
                StartDate = start,
                EndDate = end,
                AppliedFilters = filter
            };

            // Cache the result
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetPriority(CacheItemPriority.High)
                .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                .SetSize(mappedDailyActions.Count * 1000 + 2000); // Estimate size

            _cache.Set(cacheKey, response, cacheOptions);
            _logger.LogInformation("Cached filtered daily actions with hash {FilterHash}, cache key: {CacheKey}",
                cacheKey, cacheKey);

            return response;
        }

        /// <summary>
        /// Computes a hash for the filter to use as a cache key
        /// </summary>
        private string ComputeFilterHash(DailyActionFilterDto filter)
        {
            // Create a string representation of the filter
            var filterString = System.Text.Json.JsonSerializer.Serialize(filter);

            // Compute hash
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(filterString);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        /// <summary>
        /// Groups daily actions by day
        /// </summary>
        private List<DailyActionDto> GroupByDay(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by day with {Count} records", dailyActions.Count);

            return dailyActions
                .GroupBy(da => da.Date.Date)
                .Select(group =>
                {
                    var firstItem = group.First();
                    var dayName = group.Key.ToString("yyyy-MM-dd");

                    _logger.LogInformation("Creating day group for {Day} with {Count} records",
                        dayName, group.Count());

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = group.Key,
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Day",
                        GroupValue = dayName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),
                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by month
        /// </summary>
        private List<DailyActionDto> GroupByMonth(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                .Select(group =>
                {
                    var firstItem = group.First();
                    var monthName = new DateTime(group.Key.Year, group.Key.Month, 1).ToString("MMMM yyyy");

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key.Year, group.Key.Month, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Month",
                        GroupValue = monthName,

                        // Sum numeric values
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        Deposits = group.Sum(da => da.Deposits),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),

                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by year
        /// </summary>
        private List<DailyActionDto> GroupByYear(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => da.Date.Year)
                .Select(group =>
                {
                    var firstItem = group.First();
                    var yearName = group.Key.ToString();

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key, 1, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Year",
                        GroupValue = yearName,

                        // Sum numeric values
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        Deposits = group.Sum(da => da.Deposits),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),

                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by white label
        /// </summary>
        private List<DailyActionDto> GroupByWhiteLabel(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => da.WhiteLabelId)
                .Select(group =>
                {
                    var firstItem = group.First();

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.MinValue, // Not applicable for grouped data
                        WhiteLabelId = group.Key,
                        WhiteLabelName = firstItem.WhiteLabelName,
                        GroupKey = "Label",
                        GroupValue = firstItem.WhiteLabelName,

                        // Sum numeric values
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        Deposits = group.Sum(da => da.Deposits),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),

                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderByDescending(da => da.TotalGGR)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by country
        /// </summary>
        private List<DailyActionDto> GroupByCountry(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by country with {Count} records", dailyActions.Count);

            // Now we have country information in the DailyActionDto
            // Group by country name
            var countryGroups = dailyActions
                .GroupBy(da => da.CountryName)
                .Where(g => !string.IsNullOrEmpty(g.Key)) // Skip unknown countries
                .ToList();

            _logger.LogInformation("Creating {Count} country groups", countryGroups.Count);

            // Create a group for each country
            var result = new List<DailyActionDto>();

            // Add a group for each country
            foreach (var group in countryGroups)
            {
                var countryName = group.Key;
                var countryActions = group.ToList();

                // Get the white label name from the first record (not relevant for country grouping)
                var whiteLabelName = "All White Labels";

                result.Add(new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = whiteLabelName,
                    GroupKey = "Country",
                    GroupValue = countryName,

                    // Sum all metrics for this country
                    Registrations = countryActions.Sum(da => da.Registrations),
                    FTD = countryActions.Sum(da => da.FTD),
                    FTDA = countryActions.Sum(da => da.FTDA),
                    Deposits = countryActions.Sum(da => da.Deposits),
                    DepositsCreditCard = countryActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = countryActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = countryActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = countryActions.Sum(da => da.DepositsOther),
                    CashoutRequests = countryActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = countryActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = countryActions.Sum(da => da.BetsCasino),
                    WinsCasino = countryActions.Sum(da => da.WinsCasino),
                    GGRCasino = countryActions.Sum(da => da.BetsCasino) - countryActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = countryActions.Sum(da => da.BetsSport),
                    WinsSport = countryActions.Sum(da => da.WinsSport),
                    GGRSport = countryActions.Sum(da => da.BetsSport) - countryActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = countryActions.Sum(da => da.BetsLive),
                    WinsLive = countryActions.Sum(da => da.WinsLive),
                    GGRLive = countryActions.Sum(da => da.BetsLive) - countryActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = countryActions.Sum(da => da.BetsBingo),
                    WinsBingo = countryActions.Sum(da => da.WinsBingo),
                    GGRBingo = countryActions.Sum(da => da.BetsBingo) - countryActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = countryActions.Sum(da => da.TotalGGR)
                });
            }

            // If no groups were created, add a default "Unknown" group
            if (result.Count == 0)
            {
                result.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.UtcNow,
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Country",
                    GroupValue = "Unknown",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                });
            }

            _logger.LogInformation("Grouped by country: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by tracker
        /// </summary>
        private List<DailyActionDto> GroupByTracker(List<DailyActionDto> dailyActions)
        {
            // Since we don't have tracker information in the DailyAction model,
            // we'll create a single group for "Unknown" tracker
            _logger.LogInformation("Grouping by tracker with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Tracker",
                    GroupValue = "Unknown",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                }
            };

            _logger.LogInformation("Grouped by tracker: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by currency
        /// </summary>
        private List<DailyActionDto> GroupByCurrency(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by currency with {Count} records", dailyActions.Count);

            // Now we have currency information in the DailyActionDto
            // Group by currency code
            var currencyGroups = dailyActions
                .GroupBy(da => da.CurrencyCode)
                .Where(g => !string.IsNullOrEmpty(g.Key)) // Skip unknown currencies
                .ToList();

            _logger.LogInformation("Creating {Count} currency groups", currencyGroups.Count);

            // Create a group for each currency
            var result = new List<DailyActionDto>();

            // Add a group for each currency
            foreach (var group in currencyGroups)
            {
                var currencyCode = group.Key;
                var currencyActions = group.ToList();

                _logger.LogInformation("Creating currency group for {Currency} with {Count} records",
                    currencyCode, currencyActions.Count);

                result.Add(new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Currency",
                    GroupValue = currencyCode,

                    // Sum all metrics for this currency
                    Registrations = currencyActions.Sum(da => da.Registrations),
                    FTD = currencyActions.Sum(da => da.FTD),
                    FTDA = currencyActions.Sum(da => da.FTDA),
                    Deposits = currencyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = currencyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = currencyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = currencyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = currencyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = currencyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = currencyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = currencyActions.Sum(da => da.BetsCasino),
                    WinsCasino = currencyActions.Sum(da => da.WinsCasino),
                    GGRCasino = currencyActions.Sum(da => da.BetsCasino) - currencyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = currencyActions.Sum(da => da.BetsSport),
                    WinsSport = currencyActions.Sum(da => da.WinsSport),
                    GGRSport = currencyActions.Sum(da => da.BetsSport) - currencyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = currencyActions.Sum(da => da.BetsLive),
                    WinsLive = currencyActions.Sum(da => da.WinsLive),
                    GGRLive = currencyActions.Sum(da => da.BetsLive) - currencyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = currencyActions.Sum(da => da.BetsBingo),
                    WinsBingo = currencyActions.Sum(da => da.WinsBingo),
                    GGRBingo = currencyActions.Sum(da => da.BetsBingo) - currencyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = currencyActions.Sum(da => da.TotalGGR)
                });
            }

            // If no groups were created, add a default "Unknown" group
            if (result.Count == 0)
            {
                result.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.UtcNow,
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Currency",
                    GroupValue = "Unknown",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                });
            }

            _logger.LogInformation("Grouped by currency: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by gender
        /// </summary>
        private List<DailyActionDto> GroupByGender(List<DailyActionDto> dailyActions)
        {
            // Since we don't have gender information in the DailyAction model,
            // we'll create a single group for "Unknown" gender
            _logger.LogInformation("Grouping by gender with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Gender",
                    GroupValue = "Unknown",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                }
            };

            _logger.LogInformation("Grouped by gender: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by platform
        /// </summary>
        private List<DailyActionDto> GroupByPlatform(List<DailyActionDto> dailyActions)
        {
            // Since we don't have platform information in the DailyAction model,
            // we'll create a single group for "Unknown" platform
            _logger.LogInformation("Grouping by platform with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Platform",
                    GroupValue = "Unknown",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                }
            };

            _logger.LogInformation("Grouped by platform: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by ranking
        /// </summary>
        private List<DailyActionDto> GroupByRanking(List<DailyActionDto> dailyActions)
        {
            // For ranking, we'll sort by total GGR and add a rank
            var rankedData = dailyActions
                .OrderByDescending(da => da.TotalGGR)
                .Select((da, index) =>
                {
                    var rankValue = (index + 1).ToString();

                    // Create a copy of the DTO with the rank information
                    var rankedDto = new DailyActionDto
                    {
                        Id = da.Id,
                        Date = da.Date,
                        WhiteLabelId = da.WhiteLabelId,
                        WhiteLabelName = da.WhiteLabelName,
                        GroupKey = "Rank",
                        GroupValue = rankValue,

                        // Copy all other properties
                        Registrations = da.Registrations,
                        FTD = da.FTD,
                        Deposits = da.Deposits,
                        PaidCashouts = da.PaidCashouts,
                        BetsCasino = da.BetsCasino,
                        WinsCasino = da.WinsCasino,
                        BetsSport = da.BetsSport,
                        WinsSport = da.WinsSport,
                        BetsLive = da.BetsLive,
                        WinsLive = da.WinsLive,
                        BetsBingo = da.BetsBingo,
                        WinsBingo = da.WinsBingo,
                        GGRCasino = da.GGRCasino,
                        GGRSport = da.GGRSport,
                        GGRLive = da.GGRLive,
                        GGRBingo = da.GGRBingo,
                        TotalGGR = da.TotalGGR
                    };

                    return rankedDto;
                })
                .ToList();

            return rankedData;
        }

        /// <summary>
        /// Groups daily actions by player
        /// </summary>
        private List<DailyActionDto> GroupByPlayer(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by player with {Count} records", dailyActions.Count);

            // Group by player ID if available
            var playerGroups = new List<DailyActionDto>();

            // Get all daily actions with player IDs
            var actionsWithPlayerIds = dailyActions.Where(da => da.PlayerId.HasValue).ToList();

            if (actionsWithPlayerIds.Any())
            {
                _logger.LogInformation("Found {Count} records with player IDs", actionsWithPlayerIds.Count);

                // Group by player ID
                var playerIdGroups = actionsWithPlayerIds
                    .GroupBy(da => da.PlayerId.Value)
                    .ToList();

                _logger.LogInformation("Created {Count} player groups", playerIdGroups.Count);

                // Create a group for each player
                foreach (var group in playerIdGroups)
                {
                    var playerId = group.Key;
                    var playerName = $"Player {playerId}";

                    // Try to get player name from the first record
                    var firstRecord = group.FirstOrDefault();
                    if (firstRecord != null && !string.IsNullOrEmpty(firstRecord.PlayerName))
                    {
                        playerName = firstRecord.PlayerName;
                    }

                    playerGroups.Add(new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.MinValue, // Set to MinValue to avoid displaying date
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        PlayerId = playerId,
                        PlayerName = playerName,
                        GroupKey = "Player",
                        GroupValue = $"Player {playerId}",

                        // Sum all metrics for this player
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),

                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),

                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),

                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),

                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),

                        // Total GGR
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    });
                }
            }

            // If no player groups were created, create a default "Unknown" group
            if (playerGroups.Count == 0)
            {
                _logger.LogWarning("No player IDs found in the data. Creating a default 'Unknown' player group.");

                playerGroups.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.MinValue, // Set to MinValue to avoid displaying date
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    PlayerId = null,
                    PlayerName = "Unknown",
                    GroupKey = "Player",
                    GroupValue = "Unknown Player",

                    // Sum all metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    DepositsCreditCard = dailyActions.Sum(da => da.DepositsCreditCard),
                    DepositsNeteller = dailyActions.Sum(da => da.DepositsNeteller),
                    DepositsMoneyBookers = dailyActions.Sum(da => da.DepositsMoneyBookers),
                    DepositsOther = dailyActions.Sum(da => da.DepositsOther),
                    CashoutRequests = dailyActions.Sum(da => da.CashoutRequests),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),

                    // Total GGR
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                });
            }

            _logger.LogInformation("Grouped by player: returning {Count} groups", playerGroups.Count);
            return playerGroups;
        }

        /// <summary>
        /// Prewarms the cache with commonly accessed data
        /// </summary>
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

        /// <summary>
        /// Invalidates all caches related to a specific date and white label
        /// </summary>
        private void InvalidateCacheForDate(DateTime date, short? whiteLabelId)
        {
            // We need to invalidate all caches that might contain this date
            // This is a bit aggressive, but ensures consistency

            // Get all cache keys that might be affected
            var keysToRemove = new List<string>();

            // Format date for cache key
            var dateStr = date.ToString("yyyyMMdd");

            // Add specific date cache keys
            keysToRemove.Add(string.Format(DAILY_ACTIONS_CACHE_KEY, dateStr, dateStr, whiteLabelId?.ToString() ?? "all"));
            keysToRemove.Add(string.Format(DAILY_ACTIONS_CACHE_KEY, dateStr, dateStr, "all"));

            // Add summary metrics cache keys
            keysToRemove.Add(string.Format(SUMMARY_METRICS_CACHE_KEY, dateStr, dateStr, whiteLabelId?.ToString() ?? "all"));
            keysToRemove.Add(string.Format(SUMMARY_METRICS_CACHE_KEY, dateStr, dateStr, "all"));

            // For any filtered queries, we can't easily determine which ones to invalidate
            // So we'll just log that filtered caches might be stale
            _logger.LogInformation("Filtered daily actions caches might be stale after update to date {Date} and white label {WhiteLabelId}",
                date, whiteLabelId);

            // Remove all identified cache entries
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _logger.LogInformation("Invalidated cache key: {Key}", key);
            }
        }

        /// <summary>
        /// Clears all caches related to daily actions
        /// </summary>
        public void ClearAllCaches()
        {
            _logger.LogWarning("Clearing all daily actions caches");

            // Since we can't enumerate all keys in IMemoryCache, we'll remove the known ones
            _cache.Remove(METADATA_CACHE_KEY);

            // Log the cache instance hash code for debugging
            _logger.LogInformation("Cache instance hash code: {HashCode}", _cache.GetHashCode());

            _logger.LogWarning("All daily actions caches cleared");
        }

        /// <summary>
        /// Clear the cache for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">Optional white label ID</param>
        /// <returns>True if the cache was cleared, false otherwise</returns>
        public bool ClearCacheForDateRange(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create cache key
                string cacheKey = string.Format(DAILY_ACTIONS_CACHE_KEY,
                    start.ToString("yyyyMMdd"),
                    end.ToString("yyyyMMdd"),
                    whiteLabelId?.ToString() ?? "all");

                // Log the cache key
                _logger.LogInformation("Clearing cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                    startDate, endDate, whiteLabelId, cacheKey);

                // Remove the cache entry
                _cache.Remove(cacheKey);

                // Also clear the summary metrics cache
                string summaryKey = string.Format(SUMMARY_METRICS_CACHE_KEY,
                    start.ToString("yyyyMMdd"),
                    end.ToString("yyyyMMdd"),
                    whiteLabelId?.ToString() ?? "all");

                _cache.Remove(summaryKey);

                // Log the cache instance hash code for debugging
                _logger.LogInformation("Cache instance hash code: {HashCode}", _cache.GetHashCode());

                _logger.LogWarning("Cache cleared for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    startDate, endDate, whiteLabelId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    startDate, endDate, whiteLabelId);
                return false;
            }
        }
    }
}
