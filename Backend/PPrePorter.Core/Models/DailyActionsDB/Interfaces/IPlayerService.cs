using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Models.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the Player service in DailyActionsDB
    /// </summary>
    public interface IPlayerService
    {
        /// <summary>
        /// Gets players for a specific date range
        /// </summary>
        Task<List<object>> GetPlayersByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
