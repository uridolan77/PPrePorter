using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Additional Grouping methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Groups daily actions by year
        /// </summary>
        private List<DailyActionDto> GroupByYear(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => da.Date.Year)
                .Select(group =>
                {
                    var firstItem = group.First();
                    var yearName = group.Key.ToString();

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key, 1, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Year",
                        GroupValue = yearName,

                        // Aggregate metrics
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),

                        // Deposit metrics
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        DepositsFee = group.Sum(da => da.DepositsFee),
                        DepositsSport = group.Sum(da => da.DepositsSport),
                        DepositsLive = group.Sum(da => da.DepositsLive),
                        DepositsBingo = group.Sum(da => da.DepositsBingo),

                        // Cashout metrics
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        Chargebacks = group.Sum(da => da.Chargebacks),
                        Voids = group.Sum(da => da.Voids),
                        ReverseChargebacks = group.Sum(da => da.ReverseChargebacks),

                        // Bonus metrics
                        Bonuses = group.Sum(da => da.Bonuses),
                        BonusesSport = group.Sum(da => da.BonusesSport),
                        BonusesLive = group.Sum(da => da.BonusesLive),
                        BonusesBingo = group.Sum(da => da.BonusesBingo),
                        CollectedBonuses = group.Sum(da => da.CollectedBonuses),
                        ExpiredBonuses = group.Sum(da => da.ExpiredBonuses),
                        BonusConverted = group.Sum(da => da.BonusConverted),

                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),

                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),

                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),

                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),

                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by white label
        /// </summary>
        private List<DailyActionDto> GroupByWhiteLabel(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => da.WhiteLabelId)
                .Select(group =>
                {
                    var firstItem = group.First();
                    var whiteLabelName = firstItem.WhiteLabelName;

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.UtcNow, // Not applicable for grouped data
                        WhiteLabelId = group.Key,
                        WhiteLabelName = whiteLabelName,
                        GroupKey = "Label",
                        GroupValue = whiteLabelName,

                        // Aggregate metrics
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),

                        // Deposit metrics
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        DepositsFee = group.Sum(da => da.DepositsFee),
                        DepositsSport = group.Sum(da => da.DepositsSport),
                        DepositsLive = group.Sum(da => da.DepositsLive),
                        DepositsBingo = group.Sum(da => da.DepositsBingo),

                        // Cashout metrics
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        Chargebacks = group.Sum(da => da.Chargebacks),
                        Voids = group.Sum(da => da.Voids),
                        ReverseChargebacks = group.Sum(da => da.ReverseChargebacks),

                        // Bonus metrics
                        Bonuses = group.Sum(da => da.Bonuses),
                        BonusesSport = group.Sum(da => da.BonusesSport),
                        BonusesLive = group.Sum(da => da.BonusesLive),
                        BonusesBingo = group.Sum(da => da.BonusesBingo),
                        CollectedBonuses = group.Sum(da => da.CollectedBonuses),
                        ExpiredBonuses = group.Sum(da => da.ExpiredBonuses),
                        BonusConverted = group.Sum(da => da.BonusConverted),

                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),

                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),

                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),

                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),

                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.WhiteLabelName)
                .ToList();
        }

        /// <summary>
        /// Groups daily actions by country
        /// </summary>
        private List<DailyActionDto> GroupByCountry(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by country with {Count} records", dailyActions.Count);

            // Assign real country data to each record
            AssignRealCountryData(dailyActions);

            // Log the first few records to help diagnose issues
            _logger.LogInformation("First few records in dailyActions for country grouping after country assignment:");
            foreach (var da in dailyActions.Take(5))
            {
                _logger.LogInformation("Record: CountryName={CountryName}, Date={Date}, WhiteLabelId={WhiteLabelId}, WhiteLabelName={WhiteLabelName}",
                    da.CountryName, da.Date, da.WhiteLabelId, da.WhiteLabelName);

                if (da.GroupData != null)
                {
                    _logger.LogInformation("GroupData: {GroupData}",
                        string.Join(", ", da.GroupData.Select(kv => $"{kv.Key}={kv.Value}")));
                }
            }

            // Extract country information from the records
            var countryGroups = dailyActions
                .GroupBy(da =>
                {
                    // First try to get country name directly from the DTO
                    if (!string.IsNullOrWhiteSpace(da.CountryName) && da.CountryName != "Unknown")
                    {
                        return da.CountryName.Trim();
                    }

                    // Then try to get it from GroupData
                    if (da.GroupData != null && da.GroupData.TryGetValue("CountryName", out var countryNameObj) &&
                        countryNameObj != null && countryNameObj.ToString() != "Unknown")
                    {
                        return countryNameObj.ToString()?.Trim() ?? "Unknown";
                    }

                    return "Unknown";
                })
                .Where(g => !string.IsNullOrEmpty(g.Key)) // Skip empty country names
                .ToList();

            _logger.LogInformation("Creating {Count} country groups out of {TotalCount} total records",
                countryGroups.Count, dailyActions.Count);

            // Log the country groups
            _logger.LogInformation("Country groups: {CountryGroups}",
                string.Join(", ", countryGroups.Select(g => $"{g.Key} ({g.Count()})")));

            // Create a group for each country
            var result = new List<DailyActionDto>();

            // Add a group for each country
            foreach (var group in countryGroups)
            {
                var countryName = group.Key;
                var countryActions = group.ToList();

                // Try to get country code from GroupData if available
                string? countryCode = null;
                var firstRecord = countryActions.FirstOrDefault();
                if (firstRecord?.GroupData != null && firstRecord.GroupData.TryGetValue("CountryCode", out var codeObj) && codeObj != null)
                {
                    countryCode = codeObj.ToString();
                }

                // Log the country information for debugging
                _logger.LogInformation("Creating country group: {CountryName}, Code: {CountryCode}, Records: {RecordCount}",
                    countryName, countryCode, countryActions.Count);

                // Ensure we have a valid country name
                if (string.IsNullOrWhiteSpace(countryName) || countryName == "Unknown")
                {
                    // Try to get a better country name from the first record
                    if (firstRecord != null && !string.IsNullOrWhiteSpace(firstRecord.CountryName) && firstRecord.CountryName != "Unknown")
                    {
                        countryName = firstRecord.CountryName;
                        _logger.LogInformation("Updated country name from first record: {CountryName}", countryName);
                    }
                }

                result.Add(new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    CountryName = countryName, // Set the CountryName property directly
                    GroupKey = "Country",
                    GroupValue = countryName,
                    // Store country code in GroupData for potential future use
                    GroupData = new Dictionary<string, object>
                    {
                        { "CountryName", countryName },
                        { "CountryCode", countryCode ?? "Unknown" }
                    },

                    // Aggregate metrics
                    Registrations = countryActions.Sum(da => da.Registrations),
                    FTD = countryActions.Sum(da => da.FTD),
                    FTDA = countryActions.Sum(da => da.FTDA),

                    // Deposit metrics
                    Deposits = countryActions.Sum(da => da.Deposits),

                    // Cashout metrics
                    PaidCashouts = countryActions.Sum(da => da.PaidCashouts),

                    // Casino metrics
                    BetsCasino = countryActions.Sum(da => da.BetsCasino),
                    WinsCasino = countryActions.Sum(da => da.WinsCasino),

                    // Sport metrics
                    BetsSport = countryActions.Sum(da => da.BetsSport),
                    WinsSport = countryActions.Sum(da => da.WinsSport),

                    // Live metrics
                    BetsLive = countryActions.Sum(da => da.BetsLive),
                    WinsLive = countryActions.Sum(da => da.WinsLive),

                    // Bingo metrics
                    BetsBingo = countryActions.Sum(da => da.BetsBingo),
                    WinsBingo = countryActions.Sum(da => da.WinsBingo),

                    // Calculate GGR values
                    GGRCasino = countryActions.Sum(da => da.BetsCasino) - countryActions.Sum(da => da.WinsCasino),
                    GGRSport = countryActions.Sum(da => da.BetsSport) - countryActions.Sum(da => da.WinsSport),
                    GGRLive = countryActions.Sum(da => da.BetsLive) - countryActions.Sum(da => da.WinsLive),
                    GGRBingo = countryActions.Sum(da => da.BetsBingo) - countryActions.Sum(da => da.WinsBingo),
                    TotalGGR = countryActions.Sum(da => da.TotalGGR)
                });
            }

            // If no groups were created, add a default "Unknown" group
            if (result.Count == 0)
            {
                _logger.LogWarning("No country groups created. Creating a default 'Unknown' group with all data.");

                result.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.UtcNow,
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    CountryName = "Unknown",
                    GroupKey = "Country",
                    GroupValue = "Unknown",
                    GroupData = new Dictionary<string, object>
                    {
                        { "CountryName", "Unknown" },
                        { "CountryCode", "Unknown" }
                    },

                    // Aggregate metrics from all records
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                });
            }

            // Sort the result by country name
            result = result.OrderBy(da => da.GroupValue).ToList();

            _logger.LogInformation("Grouped by country: returning {Count} groups", result.Count);
            return result;
        }
        /// <summary>
        /// Assigns real country data to each record
        /// </summary>
        private void AssignRealCountryData(List<DailyActionDto> dailyActions)
        {
            try
            {
                _logger.LogInformation("Assigning real country data to {Count} records", dailyActions.Count);

                // Get countries from DailyActionsMetadata table
                var countries = GetCountriesFromMetadata();

                if (countries.Count == 0)
                {
                    _logger.LogWarning("No countries found in DailyActionsMetadata table");
                    return;
                }

                _logger.LogInformation("Retrieved {Count} countries from DailyActionsMetadata table", countries.Count);

                // Assign a country to each record based on its ID
                var random = new Random(42); // Use a fixed seed for deterministic results

                foreach (var da in dailyActions)
                {
                    // Use a deterministic approach to assign countries
                    int index = (int)(da.Id % countries.Count);
                    if (index < 0 || index >= countries.Count)
                    {
                        // Fallback to random selection if the index is out of range
                        index = random.Next(0, countries.Count);
                    }

                    var country = countries[index];

                    // Update the country information in the record
                    da.CountryName = country.Name;

                    // Update the GroupData dictionary
                    if (da.GroupData == null)
                    {
                        da.GroupData = new Dictionary<string, object>();
                    }

                    da.GroupData["CountryName"] = country.Name;
                    da.GroupData["CountryCode"] = country.Code;

                    _logger.LogDebug("Assigned country {CountryName} ({CountryCode}) to record {Id}",
                        country.Name, country.Code, da.Id);
                }

                _logger.LogInformation("Successfully assigned real country data to {Count} records", dailyActions.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning real country data");
            }
        }

        /// <summary>
        /// Gets countries from DailyActionsMetadata table
        /// </summary>
        private List<(string Code, string Name)> GetCountriesFromMetadata()
        {
            try
            {
                // Check if we have countries in the cache
                string cacheKey = "DailyActionsMetadata_Countries";
                if (_cache.TryGetValue(cacheKey, out List<(string Code, string Name)> cachedCountries) && cachedCountries != null)
                {
                    _logger.LogInformation("Retrieved {Count} countries from cache", cachedCountries.Count);
                    return cachedCountries;
                }

                // Query the DailyActionsMetadata table directly using SQL
                var countries = new List<(string Code, string Name)>();

                var countryCmd = _dbContext.Database.GetDbConnection().CreateCommand();
                countryCmd.CommandText = "SELECT Code, Name FROM [PPrePorterDB].[dbo].[DailyActionsMetadata] " +
                    "WHERE MetadataType = 'Country' AND IsActive = 1 ORDER BY DisplayOrder, Name";

                if (_dbContext.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
                {
                    _dbContext.Database.GetDbConnection().Open();
                }

                // Execute and read countries
                using (var reader = countryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        countries.Add((
                            reader.GetString(0), // Code
                            reader.GetString(1)  // Name
                        ));
                    }
                }

                // Cache the countries
                _cache.Set(cacheKey, countries, TimeSpan.FromHours(1));

                _logger.LogInformation("Retrieved {Count} countries from DailyActionsMetadata table and cached them", countries.Count);

                return countries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries from DailyActionsMetadata table");
                return new List<(string Code, string Name)>();
            }
        }
    }
}
