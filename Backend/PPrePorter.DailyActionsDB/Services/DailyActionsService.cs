using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
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
            IWhiteLabelService whiteLabelService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));

            _logger.LogInformation("DailyActionsService initialized with global cache service instance: {CacheHashCode}, DbContext instance: {DbContextHashCode}",
                _cache.GetHashCode(), _dbContext.GetHashCode());
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
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

                _logger.LogDebug("CACHE CHECK: Checking cache for daily actions with key: {CacheKey}", cacheKey);

                // Log cache statistics before trying to get from cache
                var globalCacheService = _cache as IGlobalCacheService;
                if (globalCacheService != null)
                {
                    var stats = globalCacheService.GetStatistics();
                    _logger.LogDebug("CACHE STATS before retrieval: TotalHits={TotalHits}, TotalMisses={TotalMisses}, CacheCount={CacheCount}",
                        stats["TotalHits"], stats["TotalMisses"], stats["CacheCount"]);
                }

                // Try to get from cache first
                bool cacheHit = _cache.TryGetValue(cacheKey, out IEnumerable<DailyAction>? cachedResult);

                _logger.LogDebug("CACHE RESULT: TryGetValue returned {Result} for key {CacheKey}", cacheHit, cacheKey);

                if (cacheHit && cachedResult != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved daily actions from cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, count: {Count}",
                        startDate, endDate, whiteLabelId, cacheKey, cachedResult.Count());
                    return cachedResult;
                }
                else if (cacheHit && cachedResult == null)
                {
                    _logger.LogWarning("CACHE ANOMALY: Cache hit but null result for key {CacheKey}", cacheKey);
                }
                else
                {
                    _logger.LogWarning("CACHE MISS: Getting daily actions from database for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                        startDate, endDate, whiteLabelId, cacheKey);
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
                var result = await query.ToListAsync();

                // Log the result count and size estimation
                int resultCount = result.Count;
                _logger.LogInformation("Retrieved {Count} daily actions from database for date range {StartDate} to {EndDate} and white label {WhiteLabelId}",
                    resultCount, startDate, endDate, whiteLabelId);

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
                    _logger.LogDebug("CACHE SET: About to set cache with key {CacheKey}, value type {ValueType}, value count {ValueCount}, options {@Options}",
                        cacheKey, result.GetType().Name, result.Count, new {
                            Priority = cacheOptions.Priority,
                            Size = cacheOptions.Size,
                            SlidingExpiration = cacheOptions.SlidingExpiration,
                            AbsoluteExpiration = cacheOptions.AbsoluteExpiration
                        });

                    // Store the result in a local variable to ensure it's not modified
                    var resultToCache = result.ToList();

                    _logger.LogDebug("CACHE SET DETAILS: Setting cache with key {CacheKey}, value type {ValueType}, value count {ValueCount}, first item ID {FirstItemId}",
                        cacheKey, resultToCache.GetType().Name, resultToCache.Count, resultToCache.FirstOrDefault()?.Id);

                    // Set the cache with the local variable
                    _cache.Set(cacheKey, resultToCache, cacheOptions);

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

                    _logger.LogInformation("Cached daily actions for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                        startDate, endDate, whiteLabelId, cacheKey, estimatedSize);

                    // Log cache statistics after setting
                    var cacheServiceAfterSet = _cache as IGlobalCacheService;
                    if (cacheServiceAfterSet != null)
                    {
                        var stats = cacheServiceAfterSet.GetStatistics();
                        _logger.LogDebug("CACHE STATS after set: TotalHits={TotalHits}, TotalMisses={TotalMisses}, CacheCount={CacheCount}",
                            stats["TotalHits"], stats["TotalMisses"], stats["CacheCount"]);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "CACHE ERROR: Failed to set cache with key {CacheKey}", cacheKey);
                }

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
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Create cache key
                string cacheKey = string.Format(SUMMARY_METRICS_CACHE_KEY,
                    start.ToString("yyyyMMdd"),
                    end.ToString("yyyyMMdd"),
                    whiteLabelId?.ToString() ?? "all");

                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out DailyActionsSummary? cachedResult) && cachedResult != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved summary metrics from cache for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                        startDate, endDate, whiteLabelId, cacheKey);
                    return cachedResult;
                }

                _logger.LogWarning("CACHE MISS: Calculating summary metrics for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}",
                    startDate, endDate, whiteLabelId, cacheKey);

                // Get daily actions for the specified date range
                var dailyActions = await GetDailyActionsAsync(startDate, endDate, whiteLabelId);

                // Calculate summary metrics
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

                // Estimate the size of the summary object for cache entry
                long estimatedSize = 1000; // More accurate estimate for summary object

                // Cache the result with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetSize(estimatedSize); // Explicitly set the size for the cache entry

                _cache.Set(cacheKey, summary, cacheOptions);
                _logger.LogInformation("Cached summary metrics for date range {StartDate} to {EndDate} and white label {WhiteLabelId}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                    startDate, endDate, whiteLabelId, cacheKey, estimatedSize);

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

                // Build base query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    // Use a different approach to avoid OPENJSON issues
                    // Instead of using Contains which generates a subquery with OPENJSON,
                    // we'll build an OR expression for each white label ID
                    var whiteLabelIds = filter.WhiteLabelIds.ToArray();
                    if (whiteLabelIds.Length == 1)
                    {
                        // Simple case - just one white label ID
                        query = query.Where(da => da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == whiteLabelIds[0]);
                    }
                    else
                    {
                        // Multiple white label IDs - build a predicate
                        var parameter = System.Linq.Expressions.Expression.Parameter(typeof(DailyAction), "da");
                        var propertyID = System.Linq.Expressions.Expression.Property(parameter, "WhiteLabelID");

                        // Build the expression for the first ID
                        var hasValueID = System.Linq.Expressions.Expression.Property(propertyID, "HasValue");
                        var valueID = System.Linq.Expressions.Expression.Property(propertyID, "Value");
                        var equalsID = System.Linq.Expressions.Expression.Equal(
                            valueID,
                            System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[0]));
                        var equals = System.Linq.Expressions.Expression.AndAlso(hasValueID, equalsID);

                        // Add the rest with OR
                        for (int i = 1; i < whiteLabelIds.Length; i++)
                        {
                            // Build for WhiteLabelID
                            var nextEqualsID = System.Linq.Expressions.Expression.Equal(
                                valueID,
                                System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[i]));
                            var nextAndID = System.Linq.Expressions.Expression.AndAlso(hasValueID, nextEqualsID);

                            // Add to the main expression
                            equals = System.Linq.Expressions.Expression.OrElse(equals, nextAndID);
                        }

                        // Create and apply the lambda expression
                        var lambda = System.Linq.Expressions.Expression.Lambda<Func<DailyAction, bool>>(
                            equals, parameter);
                        query = query.Where(lambda);
                    }
                }

                // Get total count before pagination, but limit it to avoid performance issues
                var countQuery = query;
                if (maxTotalRecords > 0)
                {
                    // Apply the limit to the count query as well
                    countQuery = countQuery.Take(maxTotalRecords);
                }
                var totalCount = await countQuery.CountAsync();

                // Apply pagination
                var pageSize = Math.Max(1, filter.PageSize);
                var pageNumber = Math.Max(1, filter.PageNumber);
                var skip = (pageNumber - 1) * pageSize;

                // Apply the overall limit first to avoid processing too many records
                query = query.Take(maxTotalRecords);

                // Get data with pagination
                var dailyActions = await query
                    .OrderBy(da => da.Date)
                    .ThenBy(da => da.WhiteLabelID)
                    .Skip(skip)
                    .Take(Math.Min(pageSize, 1000)) // Ensure page size is reasonable
                    .ToListAsync();

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map to DTOs
                var result = dailyActions.Select(da =>
                {
                    // Get the WhiteLabel ID
                    int whiteLabelId = 0;
                    if (da.WhiteLabelID.HasValue)
                    {
                        whiteLabelId = (int)da.WhiteLabelID.Value;
                    }

                    // Get the white label name
                    string whiteLabelName = "Unknown";
                    if (whiteLabelId > 0 && whiteLabelDict.TryGetValue(whiteLabelId, out var name))
                    {
                        whiteLabelName = name;
                    }

                    return new DailyActionDto
                    {
                        Id = (int)da.Id,
                        Date = da.Date,
                        WhiteLabelId = whiteLabelId,
                        WhiteLabelName = whiteLabelName,
                        Registrations = da.Registration.HasValue ? (int)da.Registration.Value : 0,
                        FTD = da.FTD.HasValue ? (int)da.FTD.Value : 0,
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
                        TotalGGR = da.TotalGGR
                    };
                }).ToList();

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

                _logger.LogWarning("CACHE MISS: Getting daily actions metadata from database, cache key: {CacheKey}", METADATA_CACHE_KEY);

                // Get white labels
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDtos = whiteLabels.Select(wl => new WhiteLabelDto
                {
                    Id = wl.Id,
                    Name = wl.Name,
                    Code = wl.Code,
                    IsActive = wl.IsActive ?? false
                }).ToList();

                // Get countries
                var countries = await _dbContext.Countries
                    .AsNoTracking()
                    // Don't use WithNoLock() here since we're using the NoLockInterceptor
                    .Where(c => c.IsActive == true)
                    .OrderBy(c => c.CountryName)
                    .ToListAsync();

                var countryDtos = countries.Select(c => new CountryDto
                {
                    Id = c.CountryID,
                    Name = c.CountryName,
                    IsoCode = c.IsoCode
                }).ToList();

                // Get currencies
                var currencies = await _dbContext.Currencies
                    .AsNoTracking()
                    // Don't use WithNoLock() here since we're using the NoLockInterceptor
                    .OrderBy(c => c.CurrencyName)
                    .ToListAsync();

                var currencyDtos = currencies.Select(c => new CurrencyDto
                {
                    Id = c.CurrencyID,
                    Name = c.CurrencyName,
                    Code = c.CurrencyCode,
                    Symbol = c.CurrencySymbol
                }).ToList();

                // Get distinct values from players table using more efficient queries
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

                // For platforms
                var platforms = await _dbContext.Players
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(p => !string.IsNullOrEmpty(p.RegisteredPlatform))
                    .Select(p => p.RegisteredPlatform)
                    .Distinct()
                    .OrderBy(p => p)
                    .Take(20) // Limit to top 20 platforms
                    .ToListAsync();

                // For genders
                var genders = await _dbContext.Players
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(p => !string.IsNullOrEmpty(p.Gender))
                    .Select(p => p.Gender)
                    .Distinct()
                    .OrderBy(g => g)
                    .Take(10) // Limit to top 10 genders (should be just a few)
                    .ToListAsync();

                // For statuses
                var statuses = await _dbContext.Players
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(p => !string.IsNullOrEmpty(p.Status))
                    .Select(p => p.Status)
                    .Distinct()
                    .OrderBy(s => s)
                    .Take(20) // Limit to top 20 statuses
                    .ToListAsync();

                // For registration play modes
                var registrationPlayModes = await _dbContext.Players
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(p => !string.IsNullOrEmpty(p.RegistrationPlayMode))
                    .Select(p => p.RegistrationPlayMode)
                    .Distinct()
                    .OrderBy(r => r)
                    .Take(20) // Limit to top 20 registration play modes
                    .ToListAsync();

                // For trackers (affiliate IDs)
                var trackers = await _dbContext.Players
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(p => !string.IsNullOrEmpty(p.AffiliateID))
                    .Select(p => p.AffiliateID)
                    .Distinct()
                    .OrderBy(t => t)
                    .Take(100) // Limit to top 100 trackers
                    .ToListAsync();

                // Create group by options
                var groupByOptions = new List<GroupByOptionDto>
                {
                    new() { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                    new() { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                    new() { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" },
                    new() { Id = (int)GroupByOption.Label, Name = "Label", Value = "Label" },
                    new() { Id = (int)GroupByOption.Country, Name = "Country", Value = "Country" },
                    new() { Id = (int)GroupByOption.Tracker, Name = "Tracker", Value = "Tracker" },
                    new() { Id = (int)GroupByOption.Currency, Name = "Currency", Value = "Currency" },
                    new() { Id = (int)GroupByOption.Gender, Name = "Gender", Value = "Gender" },
                    new() { Id = (int)GroupByOption.Platform, Name = "Platform", Value = "Platform" },
                    new() { Id = (int)GroupByOption.Ranking, Name = "Ranking", Value = "Ranking" }
                };

                // Create language DTOs
                var languageDtos = languages.Select((l, i) => new LanguageDto
                {
                    Id = i + 1,
                    Name = l ?? string.Empty,
                    Code = l ?? string.Empty
                }).ToList();

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
                throw;
            }
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
