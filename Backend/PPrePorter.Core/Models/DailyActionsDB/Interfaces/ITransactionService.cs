using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Models.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the Transaction service in DailyActionsDB
    /// </summary>
    public interface ITransactionService
    {
        /// <summary>
        /// Gets transactions for a specific date range
        /// </summary>
        Task<List<object>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
