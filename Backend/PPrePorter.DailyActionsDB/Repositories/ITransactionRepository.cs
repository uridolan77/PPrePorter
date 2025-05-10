using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Transaction entities
    /// </summary>
    public interface ITransactionRepository : IBaseRepository<Transaction>
    {
        /// <summary>
        /// Get transaction by transaction ID
        /// </summary>
        /// <param name="transactionId">Transaction ID</param>
        /// <returns>Transaction or null if not found</returns>
        Task<Transaction?> GetByTransactionIdAsync(string transactionId);
        
        /// <summary>
        /// Get transactions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByPlayerIdAsync(string playerId);
        
        /// <summary>
        /// Get transactions by white label ID
        /// </summary>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByWhiteLabelIdAsync(string whiteLabelId);
        
        /// <summary>
        /// Get transactions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByGameIdAsync(string gameId);
        
        /// <summary>
        /// Get transactions by transaction type
        /// </summary>
        /// <param name="transactionType">Transaction type</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByTransactionTypeAsync(string transactionType);
        
        /// <summary>
        /// Get transactions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get transactions by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get transactions by currency
        /// </summary>
        /// <param name="currency">Currency</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetByCurrencyAsync(string currency);
    }
}
