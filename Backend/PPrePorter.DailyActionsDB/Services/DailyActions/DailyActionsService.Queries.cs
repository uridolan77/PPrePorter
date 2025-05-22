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
                // Only using date-related properties for the cache key since we filter by date in the database
                // and perform other filtering/grouping operations in memory
                var filterHash = ComputeFilterHash(filter);

                // Create cache keys for both raw and grouped data
                var rawDataCacheKey = $"{CACHE_KEY_PREFIX}RawData_{filterHash}";
                var groupedDataCacheKey = $"{CACHE_KEY_PREFIX}GroupedData_{filterHash}_{filter.GroupBy}";

                _logger.LogInformation("Checking cache for grouped data key: {GroupedDataCacheKey}", groupedDataCacheKey);

                // First, try to get the grouped data for the specific GroupBy option
                if (_cache.TryGetValue(groupedDataCacheKey, out DailyActionResponseDto? cachedGroupedResponse) && cachedGroupedResponse != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved grouped daily actions from cache with hash {FilterHash}, GroupBy: {GroupBy}, cache key: {GroupedDataCacheKey}",
                        filterHash, filter.GroupBy, groupedDataCacheKey);

                    // We found a cached response with the exact grouping we need
                    var cachedGroupedData = cachedGroupedResponse.Data;

                    // Create a new response with the grouped data and current filter settings
                    var newResponse = new DailyActionResponseDto
                    {
                        Data = cachedGroupedData,
                        Summary = cachedGroupedResponse.Summary,
                        TotalCount = cachedGroupedResponse.TotalCount,
                        TotalPages = (int)Math.Ceiling(cachedGroupedResponse.TotalCount / (double)filter.PageSize),
                        CurrentPage = filter.PageNumber,
                        PageSize = filter.PageSize,
                        StartDate = startDate, // Use the already normalized date
                        EndDate = endDate, // Use the already normalized date
                        AppliedFilters = filter
                    };

                    _logger.LogInformation("Returning cached grouped data with {Count} records", cachedGroupedData.Count);
                    return newResponse;
                }

                // If we don't have the grouped data, try to get the raw data
                _logger.LogInformation("No cached grouped data found. Checking cache for raw data key: {RawDataCacheKey}", rawDataCacheKey);

                if (_cache.TryGetValue(rawDataCacheKey, out DailyActionResponseDto? cachedResponse) && cachedResponse != null)
                {
                    _logger.LogInformation("CACHE HIT: Retrieved raw daily actions from cache with hash {FilterHash}, cache key: {RawDataCacheKey}",
                        filterHash, rawDataCacheKey);

                    _logger.LogInformation("Applying current filter (GroupBy={RequestedGroupBy}) to cached raw data", filter.GroupBy);

                    // Get the raw data from the cached response
                    var rawData = cachedResponse.Data;

                    // Log the GroupBy option being used for cached data
                    _logger.LogInformation("Applying grouping to cached data with GroupBy={GroupBy} (enum value: {GroupByValue})",
                        filter.GroupBy, (int)filter.GroupBy);

                    // Apply the requested grouping to the raw data
                    List<DailyActionDto> regroupedData;

                    switch (filter.GroupBy)
                    {
                        case GroupByOption.Day:
                            _logger.LogInformation("Grouping cached data by Day");
                            regroupedData = GroupByDay(rawData);
                            break;
                        case GroupByOption.Month:
                            _logger.LogInformation("Grouping cached data by Month");
                            regroupedData = GroupByMonth(rawData);
                            break;
                        case GroupByOption.Year:
                            _logger.LogInformation("Grouping cached data by Year");
                            regroupedData = GroupByYear(rawData);
                            break;
                        case GroupByOption.Label:
                            _logger.LogInformation("Grouping cached data by Label (White Label)");
                            regroupedData = GroupByWhiteLabel(rawData);
                            break;
                        case GroupByOption.Country:
                            _logger.LogInformation("Grouping cached data by Country");
                            regroupedData = GroupByCountry(rawData);
                            break;
                        case GroupByOption.Tracker:
                            _logger.LogInformation("Grouping cached data by Tracker");
                            regroupedData = GroupByTracker(rawData);
                            break;
                        case GroupByOption.Currency:
                            _logger.LogInformation("Grouping cached data by Currency");
                            regroupedData = GroupByCurrency(rawData);
                            break;
                        case GroupByOption.Gender:
                            _logger.LogInformation("Grouping cached data by Gender");
                            regroupedData = GroupByGender(rawData);
                            break;
                        case GroupByOption.Platform:
                            _logger.LogInformation("Grouping cached data by Platform");
                            regroupedData = GroupByPlatform(rawData);
                            break;
                        case GroupByOption.Ranking:
                            _logger.LogInformation("Grouping cached data by Ranking");
                            regroupedData = GroupByRanking(rawData);
                            break;
                        case GroupByOption.Player:
                            _logger.LogInformation("Grouping cached data by Player");
                            regroupedData = GroupByPlayer(rawData);
                            break;
                        default:
                            _logger.LogWarning("Unknown GroupBy option for cached data: {GroupBy}. Using raw data without grouping.", filter.GroupBy);
                            regroupedData = rawData;
                            break;
                    }

                    // Log the result after grouping cached data
                    _logger.LogInformation("After grouping cached data: {Count} records returned", regroupedData.Count);

                    // Create a new response with the grouped data and current filter settings
                    var newResponse = new DailyActionResponseDto
                    {
                        Data = regroupedData,
                        Summary = cachedResponse.Summary,
                        TotalCount = cachedResponse.TotalCount,
                        TotalPages = (int)Math.Ceiling(cachedResponse.TotalCount / (double)filter.PageSize),
                        CurrentPage = filter.PageNumber,
                        PageSize = filter.PageSize,
                        StartDate = cachedResponse.StartDate,
                        EndDate = cachedResponse.EndDate,
                        AppliedFilters = filter,
                        LastHistoricalRefreshTime = cachedResponse.LastHistoricalRefreshTime,
                        LastTodayRefreshTime = cachedResponse.LastTodayRefreshTime
                    };

                    _logger.LogInformation("Applied grouping to cached data: GroupBy={RequestedGroupBy}, resulting in {RegroupedCount} records",
                        filter.GroupBy, regroupedData.Count);

                    return newResponse;
                }

                _logger.LogWarning("CACHE MISS: Getting filtered daily actions from database with hash {FilterHash}", filterHash);

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
                                // Convert the key to short? to match the WhiteLabelID property type
                                WhiteLabelID = g.Key != null ? (short?)Convert.ToInt16(g.Key) : null,
                                Registration = g.Sum(da => da.Registration ?? 0),
                                FTD = g.Sum(da => da.FTD ?? 0),
                                FTDA = g.Sum(da => da.FTDA ?? 0),
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
                    // Convert the int WhiteLabelIds to short for proper comparison
                    var shortWhiteLabelIds = filter.WhiteLabelIds.Select(id => (short)id).ToList();

                    // Use the converted IDs for the filter
                    dailyActionsQuery = dailyActionsQuery.Where(da => da.WhiteLabelID.HasValue && shortWhiteLabelIds.Contains(da.WhiteLabelID.Value));

                    _logger.LogInformation("Applied white label filter: WhiteLabelIDs = {WhiteLabelIds}",
                        string.Join(", ", filter.WhiteLabelIds));
                }

                // IMPORTANT: We're not applying any grouping at the database level anymore
                // Instead, we'll get all the raw data and then apply grouping in memory
                // This allows us to cache the raw data and apply different groupings without going back to the database

                _logger.LogInformation("Getting raw data from database without any grouping");

                // Use a projection to explicitly handle type conversions
                var rawQuery = dailyActionsQuery.Select(da => new DailyAction
                {
                    Id = da.Id,
                    Date = da.Date,
                    // Explicitly convert byte to short for WhiteLabelID
                    WhiteLabelID = da.WhiteLabelID,
                    PlayerID = da.PlayerID,
                    // Explicitly convert byte to int for these fields
                    Registration = da.Registration,
                    FTD = da.FTD,
                    FTDA = da.FTDA,
                    // Include all other fields
                    Deposits = da.Deposits,
                    DepositsCreditCard = da.DepositsCreditCard,
                    DepositsNeteller = da.DepositsNeteller,
                    DepositsMoneyBookers = da.DepositsMoneyBookers,
                    DepositsOther = da.DepositsOther,
                    DepositsFee = da.DepositsFee,
                    DepositsSport = da.DepositsSport,
                    DepositsLive = da.DepositsLive,
                    DepositsBingo = da.DepositsBingo,
                    CashoutRequests = da.CashoutRequests,
                    PaidCashouts = da.PaidCashouts,
                    Chargebacks = da.Chargebacks,
                    Voids = da.Voids,
                    ReverseChargebacks = da.ReverseChargebacks,
                    Bonuses = da.Bonuses,
                    BonusesSport = da.BonusesSport,
                    BonusesLive = da.BonusesLive,
                    BonusesBingo = da.BonusesBingo,
                    CollectedBonuses = da.CollectedBonuses,
                    ExpiredBonuses = da.ExpiredBonuses,
                    BonusConverted = da.BonusConverted,
                    BetsCasino = da.BetsCasino,
                    BetsCasinoReal = da.BetsCasinoReal,
                    BetsCasinoBonus = da.BetsCasinoBonus,
                    RefundsCasino = da.RefundsCasino,
                    RefundsCasinoReal = da.RefundsCasinoReal,
                    RefundsCasinoBonus = da.RefundsCasinoBonus,
                    WinsCasino = da.WinsCasino,
                    WinsCasinoReal = da.WinsCasinoReal,
                    WinsCasinoBonus = da.WinsCasinoBonus,
                    BetsSport = da.BetsSport,
                    BetsSportReal = da.BetsSportReal,
                    BetsSportBonus = da.BetsSportBonus,
                    RefundsSport = da.RefundsSport,
                    RefundsSportReal = da.RefundsSportReal,
                    RefundsSportBonus = da.RefundsSportBonus,
                    WinsSport = da.WinsSport,
                    WinsSportReal = da.WinsSportReal,
                    WinsSportBonus = da.WinsSportBonus,
                    BetsLive = da.BetsLive,
                    BetsLiveReal = da.BetsLiveReal,
                    BetsLiveBonus = da.BetsLiveBonus,
                    RefundsLive = da.RefundsLive,
                    RefundsLiveReal = da.RefundsLiveReal,
                    RefundsLiveBonus = da.RefundsLiveBonus,
                    WinsLive = da.WinsLive,
                    WinsLiveReal = da.WinsLiveReal,
                    WinsLiveBonus = da.WinsLiveBonus,
                    BetsBingo = da.BetsBingo,
                    BetsBingoReal = da.BetsBingoReal,
                    BetsBingoBonus = da.BetsBingoBonus,
                    RefundsBingo = da.RefundsBingo,
                    RefundsBingoReal = da.RefundsBingoReal,
                    RefundsBingoBonus = da.RefundsBingoBonus,
                    WinsBingo = da.WinsBingo,
                    WinsBingoReal = da.WinsBingoReal,
                    WinsBingoBonus = da.WinsBingoBonus
                });

                // Execute the query with NOLOCK hint
                _logger.LogInformation("Executing query with NOLOCK hint");

                try
                {
                    // Log the SQL query for debugging
                    var rawQueryString = rawQuery.ToString();
                    _logger.LogInformation("SQL Query: {SqlQuery}", rawQueryString);

                    // Add more detailed logging about the query
                    _logger.LogInformation("Query type: {QueryType}, Provider: {Provider}",
                        rawQuery.GetType().Name,
                        rawQuery.Provider.GetType().Name);

                    // Execute the query with NOLOCK hint and detailed error handling
                    try
                    {
                        results = await rawQuery.ToListWithSqlNoLock();
                        _logger.LogInformation("Query executed successfully, retrieved {Count} results", results.Count);

                        // Log the first few results to help diagnose issues
                        if (results.Count > 0)
                        {
                            var firstResult = results.First();
                            _logger.LogInformation("First result - Id: {Id}, Date: {Date}, WhiteLabelID: {WhiteLabelID} (Type: {WhiteLabelIDType}), " +
                                "PlayerID: {PlayerID}, Registration: {Registration} (Type: {RegistrationType}), FTD: {FTD} (Type: {FTDType})",
                                firstResult.Id,
                                firstResult.Date,
                                firstResult.WhiteLabelID,
                                firstResult.WhiteLabelID?.GetType().Name ?? "null",
                                firstResult.PlayerID,
                                firstResult.Registration,
                                firstResult.Registration?.GetType().Name ?? "null",
                                firstResult.FTD,
                                firstResult.FTD?.GetType().Name ?? "null");
                        }
                    }
                    catch (InvalidCastException castEx)
                    {
                        _logger.LogError(castEx, "Type casting error executing query. This might be due to a mismatch between the database schema and the entity model.");

                        // Try a simpler query as a fallback
                        _logger.LogWarning("Attempting fallback query with minimal fields...");

                        var fallbackQuery = dailyActionsQuery.Select(da => new DailyAction
                        {
                            Id = da.Id,
                            Date = da.Date,
                            // Convert problematic fields explicitly
                            WhiteLabelID = da.WhiteLabelID != null ? (short?)Convert.ToInt16(da.WhiteLabelID) : null,
                            PlayerID = da.PlayerID,
                            Registration = da.Registration != null ? (byte?)Convert.ToByte(da.Registration) : null,
                            FTD = da.FTD != null ? (byte?)Convert.ToByte(da.FTD) : null,
                            FTDA = da.FTDA != null ? (byte?)Convert.ToByte(da.FTDA) : null,
                            // Include only essential numeric fields
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
                        });

                        results = await fallbackQuery.ToListWithSqlNoLock();
                        _logger.LogInformation("Fallback query executed successfully, retrieved {Count} results", results.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error executing query with NOLOCK hint");
                    throw;
                }

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

                _logger.LogInformation("Retrieved {Count} records from database", joinedResults.Count);

                // For now, we'll skip the additional metadata enrichment
                // We'll implement a more comprehensive solution in a separate method
                _logger.LogInformation("Skipping additional metadata enrichment for now");

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

                var whiteLabelDict = cachedWhiteLabels
                    .Where(wl => !string.IsNullOrEmpty(wl.Code))
                    .ToDictionary(wl => wl.Code!, wl => wl.Name);

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
                    _logger.LogDebug("Player ID: {PlayerId}, Player Name: {PlayerName}", da.PlayerID, playerName);

                    // Get country information from our projection
                    string countryName = result.Country?.CountryName ?? "Unknown";
                    _logger.LogDebug("Country Name: {CountryName}", countryName);

                    // Get currency information from our projection
                    string currencyCode = result.Currency?.CurrencyCode ?? "Unknown";
                    _logger.LogDebug("Currency Code: {CurrencyCode}", currencyCode);

                    // Get tracker information (for GroupByOption.Tracker)
                    string trackerName = "Unknown";
                    if (da.PlayerID.HasValue)
                    {
                        // Try to get tracker information from the player
                        // This is a placeholder - implement actual tracker retrieval logic
                        trackerName = "Default Tracker";
                    }
                    _logger.LogDebug("Tracker Name: {TrackerName}", trackerName);

                    // Get gender information (for GroupByOption.Gender)
                    string genderName = "Unknown";
                    if (result.Player != null)
                    {
                        // Try to get gender information from the player
                        genderName = result.Player.Gender ?? "Unknown";
                    }
                    _logger.LogDebug("Gender Name: {GenderName}", genderName);

                    // Get platform information (for GroupByOption.Platform)
                    string platformName = "Unknown";
                    if (result.Player != null)
                    {
                        // Try to get platform information from the player
                        platformName = result.Player.RegisteredPlatform ?? result.Player.PlatformString ?? "Unknown";
                    }
                    _logger.LogDebug("Platform Name: {PlatformName}", platformName);

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
                        // Additional fields for grouping
                        GroupKey = null, // Will be set during grouping
                        GroupValue = null, // Will be set during grouping

                        // Add explicit fields for each grouping dimension to ensure they're available
                        // These will be used by the GroupBy methods

                        // Add all the necessary fields for calculations
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
                        WinsLive = da.WinsLive ?? 0,

                        // Bingo-related properties
                        BetsBingo = da.BetsBingo ?? 0,
                        WinsBingo = da.WinsBingo ?? 0,

                        // Calculate GGR values
                        GGRCasino = (da.BetsCasino ?? 0) - (da.WinsCasino ?? 0),
                        GGRSport = (da.BetsSport ?? 0) - (da.WinsSport ?? 0),
                        GGRLive = (da.BetsLive ?? 0) - (da.WinsLive ?? 0),
                        GGRBingo = (da.BetsBingo ?? 0) - (da.WinsBingo ?? 0),
                        TotalGGR = (da.BetsCasino ?? 0) - (da.WinsCasino ?? 0) +
                                  (da.BetsSport ?? 0) - (da.WinsSport ?? 0) +
                                  (da.BetsLive ?? 0) - (da.WinsLive ?? 0) +
                                  (da.BetsBingo ?? 0) - (da.WinsBingo ?? 0),

                        // Add a dictionary for additional grouping metadata
                        GroupData = new Dictionary<string, object>
                        {
                            { "TrackerName", trackerName },
                            { "GenderName", genderName },
                            { "PlatformName", platformName },
                            { "PlayerId", da.PlayerID ?? 0 },
                            { "PlayerName", playerName },
                            { "CountryName", countryName },
                            { "CurrencyCode", currencyCode },
                            { "WhiteLabelId", whiteLabelId },
                            { "WhiteLabelName", whiteLabelName }
                        }
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

                // Log the GroupBy option being used
                _logger.LogInformation("Applying grouping with GroupBy={GroupBy} (enum value: {GroupByValue})",
                    filter.GroupBy, (int)filter.GroupBy);

                // Group the data based on the selected option
                List<DailyActionDto> groupedData;

                switch (filter.GroupBy)
                {
                    case GroupByOption.Day:
                        _logger.LogInformation("Grouping by Day");
                        groupedData = GroupByDay(mappedDailyActions);
                        break;
                    case GroupByOption.Month:
                        _logger.LogInformation("Grouping by Month");
                        groupedData = GroupByMonth(mappedDailyActions);
                        break;
                    case GroupByOption.Year:
                        _logger.LogInformation("Grouping by Year");
                        groupedData = GroupByYear(mappedDailyActions);
                        break;
                    case GroupByOption.Label:
                        _logger.LogInformation("Grouping by Label (White Label)");
                        groupedData = GroupByWhiteLabel(mappedDailyActions);
                        break;
                    case GroupByOption.Country:
                        _logger.LogInformation("Grouping by Country");
                        groupedData = GroupByCountry(mappedDailyActions);
                        break;
                    case GroupByOption.Tracker:
                        _logger.LogInformation("Grouping by Tracker");
                        groupedData = GroupByTracker(mappedDailyActions);
                        break;
                    case GroupByOption.Currency:
                        _logger.LogInformation("Grouping by Currency");
                        groupedData = GroupByCurrency(mappedDailyActions);
                        break;
                    case GroupByOption.Gender:
                        _logger.LogInformation("Grouping by Gender");
                        groupedData = GroupByGender(mappedDailyActions);
                        break;
                    case GroupByOption.Platform:
                        _logger.LogInformation("Grouping by Platform");
                        groupedData = GroupByPlatform(mappedDailyActions);
                        break;
                    case GroupByOption.Ranking:
                        _logger.LogInformation("Grouping by Ranking");
                        groupedData = GroupByRanking(mappedDailyActions);
                        break;
                    case GroupByOption.Player:
                        _logger.LogInformation("Grouping by Player");
                        groupedData = GroupByPlayer(mappedDailyActions);
                        break;
                    default:
                        _logger.LogWarning("Unknown GroupBy option: {GroupBy}. Using raw data without grouping.", filter.GroupBy);
                        groupedData = mappedDailyActions; // Default to no grouping
                        break;
                }

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

                // Store both the raw data and the grouped data in the cache
                // The raw data allows us to apply different groupings without going back to the database
                // The grouped data improves performance for common grouping options

                // We're using the same cache keys as defined earlier
                // rawDataCacheKey = $"{CACHE_KEY_PREFIX}RawData_{filterHash}"
                // groupedDataCacheKey = $"{CACHE_KEY_PREFIX}GroupedData_{filterHash}_{filter.GroupBy}"

                _logger.LogInformation("Creating cache entries for raw data (key: {RawDataCacheKey}) and grouped data (key: {GroupedDataCacheKey})",
                    rawDataCacheKey, groupedDataCacheKey);

                // Create cache response with raw data
                var rawDataCacheResponse = new DailyActionResponseDto
                {
                    // Store the raw data from the database before any grouping
                    Data = mappedDailyActions,
                    Summary = summary,
                    TotalCount = resultCount,
                    TotalPages = (int)Math.Ceiling(resultCount / (double)filter.PageSize),
                    CurrentPage = filter.PageNumber,
                    PageSize = filter.PageSize,
                    StartDate = startDate,
                    EndDate = endDate,
                    AppliedFilters = filter
                };

                // Create cache response with grouped data
                var groupedDataCacheResponse = new DailyActionResponseDto
                {
                    // Store the grouped data
                    Data = result,
                    Summary = summary,
                    TotalCount = resultCount,
                    TotalPages = (int)Math.Ceiling(resultCount / (double)filter.PageSize),
                    CurrentPage = filter.PageNumber,
                    PageSize = filter.PageSize,
                    StartDate = startDate,
                    EndDate = endDate,
                    AppliedFilters = filter
                };

                // Estimate the size of the response objects for cache entries
                long rawDataSize = mappedDailyActions.Count * 1000 + 2000; // More accurate estimate: 1000 bytes per DailyActionDto + 2000 bytes for summary and metadata
                long groupedDataSize = result.Count * 1000 + 2000; // Similar estimate for grouped data

                // Cache options for raw data
                var rawDataCacheOptions = new MemoryCacheEntryOptions()
                {
                    Priority = CacheItemPriority.High,
                    SlidingExpiration = TimeSpan.FromMinutes(30),
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(CACHE_EXPIRATION_MINUTES),
                    Size = rawDataSize // Explicitly set the size for the cache entry
                };

                // Cache options for grouped data
                var groupedDataCacheOptions = new MemoryCacheEntryOptions()
                {
                    Priority = CacheItemPriority.Normal, // Lower priority than raw data
                    SlidingExpiration = TimeSpan.FromMinutes(30),
                    AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(CACHE_EXPIRATION_MINUTES),
                    Size = groupedDataSize // Explicitly set the size for the cache entry
                };

                // Cache both raw and grouped data
                _cache.Set(rawDataCacheKey, rawDataCacheResponse, rawDataCacheOptions);
                _cache.Set(groupedDataCacheKey, groupedDataCacheResponse, groupedDataCacheOptions);

                _logger.LogInformation("Cached raw daily actions data with hash {FilterHash}, cache key: {RawDataCacheKey}, estimated size: {RawDataSize} bytes",
                    filterHash, rawDataCacheKey, rawDataSize);
                _logger.LogInformation("Cached grouped daily actions data with hash {FilterHash}, GroupBy: {GroupBy}, cache key: {GroupedDataCacheKey}, estimated size: {GroupedDataSize} bytes",
                    filterHash, filter.GroupBy, groupedDataCacheKey, groupedDataSize);

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
        /// Only considers date-related properties since we filter by date in the database
        /// and perform other filtering/grouping operations in memory
        /// </summary>
        private string ComputeFilterHash(DailyActionFilterDto filter)
        {
            // Create a simplified filter object with only date-related properties
            var dateOnlyFilter = new
            {
                StartDate = filter.StartDate,
                EndDate = filter.EndDate,
                WhiteLabelIds = filter.WhiteLabelIds // Keep WhiteLabelIds as it affects database query
            };

            // Create a string representation of the simplified filter
            var filterString = JsonSerializer.Serialize(dateOnlyFilter);

            _logger.LogInformation("Computing cache key using date-only filter: {FilterString}", filterString);

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
