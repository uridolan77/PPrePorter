using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Transactions;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for transaction operations using repository pattern
    /// </summary>
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly ILogger<TransactionService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public TransactionService(
            ITransactionRepository transactionRepository,
            ILogger<TransactionService> logger)
        {
            _transactionRepository = transactionRepository ?? throw new ArgumentNullException(nameof(transactionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetAllTransactionsAsync()
        {
            try
            {
                _logger.LogWarning("Getting all transactions - this is a potentially expensive operation and should be avoided");

                // Get transactions from the last 7 days instead of all transactions
                var endDate = DateTime.UtcNow;
                var startDate = endDate.AddDays(-7);

                _logger.LogInformation("Limiting to transactions from the last 7 days ({StartDate} to {EndDate})",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                return await _transactionRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all transactions");
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<Transaction?> GetTransactionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting transaction by ID {Id}", id);
                return await _transactionRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Transaction?> GetTransactionByTransactionIdAsync(string transactionId)
        {
            if (string.IsNullOrWhiteSpace(transactionId))
            {
                throw new ArgumentException("Transaction ID cannot be null or empty", nameof(transactionId));
            }

            try
            {
                _logger.LogInformation("Getting transaction by transaction ID {TransactionId}", transactionId);
                return await _transactionRepository.GetByTransactionIdAsync(transactionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction by transaction ID {TransactionId}", transactionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByPlayerIdAsync(string playerId)
        {
            if (string.IsNullOrWhiteSpace(playerId))
            {
                throw new ArgumentException("Player ID cannot be null or empty", nameof(playerId));
            }

            try
            {
                _logger.LogInformation("Getting transactions by player ID {PlayerId}", playerId);
                return await _transactionRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId}", playerId);
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByWhiteLabelIdAsync(string whiteLabelId)
        {
            if (string.IsNullOrWhiteSpace(whiteLabelId))
            {
                throw new ArgumentException("White label ID cannot be null or empty", nameof(whiteLabelId));
            }

            try
            {
                _logger.LogInformation("Getting transactions by white label ID {WhiteLabelId}", whiteLabelId);
                return await _transactionRepository.GetByWhiteLabelIdAsync(whiteLabelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by white label ID {WhiteLabelId}", whiteLabelId);
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByGameIdAsync(string gameId)
        {
            if (string.IsNullOrWhiteSpace(gameId))
            {
                throw new ArgumentException("Game ID cannot be null or empty", nameof(gameId));
            }

            try
            {
                _logger.LogInformation("Getting transactions by game ID {GameId}", gameId);
                return await _transactionRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by game ID {GameId}", gameId);
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByTransactionTypeAsync(string transactionType)
        {
            if (string.IsNullOrWhiteSpace(transactionType))
            {
                throw new ArgumentException("Transaction type cannot be null or empty", nameof(transactionType));
            }

            try
            {
                _logger.LogInformation("Getting transactions by transaction type {TransactionType}", transactionType);
                return await _transactionRepository.GetByTransactionTypeAsync(transactionType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by transaction type {TransactionType}", transactionType);
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Validate date range
                if (startDate > endDate)
                {
                    _logger.LogWarning("Invalid date range: start date {StartDate} is after end date {EndDate}. Swapping dates.", startDate, endDate);
                    var temp = startDate;
                    startDate = endDate;
                    endDate = temp;
                }

                // Check if date range is too large (more than 90 days)
                var daysDifference = (endDate - startDate).TotalDays;
                if (daysDifference > 90)
                {
                    _logger.LogWarning("Date range too large: {Days} days. Limiting to 90 days.", daysDifference);
                    endDate = startDate.AddDays(90);
                }

                _logger.LogInformation("Getting transactions by date range {StartDate} to {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                return await _transactionRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by date range {StartDate} to {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            // This is just an alias for GetTransactionsByDateRangeAsync
            return await GetTransactionsByDateRangeAsync(startDate, endDate);
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate)
        {
            if (string.IsNullOrWhiteSpace(playerId))
            {
                throw new ArgumentException("Player ID cannot be null or empty", nameof(playerId));
            }

            try
            {
                // Validate date range
                if (startDate > endDate)
                {
                    _logger.LogWarning("Invalid date range: start date {StartDate} is after end date {EndDate}. Swapping dates.", startDate, endDate);
                    var temp = startDate;
                    startDate = endDate;
                    endDate = temp;
                }

                // Check if date range is too large (more than 90 days)
                var daysDifference = (endDate - startDate).TotalDays;
                if (daysDifference > 90)
                {
                    _logger.LogWarning("Date range too large: {Days} days. Limiting to 90 days.", daysDifference);
                    endDate = startDate.AddDays(90);
                }

                _logger.LogInformation("Getting transactions by player ID {PlayerId} and date range {StartDate} to {EndDate}",
                    playerId, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                return await _transactionRepository.GetByPlayerIdAndDateRangeAsync(playerId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId} and date range {StartDate} to {EndDate}",
                    playerId, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByCurrencyAsync(string currency)
        {
            if (string.IsNullOrWhiteSpace(currency))
            {
                throw new ArgumentException("Currency cannot be null or empty", nameof(currency));
            }

            try
            {
                _logger.LogInformation("Getting transactions by currency {Currency}", currency);
                return await _transactionRepository.GetByCurrencyAsync(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by currency {Currency}", currency);
                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Transaction>> GetTransactionsByTypeAndDateRangeAsync(string transactionType, DateTime startDate, DateTime endDate)
        {
            if (string.IsNullOrWhiteSpace(transactionType))
            {
                throw new ArgumentException("Transaction type cannot be null or empty", nameof(transactionType));
            }

            try
            {
                // Validate date range
                if (startDate > endDate)
                {
                    _logger.LogWarning("Invalid date range: start date {StartDate} is after end date {EndDate}. Swapping dates.", startDate, endDate);
                    var temp = startDate;
                    startDate = endDate;
                    endDate = temp;
                }

                // Check if date range is too large (more than 90 days)
                var daysDifference = (endDate - startDate).TotalDays;
                if (daysDifference > 90)
                {
                    _logger.LogWarning("Date range too large: {Days} days. Limiting to 90 days.", daysDifference);
                    endDate = startDate.AddDays(90);
                }

                _logger.LogInformation("Getting transactions by transaction type {TransactionType} and date range {StartDate} to {EndDate}",
                    transactionType, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Get all transactions in the date range
                var transactions = await _transactionRepository.GetByDateRangeAsync(startDate, endDate);

                // Filter by transaction type
                return transactions.Where(t => t.TransactionType == transactionType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by transaction type {TransactionType} and date range {StartDate} to {EndDate}",
                    transactionType, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Return empty list instead of throwing to prevent 500 errors
                _logger.LogWarning("Returning empty list of transactions due to error");
                return new List<Transaction>();
            }
        }

        /// <inheritdoc/>
        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            if (transaction == null)
            {
                throw new ArgumentNullException(nameof(transaction));
            }

            try
            {
                _logger.LogInformation("Adding new transaction with transaction ID {TransactionId}", transaction.TransactionId);

                // Check if a transaction with the same transaction ID already exists
                var existingTransaction = await _transactionRepository.GetByTransactionIdAsync(transaction.TransactionId);
                if (existingTransaction != null)
                {
                    throw new InvalidOperationException($"A transaction with the transaction ID '{transaction.TransactionId}' already exists");
                }

                return await _transactionRepository.AddAsync(transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding transaction with transaction ID {TransactionId}", transaction.TransactionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Transaction> UpdateTransactionAsync(Transaction transaction)
        {
            if (transaction == null)
            {
                throw new ArgumentNullException(nameof(transaction));
            }

            try
            {
                _logger.LogInformation("Updating transaction with ID {Id}", transaction.Id);

                // Check if the transaction exists
                var existingTransaction = await _transactionRepository.GetByIdAsync(transaction.Id);
                if (existingTransaction == null)
                {
                    throw new InvalidOperationException($"Transaction with ID {transaction.Id} not found");
                }

                return await _transactionRepository.UpdateAsync(transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating transaction with ID {Id}", transaction.Id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteTransactionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting transaction with ID {Id}", id);
                return await _transactionRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting transaction with ID {Id}", id);
                throw;
            }
        }
    }
}
