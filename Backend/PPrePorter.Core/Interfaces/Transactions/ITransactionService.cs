using PPrePorter.Core.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces.Transactions
{
    /// <summary>
    /// Interface for the Transaction Service
    /// </summary>
    public interface ITransactionService
    {
        /// <summary>
        /// Gets all transactions
        /// </summary>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetAllTransactionsAsync();

        /// <summary>
        /// Gets a transaction by ID
        /// </summary>
        /// <param name="id">The transaction ID</param>
        /// <returns>The transaction DTO if found, null otherwise</returns>
        Task<TransactionDto> GetTransactionByIdAsync(int id);

        /// <summary>
        /// Gets transactions by player ID
        /// </summary>
        /// <param name="playerId">The player ID</param>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetTransactionsByPlayerIdAsync(string playerId);

        /// <summary>
        /// Gets transactions by white label ID
        /// </summary>
        /// <param name="whiteLabelId">The white label ID</param>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetTransactionsByWhiteLabelIdAsync(string whiteLabelId);

        /// <summary>
        /// Gets transactions by date range
        /// </summary>
        /// <param name="startDate">The start date</param>
        /// <param name="endDate">The end date</param>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets transactions by player ID and date range
        /// </summary>
        /// <param name="playerId">The player ID</param>
        /// <param name="startDate">The start date</param>
        /// <param name="endDate">The end date</param>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetTransactionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets transactions by transaction type and date range
        /// </summary>
        /// <param name="transactionType">The transaction type</param>
        /// <param name="startDate">The start date</param>
        /// <param name="endDate">The end date</param>
        /// <returns>A list of transaction DTOs</returns>
        Task<List<TransactionDto>> GetTransactionsByTypeAndDateRangeAsync(string transactionType, DateTime startDate, DateTime endDate);
    }
}
