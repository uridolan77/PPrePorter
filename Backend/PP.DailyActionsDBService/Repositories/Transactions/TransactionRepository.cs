using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Transactions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for Transaction entities
    /// </summary>
    public class TransactionRepository : BaseRepository<Transaction>, ITransactionRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public TransactionRepository(
            DailyActionsDbContext dbContext,
            ILogger<TransactionRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get transaction by transaction ID
        /// </summary>
        public async Task<Transaction?> GetByTransactionIdAsync(string transactionId)
        {
            if (string.IsNullOrWhiteSpace(transactionId))
            {
                throw new ArgumentException("Transaction ID cannot be null or empty", nameof(transactionId));
            }

            string cacheKey = $"{_cacheKeyPrefix}TransactionId_{transactionId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out Transaction cachedEntity))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntity;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var entity = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .FirstOrDefaultAsync(t => t.TransactionId == transactionId);

                // Cache the result if found
                if (entity != null && _enableCaching)
                {
                    _cache.Set(cacheKey, entity, _cacheExpiration);
                    _logger.LogDebug("Cached entity for {CacheKey}", cacheKey);
                }

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction by transaction ID {TransactionId}", transactionId);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by player ID
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByPlayerIdAsync(string playerId)
        {
            if (string.IsNullOrWhiteSpace(playerId))
            {
                throw new ArgumentException("Player ID cannot be null or empty", nameof(playerId));
            }

            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.PlayerId == playerId)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by white label ID
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByWhiteLabelIdAsync(string whiteLabelId)
        {
            if (string.IsNullOrWhiteSpace(whiteLabelId))
            {
                throw new ArgumentException("White label ID cannot be null or empty", nameof(whiteLabelId));
            }

            string cacheKey = $"{_cacheKeyPrefix}WhiteLabelId_{whiteLabelId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.WhitelabelId == whiteLabelId)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by game ID
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByGameIdAsync(string gameId)
        {
            if (string.IsNullOrWhiteSpace(gameId))
            {
                throw new ArgumentException("Game ID cannot be null or empty", nameof(gameId));
            }

            string cacheKey = $"{_cacheKeyPrefix}GameId_{gameId}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.GameId == gameId)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by transaction type
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByTransactionTypeAsync(string transactionType)
        {
            if (string.IsNullOrWhiteSpace(transactionType))
            {
                throw new ArgumentException("Transaction type cannot be null or empty", nameof(transactionType));
            }

            string cacheKey = $"{_cacheKeyPrefix}TransactionType_{transactionType}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.TransactionType == transactionType)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by transaction type {TransactionType}", transactionType);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by date range
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            // Ensure endDate includes the entire day
            endDate = endDate.Date.AddDays(1).AddSeconds(-1);

            string cacheKey = $"{_cacheKeyPrefix}DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);
            _logger.LogInformation("Executing query for transactions between {StartDate} and {EndDate}",
                startDate.ToString("yyyy-MM-dd HH:mm:ss"), endDate.ToString("yyyy-MM-dd HH:mm:ss"));

            try
            {
                // Create the query with explicit date range filter
                var query = _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)");

                // Add the date range filter
                query = query.Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate);

                // Log the SQL query being executed (for debugging)
                _logger.LogInformation("Executing SQL query for transactions with TransactionDate between {StartDate} and {EndDate}",
                    startDate, endDate);

                // Log the actual SQL query
                var sql = query.ToQueryString();
                _logger.LogInformation("SQL Query: {Sql}", sql);

                var result = await query.ToListAsync();

                _logger.LogInformation("Retrieved {Count} transactions between {StartDate} and {EndDate}",
                    result.Count(), startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
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

        /// <summary>
        /// Get transactions by player ID and date range
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate)
        {
            if (string.IsNullOrWhiteSpace(playerId))
            {
                throw new ArgumentException("Player ID cannot be null or empty", nameof(playerId));
            }

            string cacheKey = $"{_cacheKeyPrefix}PlayerId_{playerId}_DateRange_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.PlayerId == playerId && t.TransactionDate >= startDate && t.TransactionDate <= endDate)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Get transactions by currency
        /// </summary>
        public async Task<IEnumerable<Transaction>> GetByCurrencyAsync(string currency)
        {
            if (string.IsNullOrWhiteSpace(currency))
            {
                throw new ArgumentException("Currency cannot be null or empty", nameof(currency));
            }

            string cacheKey = $"{_cacheKeyPrefix}Currency_{currency}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Transaction> cachedResult))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var result = await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(t => t.Currency == currency)
                    .ToListAsync();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, result, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions by currency {Currency}", currency);
                throw;
            }
        }
    }
}
