using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
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
}
