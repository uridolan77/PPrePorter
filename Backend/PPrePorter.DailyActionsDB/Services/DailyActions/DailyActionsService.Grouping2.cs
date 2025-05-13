using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
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

            // Group by country name
            var countryGroups = dailyActions
                .GroupBy(da => da.CountryName)
                .Where(g => !string.IsNullOrEmpty(g.Key)) // Skip unknown countries
                .ToList();

            _logger.LogInformation("Creating {Count} country groups", countryGroups.Count);

            // Create a group for each country
            var result = new List<DailyActionDto>();

            // Add a group for each country
            foreach (var group in countryGroups)
            {
                var countryName = group.Key;
                var countryActions = group.ToList();

                // Get the white label name from the first record (not relevant for country grouping)
                var whiteLabelName = "All White Labels";

                result.Add(new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = whiteLabelName,
                    GroupKey = "Country",
                    GroupValue = countryName,
                    
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
                result.Add(new DailyActionDto
                {
                    Id = 0,
                    Date = DateTime.UtcNow,
                    WhiteLabelId = 0,
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Country",
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

            _logger.LogInformation("Grouped by country: returning {Count} groups", result.Count);
            return result;
        }
    }
}
