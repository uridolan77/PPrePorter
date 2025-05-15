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

                // Get white labels from the metadata service if available, otherwise from the database
                List<WhiteLabelDto> whiteLabelDtos = new List<WhiteLabelDto>();
                List<CountryDto> countryDtos = new List<CountryDto>();
                List<CurrencyDto> currencyDtos = new List<CurrencyDto>();

                if (_metadataService != null)
                {
                    try
                    {
                        // Get white labels from metadata service
                        var whiteLabelsMetadata = await _metadataService.GetMetadataByTypeAsync("WhiteLabel", true);
                        whiteLabelDtos = whiteLabelsMetadata.Select(wl => new WhiteLabelDto
                        {
                            Id = wl.Id,
                            Name = wl.Name,
                            Code = wl.Code,
                            IsActive = wl.IsActive
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} white labels from metadata service", whiteLabelDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving white labels from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                    whiteLabelDtos = whiteLabels.Select(wl => new WhiteLabelDto
                    {
                        Id = wl.Id,
                        Name = wl.Name,
                        Code = wl.Code,
                        IsActive = wl.IsActive ?? false
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} white labels from database", whiteLabelDtos.Count);
                }

                // Get countries from the metadata service if available, otherwise from the database
                if (_metadataService != null)
                {
                    try
                    {
                        // Get countries from metadata service
                        var countriesMetadata = await _metadataService.GetMetadataByTypeAsync("Country", true);
                        countryDtos = countriesMetadata.Select(c => new CountryDto
                        {
                            Id = c.Id,
                            Name = c.Name,
                            IsoCode = c.Code
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} countries from metadata service", countryDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving countries from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var countries = await _dbContext.Countries
                        .AsNoTracking()
                        .Where(c => c.IsActive == true)
                        .OrderBy(c => c.CountryName)
                        .ToListAsync();

                    countryDtos = countries.Select(c => new CountryDto
                    {
                        Id = c.CountryID,
                        Name = c.CountryName,
                        IsoCode = c.IsoCode
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} countries from database", countryDtos.Count);
                }

                // Get currencies from the metadata service if available, otherwise from the database
                if (_metadataService != null)
                {
                    try
                    {
                        // Get currencies from metadata service
                        var currenciesMetadata = await _metadataService.GetMetadataByTypeAsync("Currency", true);
                        currencyDtos = currenciesMetadata.Select(c => new CurrencyDto
                        {
                            Id = (byte)c.Id, // Explicit cast from int to byte
                            Name = c.Name,
                            Code = c.Code,
                            Symbol = c.AdditionalData
                        }).ToList();

                        _logger.LogInformation("Retrieved {Count} currencies from metadata service", currencyDtos.Count);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving currencies from metadata service. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to database
                    var currencies = await _dbContext.Currencies
                        .AsNoTracking()
                        .OrderBy(c => c.CurrencyName)
                        .ToListAsync();

                    currencyDtos = currencies.Select(c => new CurrencyDto
                    {
                        Id = c.CurrencyID,
                        Name = c.CurrencyName,
                        Code = c.CurrencyCode,
                        Symbol = c.CurrencySymbol
                    }).ToList();

                    _logger.LogInformation("Retrieved {Count} currencies from database", currencyDtos.Count);
                }

                // Check if we have a metadata service
                List<LanguageDto> languageDtos = new List<LanguageDto>();
                List<string> platforms = new List<string>();
                List<string> genders = new List<string>();
                List<string> statuses = new List<string>();
                List<string> registrationPlayModes = new List<string>();
                List<string> trackers = new List<string>();

                if (_metadataService != null)
                {
                    try
                    {
                        // Get metadata from the Infrastructure's MetadataService
                        // This will use the DailyActionsMetadata table in PPrePorterDB
                        _logger.LogInformation("Getting metadata from PPrePorterDB.DailyActionsMetadata table");

                        try
                        {
                            // Get languages from metadata
                            var languageMetadata = await _metadataService.GetMetadataByTypeAsync("Language");
                            languageDtos = languageMetadata.Select((l, i) => new LanguageDto
                            {
                                Id = l.Id,
                                Name = l.Name,
                                Code = l.Code
                            }).ToList();
                            _logger.LogInformation("Retrieved {Count} languages from metadata service", languageDtos.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving languages from metadata service");
                            languageDtos = new List<LanguageDto>();
                        }

                        try
                        {
                            // Get platforms from metadata
                            var platformMetadata = await _metadataService.GetMetadataByTypeAsync("Platform");
                            platforms = platformMetadata.Select(p => p.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} platforms from metadata service", platforms.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving platforms from metadata service");
                            platforms = new List<string>();
                        }

                        try
                        {
                            // Get genders from metadata
                            var genderMetadata = await _metadataService.GetMetadataByTypeAsync("Gender");
                            genders = genderMetadata.Select(g => g.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} genders from metadata service", genders.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving genders from metadata service");
                            genders = new List<string> { "Male", "Female", "Other" };
                        }

                        try
                        {
                            // Get statuses from metadata
                            var statusMetadata = await _metadataService.GetMetadataByTypeAsync("Status");
                            statuses = statusMetadata.Select(s => s.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} statuses from metadata service", statuses.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving statuses from metadata service");
                            statuses = new List<string> { "Active", "Inactive", "Blocked" };
                        }

                        try
                        {
                            // Get registration play modes from metadata
                            var registrationPlayModeMetadata = await _metadataService.GetMetadataByTypeAsync("RegistrationPlayMode");
                            registrationPlayModes = registrationPlayModeMetadata.Select(r => r.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} registration play modes from metadata service", registrationPlayModes.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving registration play modes from metadata service");
                            registrationPlayModes = new List<string> { "Real", "Fun" };
                        }

                        try
                        {
                            // Get trackers from metadata
                            var trackerMetadata = await _metadataService.GetMetadataByTypeAsync("Tracker");
                            trackers = trackerMetadata.Select(t => t.Code).ToList();
                            _logger.LogInformation("Retrieved {Count} trackers from metadata service", trackers.Count);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error retrieving trackers from metadata service");
                            trackers = new List<string>();
                        }

                        _logger.LogInformation("Retrieved metadata from PPrePorterDB.DailyActionsMetadata table");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving metadata from PPrePorterDB.DailyActionsMetadata table. Will fall back to database.");
                        // Continue to fallback
                    }
                }
                else
                {
                    // Fallback to using the DailyActionsMetadata table directly
                    _logger.LogWarning("No metadata service available, using DailyActionsMetadata table directly");

                    try
                    {
                        // Query the DailyActionsMetadata table directly
                        _logger.LogInformation("Querying [PPrePorterDB].[dbo].[DailyActionsMetadata] table directly");

                        // For languages - we'll use direct SQL commands for all metadata

                        // Create a command to get languages
                        var languageCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        languageCmd.CommandText = "SELECT Id, Code, Name FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'Language' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        if (_dbContext.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
                        {
                            await _dbContext.Database.GetDbConnection().OpenAsync();
                        }

                        // Execute and read languages
                        using (var reader = await languageCmd.ExecuteReaderAsync())
                        {
                            languageDtos = new List<LanguageDto>();
                            while (await reader.ReadAsync())
                            {
                                languageDtos.Add(new LanguageDto
                                {
                                    Id = reader.GetInt32(0),
                                    Code = reader.GetString(1),
                                    Name = reader.GetString(2)
                                });
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} languages from DailyActionsMetadata table", languageDtos.Count);

                        // For platforms
                        var platformCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        platformCmd.CommandText = "SELECT Code FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'Platform' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        using (var reader = await platformCmd.ExecuteReaderAsync())
                        {
                            platforms = new List<string>();
                            while (await reader.ReadAsync())
                            {
                                platforms.Add(reader.GetString(0));
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} platforms from DailyActionsMetadata table", platforms.Count);

                        // For genders
                        var genderCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        genderCmd.CommandText = "SELECT Code FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'Gender' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        using (var reader = await genderCmd.ExecuteReaderAsync())
                        {
                            genders = new List<string>();
                            while (await reader.ReadAsync())
                            {
                                genders.Add(reader.GetString(0));
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} genders from DailyActionsMetadata table", genders.Count);

                        // For statuses
                        var statusCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        statusCmd.CommandText = "SELECT Code FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'Status' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        using (var reader = await statusCmd.ExecuteReaderAsync())
                        {
                            statuses = new List<string>();
                            while (await reader.ReadAsync())
                            {
                                statuses.Add(reader.GetString(0));
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} statuses from DailyActionsMetadata table", statuses.Count);

                        // For registration play modes
                        var registrationPlayModeCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        registrationPlayModeCmd.CommandText = "SELECT Code FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'RegistrationPlayMode' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        using (var reader = await registrationPlayModeCmd.ExecuteReaderAsync())
                        {
                            registrationPlayModes = new List<string>();
                            while (await reader.ReadAsync())
                            {
                                registrationPlayModes.Add(reader.GetString(0));
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} registration play modes from DailyActionsMetadata table", registrationPlayModes.Count);

                        // For trackers
                        var trackerCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                        trackerCmd.CommandText = "SELECT Code FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                            "WHERE MetadataType = 'Tracker' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                        using (var reader = await trackerCmd.ExecuteReaderAsync())
                        {
                            trackers = new List<string>();
                            while (await reader.ReadAsync())
                            {
                                trackers.Add(reader.GetString(0));
                            }
                        }
                        _logger.LogInformation("Retrieved {Count} trackers from DailyActionsMetadata table", trackers.Count);

                        _logger.LogInformation("Successfully retrieved all metadata from DailyActionsMetadata table");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error querying DailyActionsMetadata table directly. Using fallback values.");

                        // Fallback values
                        languageDtos = new List<LanguageDto>
                        {
                            new LanguageDto { Id = 1, Code = "English", Name = "English" },
                            new LanguageDto { Id = 2, Code = "German", Name = "German" },
                            new LanguageDto { Id = 3, Code = "French", Name = "French" }
                        };

                        platforms = new List<string> { "WEB", "MOBILE" };
                        genders = new List<string> { "Male", "Female" };
                        statuses = new List<string> { "Active", "Inactive", "Blocked" };
                        registrationPlayModes = new List<string> { "Casino", "Sport", "Live", "Bingo" };
                        trackers = new List<string>();
                    }
                }

                // Define group by options
                var groupByOptions = new List<GroupByOptionDto>
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

                // Create a minimal fallback metadata object
                var fallbackMetadata = new DailyActionMetadataDto
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

                return fallbackMetadata;
            }
        }
    }
}
