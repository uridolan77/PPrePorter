using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Service interface for DailyAction operations
    /// </summary>
    public interface IDailyActionService
    {
        /// <summary>
        /// Get all daily actions
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive daily actions</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetAllDailyActionsAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get daily action by ID
        /// </summary>
        /// <param name="id">Daily action ID</param>
        /// <returns>Daily action or null if not found</returns>
        Task<DailyAction?> GetDailyActionByIdAsync(long id);
        
        /// <summary>
        /// Get daily actions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get daily actions by white label ID
        /// </summary>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByWhiteLabelIdAsync(short whiteLabelId);
        
        /// <summary>
        /// Get daily actions by date range and white label ID
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, short whiteLabelId);
        
        /// <summary>
        /// Get daily actions by date range and white label IDs
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelIds">White label IDs</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<short> whiteLabelIds);
        
        /// <summary>
        /// Get daily actions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get daily actions by date range and player ID
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndPlayerIdAsync(DateTime startDate, DateTime endDate, long playerId);
        
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
        Task<bool> DeleteDailyActionAsync(long id);
    }
}
