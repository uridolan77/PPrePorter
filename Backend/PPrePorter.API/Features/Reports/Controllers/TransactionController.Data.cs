using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Partial class for TransactionController containing data retrieval endpoints
    /// </summary>
    public partial class TransactionController
    {
        /// <summary>
        /// Get transactions data with basic filters
        /// </summary>
        /// <param name="startDate">Start date (defaults to yesterday)</param>
        /// <param name="endDate">End date (defaults to today)</param>
        /// <param name="playerId">Optional player ID filter</param>
        /// <param name="transactionType">Optional transaction type filter</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        [HttpGet("data")]
        public async Task<IActionResult> GetTransactionsData(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? playerId = null,
            [FromQuery] string? transactionType = null,
            [FromQuery] string? whiteLabelId = null)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetTransactionsData request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var start = startDate?.Date ?? yesterday;
                var end = endDate?.Date ?? today;

                // Log the parameters being used for the cache key
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Getting transactions with parameters: startDate={StartDate}, endDate={EndDate}, playerId={PlayerId}, transactionType={TransactionType}, whiteLabelId={WhiteLabelId}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), 
                    playerId, transactionType, whiteLabelId);

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"Transactions_Data_{start:yyyyMMdd}_{end:yyyyMMdd}_{playerId ?? "all"}_{transactionType ?? "all"}_{whiteLabelId ?? "all"}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get transactions data - measure time
                var getDataStartTime = DateTime.UtcNow;
                
                // Get all transactions first
                var transactions = await _transactionService.GetAllTransactionsAsync();
                
                // Apply filters
                transactions = transactions.Where(t => t.TransactionDate >= start && t.TransactionDate <= end);
                
                if (!string.IsNullOrEmpty(playerId))
                {
                    transactions = transactions.Where(t => t.PlayerId == playerId);
                }
                
                if (!string.IsNullOrEmpty(transactionType))
                {
                    transactions = transactions.Where(t => t.TransactionType == transactionType);
                }
                
                if (!string.IsNullOrEmpty(whiteLabelId))
                {
                    transactions = transactions.Where(t => t.WhitelabelId == whiteLabelId);
                }
                
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetTransactionsData completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Limit the number of records to prevent Swagger UI from crashing
                var limitedTransactions = transactions.Take(100).ToList();
                _logger.LogInformation("Retrieved {TotalCount} transactions, limiting to {LimitedCount} for the response",
                    transactions.Count(), limitedTransactions.Count);

                // Create a dynamic object with all properties from Transaction
                var result = limitedTransactions.Select(transaction =>
                {
                    // Create a dynamic object to hold all properties
                    var obj = new ExpandoObject() as IDictionary<string, object>;

                    // Add all properties from Transaction
                    obj["id"] = transaction.Id;
                    obj["transactionId"] = transaction.TransactionId;
                    obj["transactionDate"] = transaction.TransactionDate;
                    obj["playerId"] = transaction.PlayerId;
                    obj["whiteLabelId"] = transaction.WhitelabelId;
                    obj["gameId"] = transaction.GameId;
                    obj["gameName"] = transaction.GameName;
                    obj["amount"] = transaction.Amount;
                    obj["transactionType"] = transaction.TransactionType;
                    obj["currency"] = transaction.Currency;

                    return obj;
                }).ToList();

                // Prepare response
                var response = new
                {
                    data = result,
                    totalCount = transactions.Count(),
                    startDate = start,
                    endDate = end,
                    filters = new
                    {
                        playerId,
                        transactionType,
                        whiteLabelId
                    }
                };

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetTransactionsData request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions data");
                return StatusCode(500, new { message = "An error occurred while retrieving transactions data" });
            }
        }

        /// <summary>
        /// Get a specific transaction by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionByIdAsync(id);

                if (transaction == null)
                {
                    return NotFound(new { message = $"Transaction with ID {id} not found" });
                }

                // Create a dynamic object with all properties from Transaction
                var obj = new ExpandoObject() as IDictionary<string, object>;

                // Add all properties
                obj["id"] = transaction.Id;
                obj["transactionId"] = transaction.TransactionId;
                obj["transactionDate"] = transaction.TransactionDate;
                obj["playerId"] = transaction.PlayerId;
                obj["whiteLabelId"] = transaction.WhitelabelId;
                obj["gameId"] = transaction.GameId;
                obj["gameName"] = transaction.GameName;
                obj["amount"] = transaction.Amount;
                obj["transactionType"] = transaction.TransactionType;
                obj["currency"] = transaction.Currency;

                return Ok(obj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the transaction" });
            }
        }

        /// <summary>
        /// Get transaction types for filtering
        /// </summary>
        [HttpGet("transaction-types")]
        public IActionResult GetTransactionTypes()
        {
            try
            {
                // This would typically come from a database or service
                // For now, we'll return a static list of common transaction types
                var transactionTypes = new List<string>
                {
                    "Deposit",
                    "Withdrawal",
                    "Bet",
                    "Win",
                    "Bonus",
                    "Refund",
                    "Adjustment",
                    "Fee",
                    "Transfer"
                };

                return Ok(transactionTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction types");
                return StatusCode(500, new { message = "An error occurred while retrieving transaction types" });
            }
        }
    }
}
