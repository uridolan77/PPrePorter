using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for CurrencyHistory entities
    /// </summary>
    public interface ICurrencyHistoryRepository : IBaseRepository<CurrencyHistory>
    {
        /// <summary>
        /// Get currency history by currency ID
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetByCurrencyIdAsync(byte currencyId);
        
        /// <summary>
        /// Get currency history by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get currency history by currency ID and date range
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetByCurrencyIdAndDateRangeAsync(byte currencyId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get latest currency history by currency ID
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <returns>Latest currency history record or null if not found</returns>
        Task<CurrencyHistory?> GetLatestByCurrencyIdAsync(byte currencyId);
    }
}
