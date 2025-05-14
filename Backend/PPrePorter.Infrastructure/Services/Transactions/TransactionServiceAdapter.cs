using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces.Transactions;
using PPrePorter.Core.Models.DTOs;
using PPrePorter.Infrastructure.Adapters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DbTransaction = PPrePorter.DailyActionsDB.Models.Transactions.Transaction;

namespace PPrePorter.Infrastructure.Services.Transactions
{
    /// <summary>
    /// Adapter for the TransactionService that implements the Core ITransactionService interface
    /// and uses the DailyActionsDB ITransactionService implementation
    /// </summary>
    public class TransactionServiceAdapter : ITransactionService
    {
        private readonly PPrePorter.DailyActionsDB.Interfaces.ITransactionService _transactionService;
        private readonly ILogger<TransactionServiceAdapter> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public TransactionServiceAdapter(
            PPrePorter.DailyActionsDB.Interfaces.ITransactionService transactionService,
            ILogger<TransactionServiceAdapter> logger)
        {
            _transactionService = transactionService ?? throw new ArgumentNullException(nameof(transactionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all transactions
        /// </summary>
        public async Task<List<TransactionDto>> GetAllTransactionsAsync()
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetAllTransactionsAsync();

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all transactions");
                throw;
            }
        }

        /// <summary>
        /// Gets a transaction by ID
        /// </summary>
        public async Task<TransactionDto> GetTransactionByIdAsync(int id)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransaction = await _transactionService.GetTransactionByIdAsync(id);

                // Convert DailyActionsDB transaction to Core transaction using the adapter
                var transaction = dbTransaction != null ? TransactionAdapter.ToDto(dbTransaction) : null;

                return transaction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction by ID {Id}", id);
                throw;
            }
        }

        /// <summary>
        /// Gets transactions by player ID
        /// </summary>
        public async Task<List<TransactionDto>> GetTransactionsByPlayerIdAsync(string playerId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetTransactionsByPlayerIdAsync(playerId);

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Gets transactions by white label ID
        /// </summary>
        public async Task<List<TransactionDto>> GetTransactionsByWhiteLabelIdAsync(string whiteLabelId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetTransactionsByWhiteLabelIdAsync(whiteLabelId);

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Gets transactions by date range
        /// </summary>
        public async Task<List<TransactionDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetTransactionsByDateRangeAsync(startDate, endDate);

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Gets transactions by player ID and date range
        /// </summary>
        public async Task<List<TransactionDto>> GetTransactionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetTransactionsByPlayerIdAndDateRangeAsync(playerId, startDate, endDate);

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Gets transactions by transaction type and date range
        /// </summary>
        public async Task<List<TransactionDto>> GetTransactionsByTypeAndDateRangeAsync(string transactionType, DateTime startDate, DateTime endDate)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbTransactions = await _transactionService.GetTransactionsByTypeAndDateRangeAsync(transactionType, startDate, endDate);

                // Convert DailyActionsDB transactions to Core transactions using the adapter
                var transactions = dbTransactions.Select(t => TransactionAdapter.ToDto(t)).ToList();

                return transactions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by type {TransactionType} and date range {StartDate} to {EndDate}", transactionType, startDate, endDate);
                throw;
            }
        }

        // The ConvertToCoreDto method has been replaced by the TransactionAdapter.ToDto method
    }
}
