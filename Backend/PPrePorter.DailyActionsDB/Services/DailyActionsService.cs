using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for daily actions operations
    /// </summary>
    public class DailyActionsService : IDailyActionsService
    {
        private readonly DailyActionsDbContext _dbContext;
        private readonly ILogger<DailyActionsService> _logger;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly IMemoryCache _cache;

        // Cache keys
        private const string METADATA_CACHE_KEY = "DailyActions_Metadata";
        private const int CACHE_EXPIRATION_MINUTES = 30;

        public DailyActionsService(
            DailyActionsDbContext dbContext,
            IWhiteLabelService whiteLabelService,
            ILogger<DailyActionsService> logger,
            IMemoryCache cache)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Build query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    // .Include(da => da.WhiteLabel) // Commented out for now
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (whiteLabelId.HasValue)
                {
                    // Check both WhiteLabelID and WhiteLabelId fields
                    query = query.Where(da =>
                        (da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == whiteLabelId.Value) ||
                        (da.WhiteLabelId.HasValue && da.WhiteLabelId.Value == whiteLabelId.Value));
                }

                // Execute query - don't use WithNoLock() here since we're using the NoLockInterceptor
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction?> GetDailyActionByIdAsync(int id)
        {
            try
            {
                return await _dbContext.DailyActions
                    // .Include(da => da.WhiteLabel) // Commented out for now
                    .FirstOrDefaultAsync(da => da.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action with ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction> AddDailyActionAsync(DailyAction dailyAction)
        {
            try
            {
                _dbContext.DailyActions.Add(dailyAction);
                await _dbContext.SaveChangesAsync();
                return dailyAction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding daily action for date {Date} and white label {WhiteLabelID}",
                    dailyAction.Date, dailyAction.WhiteLabelID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyAction> UpdateDailyActionAsync(DailyAction dailyAction)
        {
            try
            {
                _dbContext.Entry(dailyAction).State = EntityState.Modified;
                await _dbContext.SaveChangesAsync();
                return dailyAction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily action with ID {Id}", dailyAction.Id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteDailyActionAsync(int id)
        {
            try
            {
                var dailyAction = await _dbContext.DailyActions.FindAsync(id);
                if (dailyAction == null)
                {
                    return false;
                }

                _dbContext.DailyActions.Remove(dailyAction);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting daily action with ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionsSummary> GetSummaryMetricsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Get daily actions for the specified date range
                var dailyActions = await GetDailyActionsAsync(startDate, endDate, whiteLabelId);

                // Calculate summary metrics
                var summary = new DailyActionsSummary
                {
                    TotalRegistrations = dailyActions.Sum(da => da.Registration ?? 0),
                    TotalFTD = dailyActions.Sum(da => da.FTD ?? 0),
                    TotalDeposits = dailyActions.Sum(da => da.Deposits ?? 0),
                    TotalCashouts = dailyActions.Sum(da => da.PaidCashouts ?? 0),
                    TotalBetsCasino = dailyActions.Sum(da => da.BetsCasino ?? 0),
                    TotalWinsCasino = dailyActions.Sum(da => da.WinsCasino ?? 0),
                    TotalBetsSport = dailyActions.Sum(da => da.BetsSport ?? 0),
                    TotalWinsSport = dailyActions.Sum(da => da.WinsSport ?? 0),
                    TotalBetsLive = dailyActions.Sum(da => da.BetsLive ?? 0),
                    TotalWinsLive = dailyActions.Sum(da => da.WinsLive ?? 0),
                    TotalBetsBingo = dailyActions.Sum(da => da.BetsBingo ?? 0),
                    TotalWinsBingo = dailyActions.Sum(da => da.WinsBingo ?? 0)
                };

                // Calculate total GGR
                summary.TotalGGR = summary.TotalBetsCasino - summary.TotalWinsCasino +
                                  summary.TotalBetsSport - summary.TotalWinsSport +
                                  summary.TotalBetsLive - summary.TotalWinsLive +
                                  summary.TotalBetsBingo - summary.TotalWinsBingo;

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting summary metrics for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

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
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Build base query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (filter.WhiteLabelIds != null && filter.WhiteLabelIds.Count > 0)
                {
                    // Use a different approach to avoid OPENJSON issues
                    // Instead of using Contains which generates a subquery with OPENJSON,
                    // we'll build an OR expression for each white label ID
                    var whiteLabelIds = filter.WhiteLabelIds.ToArray();
                    if (whiteLabelIds.Length == 1)
                    {
                        // Simple case - just one white label ID
                        query = query.Where(da =>
                            (da.WhiteLabelID.HasValue && da.WhiteLabelID.Value == whiteLabelIds[0]) ||
                            (da.WhiteLabelId.HasValue && da.WhiteLabelId.Value == whiteLabelIds[0]));
                    }
                    else
                    {
                        // Multiple white label IDs - build a predicate
                        var parameter = System.Linq.Expressions.Expression.Parameter(typeof(DailyAction), "da");
                        var propertyID = System.Linq.Expressions.Expression.Property(parameter, "WhiteLabelID");
                        var propertyId = System.Linq.Expressions.Expression.Property(parameter, "WhiteLabelId");

                        // Build the combined expression for the first ID
                        var hasValueID = System.Linq.Expressions.Expression.Property(propertyID, "HasValue");
                        var valueID = System.Linq.Expressions.Expression.Property(propertyID, "Value");
                        var equalsID = System.Linq.Expressions.Expression.Equal(
                            valueID,
                            System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[0]));
                        var andID = System.Linq.Expressions.Expression.AndAlso(hasValueID, equalsID);

                        var hasValueId = System.Linq.Expressions.Expression.Property(propertyId, "HasValue");
                        var valueId = System.Linq.Expressions.Expression.Property(propertyId, "Value");
                        var equalsId = System.Linq.Expressions.Expression.Equal(
                            valueId,
                            System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[0]));
                        var andId = System.Linq.Expressions.Expression.AndAlso(hasValueId, equalsId);

                        // Combine with OR
                        var equals = System.Linq.Expressions.Expression.OrElse(andID, andId);

                        // Add the rest with OR
                        for (int i = 1; i < whiteLabelIds.Length; i++)
                        {
                            // Build for WhiteLabelID
                            var nextEqualsID = System.Linq.Expressions.Expression.Equal(
                                valueID,
                                System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[i]));
                            var nextAndID = System.Linq.Expressions.Expression.AndAlso(hasValueID, nextEqualsID);

                            // Build for WhiteLabelId
                            var nextEqualsId = System.Linq.Expressions.Expression.Equal(
                                valueId,
                                System.Linq.Expressions.Expression.Constant((short)whiteLabelIds[i]));
                            var nextAndId = System.Linq.Expressions.Expression.AndAlso(hasValueId, nextEqualsId);

                            // Combine with OR
                            var nextCombined = System.Linq.Expressions.Expression.OrElse(nextAndID, nextAndId);

                            // Add to the main expression
                            equals = System.Linq.Expressions.Expression.OrElse(equals, nextCombined);
                        }

                        // Create and apply the lambda expression
                        var lambda = System.Linq.Expressions.Expression.Lambda<Func<DailyAction, bool>>(
                            equals, parameter);
                        query = query.Where(lambda);
                    }
                }

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var pageSize = Math.Max(1, filter.PageSize);
                var pageNumber = Math.Max(1, filter.PageNumber);
                var skip = (pageNumber - 1) * pageSize;

                // Get data with pagination
                var dailyActions = await query
                    .OrderBy(da => da.Date)
                    .ThenBy(da => da.WhiteLabelID)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Map to DTOs
                var result = dailyActions.Select(da =>
                {
                    // Determine which WhiteLabel ID to use
                    int whiteLabelId = 0;
                    if (da.WhiteLabelID.HasValue)
                    {
                        whiteLabelId = (int)da.WhiteLabelID.Value;
                    }
                    else if (da.WhiteLabelId.HasValue)
                    {
                        whiteLabelId = (int)da.WhiteLabelId.Value;
                    }

                    // Get the white label name
                    string whiteLabelName = "Unknown";
                    if (whiteLabelId > 0 && whiteLabelDict.TryGetValue(whiteLabelId, out var name))
                    {
                        whiteLabelName = name;
                    }

                    return new DailyActionDto
                    {
                        Id = (int)da.Id,
                        Date = da.Date,
                        WhiteLabelId = whiteLabelId,
                        WhiteLabelName = whiteLabelName,
                        Registrations = da.Registration.HasValue ? (int)da.Registration.Value : 0,
                        FTD = da.FTD.HasValue ? (int)da.FTD.Value : 0,
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
                }).ToList();

                // Calculate summary metrics
                var summary = await GetSummaryMetricsAsync(startDate, endDate,
                    filter.WhiteLabelIds?.Count == 1 ? filter.WhiteLabelIds[0] : null);

                // Create response
                var response = new DailyActionResponseDto
                {
                    Data = result,
                    Summary = new DailyActionsSummaryDto
                    {
                        TotalRegistrations = summary.TotalRegistrations,
                        TotalFTD = summary.TotalFTD,
                        TotalDeposits = summary.TotalDeposits,
                        TotalCashouts = summary.TotalCashouts,
                        TotalBetsCasino = summary.TotalBetsCasino,
                        TotalWinsCasino = summary.TotalWinsCasino,
                        TotalBetsSport = summary.TotalBetsSport,
                        TotalWinsSport = summary.TotalWinsSport,
                        TotalBetsLive = summary.TotalBetsLive,
                        TotalWinsLive = summary.TotalWinsLive,
                        TotalBetsBingo = summary.TotalBetsBingo,
                        TotalWinsBingo = summary.TotalWinsBingo,
                        TotalGGR = summary.TotalGGR
                    },
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    StartDate = startDate,
                    EndDate = endDate,
                    AppliedFilters = filter
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered daily actions");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionMetadataDto> GetDailyActionsMetadataAsync()
        {
            try
            {
                // Try to get metadata from cache first
                if (_cache.TryGetValue(METADATA_CACHE_KEY, out DailyActionMetadataDto? cachedMetadata) && cachedMetadata != null)
                {
                    _logger.LogInformation("Retrieved daily actions metadata from cache");
                    return cachedMetadata;
                }

                _logger.LogInformation("Getting daily actions metadata from database");

                // Get white labels
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDtos = whiteLabels.Select(wl => new WhiteLabelDto
                {
                    Id = wl.Id,
                    Name = wl.Name,
                    Code = wl.Code,
                    IsActive = wl.IsActive ?? false
                }).ToList();

                // Get countries
                var countries = await _dbContext.Countries
                    .AsNoTracking()
                    // Don't use WithNoLock() here since we're using the NoLockInterceptor
                    .Where(c => c.IsActive == true)
                    .OrderBy(c => c.CountryName)
                    .ToListAsync();

                var countryDtos = countries.Select(c => new CountryDto
                {
                    Id = c.CountryID,
                    Name = c.CountryName,
                    IsoCode = c.IsoCode
                }).ToList();

                // Get currencies
                var currencies = await _dbContext.Currencies
                    .AsNoTracking()
                    // Don't use WithNoLock() here since we're using the NoLockInterceptor
                    .OrderBy(c => c.CurrencyName)
                    .ToListAsync();

                var currencyDtos = currencies.Select(c => new CurrencyDto
                {
                    Id = c.CurrencyID,
                    Name = c.CurrencyName,
                    Code = c.CurrencyCode,
                    Symbol = c.CurrencySymbol
                }).ToList();

                // Get distinct values from players table
                var players = await _dbContext.Players
                    .AsNoTracking()
                    // Don't use WithNoLock() here since we're using the NoLockInterceptor
                    .ToListAsync();

                var languages = players
                    .Where(p => !string.IsNullOrEmpty(p.Language))
                    .Select(p => p.Language)
                    .Distinct()
                    .OrderBy(l => l)
                    .ToList();

                var platforms = players
                    .Where(p => !string.IsNullOrEmpty(p.RegisteredPlatform))
                    .Select(p => p.RegisteredPlatform)
                    .Distinct()
                    .OrderBy(p => p)
                    .ToList();

                var genders = players
                    .Where(p => !string.IsNullOrEmpty(p.Gender))
                    .Select(p => p.Gender)
                    .Distinct()
                    .OrderBy(g => g)
                    .ToList();

                var statuses = players
                    .Where(p => !string.IsNullOrEmpty(p.Status))
                    .Select(p => p.Status)
                    .Distinct()
                    .OrderBy(s => s)
                    .ToList();

                var registrationPlayModes = players
                    .Where(p => !string.IsNullOrEmpty(p.RegistrationPlayMode))
                    .Select(p => p.RegistrationPlayMode)
                    .Distinct()
                    .OrderBy(r => r)
                    .ToList();

                var trackers = players
                    .Where(p => !string.IsNullOrEmpty(p.AffiliateID))
                    .Select(p => p.AffiliateID)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToList();

                // Create group by options
                var groupByOptions = new List<GroupByOptionDto>
                {
                    new() { Id = (int)GroupByOption.Day, Name = "Day", Value = "Day" },
                    new() { Id = (int)GroupByOption.Month, Name = "Month", Value = "Month" },
                    new() { Id = (int)GroupByOption.Year, Name = "Year", Value = "Year" },
                    new() { Id = (int)GroupByOption.Label, Name = "Label", Value = "Label" },
                    new() { Id = (int)GroupByOption.Country, Name = "Country", Value = "Country" },
                    new() { Id = (int)GroupByOption.Tracker, Name = "Tracker", Value = "Tracker" },
                    new() { Id = (int)GroupByOption.Currency, Name = "Currency", Value = "Currency" },
                    new() { Id = (int)GroupByOption.Gender, Name = "Gender", Value = "Gender" },
                    new() { Id = (int)GroupByOption.Platform, Name = "Platform", Value = "Platform" },
                    new() { Id = (int)GroupByOption.Ranking, Name = "Ranking", Value = "Ranking" }
                };

                // Create language DTOs
                var languageDtos = languages.Select((l, i) => new LanguageDto
                {
                    Id = i + 1,
                    Name = l ?? string.Empty,
                    Code = l ?? string.Empty
                }).ToList();

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

                // Cache the metadata
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetPriority(CacheItemPriority.High);

                _cache.Set(METADATA_CACHE_KEY, metadata, cacheOptions);
                _logger.LogInformation("Cached daily actions metadata for {Minutes} minutes", CACHE_EXPIRATION_MINUTES);

                return metadata;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions metadata");
                throw;
            }
        }
    }
}
