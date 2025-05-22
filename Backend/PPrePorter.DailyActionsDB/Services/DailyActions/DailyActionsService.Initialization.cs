using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Extensions;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Services.DailyActions.SmartCaching;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Initialization-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Initializes the service by loading essential data
        /// </summary>
        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing DailyActionsService...");

                // Load metadata first (this is essential and relatively small)
                var startTime = DateTime.UtcNow;
                var metadata = await GetDailyActionsMetadataAsync();
                var metadataTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("Loaded metadata with {WhiteLabelCount} white labels, {CountryCount} countries, {CurrencyCount} currencies in {ElapsedMs}ms",
                    metadata.WhiteLabels.Count,
                    metadata.Countries.Count,
                    metadata.Currencies.Count,
                    metadataTime.TotalMilliseconds);

                // Define the data loader function for the smart cache
                async Task<IEnumerable<DailyAction>> DataLoaderFunc(DateTime start, DateTime end, int? wlId)
                {
                    // Normalize dates to start/end of day
                    var normalizedStart = start.Date;
                    var normalizedEnd = end.Date.AddDays(1).AddTicks(-1);

                    _logger.LogInformation("INIT DATA LOADER: Loading data from database for date range {StartDate} to {EndDate}, whiteLabelId={WhiteLabelId}",
                        normalizedStart.ToString("yyyy-MM-dd"), normalizedEnd.ToString("yyyy-MM-dd"), wlId);

                    // Build query with NOLOCK hint
                    var query = _dbContext.DailyActions
                        .AsNoTracking()
                        .WithSqlNoLock()
                        .Where(da => da.Date >= normalizedStart && da.Date <= normalizedEnd);

                    // Apply white label filter if specified
                    if (wlId.HasValue)
                    {
                        query = query.Where(da => da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == wlId.Value);
                    }

                    // Add ordering
                    query = query.OrderBy(da => da.Date).ThenBy(da => da.WhiteLabelID);

                    // Execute query with NOLOCK hint
                    var dbQueryStartTime = DateTime.UtcNow;
                    var result = await query.ToListWithSqlNoLock();
                    var dbQueryEndTime = DateTime.UtcNow;

                    _logger.LogInformation("INIT DATA LOADER: Retrieved {Count} daily actions from database in {ElapsedMs}ms",
                        result.Count, (dbQueryEndTime - dbQueryStartTime).TotalMilliseconds);

                    return result;
                }

                // Use the smart cache service to prewarm the cache
                _logger.LogInformation("Starting smart cache prewarming...");
                startTime = DateTime.UtcNow;

                await _smartCache.PrewarmCacheAsync(DataLoaderFunc);

                var prewarmTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("Smart cache prewarming completed in {ElapsedMs}ms", prewarmTime.TotalMilliseconds);

                // Get cache statistics
                var cacheStats = _smartCache.GetCacheStatistics();
                _logger.LogInformation("Cache statistics after prewarming: {TotalItems} items, {TotalSizeBytes} bytes, {HitRate:P2} hit rate",
                    cacheStats.TotalItems, cacheStats.TotalSizeBytes, cacheStats.HitRate);

                _logger.LogInformation("DailyActionsService initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing DailyActionsService");
                throw;
            }
        }

        /// <summary>
        /// Gets the status of the service
        /// </summary>
        public ServiceStatusDto GetServiceStatus()
        {
            try
            {
                // Get global cache statistics
                var cacheService = _cache as IGlobalCacheService;
                int cacheCount = cacheService?.GetCount() ?? -1;
                long cacheSize = -1; // GetSize is not available in the interface

                // Get smart cache statistics
                var smartCacheStats = _smartCache.GetCacheStatistics();

                // Get database connection status
                bool dbConnected = false;
                try
                {
                    dbConnected = _dbContext.Database.CanConnect();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error checking database connection");
                }

                // Create status response
                var status = new ServiceStatusDto
                {
                    ServiceName = "DailyActionsService",
                    IsHealthy = dbConnected,
                    CacheItemCount = cacheCount,
                    CacheSizeBytes = cacheSize,
                    SmartCacheItemCount = smartCacheStats.TotalItems,
                    SmartCacheSizeBytes = smartCacheStats.TotalSizeBytes,
                    SmartCacheHitRate = smartCacheStats.HitRate,
                    SmartCacheHitCount = smartCacheStats.HitCount,
                    SmartCacheMissCount = smartCacheStats.MissCount,
                    DatabaseConnected = dbConnected,
                    LastCheckedTime = DateTime.UtcNow
                };

                return status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service status");
                return new ServiceStatusDto
                {
                    ServiceName = "DailyActionsService",
                    IsHealthy = false,
                    ErrorMessage = ex.Message,
                    LastCheckedTime = DateTime.UtcNow
                };
            }
        }
    }

    /// <summary>
    /// DTO for service status
    /// </summary>
    public class ServiceStatusDto
    {
        /// <summary>
        /// Name of the service
        /// </summary>
        public string ServiceName { get; set; } = string.Empty;

        /// <summary>
        /// Whether the service is healthy
        /// </summary>
        public bool IsHealthy { get; set; }

        /// <summary>
        /// Number of items in the global cache
        /// </summary>
        public int CacheItemCount { get; set; }

        /// <summary>
        /// Size of the global cache in bytes
        /// </summary>
        public long CacheSizeBytes { get; set; }

        /// <summary>
        /// Number of items in the smart cache
        /// </summary>
        public int SmartCacheItemCount { get; set; }

        /// <summary>
        /// Size of the smart cache in bytes
        /// </summary>
        public long SmartCacheSizeBytes { get; set; }

        /// <summary>
        /// Hit rate of the smart cache (0-1)
        /// </summary>
        public double SmartCacheHitRate { get; set; }

        /// <summary>
        /// Number of cache hits in the smart cache
        /// </summary>
        public int SmartCacheHitCount { get; set; }

        /// <summary>
        /// Number of cache misses in the smart cache
        /// </summary>
        public int SmartCacheMissCount { get; set; }

        /// <summary>
        /// Whether the database is connected
        /// </summary>
        public bool DatabaseConnected { get; set; }

        /// <summary>
        /// Error message if any
        /// </summary>
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// Time when the status was last checked
        /// </summary>
        public DateTime LastCheckedTime { get; set; }
    }
}
