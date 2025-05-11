using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for simplified daily actions service
    /// </summary>
    public interface IDailyActionsSimpleService
    {
        /// <summary>
        /// Gets daily actions for a date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        /// <returns>Collection of daily actions</returns>
        Task<IEnumerable<DailyActionSimple>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null);

        /// <summary>
        /// Gets a daily action by ID
        /// </summary>
        /// <param name="id">Daily action ID</param>
        /// <returns>Daily action or null if not found</returns>
        Task<DailyActionSimple?> GetDailyActionByIdAsync(int id);
    }
}
