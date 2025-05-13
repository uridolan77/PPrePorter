using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Final Grouping methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Groups daily actions by platform
        /// </summary>
        private List<DailyActionDto> GroupByPlatform(List<DailyActionDto> dailyActions)
        {
            // Since we don't have platform information in the DailyAction model,
            // we'll create a single group for "Unknown" platform
            _logger.LogInformation("Grouping by platform with {Count} records", dailyActions.Count);

            // Create a default group for all data
            var result = new List<DailyActionDto>
            {
                new DailyActionDto
                {
                    Id = 0, // Not applicable for grouped data
                    Date = DateTime.UtcNow, // Not applicable for grouped data
                    WhiteLabelId = 0, // Not applicable for grouped data
                    WhiteLabelName = "All White Labels",
                    GroupKey = "Platform",
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

            _logger.LogInformation("Grouped by platform: returning {Count} groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by ranking
        /// </summary>
        private List<DailyActionDto> GroupByRanking(List<DailyActionDto> dailyActions)
        {
            // For ranking, we'll sort by total GGR and add a rank
            var rankedData = dailyActions
                .OrderByDescending(da => da.TotalGGR)
                .Select((da, index) =>
                {
                    var rankValue = (index + 1).ToString();
                    
                    return new DailyActionDto
                    {
                        Id = da.Id,
                        Date = da.Date,
                        WhiteLabelId = da.WhiteLabelId,
                        WhiteLabelName = da.WhiteLabelName,
                        PlayerId = da.PlayerId,
                        PlayerName = da.PlayerName,
                        CountryName = da.CountryName,
                        CurrencyCode = da.CurrencyCode,
                        GroupKey = "Ranking",
                        GroupValue = rankValue,
                        
                        // Copy all metrics from the original DTO
                        Registrations = da.Registrations,
                        FTD = da.FTD,
                        FTDA = da.FTDA,
                        Deposits = da.Deposits,
                        PaidCashouts = da.PaidCashouts,
                        BetsCasino = da.BetsCasino,
                        WinsCasino = da.WinsCasino,
                        BetsSport = da.BetsSport,
                        WinsSport = da.WinsSport,
                        BetsLive = da.BetsLive,
                        WinsLive = da.WinsLive,
                        BetsBingo = da.BetsBingo,
                        WinsBingo = da.WinsBingo,
                        GGRCasino = da.GGRCasino,
                        GGRSport = da.GGRSport,
                        GGRLive = da.GGRLive,
                        GGRBingo = da.GGRBingo,
                        TotalGGR = da.TotalGGR
                    };
                })
                .ToList();

            _logger.LogInformation("Grouped by ranking: returning {Count} groups", rankedData.Count);
            return rankedData;
        }

        /// <summary>
        /// Groups daily actions by player
        /// </summary>
        private List<DailyActionDto> GroupByPlayer(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by player with {Count} records", dailyActions.Count);

            // Group by player ID if available
            var playerGroups = new List<DailyActionDto>();

            // Get all daily actions with player IDs
            var actionsWithPlayerIds = dailyActions.Where(da => da.PlayerId.HasValue).ToList();

            if (actionsWithPlayerIds.Count > 0)
            {
                _logger.LogInformation("Found {Count} records with player IDs", actionsWithPlayerIds.Count);

                // Group by player ID
                var playerIdGroups = actionsWithPlayerIds
                    .GroupBy(da => da.PlayerId!.Value)
                    .ToList();

                _logger.LogInformation("Created {Count} player groups", playerIdGroups.Count);

                // Create a group for each player
                foreach (var group in playerIdGroups)
                {
                    var playerId = group.Key;
                    var playerName = $"Player {playerId}";

                    // Try to get player name from the first record
                    var firstRecord = group.FirstOrDefault();
                    if (firstRecord != null && !string.IsNullOrEmpty(firstRecord.PlayerName))
                    {
                        playerName = firstRecord.PlayerName;
                    }

                    playerGroups.Add(new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.MinValue, // Set to MinValue to avoid displaying date
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        PlayerId = playerId,
                        PlayerName = playerName,
                        GroupKey = "Player",
                        GroupValue = playerName,
                        
                        // Aggregate metrics
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        
                        // Deposit metrics
                        Deposits = group.Sum(da => da.Deposits),
                        
                        // Cashout metrics
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        
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
                    });
                }

                _logger.LogInformation("Grouped by player: returning {Count} groups", playerGroups.Count);
                return playerGroups;
            }
            else
            {
                _logger.LogWarning("No records with player IDs found. Returning empty list.");
                return new List<DailyActionDto>();
            }
        }
    }
}
