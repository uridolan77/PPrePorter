using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for country operations using repository pattern
    /// </summary>
    public class CountryService : ICountryService
    {
        private readonly ICountryRepository _countryRepository;
        private readonly ILogger<CountryService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public CountryService(
            ICountryRepository countryRepository,
            ILogger<CountryService> logger)
        {
            _countryRepository = countryRepository ?? throw new ArgumentNullException(nameof(countryRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Country>> GetAllCountriesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all countries (includeInactive: {IncludeInactive})", includeInactive);
                return await _countryRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all countries");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Country?> GetCountryByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting country by ID {Id}", id);
                return await _countryRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting country by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Country?> GetCountryByIsoCodeAsync(string isoCode)
        {
            try
            {
                _logger.LogInformation("Getting country by ISO code {IsoCode}", isoCode);
                return await _countryRepository.GetByIsoCodeAsync(isoCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting country by ISO code {IsoCode}", isoCode);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Country> AddCountryAsync(Country country)
        {
            if (country == null)
            {
                throw new ArgumentNullException(nameof(country));
            }
            
            try
            {
                _logger.LogInformation("Adding new country {Name}", country.CountryName);
                
                // Check if a country with the same ISO code already exists
                if (!string.IsNullOrEmpty(country.IsoCode))
                {
                    var existingCountry = await _countryRepository.GetByIsoCodeAsync(country.IsoCode);
                    if (existingCountry != null)
                    {
                        throw new InvalidOperationException($"A country with the ISO code '{country.IsoCode}' already exists");
                    }
                }
                
                return await _countryRepository.AddAsync(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding country {Name}", country.CountryName);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Country> UpdateCountryAsync(Country country)
        {
            if (country == null)
            {
                throw new ArgumentNullException(nameof(country));
            }
            
            try
            {
                _logger.LogInformation("Updating country with ID {Id}", country.CountryID);
                
                // Check if the country exists
                var existingCountry = await _countryRepository.GetByIdAsync(country.CountryID);
                if (existingCountry == null)
                {
                    throw new InvalidOperationException($"Country with ID {country.CountryID} not found");
                }
                
                // Check if the ISO code is being changed and if the new ISO code is already in use
                if (!string.IsNullOrEmpty(country.IsoCode) && 
                    !string.IsNullOrEmpty(existingCountry.IsoCode) && 
                    existingCountry.IsoCode != country.IsoCode)
                {
                    var countryWithSameIsoCode = await _countryRepository.GetByIsoCodeAsync(country.IsoCode);
                    if (countryWithSameIsoCode != null && countryWithSameIsoCode.CountryID != country.CountryID)
                    {
                        throw new InvalidOperationException($"A country with the ISO code '{country.IsoCode}' already exists");
                    }
                }
                
                return await _countryRepository.UpdateAsync(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating country with ID {Id}", country.CountryID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteCountryAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting country with ID {Id}", id);
                return await _countryRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting country with ID {Id}", id);
                throw;
            }
        }
    }
}
