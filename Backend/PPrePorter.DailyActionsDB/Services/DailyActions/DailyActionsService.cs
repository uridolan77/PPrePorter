using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using MemoryCacheItemPriority = Microsoft.Extensions.Caching.Memory.CacheItemPriority;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Extensions;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Models.Players;
using PPrePorter.DailyActionsDB.Repositories.Lookups;
using PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching;
using PPrePorter.DailyActionsDB.Services.DailyActions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for daily actions operations
    /// This class is divided into multiple partial classes for better organization:
    /// - DailyActionsService.cs - Main class definition and core methods
    /// - DailyActionsService.Metadata.cs - Metadata-related methods
    /// - DailyActionsService.Queries.cs - Database query methods
    /// - DailyActionsService.Grouping.cs - Grouping-related methods
    /// - DailyActionsService.Caching.cs - Caching-related methods
    /// - DailyActionsService.Initialization.cs - Initialization methods
    /// </summary>
    public partial class DailyActionsService : IDailyActionsService
    {
        private readonly ILogger<DailyActionsService> _logger;
        private readonly IGlobalCacheService _cache;
        private readonly IDailyActionsSmartCacheService _smartCache;
        private readonly DailyActionsDbContext _dbContext;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly IMetadataService? _metadataService;
        private readonly ILookupRepository _lookupRepository;
        private readonly BackgroundProcessingService _backgroundProcessingService;

        // Cache keys
        private const string CACHE_KEY_PREFIX = "DailyActions_";
        private const string METADATA_CACHE_KEY = "DailyActions_Metadata";
        private const string DAILY_ACTIONS_CACHE_KEY = "DailyActions_Data_{0}_{1}_{2}"; // Format: startDate_endDate_whiteLabelId
        private const string DAILY_ACTION_BY_ID_CACHE_KEY = "DailyAction_ById_{0}"; // Format: id
        private const string SUMMARY_METRICS_CACHE_KEY = "DailyActions_Summary_{0}_{1}_{2}"; // Format: startDate_endDate_whiteLabelId
        private const int CACHE_EXPIRATION_MINUTES = 120; // Increase to 2 hours

        public DailyActionsService(
            ILogger<DailyActionsService> logger,
            IGlobalCacheService cache,
            IDailyActionsSmartCacheService smartCache,
            DailyActionsDbContext dbContext,
            IWhiteLabelService whiteLabelService,
            IMetadataService? metadataService,
            ILookupRepository lookupRepository,
            BackgroundProcessingService backgroundProcessingService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _smartCache = smartCache ?? throw new ArgumentNullException(nameof(smartCache));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _metadataService = metadataService; // Can be null
            _lookupRepository = lookupRepository ?? throw new ArgumentNullException(nameof(lookupRepository));
            _backgroundProcessingService = backgroundProcessingService ?? throw new ArgumentNullException(nameof(backgroundProcessingService));

            _logger.LogInformation("DailyActionsService initialized with global cache service instance: {CacheHashCode}, smart cache instance: {SmartCacheHashCode}, DbContext instance: {DbContextHashCode}, lookup repository instance: {LookupRepositoryHashCode}, background processing service instance: {BackgroundProcessingHashCode}",
                _cache.GetHashCode(), _smartCache.GetHashCode(), _dbContext.GetHashCode(), _lookupRepository.GetHashCode(), _backgroundProcessingService.GetHashCode());
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Start performance timer
                var methodStartTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetDailyActionsAsync with startDate={StartDate}, endDate={EndDate}, whiteLabelId={WhiteLabelId}",
                    methodStartTime.ToString("HH:mm:ss.fff"),
                    startDate.ToString("yyyy-MM-dd"),
                    endDate.ToString("yyyy-MM-dd"),
                    whiteLabelId?.ToString() ?? "null (all white labels)");

                // Define the data loader function that will be used by the smart cache if needed
                async Task<IEnumerable<DailyAction>> DataLoaderFunc(DateTime start, DateTime end, int? wlId)
                {
                    // Normalize dates to start/end of day
                    var normalizedStart = start.Date;
                    var normalizedEnd = end.Date.AddDays(1).AddTicks(-1);

                    _logger.LogInformation("DATA LOADER: Loading data from database for date range {StartDate} to {EndDate}, whiteLabelId={WhiteLabelId}",
                        normalizedStart.ToString("yyyy-MM-dd"), normalizedEnd.ToString("yyyy-MM-dd"), wlId);

                    // Build query with NOLOCK behavior
                    var baseQuery = _dbContext.DailyActions
                        .AsNoTracking();

                    // Apply our new NOLOCK approach
                    var query = QueryNoLockExtensions.WithForceNoLock(baseQuery)
                        .Where(da => da.Date >= normalizedStart && da.Date <= normalizedEnd);

                    // Apply white label filter if specified
                    if (wlId.HasValue)
                    {
                        query = query.Where(da => da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == wlId.Value);
                        _logger.LogInformation("Applied white label filter: WhiteLabelID = {WhiteLabelId}", wlId.Value);
                    }

                    // Add ordering
                    query = query.OrderBy(da => da.Date).ThenBy(da => da.WhiteLabelID);

                    // Execute query with NOLOCK behavior
                    var dbQueryStartTime = DateTime.UtcNow;
                    var result = await QueryNoLockExtensions.ToListWithNoLockAsync(query);
                    var dbQueryEndTime = DateTime.UtcNow;

                    _logger.LogInformation("DATA LOADER: Retrieved {Count} daily actions from database in {ElapsedMs:F2}ms",
                        result.Count, (dbQueryEndTime - dbQueryStartTime).TotalMilliseconds);

                    return result;
                }

                // Use the smart cache service to get the data
                var result = await _smartCache.GetDailyActionsAsync(
                    startDate,
                    endDate,
                    whiteLabelId,
                    DataLoaderFunc);

                // Log total method time
                var methodEndTime = DateTime.UtcNow;
                var methodElapsedMs = (methodEndTime - methodStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: GetDailyActionsAsync completed in {ElapsedMs}ms, returned {Count} records",
                    methodEndTime.ToString("HH:mm:ss.fff"), methodElapsedMs, result.Count());

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

                // Get from database with NOLOCK behavior
                var baseQuery = _dbContext.DailyActions
                    .AsNoTracking()
                    .Where(da => da.Id == id);

                // Apply our new NOLOCK approach and execute
                var result = await QueryNoLockExtensions.FirstOrDefaultWithNoLockAsync(baseQuery);

                // Cache the result if not null
                if (result != null)
                {
                    // Estimate the size of the DailyAction object for cache entry
                    long estimatedSize = 1000; // More accurate estimate for a single DailyAction object

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetPriority(MemoryCacheItemPriority.High)
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
                var baseQuery = _dbContext.DailyActions
                    .AsNoTracking()
                    .Where(da => da.Id == id);

                // Apply our new NOLOCK approach and execute
                var dailyAction = await QueryNoLockExtensions.FirstOrDefaultWithNoLockAsync(baseQuery);
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

            // Execute the query with NOLOCK behavior
            var baseQuery = _dbContext.DailyActions
                .FromSqlRaw(sql, parameters.ToArray())
                .AsNoTracking();

            // Apply our new NOLOCK approach and execute
            var result = await QueryNoLockExtensions.ToListWithNoLockAsync(
                QueryNoLockExtensions.WithForceNoLock(baseQuery));

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

            var countResult = await countCmd.ExecuteScalarAsync();
            var totalCount = countResult != null ? Convert.ToInt32(countResult) : 0;

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
                .SetPriority(MemoryCacheItemPriority.High)
                .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                .SetSize(mappedDailyActions.Count * 1000 + 2000); // Estimate size

            _cache.Set(cacheKey, response, cacheOptions);
            _logger.LogInformation("Cached filtered daily actions with hash {FilterHash}, cache key: {CacheKey}",
                cacheKey, cacheKey);

            return response;
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
