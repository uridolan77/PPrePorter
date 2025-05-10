using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for currency history operations using repository pattern
    /// </summary>
    public class CurrencyHistoryService : ICurrencyHistoryService
    {
        private readonly ICurrencyHistoryRepository _currencyHistoryRepository;
        private readonly ILogger<CurrencyHistoryService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public CurrencyHistoryService(
            ICurrencyHistoryRepository currencyHistoryRepository,
            ILogger<CurrencyHistoryService> logger)
        {
            _currencyHistoryRepository = currencyHistoryRepository ?? throw new ArgumentNullException(nameof(currencyHistoryRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<CurrencyHistory>> GetAllCurrencyHistoryAsync()
        {
            try
            {
                _logger.LogInformation("Getting all currency history records");
                return await _currencyHistoryRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all currency history records");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByCurrencyIdAsync(byte currencyId)
        {
            try
            {
                _logger.LogInformation("Getting currency history by currency ID {CurrencyId}", currencyId);
                return await _currencyHistoryRepository.GetByCurrencyIdAsync(currencyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency history by currency ID {CurrencyId}", currencyId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting currency history by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _currencyHistoryRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency history by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<CurrencyHistory>> GetCurrencyHistoryByCurrencyIdAndDateRangeAsync(byte currencyId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting currency history by currency ID {CurrencyId} and date range {StartDate} to {EndDate}", currencyId, startDate, endDate);
                return await _currencyHistoryRepository.GetByCurrencyIdAndDateRangeAsync(currencyId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency history by currency ID {CurrencyId} and date range {StartDate} to {EndDate}", currencyId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<CurrencyHistory?> GetLatestCurrencyHistoryByCurrencyIdAsync(byte currencyId)
        {
            try
            {
                _logger.LogInformation("Getting latest currency history by currency ID {CurrencyId}", currencyId);
                return await _currencyHistoryRepository.GetLatestByCurrencyIdAsync(currencyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting latest currency history by currency ID {CurrencyId}", currencyId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<CurrencyHistory> AddCurrencyHistoryAsync(CurrencyHistory currencyHistory)
        {
            if (currencyHistory == null)
            {
                throw new ArgumentNullException(nameof(currencyHistory));
            }
            
            try
            {
                _logger.LogInformation("Adding new currency history record for currency ID {CurrencyId}", currencyHistory.CurrencyId);
                
                // Set the updated date to now if not provided
                if (currencyHistory.UpdatedDate == default)
                {
                    currencyHistory.UpdatedDate = DateTime.UtcNow;
                }
                
                return await _currencyHistoryRepository.AddAsync(currencyHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding currency history record for currency ID {CurrencyId}", currencyHistory.CurrencyId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<CurrencyHistory> UpdateCurrencyHistoryAsync(CurrencyHistory currencyHistory)
        {
            if (currencyHistory == null)
            {
                throw new ArgumentNullException(nameof(currencyHistory));
            }
            
            try
            {
                _logger.LogInformation("Updating currency history record for currency ID {CurrencyId}", currencyHistory.CurrencyId);
                
                // Set the updated date to now if not provided
                if (currencyHistory.UpdatedDate == default)
                {
                    currencyHistory.UpdatedDate = DateTime.UtcNow;
                }
                
                return await _currencyHistoryRepository.UpdateAsync(currencyHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating currency history record for currency ID {CurrencyId}", currencyHistory.CurrencyId);
                throw;
            }
        }
    }
}
