using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Models.Players;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services.DailyActions
{
    /// <summary>
    /// Service that loads and manages daily actions data in memory
    /// </summary>
    public class InMemoryDailyActionsService : IInMemoryDailyActionsService
    {
        private readonly ILogger<InMemoryDailyActionsService> _logger;
        private readonly DailyActionsDbContext _dbContext;
        private readonly IWhiteLabelService _whiteLabelService;
        // We don't need the metadata service for this implementation

        // In-memory storage for historical daily actions (excluding today)
        private ConcurrentDictionary<int, DailyActionDto> _historicalDailyActionsCache = new ConcurrentDictionary<int, DailyActionDto>();

        // In-memory storage for today's daily actions
        private ConcurrentDictionary<int, DailyActionDto> _todayDailyActionsCache = new ConcurrentDictionary<int, DailyActionDto>();

        // Metadata dictionaries for quick lookups
        private Dictionary<int, string> _whiteLabelNames = new Dictionary<int, string>();
        private Dictionary<int, string> _countryNames = new Dictionary<int, string>();
        private Dictionary<string, string> _currencyNames = new Dictionary<string, string>();

        // Status tracking
        private bool _isInitialized = false;
        private bool _isInitializing = false;
        private DateTime _lastHistoricalRefreshTime = DateTime.MinValue;
        private DateTime _lastTodayRefreshTime = DateTime.MinValue;
        private SemaphoreSlim _initializationLock = new SemaphoreSlim(1, 1);
        private SemaphoreSlim _todayRefreshLock = new SemaphoreSlim(1, 1);

        public InMemoryDailyActionsService(
            ILogger<InMemoryDailyActionsService> logger,
            DailyActionsDbContext dbContext,
            IWhiteLabelService whiteLabelService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService)); // Can be null
        }

        /// <summary>
        /// Initializes the in-memory cache with historical daily actions data from the last 3 months (excluding today)
        /// </summary>
        public async Task InitializeAsync()
        {
            // Prevent multiple initialization attempts
            if (_isInitializing)
            {
                _logger.LogInformation("Initialization already in progress, skipping duplicate request");
                return;
            }

            await _initializationLock.WaitAsync();
            try
            {
                _isInitializing = true;
                _logger.LogInformation("Starting initialization of in-memory daily actions cache");

                // Calculate date range (last 3 months excluding today)
                var today = DateTime.UtcNow.Date;
                var endDate = today.AddDays(-1).AddDays(1).AddTicks(-1); // End of yesterday
                var startDate = today.AddMonths(-3).Date; // Start of 3 months ago

                _logger.LogInformation("Loading historical daily actions from {StartDate} to {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Load metadata first
                await LoadMetadataAsync();

                // Load historical daily actions
                await LoadHistoricalDailyActionsAsync(startDate, endDate);

                // Load today's data separately
                await RefreshTodayDataAsync();

                _isInitialized = true;
                _lastHistoricalRefreshTime = DateTime.UtcNow;
                _logger.LogInformation("In-memory daily actions cache initialized with {HistoricalCount} historical records and {TodayCount} today records",
                    _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing in-memory daily actions cache");
                _isInitialized = false;
                throw;
            }
            finally
            {
                _isInitializing = false;
                _initializationLock.Release();
            }
        }

        /// <summary>
        /// Refreshes the in-memory cache - only refreshes today's data since historical data is fixed
        /// </summary>
        public async Task RefreshAsync()
        {
            await _initializationLock.WaitAsync();
            try
            {
                _isInitializing = true;
                _logger.LogInformation("Refreshing in-memory daily actions cache (today's data only)");

                // Check if we need to handle a day transition
                var currentDate = DateTime.UtcNow.Date;
                var cachedTodayDate = _lastTodayRefreshTime.Date;

                if (currentDate > cachedTodayDate && cachedTodayDate != DateTime.MinValue.Date)
                {
                    // Day has changed, move yesterday's data to historical cache
                    await HandleDayTransitionAsync(cachedTodayDate);
                }

                // Refresh today's data
                await RefreshTodayDataAsync();

                _logger.LogInformation("In-memory daily actions cache refreshed with {HistoricalCount} historical records and {TodayCount} today records",
                    _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing in-memory daily actions cache");
                throw;
            }
            finally
            {
                _isInitializing = false;
                _initializationLock.Release();
            }
        }

        /// <summary>
        /// Handles the transition to a new day by moving yesterday's data to the historical cache
        /// </summary>
        private async Task HandleDayTransitionAsync(DateTime previousDay)
        {
            _logger.LogInformation("Handling day transition from {PreviousDay} to {CurrentDay}",
                previousDay.ToString("yyyy-MM-dd"), DateTime.UtcNow.Date.ToString("yyyy-MM-dd"));

            try
            {
                // Load yesterday's data from the database to ensure we have the final version
                var startDate = previousDay;
                var endDate = previousDay.AddDays(1).AddTicks(-1); // End of yesterday

                // Build optimized query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(da => da.Date >= startDate && da.Date <= endDate);

                // Execute query and map to DTOs
                var yesterdayActions = await query.ToListAsync();
                _logger.LogInformation("Retrieved {Count} daily actions for yesterday ({Date}) from database",
                    yesterdayActions.Count, previousDay.ToString("yyyy-MM-dd"));

                // Add yesterday's data to the historical cache
                foreach (var da in yesterdayActions)
                {
                    var dto = MapToDailyActionDto(da);
                    _historicalDailyActionsCache.TryAdd(dto.Id, dto);
                }

                _logger.LogInformation("Added {Count} records for yesterday to historical cache", yesterdayActions.Count);

                // Clear today's cache as it contains yesterday's data
                _todayDailyActionsCache.Clear();

                _lastHistoricalRefreshTime = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling day transition");
                throw;
            }
        }

        /// <summary>
        /// Refreshes only today's data in the in-memory cache
        /// </summary>
        public async Task RefreshTodayDataAsync()
        {
            await _todayRefreshLock.WaitAsync();
            try
            {
                _logger.LogInformation("Refreshing today's data in the in-memory daily actions cache");

                // Calculate today's date range
                var today = DateTime.UtcNow.Date;
                var startDate = today;
                var endDate = today.AddDays(1).AddTicks(-1); // End of today

                // Clear today's cache
                _todayDailyActionsCache.Clear();

                // Load today's daily actions
                await LoadTodayDailyActionsAsync(startDate, endDate);

                _lastTodayRefreshTime = DateTime.UtcNow;
                _logger.LogInformation("Today's data in the in-memory daily actions cache refreshed with {Count} records",
                    _todayDailyActionsCache.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing today's data in the in-memory daily actions cache");
                throw;
            }
            finally
            {
                _todayRefreshLock.Release();
            }
        }

        /// <summary>
        /// Gets filtered daily actions from the in-memory cache
        /// </summary>
        public async Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(
            DailyActionFilterDto filter, DateTime startDate, DateTime endDate)
        {
            // Ensure the cache is initialized
            if (!_isInitialized && !_isInitializing)
            {
                _logger.LogWarning("Cache not initialized, initializing now");
                await InitializeAsync();
            }
            else if (_isInitializing)
            {
                _logger.LogWarning("Cache initialization in progress, waiting for completion");
                while (_isInitializing)
                {
                    await Task.Delay(100); // Wait for initialization to complete
                }
            }

            // Check if today's data needs to be refreshed (if older than 1 minute)
            var today = DateTime.UtcNow.Date;
            if (endDate >= today && (DateTime.UtcNow - _lastTodayRefreshTime).TotalMinutes >= 1)
            {
                _logger.LogInformation("Today's data is stale, refreshing");
                await RefreshTodayDataAsync();
            }

            _logger.LogInformation("Getting filtered daily actions from in-memory cache with filter: {@Filter}", filter);

            // Combine historical and today's data
            var allData = new List<DailyActionDto>();

            // Add historical data
            allData.AddRange(_historicalDailyActionsCache.Values);

            // Add today's data
            allData.AddRange(_todayDailyActionsCache.Values);

            _logger.LogInformation("Combined {HistoricalCount} historical records and {TodayCount} today records",
                _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count);

            // Apply date range filter
            var filteredData = allData
                .Where(da => da.Date >= startDate && da.Date <= endDate)
                .ToList();

            _logger.LogInformation("Found {Count} records in date range {StartDate} to {EndDate}",
                filteredData.Count, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Apply white label filter if specified
            if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
            {
                filteredData = filteredData
                    .Where(da => filter.WhiteLabelIds.Contains(da.WhiteLabelId))
                    .ToList();

                _logger.LogInformation("After white label filter: {Count} records", filteredData.Count);
            }

            // Apply player filter if specified
            if (filter.PlayerIds != null && filter.PlayerIds.Count > 0)
            {
                filteredData = filteredData
                    .Where(da => da.PlayerId.HasValue && filter.PlayerIds.Contains(da.PlayerId.Value))
                    .ToList();

                _logger.LogInformation("After player filter: {Count} records", filteredData.Count);
            }

            // Get total count before pagination
            int totalCount = filteredData.Count;

            // Apply pagination
            int pageSize = Math.Max(1, filter.PageSize);
            int pageNumber = Math.Max(1, filter.PageNumber);
            int skip = (pageNumber - 1) * pageSize;

            // Apply pagination if not requesting all records
            if (filter.PageSize < 1000)
            {
                filteredData = filteredData
                    .OrderBy(da => da.Date)
                    .ThenBy(da => da.WhiteLabelId)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToList();
            }

            // Apply grouping if specified
            List<DailyActionDto> result;
            if (filter.GroupBy != default)
            {
                result = ApplyGrouping(filteredData, filter.GroupBy);
            }
            else
            {
                result = filteredData;
            }

            // Calculate summary metrics
            var summary = CalculateSummaryMetrics(filteredData);

            // Create response
            var response = new DailyActionResponseDto
            {
                Data = result,
                Summary = summary,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                StartDate = startDate,
                EndDate = endDate,
                AppliedFilters = filter,
                LastHistoricalRefreshTime = _lastHistoricalRefreshTime,
                LastTodayRefreshTime = _lastTodayRefreshTime
            };

            return response;
        }

        /// <summary>
        /// Gets the status of the in-memory cache
        /// </summary>
        public CacheStatusDto GetCacheStatus()
        {
            return new CacheStatusDto
            {
                IsInitialized = _isInitialized,
                IsInitializing = _isInitializing,
                LastHistoricalRefreshTime = _lastHistoricalRefreshTime,
                LastTodayRefreshTime = _lastTodayRefreshTime,
                HistoricalRecordCount = _historicalDailyActionsCache.Count,
                TodayRecordCount = _todayDailyActionsCache.Count,
                TotalRecordCount = _historicalDailyActionsCache.Count + _todayDailyActionsCache.Count,
                WhiteLabelCount = _whiteLabelNames.Count,
                CountryCount = _countryNames.Count,
                CurrencyCount = _currencyNames.Count,
                TodayDate = DateTime.UtcNow.Date.ToString("yyyy-MM-dd")
            };
        }

        #region Private Helper Methods

        /// <summary>
        /// Loads metadata for lookups
        /// </summary>
        private async Task LoadMetadataAsync()
        {
            _logger.LogInformation("Loading metadata for lookups");

            // Load white labels
            var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
            _whiteLabelNames = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);
            _logger.LogInformation("Loaded {Count} white labels", _whiteLabelNames.Count);

            // Load countries
            var countries = await _dbContext.Countries
                .AsNoTracking()
                .TagWith("WITH (NOLOCK)")
                .Where(c => c.IsActive == true)
                .ToListAsync();
            _countryNames = countries.ToDictionary(c => c.CountryID, c => c.CountryName);
            _logger.LogInformation("Loaded {Count} countries", _countryNames.Count);

            // Load currencies
            var currencies = await _dbContext.Currencies
                .AsNoTracking()
                .TagWith("WITH (NOLOCK)")
                .ToListAsync();
            _currencyNames = currencies.ToDictionary(c => c.CurrencyCode, c => c.CurrencyName);
            _logger.LogInformation("Loaded {Count} currencies", _currencyNames.Count);
        }

        /// <summary>
        /// Loads historical daily actions data into memory (excluding today)
        /// </summary>
        private async Task LoadHistoricalDailyActionsAsync(DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("Loading historical daily actions from database for date range {StartDate} to {EndDate}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Build optimized query with NOLOCK hint and joins
            var query = _dbContext.DailyActions
                .AsNoTracking()
                .TagWith("WITH (NOLOCK)")
                .Where(da => da.Date >= startDate && da.Date <= endDate);

            // Execute query and map to DTOs
            var dailyActions = await query.ToListAsync();
            _logger.LogInformation("Retrieved {Count} historical daily actions from database", dailyActions.Count);

            // Map to DTOs and store in cache
            foreach (var da in dailyActions)
            {
                var dto = MapToDailyActionDto(da);
                _historicalDailyActionsCache.TryAdd(dto.Id, dto);
            }

            _logger.LogInformation("Loaded {Count} historical daily actions into memory", _historicalDailyActionsCache.Count);
        }

        /// <summary>
        /// Loads today's daily actions data into memory
        /// </summary>
        private async Task LoadTodayDailyActionsAsync(DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("Loading today's daily actions from database for date {Today}",
                startDate.ToString("yyyy-MM-dd"));

            // Build optimized query with NOLOCK hint and joins
            var query = _dbContext.DailyActions
                .AsNoTracking()
                .TagWith("WITH (NOLOCK)")
                .Where(da => da.Date >= startDate && da.Date <= endDate);

            // Execute query and map to DTOs
            var dailyActions = await query.ToListAsync();
            _logger.LogInformation("Retrieved {Count} today's daily actions from database", dailyActions.Count);

            // Map to DTOs and store in cache
            foreach (var da in dailyActions)
            {
                var dto = MapToDailyActionDto(da);
                _todayDailyActionsCache.TryAdd(dto.Id, dto);
            }

            _logger.LogInformation("Loaded {Count} today's daily actions into memory", _todayDailyActionsCache.Count);
        }

        /// <summary>
        /// Maps a DailyAction entity to a DailyActionDto
        /// </summary>
        private DailyActionDto MapToDailyActionDto(DailyAction da)
        {
            // Get white label name
            string whiteLabelName = "Unknown";
            if (da.WhiteLabelID.HasValue && _whiteLabelNames.TryGetValue((int)da.WhiteLabelID.Value, out var name))
            {
                whiteLabelName = name;
            }

            return new DailyActionDto
            {
                Id = (int)da.Id,
                Date = da.Date,
                WhiteLabelId = da.WhiteLabelID.HasValue ? (int)da.WhiteLabelID.Value : 0,
                WhiteLabelName = whiteLabelName,
                PlayerId = da.PlayerID,
                PlayerName = da.PlayerID.HasValue ? $"Player {da.PlayerID}" : "Unknown",
                // Add other properties as needed
                Registrations = da.Registration.HasValue ? (int)da.Registration.Value : 0,
                FTD = da.FTD.HasValue ? (int)da.FTD.Value : 0,
                FTDA = da.FTDA.HasValue ? (int)da.FTDA.Value : null,
                Deposits = da.Deposits ?? 0,
                PaidCashouts = da.PaidCashouts ?? 0,
                BetsCasino = da.BetsCasino ?? 0,
                WinsCasino = da.WinsCasino ?? 0,
                BetsSport = da.BetsSport ?? 0,
                WinsSport = da.WinsSport ?? 0,
                BetsLive = da.BetsLive ?? 0,
                WinsLive = da.WinsLive ?? 0,
                BetsBingo = da.BetsBingo ?? 0,
                WinsBingo = da.WinsBingo ?? 0,
                GGRCasino = da.GGRCasino,
                GGRSport = da.GGRSport,
                GGRLive = da.GGRLive,
                GGRBingo = da.GGRBingo,
                TotalGGR = da.TotalGGR
            };
        }

        /// <summary>
        /// Applies grouping to the filtered data
        /// </summary>
        private List<DailyActionDto> ApplyGrouping(List<DailyActionDto> data, GroupByOption groupBy)
        {
            _logger.LogInformation("Applying grouping by {GroupBy} to {Count} records", groupBy, data.Count);

            switch (groupBy)
            {
                case GroupByOption.Day:
                    return GroupByDay(data);
                case GroupByOption.Month:
                    return GroupByMonth(data);
                case GroupByOption.Year:
                    return GroupByYear(data);
                case GroupByOption.Label:
                    return GroupByWhiteLabel(data);
                case GroupByOption.Country:
                    return GroupByCountry(data);
                case GroupByOption.Currency:
                    return GroupByCurrency(data);
                case GroupByOption.Player:
                    return GroupByPlayer(data);
                default:
                    return data;
            }
        }

        /// <summary>
        /// Groups daily actions by day
        /// </summary>
        private List<DailyActionDto> GroupByDay(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by day with {Count} records", dailyActions.Count);

            // Log unique dates in the input data
            var uniqueDates = dailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
            _logger.LogInformation("Found {Count} unique dates in the input data", uniqueDates.Count);

            // Ensure we have at least one record for each date
            if (uniqueDates.Count == 0)
            {
                _logger.LogWarning("No dates found in the input data. Returning empty list.");
                return new List<DailyActionDto>();
            }

            var result = dailyActions
                .GroupBy(da => da.Date.Date)
                .Select(group =>
                {
                    var dayName = group.Key.ToString("yyyy-MM-dd");
                    var recordCount = group.Count();

                    _logger.LogInformation("Creating day group for {Day} with {Count} records",
                        dayName, recordCount);

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = group.Key,
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Day",
                        GroupValue = dayName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
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
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();

            _logger.LogInformation("Grouped by day: returning {0} day groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by month
        /// </summary>
        private List<DailyActionDto> GroupByMonth(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by month with {Count} records", dailyActions.Count);

            var result = dailyActions
                .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                .Select(group =>
                {
                    var monthName = new DateTime(group.Key.Year, group.Key.Month, 1).ToString("yyyy-MM");
                    var recordCount = group.Count();

                    _logger.LogInformation("Creating month group for {Month} with {Count} records",
                        monthName, recordCount);

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key.Year, group.Key.Month, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Month",
                        GroupValue = monthName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
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
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();

            _logger.LogInformation("Grouped by month: returning {0} month groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by year
        /// </summary>
        private List<DailyActionDto> GroupByYear(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by year with {Count} records", dailyActions.Count);

            var result = dailyActions
                .GroupBy(da => da.Date.Year)
                .Select(group =>
                {
                    var yearName = group.Key.ToString();
                    var recordCount = group.Count();

                    _logger.LogInformation("Creating year group for {Year} with {Count} records",
                        yearName, recordCount);

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key, 1, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Year",
                        GroupValue = yearName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
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
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();

            _logger.LogInformation("Grouped by year: returning {0} year groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by white label
        /// </summary>
        private List<DailyActionDto> GroupByWhiteLabel(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by white label with {Count} records", dailyActions.Count);

            var result = dailyActions
                .GroupBy(da => da.WhiteLabelId)
                .Select(group =>
                {
                    var whiteLabelId = group.Key ?? 0;
                    var whiteLabelName = _whiteLabelNames.TryGetValue(whiteLabelId, out var name)
                        ? name
                        : $"White Label {whiteLabelId}";
                    var recordCount = group.Count();

                    _logger.LogInformation("Creating white label group for {WhiteLabel} with {Count} records",
                        whiteLabelName, recordCount);

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.MinValue, // Not applicable for grouped data
                        WhiteLabelId = whiteLabelId,
                        WhiteLabelName = whiteLabelName,
                        GroupKey = "Label",
                        GroupValue = whiteLabelName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
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
                    };
                })
                .OrderBy(da => da.WhiteLabelName)
                .ToList();

            _logger.LogInformation("Grouped by white label: returning {0} white label groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by country
        /// </summary>
        private List<DailyActionDto> GroupByCountry(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by country with {Count} records", dailyActions.Count);

            // For now, we'll just return a placeholder since we don't have country data in the DTO yet
            // This would need to be implemented once we have country data in the daily actions
            _logger.LogWarning("Country grouping not fully implemented yet");
            return new List<DailyActionDto>();
        }

        /// <summary>
        /// Groups daily actions by currency
        /// </summary>
        private List<DailyActionDto> GroupByCurrency(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by currency with {Count} records", dailyActions.Count);

            // For now, we'll just return a placeholder since we don't have currency data in the DTO yet
            // This would need to be implemented once we have currency data in the daily actions
            _logger.LogWarning("Currency grouping not fully implemented yet");
            return new List<DailyActionDto>();
        }

        /// <summary>
        /// Groups daily actions by player
        /// </summary>
        private List<DailyActionDto> GroupByPlayer(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by player with {Count} records", dailyActions.Count);

            // Filter out records without player IDs
            var actionsWithPlayerIds = dailyActions.Where(da => da.PlayerId.HasValue).ToList();
            _logger.LogInformation("Found {Count} records with player IDs", actionsWithPlayerIds.Count);

            if (actionsWithPlayerIds.Count == 0)
            {
                _logger.LogWarning("No records with player IDs found. Returning empty list.");
                return new List<DailyActionDto>();
            }

            var result = actionsWithPlayerIds
                .GroupBy(da => da.PlayerId)
                .Select(group =>
                {
                    var playerId = group.Key.HasValue ? group.Key.Value : 0;
                    var playerName = $"Player {playerId}";
                    var recordCount = group.Count();

                    _logger.LogInformation("Creating player group for {Player} with {Count} records",
                        playerName, recordCount);

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = DateTime.MinValue, // Not applicable for grouped data
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        PlayerId = playerId,
                        PlayerName = playerName,
                        GroupKey = "Player",
                        GroupValue = playerName,
                        // Sum all numeric fields
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
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
                    };
                })
                .OrderBy(da => da.PlayerId)
                .ToList();

            _logger.LogInformation("Grouped by player: returning {0} player groups", result.Count);
            return result;
        }

        /// <summary>
        /// Calculates summary metrics for the filtered data
        /// </summary>
        private DailyActionsSummaryDto CalculateSummaryMetrics(List<DailyActionDto> data)
        {
            return new DailyActionsSummaryDto
            {
                TotalRegistrations = data.Sum(da => da.Registrations),
                TotalFTD = data.Sum(da => da.FTD),
                TotalDeposits = data.Sum(da => da.Deposits),
                TotalCashouts = data.Sum(da => da.PaidCashouts),
                TotalBetsCasino = data.Sum(da => da.BetsCasino),
                TotalWinsCasino = data.Sum(da => da.WinsCasino),
                TotalBetsSport = data.Sum(da => da.BetsSport),
                TotalWinsSport = data.Sum(da => da.WinsSport),
                TotalBetsLive = data.Sum(da => da.BetsLive),
                TotalWinsLive = data.Sum(da => da.WinsLive),
                TotalBetsBingo = data.Sum(da => da.BetsBingo),
                TotalWinsBingo = data.Sum(da => da.WinsBingo),
                TotalGGR = data.Sum(da => da.TotalGGR)
            };
        }

        #endregion
    }
}
