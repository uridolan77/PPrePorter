using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for currency history service
    /// </summary>
    public interface ICurrencyHistoryService
    {
        /// <summary>
        /// Get all currency history records
        /// </summary>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetAllCurrencyHistoryAsync();
        
        /// <summary>
        /// Get currency history by currency ID
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByCurrencyIdAsync(byte currencyId);
        
        /// <summary>
        /// Get currency history by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get currency history by currency ID and date range
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of currency history records</returns>
        Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByCurrencyIdAndDateRangeAsync(byte currencyId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get latest currency history by currency ID
        /// </summary>
        /// <param name="currencyId">Currency ID</param>
        /// <returns>Latest currency history record or null if not found</returns>
        Task<CurrencyHistory?> GetLatestCurrencyHistoryByCurrencyIdAsync(byte currencyId);
        
        /// <summary>
        /// Add a new currency history record
        /// </summary>
        /// <param name="currencyHistory">Currency history record to add</param>
        /// <returns>Added currency history record</returns>
        Task<CurrencyHistory> AddCurrencyHistoryAsync(CurrencyHistory currencyHistory);
        
        /// <summary>
        /// Update an existing currency history record
        /// </summary>
        /// <param name="currencyHistory">Currency history record to update</param>
        /// <returns>Updated currency history record</returns>
        Task<CurrencyHistory> UpdateCurrencyHistoryAsync(CurrencyHistory currencyHistory);
    }
}
