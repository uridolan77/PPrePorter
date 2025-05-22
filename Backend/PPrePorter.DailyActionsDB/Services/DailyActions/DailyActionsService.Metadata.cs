using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MemoryCacheItemPriority = Microsoft.Extensions.Caching.Memory.CacheItemPriority;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Metadata-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <inheritdoc/>
        public async Task<DailyActionMetadataDto> GetDailyActionsMetadataAsync()
        {
            try
            {
                // Try to get metadata from cache first
                if (_cache.TryGetValue(METADATA_CACHE_KEY, out DailyActionMetadataDto? cachedMetadata) && cachedMetadata != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved daily actions metadata from cache, cache key: {CacheKey}", METADATA_CACHE_KEY);
                    return cachedMetadata;
                }

                _logger.LogWarning("CACHE MISS: Getting daily actions metadata from PPrePorterDB database, cache key: {CacheKey}", METADATA_CACHE_KEY);

                // Get white labels, countries, and currencies
                var whiteLabelDtos = await GetWhiteLabelsAsync();
                var countryDtos = await GetCountriesAsync();
                var currencyDtos = await GetCurrenciesAsync();

                // Get lookup data using the ILookupRepository
                var languageDtos = await GetLanguagesAsync();
                var platforms = await GetPlatformsAsync();
                var genders = await GetGendersAsync();
                var statuses = await GetStatusesAsync();
                var registrationPlayModes = await GetRegistrationPlayModesAsync();
                var trackers = await GetTrackersAsync();

                // Define group by options
                var groupByOptions = GetGroupByOptions();

                // Create metadata response
                var metadata = new DailyActionMetadataDto
                {
                    WhiteLabels = whiteLabelDtos,
                    Countries = countryDtos,
                    Currencies = currencyDtos,
                    Languages = languageDtos,
                    Platforms = platforms.Where(p => p != null).Select(p => p!).ToList(),
                    Genders = genders.Where(g => g != null).Select(g => g!).ToList(),
                    Statuses = statuses.Where(s => s != null).Select(s => s!).ToList(),
                    PlayerTypes = new List<string> { "Real", "Fun" },
                    RegistrationPlayModes = registrationPlayModes.Where(r => r != null).Select(r => r!).ToList(),
                    Trackers = trackers.Where(t => t != null).Select(t => t!).ToList(),
                    GroupByOptions = groupByOptions
                };

                // Cache the result
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetPriority(MemoryCacheItemPriority.High)
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(METADATA_CACHE_KEY, metadata, cacheOptions);
                _logger.LogInformation("Cached daily actions metadata with key: {CacheKey}", METADATA_CACHE_KEY);

                return metadata;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions metadata");
                return CreateFallbackMetadata();
            }
        }

        private DailyActionMetadataDto CreateFallbackMetadata()
        {
            return new DailyActionMetadataDto
            {
                WhiteLabels = new List<WhiteLabelDto>(),
                Countries = new List<CountryDto>(),
                Currencies = new List<CurrencyDto>(),
                Languages = new List<LanguageDto>(),
                Platforms = new List<string>(),
                Genders = new List<string> { "Male", "Female", "Other" },
                Statuses = new List<string> { "Active", "Inactive", "Blocked" },
                PlayerTypes = new List<string> { "Real", "Fun" },
                RegistrationPlayModes = new List<string> { "Real", "Fun" },
                Trackers = new List<string>(),
                GroupByOptions = new List<GroupByOptionDto>
                {
                    new() { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                    new() { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                    new() { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" }
                }
            };
        }

        private List<GroupByOptionDto> GetGroupByOptions()
        {
            return new List<GroupByOptionDto>
            {
                new GroupByOptionDto { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                new GroupByOptionDto { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                new GroupByOptionDto { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" },
                new GroupByOptionDto { Id = (int)GroupByOption.Label, Name = "Label", Value = "Label" },
                new GroupByOptionDto { Id = (int)GroupByOption.Country, Name = "Country", Value = "Country" },
                new GroupByOptionDto { Id = (int)GroupByOption.Currency, Name = "Currency", Value = "Currency" },
                new GroupByOptionDto { Id = (int)GroupByOption.Gender, Name = "Gender", Value = "Gender" },
                new GroupByOptionDto { Id = (int)GroupByOption.Platform, Name = "Platform", Value = "Platform" },
                new GroupByOptionDto { Id = (int)GroupByOption.Tracker, Name = "Tracker", Value = "Tracker" },
                new GroupByOptionDto { Id = (int)GroupByOption.Ranking, Name = "Ranking", Value = "Ranking" },
                new GroupByOptionDto { Id = (int)GroupByOption.Player, Name = "Player", Value = "Player" }
            };
        }
    }
}
