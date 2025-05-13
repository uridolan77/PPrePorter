using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Extensions;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Models.Players;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using static PPrePorter.DailyActionsDB.Extensions.SqlNoLockExtensions;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Query-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <inheritdoc/>
        public async Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(DailyActionFilterDto filter)
        {
            try
            {
                _logger.LogInformation("Getting filtered daily actions with parameters: {@Filter}", filter);

                // Default date range to last 30 days if not specified
                var today = DateTime.UtcNow.Date;
                var startDate = filter.StartDate?.Date ?? today.AddDays(-30);
                var endDate = filter.EndDate?.Date ?? today;

                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1); // End of the day

                _logger.LogInformation("Normalized date range for query: {StartDate} 00:00:00 to {EndDate} 23:59:59.9999999",
                    start.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Compute a hash of the filter for caching
                var filterHash = ComputeFilterHash(filter);
                var cacheKey = $"{CACHE_KEY_PREFIX}Filter_{filterHash}";

                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out DailyActionResponseDto? cachedResponse) && cachedResponse != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved filtered daily actions from cache with hash {FilterHash}, cache key: {CacheKey}",
                        filterHash, cacheKey);
                    return cachedResponse;
                }

                _logger.LogWarning("CACHE MISS: Getting filtered daily actions from database with hash {FilterHash}, cache key: {CacheKey}", filterHash, cacheKey);

                // Calculate date range span in days
                var daySpan = (end.Date - start.Date).Days + 1;

                // No record limit - retrieve all records for the date range
                _logger.LogInformation("Retrieving all records for date range spanning {DaySpan} days", daySpan);

                _logger.LogInformation("Using optimized query with INNER JOINs and NOLOCK hints");

                // Build base query with NOLOCK hint and include joins with Player, WhiteLabel, Country, and Currency
                // Using INNER JOINs with direct column relationships and explicit NOLOCK hints
                // Select only the fields we actually need
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .AsSingleQuery() // Force single query mode
                    .WithSqlNoLock() // Force NOLOCK hints on all tables
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    query = query.Where(da => da.WhiteLabelID.HasValue && filter.WhiteLabelIds.Contains((int)da.WhiteLabelID.Value));
                    _logger.LogInformation("Applied white label filter: WhiteLabelIDs = {WhiteLabelIds}", string.Join(", ", filter.WhiteLabelIds));
                }
                else
                {
                    _logger.LogInformation("No white label filter applied, retrieving data for all white labels");
                }

                // Apply player filter if specified
                if (filter.PlayerIds != null && filter.PlayerIds.Count > 0)
                {
                    query = query.Where(da => da.PlayerID.HasValue && filter.PlayerIds.Contains(da.PlayerID.Value));
                    _logger.LogInformation("Applied player filter: PlayerIDs = {PlayerIds}", string.Join(", ", filter.PlayerIds));
                }
                else
                {
                    _logger.LogInformation("No player filter applied, retrieving data for all players");
                }

                // Define variables outside the if/else blocks
                var joinedResults = new List<(DailyAction DailyAction, Player? Player, WhiteLabel? WhiteLabel, Country? Country, Currency? Currency)>();
                int pageSize = Math.Max(1, filter.PageSize);
                int pageNumber = Math.Max(1, filter.PageNumber);

                // Apply ordering but no limits
                query = query
                    .OrderBy(x => x.Date)
                    .ThenBy(x => x.WhiteLabelID);

                // Select only the columns we need for grouping to reduce data transfer
                IQueryable<DailyAction> optimizedQuery;

                // If grouping is requested, perform it in the database query
                if (filter.GroupBy != 0 && filter.GroupBy != GroupByOption.Player)
                {
                    // Define the grouping key based on the GroupBy option
                    optimizedQuery = filter.GroupBy switch
                    {
                        GroupByOption.Day => query
                            .GroupBy(da => da.Date.Date)
                            .Select(g => new DailyAction
                            {
                                Date = g.Key,
                                Registration = (byte?)(short?)g.Sum(da => da.Registration ?? 0),
                                FTD = (byte?)(short?)g.Sum(da => da.FTD ?? 0),
                                FTDA = (byte?)(short?)g.Sum(da => da.FTDA ?? 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            }),

                        GroupByOption.Month => query
                            .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                            .Select(g => new DailyAction
                            {
                                Date = new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                                Registration = (byte?)(short?)g.Sum(da => da.Registration ?? 0),
                                FTD = (byte?)(short?)g.Sum(da => da.FTD ?? 0),
                                FTDA = (byte?)(short?)g.Sum(da => da.FTDA ?? 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            }),

                        GroupByOption.Year => query
                            .GroupBy(da => da.Date.Year)
                            .Select(g => new DailyAction
                            {
                                Date = new DateTime(g.Key, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                                Registration = (byte?)(short?)g.Sum(da => da.Registration ?? 0),
                                FTD = (byte?)(short?)g.Sum(da => da.FTD ?? 0),
                                FTDA = (byte?)(short?)g.Sum(da => da.FTDA ?? 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            }),

                        GroupByOption.Label => query
                            .GroupBy(da => da.WhiteLabelID)
                            .Select(g => new DailyAction
                            {
                                WhiteLabelID = g.Key,
                                Registration = (byte?)(short?)g.Sum(da => da.Registration ?? 0),
                                FTD = (byte?)(short?)g.Sum(da => da.FTD ?? 0),
                                FTDA = (byte?)(short?)g.Sum(da => da.FTDA ?? 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            }),

                        _ => query.Select(da => new DailyAction
                        {
                            Id = da.Id,
                            Date = da.Date,
                            WhiteLabelID = da.WhiteLabelID,
                            PlayerID = da.PlayerID,
                            Registration = da.Registration,
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
                            WinsBingo = da.WinsBingo
                        })
                    };
                }
                else
                {
                    // Select only the columns we need for grouping to reduce data transfer
                    optimizedQuery = query.Select(da => new DailyAction
                    {
                        Id = da.Id,
                        Date = da.Date,
                        WhiteLabelID = da.WhiteLabelID,
                        PlayerID = da.PlayerID,
                        Registration = da.Registration,
                        FTD = da.FTD,
                        FTDA = da.FTDA,
                        Deposits = da.Deposits,
                        DepositsCreditCard = da.DepositsCreditCard,
                        DepositsNeteller = da.DepositsNeteller,
                        DepositsMoneyBookers = da.DepositsMoneyBookers,
                        DepositsOther = da.DepositsOther,
                        CashoutRequests = da.CashoutRequests,
                        PaidCashouts = da.PaidCashouts,
                        Chargebacks = da.Chargebacks,
                        Voids = da.Voids,
                        ReverseChargebacks = da.ReverseChargebacks,
                        Bonuses = da.Bonuses,
                        CollectedBonuses = da.CollectedBonuses,
                        ExpiredBonuses = da.ExpiredBonuses,
                        BetsCasino = da.BetsCasino,
                        WinsCasino = da.WinsCasino,
                        BetsSport = da.BetsSport,
                        WinsSport = da.WinsSport,
                        BetsLive = da.BetsLive,
                        WinsLive = da.WinsLive,
                        BetsBingo = da.BetsBingo,
                        WinsBingo = da.WinsBingo
                    });
                }

                // Get the SQL query string for logging (only log a short version)
                var queryString = optimizedQuery.ToString();
                if (queryString.Length > 500)
                {
                    queryString = queryString.Substring(0, 500) + "...";
                }
                _logger.LogInformation("EXECUTING SQL QUERY: {SqlQuery}", queryString);

                // Execute the query once to get all data
                _logger.LogInformation("Retrieving records for date range {StartDate} to {EndDate}",
                    start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"));

                // Use Entity Framework with NOLOCK hints
                List<DailyAction> results;

                // Log the grouping option being used
                _logger.LogInformation("Using Entity Framework with NOLOCK hints for query with GroupBy={GroupBy}", filter.GroupBy);

                // Build the query with NOLOCK hint
                var dailyActionsQuery = _dbContext.DailyActions
                    .AsNoTracking()
                    .WithSqlNoLock()
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    dailyActionsQuery = dailyActionsQuery.Where(da => filter.WhiteLabelIds.Contains((int)(da.WhiteLabelID ?? 0)));
                }

                // Apply grouping based on the selected option
                IQueryable<DailyAction> groupedQuery;

                switch (filter.GroupBy)
                {
                    case GroupByOption.Day:
                        groupedQuery = dailyActionsQuery
                            .GroupBy(da => da.Date.Date)
                            .Select(g => new DailyAction
                            {
                                Date = g.Key,
                                Registration = g.Sum(da => da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0),
                                FTD = g.Sum(da => da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0),
                                FTDA = g.Sum(da => da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            });
                        break;

                    case GroupByOption.Month:
                        groupedQuery = dailyActionsQuery
                            .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                            .Select(g => new DailyAction
                            {
                                Date = new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                                Registration = g.Sum(da => da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0),
                                FTD = g.Sum(da => da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0),
                                FTDA = g.Sum(da => da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            });
                        break;

                    case GroupByOption.Year:
                        groupedQuery = dailyActionsQuery
                            .GroupBy(da => da.Date.Year)
                            .Select(g => new DailyAction
                            {
                                Date = new DateTime(g.Key, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                                Registration = g.Sum(da => da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0),
                                FTD = g.Sum(da => da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0),
                                FTDA = g.Sum(da => da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            });
                        break;

                    case GroupByOption.Label:
                        groupedQuery = dailyActionsQuery
                            .GroupBy(da => da.WhiteLabelID)
                            .Select(g => new DailyAction
                            {
                                WhiteLabelID = g.Key,
                                Registration = g.Sum(da => da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0),
                                FTD = g.Sum(da => da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0),
                                FTDA = g.Sum(da => da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            });
                        break;

                    case GroupByOption.Player:
                        groupedQuery = dailyActionsQuery
                            .GroupBy(da => da.PlayerID)
                            .Select(g => new DailyAction
                            {
                                PlayerID = g.Key,
                                Registration = g.Sum(da => da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0),
                                FTD = g.Sum(da => da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0),
                                FTDA = g.Sum(da => da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : 0),
                                Deposits = g.Sum(da => da.Deposits ?? 0),
                                PaidCashouts = g.Sum(da => da.PaidCashouts ?? 0),
                                BetsCasino = g.Sum(da => da.BetsCasino ?? 0),
                                WinsCasino = g.Sum(da => da.WinsCasino ?? 0),
                                BetsSport = g.Sum(da => da.BetsSport ?? 0),
                                WinsSport = g.Sum(da => da.WinsSport ?? 0),
                                BetsLive = g.Sum(da => da.BetsLive ?? 0),
                                WinsLive = g.Sum(da => da.WinsLive ?? 0),
                                BetsBingo = g.Sum(da => da.BetsBingo ?? 0),
                                WinsBingo = g.Sum(da => da.WinsBingo ?? 0)
                            });
                        break;

                    default:
                        // Default to no grouping
                        groupedQuery = dailyActionsQuery;
                        break;
                }

                // Execute the query with NOLOCK hint
                _logger.LogInformation("Executing query with NOLOCK hint");
                results = await groupedQuery.ToListWithSqlNoLock();

                // Get total count from the results (no need for a separate query)
                int resultCount = results.Count;
                _logger.LogInformation("Total count of records: {TotalCount}", resultCount);

                // Convert to our tuple format with the optimized projection
                joinedResults = results.Select(r => (
                    r,
                    (Player?)null, // We're not using the full Player object anymore
                    (WhiteLabel?)null, // We're not using the full WhiteLabel object anymore
                    (Country?)null, // We're not using the full Country object anymore
                    (Currency?)null // We're not using the full Currency object anymore
                )).ToList();

                // Get white labels for mapping names - use caching to avoid repeated database calls
                string whiteLabelCacheKey = "AllWhiteLabels_True";
                if (!_cache.TryGetValue(whiteLabelCacheKey, out List<WhiteLabel>? cachedWhiteLabels) || cachedWhiteLabels == null)
                {
                    var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                    cachedWhiteLabels = whiteLabels.ToList();
                    _cache.Set(whiteLabelCacheKey, cachedWhiteLabels, TimeSpan.FromHours(1));
                    _logger.LogInformation("Retrieved {Count} white labels from database and cached them", cachedWhiteLabels.Count);
                }
                else
                {
                    _logger.LogInformation("Retrieved {Count} white labels from cache", cachedWhiteLabels.Count);
                }

                var whiteLabelDict = cachedWhiteLabels.ToDictionary(wl => wl.Code, wl => wl.Name);

                // Map to DTOs
                var mappedDailyActions = joinedResults.Select(result =>
                {
                    var da = result.DailyAction;

                    // Get the WhiteLabel ID and name from our projection
                    int whiteLabelId = 0;
                    string whiteLabelName = "Unknown";

                    if (da.WhiteLabelID.HasValue)
                    {
                        whiteLabelId = (int)da.WhiteLabelID.Value;
                        // The WhiteLabelID in DailyAction is actually the Code field, not the Id field
                        string whiteLabelCode = whiteLabelId.ToString();
                        if (whiteLabelDict.TryGetValue(whiteLabelCode, out var name))
                        {
                            whiteLabelName = name;
                        }
                        else
                        {
                            _logger.LogWarning("White label Code {WhiteLabelCode} not found in dictionary", whiteLabelCode);
                        }
                    }

                    // Get player information from our projection
                    string playerName = da.PlayerID.HasValue ? $"Player {da.PlayerID}" : "Unknown";

                    // Get country information from our projection
                    string countryName = "Unknown";

                    // Get currency information from our projection
                    string currencyCode = "Unknown";

                    return new DailyActionDto
                    {
                        Id = (int)da.Id,
                        Date = da.Date,
                        WhiteLabelId = whiteLabelId,
                        WhiteLabelName = whiteLabelName,
                        PlayerId = da.PlayerID,
                        PlayerName = playerName,
                        CountryName = countryName,
                        CurrencyCode = currencyCode,
                        Registrations = da.Registration.HasValue ? Convert.ToInt32(da.Registration.Value) : 0,
                        FTD = da.FTD.HasValue ? Convert.ToInt32(da.FTD.Value) : 0,
                        FTDA = da.FTDA.HasValue ? Convert.ToInt32(da.FTDA.Value) : null,

                        // Deposit-related properties
                        Deposits = da.Deposits ?? 0,
                        DepositsCreditCard = da.DepositsCreditCard,
                        DepositsNeteller = da.DepositsNeteller,
                        DepositsMoneyBookers = da.DepositsMoneyBookers,
                        DepositsOther = da.DepositsOther,
                        DepositsFee = da.DepositsFee,
                        DepositsSport = da.DepositsSport,
                        DepositsLive = da.DepositsLive,
                        DepositsBingo = da.DepositsBingo,

                        // Cashout-related properties
                        CashoutRequests = da.CashoutRequests,
                        PaidCashouts = da.PaidCashouts ?? 0,
                        Chargebacks = da.Chargebacks,
                        Voids = da.Voids,
                        ReverseChargebacks = da.ReverseChargebacks,

                        // Bonus-related properties
                        Bonuses = da.Bonuses,
                        BonusesSport = da.BonusesSport,
                        BonusesLive = da.BonusesLive,
                        BonusesBingo = da.BonusesBingo,
                        CollectedBonuses = da.CollectedBonuses,
                        ExpiredBonuses = da.ExpiredBonuses,
                        BonusConverted = da.BonusConverted,

                        // Casino-related properties
                        BetsCasino = da.BetsCasino ?? 0,
                        BetsCasinoReal = da.BetsCasinoReal,
                        BetsCasinoBonus = da.BetsCasinoBonus,
                        RefundsCasino = da.RefundsCasino,
                        RefundsCasinoReal = da.RefundsCasinoReal,
                        RefundsCasinoBonus = da.RefundsCasinoBonus,
                        WinsCasino = da.WinsCasino ?? 0,
                        WinsCasinoReal = da.WinsCasinoReal,
                        WinsCasinoBonus = da.WinsCasinoBonus,

                        // Sport-related properties
                        BetsSport = da.BetsSport ?? 0,
                        BetsSportReal = da.BetsSportReal,
                        BetsSportBonus = da.BetsSportBonus,
                        RefundsSport = da.RefundsSport,
                        RefundsSportReal = da.RefundsSportReal,
                        RefundsSportBonus = da.RefundsSportBonus,
                        WinsSport = da.WinsSport ?? 0,
                        WinsSportReal = da.WinsSportReal,
                        WinsSportBonus = da.WinsSportBonus,

                        // Live-related properties
                        BetsLive = da.BetsLive ?? 0,
                        BetsLiveReal = da.BetsLiveReal,
                        BetsLiveBonus = da.BetsLiveBonus,
                        RefundsLive = da.RefundsLive,
                        RefundsLiveReal = da.RefundsLiveReal,
                        RefundsLiveBonus = da.RefundsLiveBonus,
                        WinsLive = da.WinsLive ?? 0,
                        WinsLiveReal = da.WinsLiveReal,
                        WinsLiveBonus = da.WinsLiveBonus,

                        // Bingo-related properties
                        BetsBingo = da.BetsBingo ?? 0,
                        BetsBingoReal = da.BetsBingoReal,
                        BetsBingoBonus = da.BetsBingoBonus,
                        RefundsBingo = da.RefundsBingo,
                        RefundsBingoReal = da.RefundsBingoReal,
                        RefundsBingoBonus = da.RefundsBingoBonus,
                        WinsBingo = da.WinsBingo ?? 0,
                        WinsBingoReal = da.WinsBingoReal,
                        WinsBingoBonus = da.WinsBingoBonus,

                        // Calculate GGR values
                        GGRCasino = (da.BetsCasino ?? 0) - (da.WinsCasino ?? 0),
                        GGRSport = (da.BetsSport ?? 0) - (da.WinsSport ?? 0),
                        GGRLive = (da.BetsLive ?? 0) - (da.WinsLive ?? 0),
                        GGRBingo = (da.BetsBingo ?? 0) - (da.WinsBingo ?? 0),
                        TotalGGR = (da.BetsCasino ?? 0) - (da.WinsCasino ?? 0) +
                                  (da.BetsSport ?? 0) - (da.WinsSport ?? 0) +
                                  (da.BetsLive ?? 0) - (da.WinsLive ?? 0) +
                                  (da.BetsBingo ?? 0) - (da.WinsBingo ?? 0)
                    };
                }).ToList();

                // Apply grouping for all GroupByOptions
                List<DailyActionDto> result;

                _logger.LogInformation("Applying grouping by {GroupBy}", filter.GroupBy);

                // Log the data before grouping
                _logger.LogInformation("About to group {Count} records by {GroupBy}. Date range: {StartDate} to {EndDate}",
                    mappedDailyActions.Count, filter.GroupBy, start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"));

                // Log the dates in the data
                var datesInData = mappedDailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
                _logger.LogInformation("Found {Count} distinct dates in the data: {Dates}",
                    datesInData.Count, string.Join(", ", datesInData.Select(d => d.ToString("yyyy-MM-dd"))));

                // Log the data before grouping
                _logger.LogInformation("About to apply grouping to {Count} records. Found {DateCount} distinct dates and {WhiteLabelCount} distinct white labels",
                    mappedDailyActions.Count,
                    mappedDailyActions.Select(da => da.Date.Date).Distinct().Count(),
                    mappedDailyActions.Select(da => da.WhiteLabelId).Distinct().Count());

                // Group the data based on the selected option
                var groupedData = filter.GroupBy switch
                {
                    GroupByOption.Day => GroupByDay(mappedDailyActions),
                    GroupByOption.Month => GroupByMonth(mappedDailyActions),
                    GroupByOption.Year => GroupByYear(mappedDailyActions),
                    GroupByOption.Label => GroupByWhiteLabel(mappedDailyActions),
                    GroupByOption.Country => GroupByCountry(mappedDailyActions),
                    GroupByOption.Tracker => GroupByTracker(mappedDailyActions),
                    GroupByOption.Currency => GroupByCurrency(mappedDailyActions),
                    GroupByOption.Gender => GroupByGender(mappedDailyActions),
                    GroupByOption.Platform => GroupByPlatform(mappedDailyActions),
                    GroupByOption.Ranking => GroupByRanking(mappedDailyActions),
                    GroupByOption.Player => GroupByPlayer(mappedDailyActions),
                    _ => mappedDailyActions // Default to no grouping
                };

                // Log the result after grouping
                _logger.LogInformation("After grouping: {Count} records returned", groupedData.Count);

                result = groupedData;

                // Calculate summary metrics directly from the data we already have
                // This avoids making another database query
                _logger.LogInformation("Calculating summary metrics directly from the {Count} records we already have",
                    mappedDailyActions.Count);

                // Filter by white label if needed
                var dataForSummary = mappedDailyActions;
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count == 1)
                {
                    int whiteLabelId = filter.WhiteLabelIds[0];
                    dataForSummary = mappedDailyActions.Where(da => da.WhiteLabelId == whiteLabelId).ToList();
                    _logger.LogInformation("Filtered summary data to {Count} records for white label {WhiteLabelId}",
                        dataForSummary.Count, whiteLabelId);
                }

                // Calculate summary metrics
                var summary = new DailyActionsSummaryDto
                {
                    TotalRegistrations = dataForSummary.Sum(da => da.Registrations),
                    TotalFTD = dataForSummary.Sum(da => da.FTD),
                    TotalDeposits = dataForSummary.Sum(da => da.Deposits),
                    TotalCashouts = dataForSummary.Sum(da => da.PaidCashouts),
                    TotalBetsCasino = dataForSummary.Sum(da => da.BetsCasino),
                    TotalWinsCasino = dataForSummary.Sum(da => da.WinsCasino),
                    TotalBetsSport = dataForSummary.Sum(da => da.BetsSport),
                    TotalWinsSport = dataForSummary.Sum(da => da.WinsSport),
                    TotalBetsLive = dataForSummary.Sum(da => da.BetsLive),
                    TotalWinsLive = dataForSummary.Sum(da => da.WinsLive),
                    TotalBetsBingo = dataForSummary.Sum(da => da.BetsBingo),
                    TotalWinsBingo = dataForSummary.Sum(da => da.WinsBingo)
                };

                // Calculate total GGR
                summary.TotalGGR = summary.TotalBetsCasino - summary.TotalWinsCasino +
                                  summary.TotalBetsSport - summary.TotalWinsSport +
                                  summary.TotalBetsLive - summary.TotalWinsLive +
                                  summary.TotalBetsBingo - summary.TotalWinsBingo;

                // Create response
                var response = new DailyActionResponseDto
                {
                    Data = result,
                    Summary = summary,
                    TotalCount = resultCount,
                    TotalPages = (int)Math.Ceiling(resultCount / (double)pageSize),
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    StartDate = startDate,
                    EndDate = endDate,
                    AppliedFilters = filter
                };

                // Estimate the size of the response object for cache entry
                long estimatedSize = result.Count * 1000 + 2000; // More accurate estimate: 1000 bytes per DailyActionDto + 2000 bytes for summary and metadata

                // Cache the result with more aggressive caching options
                var cacheOptions = new MemoryCacheEntryOptions()
                {
                    Priority = CacheItemPriority.High,
                    SlidingExpiration = TimeSpan.FromMinutes(30),
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(CACHE_EXPIRATION_MINUTES),
                    Size = estimatedSize // Explicitly set the size for the cache entry
                };

                _cache.Set(cacheKey, response, cacheOptions);
                _logger.LogInformation("Cached filtered daily actions with hash {FilterHash}, cache key: {CacheKey}, estimated size: {EstimatedSize} bytes",
                    filterHash, cacheKey, estimatedSize);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered daily actions");
                throw;
            }
        }

        /// <summary>
        /// Computes a hash for the filter to use as a cache key
        /// </summary>
        private string ComputeFilterHash(DailyActionFilterDto filter)
        {
            // Create a string representation of the filter
            var filterString = JsonSerializer.Serialize(filter);

            // Compute hash
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(filterString);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
