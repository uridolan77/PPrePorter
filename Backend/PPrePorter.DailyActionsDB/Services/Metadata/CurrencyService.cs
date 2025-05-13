using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces.Metadata;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for currency operations using repository pattern
    /// </summary>
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _currencyRepository;
        private readonly IDailyActionsMetadataRepository _metadataRepository;
        private readonly ILogger<CurrencyService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public CurrencyService(
            ICurrencyRepository currencyRepository,
            IDailyActionsMetadataRepository metadataRepository,
            ILogger<CurrencyService> logger)
        {
            _currencyRepository = currencyRepository ?? throw new ArgumentNullException(nameof(currencyRepository));
            _metadataRepository = metadataRepository ?? throw new ArgumentNullException(nameof(metadataRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Currency>> GetAllCurrenciesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all currencies from DailyActionsMetadata");

                // Get currencies from the DailyActionsMetadata table
                var metadataCurrencies = await _metadataRepository.GetCurrenciesAsync(true);

                // Convert to Currency entities
                var currencies = metadataCurrencies.Select(m => new Currency
                {
                    CurrencyID = (byte)m.Id, // Cast to byte since Currency.CurrencyID is byte
                    CurrencyName = m.Name,
                    CurrencyCode = m.Code,
                    CurrencySymbol = m.AdditionalData,
                    UpdatedDate = m.UpdatedDate ?? DateTime.UtcNow
                }).ToList();

                _logger.LogInformation("Retrieved {Count} currencies from DailyActionsMetadata", currencies.Count);

                return currencies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currencies from DailyActionsMetadata");

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for currencies");
                try
                {
                    return await _currencyRepository.GetOrderedByNameAsync();
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting currencies from fallback repository");
                    throw;
                }
            }
        }

        /// <inheritdoc/>
        public async Task<Currency?> GetCurrencyByIdAsync(byte id)
        {
            try
            {
                _logger.LogInformation("Getting currency by ID {Id} from DailyActionsMetadata", id);

                // Get all currencies from the DailyActionsMetadata table
                var metadataCurrencies = await _metadataRepository.GetCurrenciesAsync(true);

                // Find the currency with the specified ID
                var metadataCurrency = metadataCurrencies.FirstOrDefault(m => m.Id == id);

                if (metadataCurrency != null)
                {
                    // Convert to Currency entity
                    var currency = new Currency
                    {
                        CurrencyID = (byte)metadataCurrency.Id,
                        CurrencyName = metadataCurrency.Name,
                        CurrencyCode = metadataCurrency.Code,
                        CurrencySymbol = metadataCurrency.AdditionalData,
                        UpdatedDate = metadataCurrency.UpdatedDate ?? DateTime.UtcNow
                    };

                    _logger.LogInformation("Retrieved currency with ID {Id} from DailyActionsMetadata", id);

                    return currency;
                }

                _logger.LogWarning("Currency with ID {Id} not found in DailyActionsMetadata", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency by ID {Id} from DailyActionsMetadata", id);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for currency with ID {Id}", id);
                try
                {
                    return await _currencyRepository.GetByIdAsync(id);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting currency by ID {Id} from fallback repository", id);
                    throw;
                }
            }
        }

        /// <inheritdoc/>
        public async Task<Currency?> GetCurrencyByCodeAsync(string code)
        {
            try
            {
                _logger.LogInformation("Getting currency by code {Code} from DailyActionsMetadata", code);

                // Get all currencies from the DailyActionsMetadata table
                var metadataCurrencies = await _metadataRepository.GetCurrenciesAsync(true);

                // Find the currency with the specified code
                var metadataCurrency = metadataCurrencies.FirstOrDefault(m => m.Code == code);

                if (metadataCurrency != null)
                {
                    // Convert to Currency entity
                    var currency = new Currency
                    {
                        CurrencyID = (byte)metadataCurrency.Id,
                        CurrencyName = metadataCurrency.Name,
                        CurrencyCode = metadataCurrency.Code,
                        CurrencySymbol = metadataCurrency.AdditionalData,
                        UpdatedDate = metadataCurrency.UpdatedDate ?? DateTime.UtcNow
                    };

                    _logger.LogInformation("Retrieved currency with code {Code} from DailyActionsMetadata", code);

                    return currency;
                }

                _logger.LogWarning("Currency with code {Code} not found in DailyActionsMetadata", code);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting currency by code {Code} from DailyActionsMetadata", code);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for currency with code {Code}", code);
                try
                {
                    return await _currencyRepository.GetByCodeAsync(code);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting currency by code {Code} from fallback repository", code);
                    throw;
                }
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
