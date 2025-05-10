using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for daily actions service
    /// </summary>
    public interface IDailyActionsService
    {
        /// <summary>
        /// Get daily actions for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null);

        /// <summary>
        /// Get daily actions with comprehensive filtering
        /// </summary>
        /// <param name="filter">Filter parameters</param>
        /// <returns>Filtered daily actions response</returns>
        Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(DailyActionFilterDto filter);

        /// <summary>
        /// Get metadata for daily actions report
        /// </summary>
        /// <returns>Metadata for filters and options</returns>
        Task<DailyActionMetadataDto> GetDailyActionsMetadataAsync();

        /// <summary>
        /// Get a specific daily action by ID
        /// </summary>
        /// <param name="id">Daily action ID</param>
        /// <returns>Daily action or null if not found</returns>
        Task<DailyAction?> GetDailyActionByIdAsync(int id);

        /// <summary>
        /// Add a new daily action
        /// </summary>
        /// <param name="dailyAction">Daily action to add</param>
        /// <returns>Added daily action</returns>
        Task<DailyAction> AddDailyActionAsync(DailyAction dailyAction);

        /// <summary>
        /// Update an existing daily action
        /// </summary>
        /// <param name="dailyAction">Daily action to update</param>
        /// <returns>Updated daily action</returns>
        Task<DailyAction> UpdateDailyActionAsync(DailyAction dailyAction);

        /// <summary>
        /// Delete a daily action
        /// </summary>
        /// <param name="id">Daily action ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteDailyActionAsync(int id);

        /// <summary>
        /// Get summary metrics for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        /// <returns>Summary metrics</returns>
        Task<DailyActionsSummary> GetSummaryMetricsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null);

        /// <summary>
        /// Prewarms the cache with commonly accessed data
        /// </summary>
        Task PrewarmCacheAsync();

        /// <summary>
        /// Clears all caches related to daily actions
        /// </summary>
        void ClearAllCaches();

        /// <summary>
        /// Clear the cache for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">Optional white label ID</param>
        /// <returns>True if the cache was cleared, false otherwise</returns>
        bool ClearCacheForDateRange(DateTime startDate, DateTime endDate, int? whiteLabelId = null);
    }

    /// <summary>
    /// Summary metrics for daily actions
    /// </summary>
    public class DailyActionsSummary
    {
        public int TotalRegistrations { get; set; }
        public int TotalFTD { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalCashouts { get; set; }
        public decimal TotalBetsCasino { get; set; }
        public decimal TotalWinsCasino { get; set; }
        public decimal TotalBetsSport { get; set; }
        public decimal TotalWinsSport { get; set; }
        public decimal TotalBetsLive { get; set; }
        public decimal TotalWinsLive { get; set; }
        public decimal TotalBetsBingo { get; set; }
        public decimal TotalWinsBingo { get; set; }
        public decimal TotalGGR { get; set; }
    }
}
