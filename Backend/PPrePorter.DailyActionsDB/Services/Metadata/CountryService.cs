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
    /// Service for country operations using repository pattern
    /// </summary>
    public class CountryService : ICountryService
    {
        private readonly ICountryRepository _countryRepository;
        private readonly IDailyActionsMetadataRepository _metadataRepository;
        private readonly ILogger<CountryService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public CountryService(
            ICountryRepository countryRepository,
            IDailyActionsMetadataRepository metadataRepository,
            ILogger<CountryService> logger)
        {
            _countryRepository = countryRepository ?? throw new ArgumentNullException(nameof(countryRepository));
            _metadataRepository = metadataRepository ?? throw new ArgumentNullException(nameof(metadataRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Country>> GetAllCountriesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all countries from DailyActionsMetadata (includeInactive: {IncludeInactive})", includeInactive);

                // Get countries from the DailyActionsMetadata table
                var metadataCountries = await _metadataRepository.GetCountriesAsync(includeInactive);

                // Convert to Country entities
                var countries = metadataCountries.Select(m => new Country
                {
                    CountryID = m.Id,
                    CountryName = m.Name,
                    IsoCode = m.Code,
                    IsActive = m.IsActive
                }).ToList();

                _logger.LogInformation("Retrieved {Count} countries from DailyActionsMetadata", countries.Count);

                return countries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting countries from DailyActionsMetadata");

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for countries");
                try
                {
                    return await _countryRepository.GetAllAsync(includeInactive);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting countries from fallback repository");
                    throw;
                }
            }
        }

        /// <inheritdoc/>
        public async Task<Country?> GetCountryByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting country by ID {Id} from DailyActionsMetadata", id);

                // Get all countries from the DailyActionsMetadata table
                var metadataCountries = await _metadataRepository.GetCountriesAsync(true);

                // Find the country with the specified ID
                var metadataCountry = metadataCountries.FirstOrDefault(m => m.Id == id);

                if (metadataCountry != null)
                {
                    // Convert to Country entity
                    var country = new Country
                    {
                        CountryID = metadataCountry.Id,
                        CountryName = metadataCountry.Name,
                        IsoCode = metadataCountry.Code,
                        IsActive = metadataCountry.IsActive
                    };

                    _logger.LogInformation("Retrieved country with ID {Id} from DailyActionsMetadata", id);

                    return country;
                }

                _logger.LogWarning("Country with ID {Id} not found in DailyActionsMetadata", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting country by ID {Id} from DailyActionsMetadata", id);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for country with ID {Id}", id);
                try
                {
                    return await _countryRepository.GetByIdAsync(id);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting country by ID {Id} from fallback repository", id);
                    throw;
                }
            }
        }

        /// <inheritdoc/>
        public async Task<Country?> GetCountryByIsoCodeAsync(string isoCode)
        {
            try
            {
                _logger.LogInformation("Getting country by ISO code {IsoCode} from DailyActionsMetadata", isoCode);

                // Get all countries from the DailyActionsMetadata table
                var metadataCountries = await _metadataRepository.GetCountriesAsync(true);

                // Find the country with the specified ISO code
                var metadataCountry = metadataCountries.FirstOrDefault(m => m.Code == isoCode);

                if (metadataCountry != null)
                {
                    // Convert to Country entity
                    var country = new Country
                    {
                        CountryID = metadataCountry.Id,
                        CountryName = metadataCountry.Name,
                        IsoCode = metadataCountry.Code,
                        IsActive = metadataCountry.IsActive
                    };

                    _logger.LogInformation("Retrieved country with ISO code {IsoCode} from DailyActionsMetadata", isoCode);

                    return country;
                }

                _logger.LogWarning("Country with ISO code {IsoCode} not found in DailyActionsMetadata", isoCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting country by ISO code {IsoCode} from DailyActionsMetadata", isoCode);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for country with ISO code {IsoCode}", isoCode);
                try
                {
                    return await _countryRepository.GetByIsoCodeAsync(isoCode);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting country by ISO code {IsoCode} from fallback repository", isoCode);
                    throw;
                }
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
