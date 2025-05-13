using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - More Grouping methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Groups daily actions by tracker
        /// </summary>
        private List<DailyActionDto> GroupByTracker(List<DailyActionDto> dailyActions)
        {
            // Since we don't have tracker information in the DailyAction model,
            // we'll create a single group for "Unknown" tracker
            _logger.LogInformation("Grouping by tracker with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Tracker",
                    GroupValue = "Unknown",
                    
                    // Aggregate metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    
                    // Deposit metrics
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    
                    // Cashout metrics
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),
                    
                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    
                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    
                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    
                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    
                    // Calculate GGR values
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                }
            };

            _logger.LogInformation("Grouped by tracker: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by currency
        /// </summary>
        private List<DailyActionDto> GroupByCurrency(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by currency with {Count} records", dailyActions.Count);

            // Now we have currency information in the DailyActionDto
            // Group by currency code
            var currencyGroups = dailyActions
                .GroupBy(da => da.CurrencyCode)
                .Where(g => !string.IsNullOrEmpty(g.Key)) // Skip unknown currencies
                .ToList();

            _logger.LogInformation("Creating {Count} currency groups", currencyGroups.Count);

            // Create a group for each currency
            var result = new List<DailyActionDto>();

            // Add a group for each currency
            foreach (var group in currencyGroups)
            {
                var currencyCode = group.Key;
                var currencyActions = group.ToList();

                _logger.LogInformation("Creating currency group for {Currency} with {Count} records",
                    currencyCode, currencyActions.Count);

                result.Add(new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Currency",
                    GroupValue = currencyCode,
                    
                    // Aggregate metrics
                    Registrations = currencyActions.Sum(da => da.Registrations),
                    FTD = currencyActions.Sum(da => da.FTD),
                    FTDA = currencyActions.Sum(da => da.FTDA),
                    
                    // Deposit metrics
                    Deposits = currencyActions.Sum(da => da.Deposits),
                    
                    // Cashout metrics
                    PaidCashouts = currencyActions.Sum(da => da.PaidCashouts),
                    
                    // Casino metrics
                    BetsCasino = currencyActions.Sum(da => da.BetsCasino),
                    WinsCasino = currencyActions.Sum(da => da.WinsCasino),
                    
                    // Sport metrics
                    BetsSport = currencyActions.Sum(da => da.BetsSport),
                    WinsSport = currencyActions.Sum(da => da.WinsSport),
                    
                    // Live metrics
                    BetsLive = currencyActions.Sum(da => da.BetsLive),
                    WinsLive = currencyActions.Sum(da => da.WinsLive),
                    
                    // Bingo metrics
                    BetsBingo = currencyActions.Sum(da => da.BetsBingo),
                    WinsBingo = currencyActions.Sum(da => da.WinsBingo),
                    
                    // Calculate GGR values
                    GGRCasino = currencyActions.Sum(da => da.BetsCasino) - currencyActions.Sum(da => da.WinsCasino),
                    GGRSport = currencyActions.Sum(da => da.BetsSport) - currencyActions.Sum(da => da.WinsSport),
                    GGRLive = currencyActions.Sum(da => da.BetsLive) - currencyActions.Sum(da => da.WinsLive),
                    GGRBingo = currencyActions.Sum(da => da.BetsBingo) - currencyActions.Sum(da => da.WinsBingo),
                    TotalGGR = currencyActions.Sum(da => da.TotalGGR)
                });
            }

            // If no groups were created, add a default "Unknown" group
            if (result.Count == 0)
            {
                result.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.UtcNow,
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Currency",
                    GroupValue = "Unknown",
                    
                    // Aggregate metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    
                    // Deposit metrics
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    
                    // Cashout metrics
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),
                    
                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    
                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    
                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    
                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    
                    // Calculate GGR values
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                });
            }

            _logger.LogInformation("Grouped by currency: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by gender
        /// </summary>
        private List<DailyActionDto> GroupByGender(List<DailyActionDto> dailyActions)
        {
            // Since we don't have gender information in the DailyAction model,
            // we'll create a single group for "Unknown" gender
            _logger.LogInformation("Grouping by gender with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Gender",
                    GroupValue = "Unknown",
                    
                    // Aggregate metrics
                    Registrations = dailyActions.Sum(da => da.Registrations),
                    FTD = dailyActions.Sum(da => da.FTD),
                    FTDA = dailyActions.Sum(da => da.FTDA),
                    
                    // Deposit metrics
                    Deposits = dailyActions.Sum(da => da.Deposits),
                    
                    // Cashout metrics
                    PaidCashouts = dailyActions.Sum(da => da.PaidCashouts),
                    
                    // Casino metrics
                    BetsCasino = dailyActions.Sum(da => da.BetsCasino),
                    WinsCasino = dailyActions.Sum(da => da.WinsCasino),
                    
                    // Sport metrics
                    BetsSport = dailyActions.Sum(da => da.BetsSport),
                    WinsSport = dailyActions.Sum(da => da.WinsSport),
                    
                    // Live metrics
                    BetsLive = dailyActions.Sum(da => da.BetsLive),
                    WinsLive = dailyActions.Sum(da => da.WinsLive),
                    
                    // Bingo metrics
                    BetsBingo = dailyActions.Sum(da => da.BetsBingo),
                    WinsBingo = dailyActions.Sum(da => da.WinsBingo),
                    
                    // Calculate GGR values
                    GGRCasino = dailyActions.Sum(da => da.BetsCasino) - dailyActions.Sum(da => da.WinsCasino),
                    GGRSport = dailyActions.Sum(da => da.BetsSport) - dailyActions.Sum(da => da.WinsSport),
                    GGRLive = dailyActions.Sum(da => da.BetsLive) - dailyActions.Sum(da => da.WinsLive),
                    GGRBingo = dailyActions.Sum(da => da.BetsBingo) - dailyActions.Sum(da => da.WinsBingo),
                    TotalGGR = dailyActions.Sum(da => da.TotalGGR)
                }
            };

            _logger.LogInformation("Grouped by gender: returning {Count} groups", result.Count);
            return result;
        }
    }
}
