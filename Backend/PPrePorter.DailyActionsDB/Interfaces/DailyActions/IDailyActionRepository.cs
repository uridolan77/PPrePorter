using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for DailyAction entities
    /// </summary>
    public interface IDailyActionRepository : IBaseRepository<DailyAction>
    {
        /// <summary>
        /// Get daily actions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get daily actions by white label ID
        /// </summary>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByWhiteLabelIdAsync(short whiteLabelId);

        /// <summary>
        /// Get daily actions by date range and white label ID
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, short whiteLabelId);

        /// <summary>
        /// Get daily actions by date range and white label IDs
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelIds">White label IDs</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<short> whiteLabelIds);

        /// <summary>
        /// Get daily actions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByPlayerIdAsync(long playerId);

        /// <summary>
        /// Get daily actions by date range and player ID
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily actions</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAndPlayerIdAsync(DateTime startDate, DateTime endDate, long playerId);
    }
}
