using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Models.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the DailyActionGame service in DailyActionsDB
    /// </summary>
    public interface IDailyActionGameService
    {
        /// <summary>
        /// Gets daily action games for a specific date range
        /// </summary>
        Task<List<object>> GetDailyActionGamesByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
