using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Metadata items methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Gets all white labels from the metadata service or database
        /// </summary>
        private async Task<List<WhiteLabelDto>> GetWhiteLabelsAsync()
        {
            if (_metadataService != null)
            {
                try
                {
                    // Get white labels from metadata service
                    var whiteLabelsMetadata = await _metadataService.GetMetadataByTypeAsync("WhiteLabel", true);
                    var whiteLabelDtos = whiteLabelsMetadata.Select(wl => new WhiteLabelDto
                    {
                        Id = wl.Id,
                        Name = wl.Name,
                        Code = wl.Code,
                        IsActive = wl.IsActive
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} white labels from metadata service", whiteLabelDtos.Count);
                    return whiteLabelDtos;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving white labels from metadata service. Will fall back to database.");
                    // Continue to fallback
                }
            }

            // Fallback to database
            var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
            var result = whiteLabels.Select(wl => new WhiteLabelDto
            {
                Id = wl.Id,
                Name = wl.Name,
                Code = wl.Code,
                IsActive = wl.IsActive ?? false
            }).ToList();

            _logger.LogInformation("Retrieved {Count} white labels from database", result.Count);
            return result;
        }

        /// <summary>
        /// Gets all countries from the metadata service or database
        /// </summary>
        private async Task<List<CountryDto>> GetCountriesAsync()
        {
            if (_metadataService != null)
            {
                try
                {
                    // Get countries from metadata service
                    var countriesMetadata = await _metadataService.GetMetadataByTypeAsync("Country", true);
                    var countryDtos = countriesMetadata.Select(c => new CountryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsoCode = c.Code
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} countries from metadata service", countryDtos.Count);
                    return countryDtos;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving countries from metadata service. Will fall back to database.");
                    // Continue to fallback
                }
            }

            // Fallback to database
            var countries = await _dbContext.Countries
                .AsNoTracking()
                .Where(c => c.IsActive == true)
                .OrderBy(c => c.CountryName)
                .ToListAsync();

            var result = countries.Select(c => new CountryDto
            {
                Id = c.CountryID,
                Name = c.CountryName,
                IsoCode = c.IsoCode
            }).ToList();

            _logger.LogInformation("Retrieved {Count} countries from database", result.Count);
            return result;
        }

        /// <summary>
        /// Gets all currencies from the metadata service or database
        /// </summary>
        private async Task<List<CurrencyDto>> GetCurrenciesAsync()
        {
            if (_metadataService != null)
            {
                try
                {
                    // Get currencies from metadata service
                    var currenciesMetadata = await _metadataService.GetMetadataByTypeAsync("Currency", true);
                    var currencyDtos = currenciesMetadata.Select(c => new CurrencyDto
                    {
                        Id = (byte)c.Id, // Explicit cast from int to byte
                        Name = c.Name,
                        Code = c.Code,
                        Symbol = c.AdditionalData
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} currencies from metadata service", currencyDtos.Count);
                    return currencyDtos;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving currencies from metadata service. Will fall back to database.");
                    // Continue to fallback
                }
            }

            // Fallback to database
            var currencies = await _dbContext.Currencies
                .AsNoTracking()
                .OrderBy(c => c.CurrencyName)
                .ToListAsync();

            var result = currencies.Select(c => new CurrencyDto
            {
                Id = c.CurrencyID,
                Name = c.CurrencyName,
                Code = c.CurrencyCode,
                Symbol = c.CurrencySymbol
            }).ToList();

            _logger.LogInformation("Retrieved {Count} currencies from database", result.Count);
            return result;
        }
    }
}
