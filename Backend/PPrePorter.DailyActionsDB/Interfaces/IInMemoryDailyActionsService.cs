using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the in-memory daily actions service
    /// </summary>
    public interface IInMemoryDailyActionsService
    {
        /// <summary>
        /// Initializes the in-memory cache with daily actions data from the last 3 months
        /// </summary>
        Task InitializeAsync();

        /// <summary>
        /// Refreshes the in-memory cache with the latest data (both historical and today's data)
        /// </summary>
        Task RefreshAsync();

        /// <summary>
        /// Refreshes only today's data in the in-memory cache
        /// </summary>
        Task RefreshTodayDataAsync();

        /// <summary>
        /// Gets filtered daily actions from the in-memory cache
        /// </summary>
        Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(
            DailyActionFilterDto filter, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets the status of the in-memory cache
        /// </summary>
        CacheStatusDto GetCacheStatus();

        /// <summary>
        /// Gets the raw daily action data from the in-memory cache
        /// </summary>
        /// <param name="startDate">Start date for filtering</param>
        /// <param name="endDate">End date for filtering</param>
        /// <param name="includeHistorical">Whether to include historical data</param>
        /// <param name="includeToday">Whether to include today's data</param>
        /// <param name="pageNumber">Page number for pagination</param>
        /// <param name="pageSize">Page size for pagination</param>
        /// <returns>A list of daily action DTOs</returns>
        Task<RawDailyActionResponseDto> GetRawDailyActionsAsync(
            DateTime startDate,
            DateTime endDate,
            bool includeHistorical = true,
            bool includeToday = true,
            int pageNumber = 1,
            int pageSize = 100);

        /// <summary>
        /// Gets the raw daily action data directly from the in-memory cache without any database calls or initialization
        /// </summary>
        /// <param name="startDate">Start date for filtering</param>
        /// <param name="endDate">End date for filtering</param>
        /// <param name="includeHistorical">Whether to include historical data</param>
        /// <param name="includeToday">Whether to include today's data</param>
        /// <param name="pageNumber">Page number for pagination</param>
        /// <param name="pageSize">Page size for pagination</param>
        /// <returns>A list of daily action DTOs</returns>
        RawDailyActionResponseDto GetRawDailyActionsDirectFromMemory(
            DateTime startDate,
            DateTime endDate,
            bool includeHistorical = true,
            bool includeToday = true,
            int pageNumber = 1,
            int pageSize = 100);

        /// <summary>
        /// Gets statistics about the daily action data in memory, including min/max dates and counts per day
        /// </summary>
        /// <returns>Statistics about the daily action data in memory</returns>
        DailyDataStatisticsDto GetDailyDataStatistics();
    }

    /// <summary>
    /// DTO for cache status information
    /// </summary>
    public class CacheStatusDto
    {
        public bool IsInitialized { get; set; }
        public bool IsInitializing { get; set; }
        public DateTime LastHistoricalRefreshTime { get; set; }
        public DateTime LastTodayRefreshTime { get; set; }
        public int HistoricalRecordCount { get; set; }
        public int TodayRecordCount { get; set; }
        public int TotalRecordCount { get; set; }
        public int WhiteLabelCount { get; set; }
        public int CountryCount { get; set; }
        public int CurrencyCount { get; set; }
        public string TodayDate { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for raw daily action response
    /// </summary>
    public class RawDailyActionResponseDto
    {
        /// <summary>
        /// The raw daily action data
        /// </summary>
        public List<DailyActionDto> Data { get; set; } = new List<DailyActionDto>();

        /// <summary>
        /// Total count of records (before pagination)
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Total number of pages
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// Current page number
        /// </summary>
        public int CurrentPage { get; set; }

        /// <summary>
        /// Page size
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Start date of the data
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the data
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Whether historical data is included
        /// </summary>
        public bool IncludesHistorical { get; set; }

        /// <summary>
        /// Whether today's data is included
        /// </summary>
        public bool IncludesToday { get; set; }

        /// <summary>
        /// Last time historical data was refreshed
        /// </summary>
        public DateTime LastHistoricalRefreshTime { get; set; }

        /// <summary>
        /// Last time today's data was refreshed
        /// </summary>
        public DateTime LastTodayRefreshTime { get; set; }
    }

    /// <summary>
    /// DTO for daily data statistics
    /// </summary>
    public class DailyDataStatisticsDto
    {
        /// <summary>
        /// Minimum date in the data
        /// </summary>
        public DateTime MinDate { get; set; }

        /// <summary>
        /// Maximum date in the data
        /// </summary>
        public DateTime MaxDate { get; set; }

        /// <summary>
        /// Total count of records
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Count of records in historical cache
        /// </summary>
        public int HistoricalCount { get; set; }

        /// <summary>
        /// Count of records in today's cache
        /// </summary>
        public int TodayCount { get; set; }

        /// <summary>
        /// Last time historical data was refreshed
        /// </summary>
        public DateTime LastHistoricalRefreshTime { get; set; }

        /// <summary>
        /// Last time today's data was refreshed
        /// </summary>
        public DateTime LastTodayRefreshTime { get; set; }

        /// <summary>
        /// Count of records for each day
        /// </summary>
        public Dictionary<string, int> DailyCounts { get; set; } = new Dictionary<string, int>();
    }
}
