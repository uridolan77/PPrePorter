using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Extensions;
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
        private readonly IServiceProvider _serviceProvider;
        // We don't need the metadata service for this implementation

        // Static in-memory storage for historical daily actions (excluding today)
        private static ConcurrentDictionary<int, DailyActionDto> _historicalDailyActionsCache = new ConcurrentDictionary<int, DailyActionDto>();

        // Static in-memory storage for today's daily actions
        private static ConcurrentDictionary<int, DailyActionDto> _todayDailyActionsCache = new ConcurrentDictionary<int, DailyActionDto>();

        // Metadata dictionaries for quick lookups
        private Dictionary<int, string> _whiteLabelNames = new Dictionary<int, string>();
        private Dictionary<int, string> _countryNames = new Dictionary<int, string>();
        private Dictionary<string, string> _currencyNames = new Dictionary<string, string>();

        // Static status tracking
        private static bool _isInitialized = false;
        private static bool _isInitializing = false;
        private static DateTime _lastHistoricalRefreshTime = DateTime.MinValue;
        private static DateTime _lastTodayRefreshTime = DateTime.MinValue;
        private static SemaphoreSlim _initializationLock = new SemaphoreSlim(1, 1);
        private static SemaphoreSlim _todayRefreshLock = new SemaphoreSlim(1, 1);

        public InMemoryDailyActionsService(
            ILogger<InMemoryDailyActionsService> logger,
            DailyActionsDbContext dbContext,
            IWhiteLabelService whiteLabelService,
            IServiceProvider serviceProvider)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));

            _logger.LogInformation("InMemoryDailyActionsService created with STATIC collections. Cache state: IsInitialized={IsInitialized}, Records: Historical={HistoricalCount}, Today={TodayCount}",
                _isInitialized, _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count); // Can be null
        }

        /// <summary>
        /// Initializes the in-memory cache with historical daily actions data from the last 3 months (excluding today)
        /// </summary>
        public async Task InitializeAsync()
        {
            // Prevent multiple initialization attempts
            if (_isInitializing)
            {
                _logger.LogInformation("INITIALIZATION: Already in progress, skipping duplicate request");
                return;
            }

            await _initializationLock.WaitAsync();
            try
            {
                _isInitializing = true;
                _logger.LogInformation("INITIALIZATION: Starting initialization of in-memory daily actions cache");

                // Log current cache state before initialization
                _logger.LogInformation("INITIALIZATION: Current cache state before initialization - Historical: {HistoricalCount}, Today: {TodayCount}, IsInitialized: {IsInitialized}",
                    _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count, _isInitialized);

                // Load today's data and yesterday's data synchronously, then stop
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var tenDaysAgo = today.AddDays(-10);

                _logger.LogInformation("INITIALIZATION: Date calculations - today: {Today}, yesterday: {Yesterday}, tenDaysAgo: {TenDaysAgo}",
                    today.ToString("yyyy-MM-dd"), yesterday.ToString("yyyy-MM-dd"), tenDaysAgo.ToString("yyyy-MM-dd"));

                _logger.LogInformation("INITIALIZATION: Initializing with today's data and yesterday's data synchronously, then stopping");

                // Load metadata first
                await LoadMetadataAsync();

                // Start with today's data synchronously
                _logger.LogInformation("INITIALIZATION: Loading today's data synchronously for {Today}", today.ToString("yyyy-MM-dd"));
                await RefreshTodayDataAsync();

                // Check if there's any data in the database for the date range we're trying to load
                _logger.LogInformation("INITIALIZATION: Checking if there's any data in the database for the past 10 days");

                // Build a query to check if there's any data
                var checkQuery = _dbContext.DailyActions
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(da => da.Date >= tenDaysAgo && da.Date <= today);

                // Get the count of records for each day
                var dailyCounts = await checkQuery
                    .GroupBy(da => da.Date.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Date)
                    .ToListWithNoLockAsync();

                // Log the results
                if (dailyCounts.Count > 0)
                {
                    _logger.LogInformation("INITIALIZATION: Found data for {Count} days in the database:", dailyCounts.Count);
                    foreach (var dayCount in dailyCounts)
                    {
                        _logger.LogInformation("INITIALIZATION: Date: {Date}, Count: {Count}",
                            dayCount.Date.ToString("yyyy-MM-dd"), dayCount.Count);
                    }
                }
                else
                {
                    _logger.LogWarning("INITIALIZATION: No data found in the database for the past 10 days!");
                }

                // Load yesterday's data synchronously (just one day)
                _logger.LogInformation("INITIALIZATION: Loading yesterday's data synchronously for {Yesterday}", yesterday.ToString("yyyy-MM-dd"));
                var startOfYesterday = yesterday;
                var endOfYesterday = yesterday.AddDays(1).AddTicks(-1);

                // Load data for yesterday
                await LoadHistoricalDailyActionsAsync(startOfYesterday, endOfYesterday);

                // Update the last historical refresh time
                _lastHistoricalRefreshTime = DateTime.UtcNow;

                // Log progress
                _logger.LogInformation("INITIALIZATION: Loaded data for {Date}, historical cache now has {Count} records",
                    yesterday.ToString("yyyy-MM-dd"), _historicalDailyActionsCache.Count);

                // Set initialized flag to true after loading today and yesterday
                _isInitialized = true;

                // Start a background task to load the rest of the historical data
                _logger.LogInformation("INITIALIZATION: Starting background task to load historical data for the past 10 days");

                // Create a dedicated task to track the background loading
                var backgroundTask = Task.Run(async () =>
                {
                    try
                    {
                        _logger.LogInformation("BACKGROUND LOAD: Starting to load historical data day by day from {StartDate} to {EndDate}",
                            tenDaysAgo.ToString("yyyy-MM-dd"), yesterday.AddDays(-1).ToString("yyyy-MM-dd"));

                        // Calculate the expected number of days to process
                        int expectedDays = (int)(yesterday.AddDays(-1) - tenDaysAgo).TotalDays + 1;
                        _logger.LogInformation("BACKGROUND LOAD: Expected to process {ExpectedDays} days", expectedDays);

                        // Check if there are any days to load
                        if (yesterday.AddDays(-1) < tenDaysAgo)
                        {
                            _logger.LogWarning("BACKGROUND LOAD: No days to load - yesterday.AddDays(-1) = {YesterdayMinus1} is before tenDaysAgo = {TenDaysAgo}",
                                yesterday.AddDays(-1).ToString("yyyy-MM-dd"), tenDaysAgo.ToString("yyyy-MM-dd"));
                        }

                        int daysProcessed = 0;
                        DateTime startDate = yesterday.AddDays(-1);
                        DateTime endDate = tenDaysAgo;

                        _logger.LogInformation("BACKGROUND LOAD: Will process from {StartDate} to {EndDate} ({Days} days)",
                            startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"), expectedDays);

                        // Load historical data day by day (skip yesterday as it's already loaded)
                        for (var date = startDate; date >= endDate; date = date.AddDays(-1))
                        {
                            daysProcessed++;
                            _logger.LogInformation("BACKGROUND LOAD: Loading historical data for {Date} (day {DayNumber} of {TotalDays})",
                                date.ToString("yyyy-MM-dd"), daysProcessed, expectedDays);

                            var startOfDay = date;
                            var endOfDay = date.AddDays(1).AddTicks(-1);

                            // Log the exact parameters being used
                            _logger.LogInformation("BACKGROUND LOAD: Parameters - startDate: {StartDate}, endDate: {EndDate}",
                                startOfDay.ToString("yyyy-MM-dd HH:mm:ss.fffffff"), endOfDay.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));

                            try
                            {
                                // Create a new scope for each day to get a fresh DbContext
                                using (var scope = _serviceProvider.CreateScope())
                                {
                                    // Get a new DbContext instance from the scope
                                    var dbContext = scope.ServiceProvider.GetRequiredService<DailyActionsDbContext>();

                                    // Load data for this day using the new DbContext
                                    await LoadHistoricalDailyActionsForBackgroundAsync(dbContext, startOfDay, endOfDay);

                                    // Update the last historical refresh time
                                    _lastHistoricalRefreshTime = DateTime.UtcNow;

                                    // Log progress
                                    _logger.LogInformation("BACKGROUND LOAD: Loaded data for {Date}, historical cache now has {Count} records",
                                        date.ToString("yyyy-MM-dd"), _historicalDailyActionsCache.Count);
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "BACKGROUND LOAD: Error loading data for {Date}", date.ToString("yyyy-MM-dd"));
                                // Continue with the next day even if this one fails
                            }

                            // Add a small delay to avoid overwhelming the database
                            await Task.Delay(500);
                        }

                        _logger.LogInformation("BACKGROUND LOAD: Completed loading historical data for the past 10 days. Processed {DaysProcessed} days out of expected {ExpectedDays}.",
                            daysProcessed, expectedDays);

                        // Verify we processed the expected number of days
                        if (daysProcessed < expectedDays)
                        {
                            _logger.LogWarning("BACKGROUND LOAD: Only processed {DaysProcessed} days out of expected {ExpectedDays}. This may indicate an issue with the date range calculation.",
                                daysProcessed, expectedDays);
                        }

                        // Log the final state of the cache
                        var allData = new List<DailyActionDto>();
                        allData.AddRange(_historicalDailyActionsCache.Values);
                        allData.AddRange(_todayDailyActionsCache.Values);

                        var uniqueDates = allData
                            .Select(da => da.Date.Date)
                            .Distinct()
                            .OrderBy(d => d)
                            .ToList();

                        _logger.LogInformation("BACKGROUND LOAD: Final cache state - {TotalCount} total records across {UniqueDatesCount} unique dates: {UniqueDates}",
                            allData.Count, uniqueDates.Count, string.Join(", ", uniqueDates.Select(d => d.ToString("yyyy-MM-dd"))));

                        // Log the date range that should have been loaded
                        _logger.LogInformation("BACKGROUND LOAD: Expected date range was from {StartDate} to {EndDate} ({Days} days)",
                            tenDaysAgo.ToString("yyyy-MM-dd"), yesterday.ToString("yyyy-MM-dd"), expectedDays + 1);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "BACKGROUND LOAD: Error loading historical data in background");
                    }
                });

                // Log that we've started the background task
                _logger.LogInformation("INITIALIZATION: Background task started with ID {TaskId}", backgroundTask.Id);

                // Log detailed cache state after initialization
                var todayRowsInHistorical = _historicalDailyActionsCache.Values.Count(da => da.Date.Date == today);
                var todayRowsInTodayCache = _todayDailyActionsCache.Values.Count(da => da.Date.Date == today);

                _logger.LogInformation("INITIALIZATION: Cache initialized with {HistoricalCount} historical records and {TodayCount} today records",
                    _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count);
                _logger.LogInformation("INITIALIZATION: Records for today ({Today}): {TodayInHistorical} in historical cache, {TodayInTodayCache} in today's cache",
                    today.ToString("yyyy-MM-dd"), todayRowsInHistorical, todayRowsInTodayCache);

                // Log sample data from today's cache
                if (_todayDailyActionsCache.Count > 0)
                {
                    var sample = _todayDailyActionsCache.Values.Take(Math.Min(3, _todayDailyActionsCache.Count)).ToList();
                    foreach (var da in sample)
                    {
                        _logger.LogInformation("INITIALIZATION: Sample today's data: ID={Id}, Date={Date}, WhiteLabelId={WhiteLabelId}, PlayerId={PlayerId}",
                            da.Id, da.Date.ToString("yyyy-MM-dd"), da.WhiteLabelId, da.PlayerId);
                    }
                }
                else
                {
                    _logger.LogWarning("INITIALIZATION: No today's data found after initialization");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "INITIALIZATION: Error initializing in-memory daily actions cache");
                _isInitialized = false;
                throw;
            }
            finally
            {
                _isInitializing = false;
                _initializationLock.Release();
                _logger.LogInformation("INITIALIZATION: Completed with status IsInitialized={IsInitialized}", _isInitialized);
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
                _logger.LogInformation("Refreshing in-memory daily actions cache");

                // Check if historical data needs to be loaded (first time)
                if (_historicalDailyActionsCache.Count == 0)
                {
                    _logger.LogInformation("Historical data not loaded yet, loading last 3 months of data");

                    // Calculate date range (last 3 months excluding today)
                    var today = DateTime.UtcNow.Date;
                    var endDate = today.AddDays(-1).AddDays(1).AddTicks(-1); // End of yesterday
                    var startDate = today.AddMonths(-3).Date; // Start of 3 months ago

                    _logger.LogInformation("Loading historical daily actions from {StartDate} to {EndDate}",
                        startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                    // Load historical daily actions
                    await LoadHistoricalDailyActionsAsync(startDate, endDate);
                }

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
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate);

                // Execute query with NOLOCK hint and map to DTOs
                var yesterdayActions = await query.ToListWithNoLockAsync();
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

        /// <summary>
        /// Gets statistics about the daily action data in memory, including min/max dates and counts per day
        /// </summary>
        public DailyDataStatisticsDto GetDailyDataStatistics()
        {
            _logger.LogInformation("Getting daily data statistics from in-memory cache");

            // Combine historical and today's data
            var allData = new List<DailyActionDto>();
            allData.AddRange(_historicalDailyActionsCache.Values);
            allData.AddRange(_todayDailyActionsCache.Values);

            // Calculate min and max dates
            DateTime minDate = DateTime.MaxValue;
            DateTime maxDate = DateTime.MinValue;

            if (allData.Count > 0)
            {
                minDate = allData.Min(da => da.Date.Date);
                maxDate = allData.Max(da => da.Date.Date);
            }
            else
            {
                // If no data, use today's date for both min and max
                minDate = DateTime.UtcNow.Date;
                maxDate = DateTime.UtcNow.Date;
            }

            // Calculate counts per day
            var dailyCounts = allData
                .GroupBy(da => da.Date.Date)
                .OrderBy(g => g.Key)
                .ToDictionary(
                    g => g.Key.ToString("yyyy-MM-dd"),
                    g => g.Count()
                );

            // Log detailed statistics
            _logger.LogInformation("Daily data statistics: MinDate={MinDate}, MaxDate={MaxDate}, TotalCount={TotalCount}, DaysWithData={DaysWithData}",
                minDate.ToString("yyyy-MM-dd"), maxDate.ToString("yyyy-MM-dd"), allData.Count, dailyCounts.Count);

            // Log the counts for each day
            foreach (var dayCount in dailyCounts.OrderBy(kv => kv.Key))
            {
                _logger.LogInformation("Daily data statistics: Date={Date}, Count={Count}", dayCount.Key, dayCount.Value);
            }

            // Log the unique dates in the historical cache
            var historicalDates = _historicalDailyActionsCache.Values
                .Select(da => da.Date.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            _logger.LogInformation("Historical cache contains {Count} unique dates: {Dates}",
                historicalDates.Count, string.Join(", ", historicalDates.Select(d => d.ToString("yyyy-MM-dd"))));

            // Log the unique dates in today's cache
            var todayDates = _todayDailyActionsCache.Values
                .Select(da => da.Date.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            _logger.LogInformation("Today's cache contains {Count} unique dates: {Dates}",
                todayDates.Count, string.Join(", ", todayDates.Select(d => d.ToString("yyyy-MM-dd"))));

            // Create response
            var response = new DailyDataStatisticsDto
            {
                MinDate = minDate,
                MaxDate = maxDate,
                TotalCount = allData.Count,
                HistoricalCount = _historicalDailyActionsCache.Count,
                TodayCount = _todayDailyActionsCache.Count,
                LastHistoricalRefreshTime = _lastHistoricalRefreshTime,
                LastTodayRefreshTime = _lastTodayRefreshTime,
                DailyCounts = dailyCounts
            };

            return response;
        }

        /// <summary>
        /// Gets the raw daily action data from the in-memory cache without making any database calls
        /// </summary>
        public async Task<RawDailyActionResponseDto> GetRawDailyActionsAsync(
            DateTime startDate,
            DateTime endDate,
            bool includeHistorical = true,
            bool includeToday = true,
            int pageNumber = 1,
            int pageSize = 100)
        {
            // Just check if the cache is initialized, but don't initialize it
            if (!_isInitialized)
            {
                _logger.LogWarning("Cache not initialized. Will return data currently in memory without initializing.");
            }
            else if (_isInitializing)
            {
                _logger.LogWarning("Cache initialization in progress. Will return data currently in memory without waiting.");
            }

            _logger.LogInformation("Getting raw daily actions from in-memory cache with date range {StartDate} to {EndDate}, includeHistorical: {IncludeHistorical}, includeToday: {IncludeToday}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"), includeHistorical, includeToday);

            // Use the direct from memory method to avoid any database calls
            var response = GetRawDailyActionsDirectFromMemory(
                startDate,
                endDate,
                includeHistorical,
                includeToday,
                pageNumber,
                pageSize);

            // This is a synchronous operation, but we're keeping the async signature for consistency
            return await Task.FromResult(response);
        }

        /// <summary>
        /// Gets the raw daily action data directly from the in-memory cache without any database calls or initialization
        /// This method is guaranteed to never make any database calls
        /// </summary>
        public RawDailyActionResponseDto GetRawDailyActionsDirectFromMemory(
            DateTime startDate,
            DateTime endDate,
            bool includeHistorical = true,
            bool includeToday = true,
            int pageNumber = 1,
            int pageSize = 100)
        {
            _logger.LogInformation("Getting raw daily actions DIRECTLY from STATIC in-memory cache with NO DB CALLS. Date range {StartDate} to {EndDate}, includeHistorical: {IncludeHistorical}, includeToday: {IncludeToday}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"), includeHistorical, includeToday);

            // Log detailed cache state
            var today = DateTime.UtcNow.Date;
            var todayRowsInHistorical = _historicalDailyActionsCache.Values.Count(da => da.Date.Date == today);
            var todayRowsInTodayCache = _todayDailyActionsCache.Values.Count(da => da.Date.Date == today);

            _logger.LogInformation("CACHE STATE: Historical cache has {HistoricalCount} total records, Today's cache has {TodayCount} total records",
                _historicalDailyActionsCache.Count, _todayDailyActionsCache.Count);
            _logger.LogInformation("CACHE STATE: Records for today ({Today}): {TodayInHistorical} in historical cache, {TodayInTodayCache} in today's cache",
                today.ToString("yyyy-MM-dd"), todayRowsInHistorical, todayRowsInTodayCache);

            // Log initialization status
            _logger.LogInformation("CACHE STATE: IsInitialized={IsInitialized}, IsInitializing={IsInitializing}, LastHistoricalRefreshTime={LastHistoricalRefreshTime}, LastTodayRefreshTime={LastTodayRefreshTime}",
                _isInitialized, _isInitializing, _lastHistoricalRefreshTime, _lastTodayRefreshTime);

            // Log date ranges in cache
            if (_historicalDailyActionsCache.Count > 0)
            {
                var minHistoricalDate = _historicalDailyActionsCache.Values.Min(da => da.Date);
                var maxHistoricalDate = _historicalDailyActionsCache.Values.Max(da => da.Date);
                _logger.LogInformation("CACHE STATE: Historical cache date range: {MinDate} to {MaxDate}",
                    minHistoricalDate.ToString("yyyy-MM-dd"), maxHistoricalDate.ToString("yyyy-MM-dd"));
            }

            if (_todayDailyActionsCache.Count > 0)
            {
                var minTodayDate = _todayDailyActionsCache.Values.Min(da => da.Date);
                var maxTodayDate = _todayDailyActionsCache.Values.Max(da => da.Date);
                _logger.LogInformation("CACHE STATE: Today's cache date range: {MinDate} to {MaxDate}",
                    minTodayDate.ToString("yyyy-MM-dd"), maxTodayDate.ToString("yyyy-MM-dd"));
            }

            // Combine data based on parameters - just use what's in memory without refreshing
            var allData = new List<DailyActionDto>();

            // Add historical data if requested
            if (includeHistorical)
            {
                allData.AddRange(_historicalDailyActionsCache.Values);
                _logger.LogInformation("Added {Count} historical records from memory", _historicalDailyActionsCache.Count);
            }

            // Add today's data if requested
            if (includeToday)
            {
                allData.AddRange(_todayDailyActionsCache.Values);
                _logger.LogInformation("Added {Count} today records from memory", _todayDailyActionsCache.Count);
            }

            // Log requested date range vs. actual data
            _logger.LogInformation("REQUESTED DATE RANGE: {StartDate} to {EndDate}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Apply date range filter
            var filteredData = allData
                .Where(da => da.Date >= startDate && da.Date <= endDate)
                .OrderBy(da => da.Date)
                .ThenBy(da => da.WhiteLabelId)
                .ThenBy(da => da.PlayerId)
                .ToList();

            _logger.LogInformation("Found {Count} records in date range {StartDate} to {EndDate}",
                filteredData.Count, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Log unique dates in filtered data
            var uniqueDatesInFiltered = filteredData.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
            _logger.LogInformation("FILTERED DATA: Contains {Count} unique dates: {Dates}",
                uniqueDatesInFiltered.Count, string.Join(", ", uniqueDatesInFiltered.Select(d => d.ToString("yyyy-MM-dd"))));

            // Log sample data from filtered results
            if (filteredData.Count > 0)
            {
                var sample = filteredData.Take(Math.Min(3, filteredData.Count)).ToList();
                foreach (var da in sample)
                {
                    _logger.LogInformation("Sample filtered data: ID={Id}, Date={Date}, WhiteLabelId={WhiteLabelId}, PlayerId={PlayerId}",
                        da.Id, da.Date.ToString("yyyy-MM-dd"), da.WhiteLabelId, da.PlayerId);
                }
            }
            else
            {
                _logger.LogWarning("FILTERED DATA: No records found in the requested date range {StartDate} to {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
            }

            // Get total count before pagination
            int totalCount = filteredData.Count;

            // Apply pagination
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);
            int skip = (pageNumber - 1) * pageSize;

            // Apply pagination
            var pagedData = filteredData
                .Skip(skip)
                .Take(pageSize)
                .ToList();

            _logger.LogInformation("Returning {Count} records after pagination (page {Page}, size {Size})",
                pagedData.Count, pageNumber, pageSize);

            // Create response
            var response = new RawDailyActionResponseDto
            {
                Data = pagedData,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                CurrentPage = pageNumber,
                PageSize = pageSize,
                StartDate = startDate,
                EndDate = endDate,
                IncludesHistorical = includeHistorical,
                IncludesToday = includeToday,
                LastHistoricalRefreshTime = _lastHistoricalRefreshTime,
                LastTodayRefreshTime = _lastTodayRefreshTime
            };

            return response;
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
            _whiteLabelNames = whiteLabels.ToDictionary(wl => wl.Code != null ? int.Parse(wl.Code) : wl.Id, wl => wl.Name);
            _logger.LogInformation("Loaded {Count} white labels", _whiteLabelNames.Count);

            // Load countries
            var countries = await _dbContext.Countries
                .AsNoTracking()
                .WithForceNoLock()
                .Where(c => c.IsActive == true)
                .ToListWithNoLockAsync();
            _countryNames = countries.ToDictionary(c => c.CountryID, c => c.CountryName);
            _logger.LogInformation("Loaded {Count} countries", _countryNames.Count);

            // Load currencies
            var currencies = await _dbContext.Currencies
                .AsNoTracking()
                .WithForceNoLock()
                .ToListWithNoLockAsync();
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

            // Check if we're loading data for a single day
            bool isSingleDay = startDate.Date == endDate.Date || (endDate - startDate).TotalDays <= 1;
            string logPrefix = isSingleDay ? $"HISTORICAL-{startDate:yyyy-MM-dd}" : "HISTORICAL-RANGE";

            // Build optimized query with NOLOCK hint and joins
            var query = _dbContext.DailyActions
                .AsNoTracking()
                .WithForceNoLock()
                .Where(da => da.Date >= startDate && da.Date <= endDate);

            // Log the SQL query being executed
            var sql = query.ToQueryString();
            _logger.LogInformation("{Prefix}: Executing SQL query: {Sql}", logPrefix, sql);

            // Execute query with NOLOCK hint and map to DTOs
            var dailyActions = await query.ToListWithNoLockAsync();
            _logger.LogInformation("{Prefix}: Retrieved {Count} historical daily actions from database for date range {StartDate} to {EndDate}",
                logPrefix, dailyActions.Count, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Log unique dates in the retrieved data
            var uniqueDates = dailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
            _logger.LogInformation("{Prefix}: Retrieved data contains {Count} unique dates: {Dates}",
                logPrefix, uniqueDates.Count, string.Join(", ", uniqueDates.Take(10).Select(d => d.ToString("yyyy-MM-dd"))) +
                (uniqueDates.Count > 10 ? "..." : ""));

            // Log some sample data
            if (dailyActions.Count > 0)
            {
                var sample = dailyActions.Take(Math.Min(3, dailyActions.Count)).ToList();
                foreach (var da in sample)
                {
                    _logger.LogInformation("{Prefix}: Sample data: ID={Id}, Date={Date}, WhiteLabelID={WhiteLabelID}, PlayerID={PlayerID}",
                        logPrefix, da.Id, da.Date.ToString("yyyy-MM-dd"), da.WhiteLabelID, da.PlayerID);
                }
            }
            else
            {
                _logger.LogWarning("{Prefix}: No data found for date range {StartDate} to {EndDate}",
                    logPrefix, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
            }

            int addedCount = 0;
            // Map to DTOs and store in cache
            foreach (var da in dailyActions)
            {
                var dto = MapToDailyActionDto(da);
                if (_historicalDailyActionsCache.TryAdd(dto.Id, dto))
                {
                    addedCount++;
                }
            }

            _logger.LogInformation("{Prefix}: Added {AddedCount} new records to historical cache. Total historical cache now has {TotalCount} records",
                logPrefix, addedCount, _historicalDailyActionsCache.Count);

            // Only log the full cache state if we're not loading a single day (to reduce log noise)
            if (!isSingleDay || _historicalDailyActionsCache.Count < 1000)
            {
                // Log cache state after loading
                var minDate = _historicalDailyActionsCache.Values.Any() ?
                    _historicalDailyActionsCache.Values.Min(da => da.Date).ToString("yyyy-MM-dd") : "N/A";
                var maxDate = _historicalDailyActionsCache.Values.Any() ?
                    _historicalDailyActionsCache.Values.Max(da => da.Date).ToString("yyyy-MM-dd") : "N/A";
                _logger.LogInformation("{Prefix}: Historical cache now contains data from {MinDate} to {MaxDate}",
                    logPrefix, minDate, maxDate);
            }
        }

        /// <summary>
        /// Loads historical daily actions data into memory for the background task using a dedicated DbContext
        /// </summary>
        private async Task LoadHistoricalDailyActionsForBackgroundAsync(DailyActionsDbContext dbContext, DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("BACKGROUND LOAD: Loading historical daily actions from database for date range {StartDate} to {EndDate}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Check if we're loading data for a single day
            bool isSingleDay = startDate.Date == endDate.Date || (endDate - startDate).TotalDays <= 1;
            string logPrefix = isSingleDay ? $"BACKGROUND-{startDate:yyyy-MM-dd}" : "BACKGROUND-RANGE";

            try
            {
                // Build optimized query with NOLOCK hint and joins
                var query = dbContext.DailyActions
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(da => da.Date >= startDate && da.Date <= endDate);

                // Log the SQL query being executed
                var sql = query.ToQueryString();
                _logger.LogInformation("{Prefix}: Executing SQL query: {Sql}", logPrefix, sql);

                // Execute query with NOLOCK hint and map to DTOs
                var dailyActions = await query.ToListWithNoLockAsync();
                _logger.LogInformation("{Prefix}: Retrieved {Count} historical daily actions from database for date range {StartDate} to {EndDate}",
                    logPrefix, dailyActions.Count, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                // Log unique dates in the retrieved data
                var uniqueDates = dailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
                _logger.LogInformation("{Prefix}: Retrieved data contains {Count} unique dates: {Dates}",
                    logPrefix, uniqueDates.Count, string.Join(", ", uniqueDates.Take(10).Select(d => d.ToString("yyyy-MM-dd"))) +
                    (uniqueDates.Count > 10 ? "..." : ""));

                // Log some sample data
                if (dailyActions.Count > 0)
                {
                    var sample = dailyActions.Take(Math.Min(3, dailyActions.Count)).ToList();
                    foreach (var da in sample)
                    {
                        _logger.LogInformation("{Prefix}: Sample data: ID={Id}, Date={Date}, WhiteLabelID={WhiteLabelID}, PlayerID={PlayerID}",
                            logPrefix, da.Id, da.Date.ToString("yyyy-MM-dd"), da.WhiteLabelID, da.PlayerID);
                    }
                }
                else
                {
                    _logger.LogWarning("{Prefix}: No data found for date range {StartDate} to {EndDate}",
                        logPrefix, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
                }

                int addedCount = 0;
                // Map to DTOs and store in cache
                foreach (var da in dailyActions)
                {
                    var dto = MapToDailyActionDto(da);
                    if (_historicalDailyActionsCache.TryAdd(dto.Id, dto))
                    {
                        addedCount++;
                    }
                }

                _logger.LogInformation("{Prefix}: Added {AddedCount} new records to historical cache. Total historical cache now has {TotalCount} records",
                    logPrefix, addedCount, _historicalDailyActionsCache.Count);

                // Only log the full cache state if we're not loading a single day (to reduce log noise)
                if (!isSingleDay || _historicalDailyActionsCache.Count < 1000)
                {
                    // Log cache state after loading
                    var minDate = _historicalDailyActionsCache.Values.Any() ?
                        _historicalDailyActionsCache.Values.Min(da => da.Date).ToString("yyyy-MM-dd") : "N/A";
                    var maxDate = _historicalDailyActionsCache.Values.Any() ?
                        _historicalDailyActionsCache.Values.Max(da => da.Date).ToString("yyyy-MM-dd") : "N/A";
                    _logger.LogInformation("{Prefix}: Historical cache now contains data from {MinDate} to {MaxDate}",
                        logPrefix, minDate, maxDate);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Prefix}: Error loading historical daily actions for date range {StartDate} to {EndDate}",
                    logPrefix, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
                throw; // Rethrow to be caught by the caller
            }
        }

        /// <summary>
        /// Loads today's daily actions data into memory
        /// </summary>
        private async Task LoadTodayDailyActionsAsync(DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("Loading today's daily actions from database for date range {StartDate} to {EndDate}",
                startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

            // Clear existing today's cache before loading new data
            int previousCount = _todayDailyActionsCache.Count;
            _todayDailyActionsCache.Clear();
            _logger.LogInformation("Cleared today's cache which had {Count} records", previousCount);

            // Build optimized query with NOLOCK hint and joins
            var query = _dbContext.DailyActions
                .AsNoTracking()
                .WithForceNoLock()
                .Where(da => da.Date >= startDate && da.Date <= endDate);

            // Execute query with NOLOCK hint and map to DTOs
            var dailyActions = await query.ToListWithNoLockAsync();
            _logger.LogInformation("Retrieved {Count} today's daily actions from database", dailyActions.Count);

            // Log unique dates in the retrieved data
            var uniqueDates = dailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
            _logger.LogInformation("Today's data contains {Count} unique dates: {Dates}",
                uniqueDates.Count, string.Join(", ", uniqueDates.Select(d => d.ToString("yyyy-MM-dd"))));

            // Log some sample data
            if (dailyActions.Count > 0)
            {
                var sample = dailyActions.Take(Math.Min(5, dailyActions.Count)).ToList();
                foreach (var da in sample)
                {
                    _logger.LogInformation("Sample today's data: ID={Id}, Date={Date}, WhiteLabelID={WhiteLabelID}, PlayerID={PlayerID}",
                        da.Id, da.Date.ToString("yyyy-MM-dd"), da.WhiteLabelID, da.PlayerID);
                }
            }
            else
            {
                _logger.LogWarning("No today's data found in database for date range {StartDate} to {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
            }

            int addedCount = 0;
            // Map to DTOs and store in cache
            foreach (var da in dailyActions)
            {
                var dto = MapToDailyActionDto(da);
                if (_todayDailyActionsCache.TryAdd(dto.Id, dto))
                {
                    addedCount++;
                }
            }

            _logger.LogInformation("Added {AddedCount} records to today's cache. Total today's cache now has {TotalCount} records",
                addedCount, _todayDailyActionsCache.Count);

            // Log cache state after loading
            if (_todayDailyActionsCache.Count > 0)
            {
                var minDate = _todayDailyActionsCache.Values.Min(da => da.Date).ToString("yyyy-MM-dd");
                var maxDate = _todayDailyActionsCache.Values.Max(da => da.Date).ToString("yyyy-MM-dd");
                _logger.LogInformation("Today's cache now contains data from {MinDate} to {MaxDate}", minDate, maxDate);
            }
            else
            {
                _logger.LogWarning("Today's cache is empty after loading");
            }
        }

        /// <summary>
        /// Maps a DailyAction entity to a DailyActionDto
        /// </summary>
        private DailyActionDto MapToDailyActionDto(DailyAction da)
        {
            // Get white label name
            string whiteLabelName = "Unknown";
            if (da.WhiteLabelID.HasValue)
            {
                // The WhiteLabelID in DailyAction is actually the Code field, not the Id field
                int whiteLabelId = da.WhiteLabelID.Value;
                if (_whiteLabelNames.TryGetValue(whiteLabelId, out var name))
                {
                    whiteLabelName = name;
                }
            }

            return new DailyActionDto
            {
                Id = (int)da.Id, // Need to cast from long to int
                Date = da.Date,
                WhiteLabelId = da.WhiteLabelID ?? 0,
                WhiteLabelName = whiteLabelName,
                PlayerId = da.PlayerID,
                PlayerName = da.PlayerID != null ? $"Player {da.PlayerID}" : "Unknown",
                // Add other properties as needed
                Registrations = da.Registration ?? 0,
                FTD = da.FTD ?? 0,
                FTDA = da.FTDA,
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

            return groupBy switch
            {
                GroupByOption.Day => GroupByDay(data),
                GroupByOption.Month => GroupByMonth(data),
                GroupByOption.Year => GroupByYear(data),
                GroupByOption.Label => GroupByWhiteLabel(data),
                GroupByOption.Country => GroupByCountry(data),
                GroupByOption.Currency => GroupByCurrency(data),
                GroupByOption.Player => GroupByPlayer(data),
                _ => data
            };
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
                return [];
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

            _logger.LogInformation("Grouped by day: returning {Count} day groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by month
        /// </summary>
        private List<DailyActionDto> GroupByMonth(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by month with {Count} records", dailyActions.Count);

            var result = dailyActions
                .GroupBy(da => new { da.Date.Year, da.Date.Month })
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

            _logger.LogInformation("Grouped by month: returning {Count} month groups", result.Count);
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

            _logger.LogInformation("Grouped by year: returning {Count} year groups", result.Count);
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
                    var whiteLabelId = group.Key;
                    // The WhiteLabelId in DailyAction is actually the Code field, not the Id field
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

            _logger.LogInformation("Grouped by white label: returning {Count} white label groups", result.Count);
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
            return [];
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
            return [];
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
                return [];
            }

            var result = actionsWithPlayerIds
                .GroupBy(da => da.PlayerId)
                .Select(group =>
                {
                    var playerId = group.Key ?? 0;
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

            _logger.LogInformation("Grouped by player: returning {Count} player groups", result.Count);
            return result;
        }

        /// <summary>
        /// Calculates summary metrics for the filtered data
        /// </summary>
        private static DailyActionsSummaryDto CalculateSummaryMetrics(List<DailyActionDto> data)
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
