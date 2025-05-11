using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for currency service
    /// </summary>
    public interface ICurrencyService
    {
        /// <summary>
        /// Get all currencies
        /// </summary>
        /// <returns>List of currencies</returns>
        Task<IEnumerable<Currency>> GetAllCurrenciesAsync();
        
        /// <summary>
        /// Get a specific currency by ID
        /// </summary>
        /// <param name="id">Currency ID</param>
        /// <returns>Currency or null if not found</returns>
        Task<Currency?> GetCurrencyByIdAsync(byte id);
        
        /// <summary>
        /// Get a specific currency by code
        /// </summary>
        /// <param name="code">Currency code</param>
        /// <returns>Currency or null if not found</returns>
        Task<Currency?> GetCurrencyByCodeAsync(string code);
        
        /// <summary>
        /// Add a new currency
        /// </summary>
        /// <param name="currency">Currency to add</param>
        /// <returns>Added currency</returns>
        Task<Currency> AddCurrencyAsync(Currency currency);
        
        /// <summary>
        /// Update an existing currency
        /// </summary>
        /// <param name="currency">Currency to update</param>
        /// <returns>Updated currency</returns>
        Task<Currency> UpdateCurrencyAsync(Currency currency);
        
        /// <summary>
        /// Delete a currency
        /// </summary>
        /// <param name="id">Currency ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteCurrencyAsync(byte id);
    }
}
