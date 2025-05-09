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
    /// Service for currency operations using repository pattern
    /// </summary>
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _currencyRepository;
        private readonly ILogger<CurrencyService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public CurrencyService(
            ICurrencyRepository currencyRepository,
            ILogger<CurrencyService> logger)
        {
            _currencyRepository = currencyRepository ?? throw new ArgumentNullException(nameof(currencyRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Currency>> GetAllCurrenciesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all currencies");
                return await _currencyRepository.GetOrderedByNameAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all currencies");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Currency?> GetCurrencyByIdAsync(byte id)
        {
            try
            {
                _logger.LogInformation("Getting currency by ID {Id}", id);
                return await _currencyRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Currency?> GetCurrencyByCodeAsync(string code)
        {
            try
            {
                _logger.LogInformation("Getting currency by code {Code}", code);
                return await _currencyRepository.GetByCodeAsync(code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency by code {Code}", code);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Currency> AddCurrencyAsync(Currency currency)
        {
            if (currency == null)
            {
                throw new ArgumentNullException(nameof(currency));
            }
            
            try
            {
                _logger.LogInformation("Adding new currency {Name}", currency.CurrencyName);
                
                // Check if a currency with the same code already exists
                var existingCurrency = await _currencyRepository.GetByCodeAsync(currency.CurrencyCode);
                if (existingCurrency != null)
                {
                    throw new InvalidOperationException($"A currency with the code '{currency.CurrencyCode}' already exists");
                }
                
                return await _currencyRepository.AddAsync(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding currency {Name}", currency.CurrencyName);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Currency> UpdateCurrencyAsync(Currency currency)
        {
            if (currency == null)
            {
                throw new ArgumentNullException(nameof(currency));
            }
            
            try
            {
                _logger.LogInformation("Updating currency with ID {Id}", currency.CurrencyID);
                
                // Check if the currency exists
                var existingCurrency = await _currencyRepository.GetByIdAsync(currency.CurrencyID);
                if (existingCurrency == null)
                {
                    throw new InvalidOperationException($"Currency with ID {currency.CurrencyID} not found");
                }
                
                // Check if the code is being changed and if the new code is already in use
                if (existingCurrency.CurrencyCode != currency.CurrencyCode)
                {
                    var currencyWithSameCode = await _currencyRepository.GetByCodeAsync(currency.CurrencyCode);
                    if (currencyWithSameCode != null && currencyWithSameCode.CurrencyID != currency.CurrencyID)
                    {
                        throw new InvalidOperationException($"A currency with the code '{currency.CurrencyCode}' already exists");
                    }
                }
                
                return await _currencyRepository.UpdateAsync(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating currency with ID {Id}", currency.CurrencyID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteCurrencyAsync(byte id)
        {
            try
            {
                _logger.LogInformation("Deleting currency with ID {Id}", id);
                return await _currencyRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting currency with ID {Id}", id);
                throw;
            }
        }
    }
}
