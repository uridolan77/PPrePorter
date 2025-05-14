using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Models.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the Game service in DailyActionsDB
    /// </summary>
    public interface IGameService
    {
        /// <summary>
        /// Gets games for a specific date range
        /// </summary>
        Task<List<object>> GetGamesByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
