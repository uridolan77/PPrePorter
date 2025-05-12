using PPrePorter.DailyActionsDB.Models.Transactions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for transaction service
    /// </summary>
    public interface ITransactionService
    {
        /// <summary>
        /// Get all transactions
        /// </summary>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetAllTransactionsAsync();

        /// <summary>
        /// Get a specific transaction by ID
        /// </summary>
        /// <param name="id">Transaction ID</param>
        /// <returns>Transaction or null if not found</returns>
        Task<Transaction?> GetTransactionByIdAsync(int id);

        /// <summary>
        /// Get a specific transaction by transaction ID
        /// </summary>
        /// <param name="transactionId">Transaction ID</param>
        /// <returns>Transaction or null if not found</returns>
        Task<Transaction?> GetTransactionByTransactionIdAsync(string transactionId);

        /// <summary>
        /// Get transactions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByPlayerIdAsync(string playerId);

        /// <summary>
        /// Get transactions by white label ID
        /// </summary>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByWhiteLabelIdAsync(string whiteLabelId);

        /// <summary>
        /// Get transactions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByGameIdAsync(string gameId);

        /// <summary>
        /// Get transactions by transaction type
        /// </summary>
        /// <param name="transactionType">Transaction type</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByTransactionTypeAsync(string transactionType);

        /// <summary>
        /// Get transactions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get transactions by date range (alias for GetTransactionsByDateRangeAsync)
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
        Task<IEnumerable<Transaction>> GetTransactionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get transactions by currency
        /// </summary>
        /// <param name="currency">Currency</param>
        /// <returns>List of transactions</returns>
        Task<IEnumerable<Transaction>> GetTransactionsByCurrencyAsync(string currency);

        /// <summary>
        /// Add a new transaction
        /// </summary>
        /// <param name="transaction">Transaction to add</param>
        /// <returns>Added transaction</returns>
        Task<Transaction> AddTransactionAsync(Transaction transaction);

        /// <summary>
        /// Update an existing transaction
        /// </summary>
        /// <param name="transaction">Transaction to update</param>
        /// <returns>Updated transaction</returns>
        Task<Transaction> UpdateTransactionAsync(Transaction transaction);

        /// <summary>
        /// Delete a transaction
        /// </summary>
        /// <param name="id">Transaction ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteTransactionAsync(int id);
    }
}
