using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System.Text.Json;
using System.Text;
using CsvHelper;
using System.Globalization;

namespace PPrePorter.API.Features.Reports.Controllers.Players
{
    /// <summary>
    /// Partial class for PlayerController containing daily action summary endpoints
    /// </summary>
    public partial class PlayerController
    {
        /// <summary>
        /// Get player daily action summary for a specific date range
        /// </summary>
        /// <param name="startDate">Start date for the report (defaults to yesterday)</param>
        /// <param name="endDate">End date for the report (defaults to today)</param>
        /// <param name="casinoName">Optional casino name filter</param>
        /// <param name="country">Optional country filter</param>
        /// <param name="currency">Optional currency filter</param>
        /// <param name="groupBy">Optional group by option (numeric enum value: 0=Day, 1=Month, 2=Year, 3=Label, 4=Country, 10=Player, etc.)</param>
        /// <param name="groupByString">Optional group by option as string (alternative to numeric enum, e.g., "Day", "Month", "Year", "Label", "Country", "Player")</param>
        /// <param name="page">Page number (1-based, defaults to 1)</param>
        /// <param name="pageSize">Page size (defaults to 20, max 100)</param>
        [HttpGet("daily-action-summary")]
        public async Task<IActionResult> GetPlayerDailyActionSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? casinoName = null,
            [FromQuery] string? country = null,
            [FromQuery] string? currency = null,
            [FromQuery] GroupByOption? groupBy = null,
            [FromQuery] string? groupByString = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetPlayerDailyActionSummary request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Set default dates if not provided
                startDate ??= DateTime.UtcNow.Date.AddDays(-1); // Yesterday
                endDate ??= DateTime.UtcNow.Date; // Today

                // Validate page and pageSize
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 20;
                if (pageSize > 100) pageSize = 100;

                // Process string-based group by if provided
                if (!string.IsNullOrEmpty(groupByString) && groupBy == null)
                {
                    // Try to parse as enum directly (case-insensitive)
                    if (Enum.TryParse<GroupByOption>(groupByString, true, out var parsedGroupBy))
                    {
                        groupBy = parsedGroupBy;
                        _logger.LogInformation("Converted groupByString '{GroupByString}' to groupBy enum value '{GroupBy}'",
                            groupByString, groupBy);
                    }
                    else
                    {
                        _logger.LogWarning("Could not parse groupByString '{GroupByString}' to a valid GroupByOption enum value",
                            groupByString);
                    }
                }

                // Log the parameters
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Getting player daily action summary with parameters: " +
                    "startDate={StartDate}, endDate={EndDate}, casinoName={CasinoName}, country={Country}, " +
                    "currency={Currency}, groupBy={GroupBy}, groupByString={GroupByString}, page={Page}, pageSize={PageSize}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    startDate?.ToString("yyyy-MM-dd"),
                    endDate?.ToString("yyyy-MM-dd"),
                    casinoName, country, currency, groupBy, groupByString, page, pageSize);

                // Create cache key
                string cacheKey = $"PlayerDailyActionSummary_{startDate?.ToString("yyyyMMdd")}_{endDate?.ToString("yyyyMMdd")}_" +
                    $"{casinoName ?? "all"}_{country ?? "all"}_{currency ?? "all"}_{groupBy?.ToString() ?? "none"}_{page}_{pageSize}";

                // Try to get from cache first
                if (_cacheService.TryGetValue(cacheKey, out PlayerDailyActionSummaryResponseDto? cachedResponse))
                {
                    _logger.LogInformation("CACHE HIT: Retrieved player daily action summary from cache, key: {CacheKey}", cacheKey);
                    return Ok(cachedResponse);
                }

                _logger.LogInformation("CACHE MISS: Getting player daily action summary from database, cache key: {CacheKey}", cacheKey);

                // Get players based on filters
                var getPlayersStartTime = DateTime.UtcNow;
                IEnumerable<PPrePorter.DailyActionsDB.Models.Players.Player> players;

                if (!string.IsNullOrEmpty(casinoName))
                {
                    players = await _playerService.GetPlayersByCasinoNameAsync(casinoName);
                }
                else if (!string.IsNullOrEmpty(country))
                {
                    players = await _playerService.GetPlayersByCountryAsync(country);
                }
                else if (!string.IsNullOrEmpty(currency))
                {
                    players = await _playerService.GetPlayersByCurrencyAsync(currency);
                }
                else
                {
                    // Get all players if no filters are specified
                    players = await _playerService.GetAllPlayersAsync();
                }

                var getPlayersEndTime = DateTime.UtcNow;
                var getPlayersElapsedMs = (getPlayersEndTime - getPlayersStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Retrieved {Count} players in {ElapsedMs}ms",
                    getPlayersEndTime.ToString("HH:mm:ss.fff"), players.Count(), getPlayersElapsedMs);

                // Get daily actions for the date range
                var getDailyActionsStartTime = DateTime.UtcNow;
                var dailyActions = await _dailyActionsService.GetDailyActionsAsync(startDate.Value, endDate.Value);
                var getDailyActionsEndTime = DateTime.UtcNow;
                var getDailyActionsElapsedMs = (getDailyActionsEndTime - getDailyActionsStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Retrieved {Count} daily actions in {ElapsedMs}ms",
                    getDailyActionsEndTime.ToString("HH:mm:ss.fff"), dailyActions.Count(), getDailyActionsElapsedMs);

                // Group daily actions by player ID and calculate summaries
                var groupStartTime = DateTime.UtcNow;
                var playerDailySummaries = new List<PlayerDailyActionSummaryDto>();

                // Group daily actions by player ID
                var groupedDailyActions = dailyActions
                    .Where(da => da.PlayerID.HasValue)
                    .GroupBy(da => da.PlayerID.Value);

                foreach (var group in groupedDailyActions)
                {
                    var playerId = group.Key;
                    var player = players.FirstOrDefault(p => p.PlayerID == playerId);

                    if (player == null) continue;

                    var summary = new PlayerDailyActionSummaryDto
                    {
                        PlayerId = player.PlayerID,
                        Alias = player.Alias,
                        FirstName = player.FirstName,
                        LastName = player.LastName,
                        Email = player.Email,
                        Country = player.Country,
                        Currency = player.Currency,
                        CasinoName = player.CasinoName,
                        RegisteredDate = player.RegisteredDate,
                        FirstDepositDate = player.FirstDepositDate,
                        LastLoginDate = player.LastLoginDate,
                        Balance = player.Balance,
                        VIPLevel = player.VIPLevel,

                        // Aggregate daily action metrics
                        TotalDeposits = group.Sum(da => da.Deposits ?? 0),
                        TotalCashouts = group.Sum(da => da.PaidCashouts ?? 0),
                        TotalBetsCasino = group.Sum(da => da.BetsCasino ?? 0),
                        TotalWinsCasino = group.Sum(da => da.WinsCasino ?? 0),
                        TotalBetsSport = group.Sum(da => da.BetsSport ?? 0),
                        TotalWinsSport = group.Sum(da => da.WinsSport ?? 0),
                        TotalBetsLive = group.Sum(da => da.BetsLive ?? 0),
                        TotalWinsLive = group.Sum(da => da.WinsLive ?? 0),
                        TotalBetsBingo = group.Sum(da => da.BetsBingo ?? 0),
                        TotalWinsBingo = group.Sum(da => da.WinsBingo ?? 0),
                        Registrations = group.Sum(da => da.Registration ?? 0),
                        FTDs = group.Sum(da => da.FTD ?? 0)
                    };

                    playerDailySummaries.Add(summary);
                }

                var groupEndTime = DateTime.UtcNow;
                var groupElapsedMs = (groupEndTime - groupStartTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Grouped and calculated summaries for {Count} players in {ElapsedMs}ms",
                    groupEndTime.ToString("HH:mm:ss.fff"), playerDailySummaries.Count, groupElapsedMs);

                // Apply pagination
                var totalCount = playerDailySummaries.Count;
                var pagedData = playerDailySummaries
                    .OrderByDescending(p => p.TotalGGR)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                // Create response
                var response = new PlayerDailyActionSummaryResponseDto
                {
                    Data = pagedData,
                    TotalCount = totalCount,
                    StartDate = startDate.Value,
                    EndDate = endDate.Value,
                    Filters = new
                    {
                        casinoName,
                        country,
                        currency,
                        page,
                        pageSize
                    }
                };

                // Cache the response
                _cacheService.Set(cacheKey, response, TimeSpan.FromMinutes(30));

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetPlayerDailyActionSummary request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving player daily action summary");
                return StatusCode(500, new { message = "An error occurred while retrieving player daily action summary" });
            }
        }

        /// <summary>
        /// Export player daily action summary for a specific date range
        /// </summary>
        /// <param name="startDate">Start date for the report (defaults to yesterday)</param>
        /// <param name="endDate">End date for the report (defaults to today)</param>
        /// <param name="casinoName">Optional casino name filter</param>
        /// <param name="country">Optional country filter</param>
        /// <param name="currency">Optional currency filter</param>
        /// <param name="groupBy">Optional group by option (numeric enum value: 0=Day, 1=Month, 2=Year, 3=Label, 4=Country, 10=Player, etc.)</param>
        /// <param name="groupByString">Optional group by option as string (alternative to numeric enum, e.g., "Day", "Month", "Year", "Label", "Country", "Player")</param>
        /// <param name="format">Export format (json or csv, defaults to csv)</param>
        [HttpGet("daily-action-summary/export")]
        public async Task<IActionResult> ExportPlayerDailyActionSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? casinoName = null,
            [FromQuery] string? country = null,
            [FromQuery] string? currency = null,
            [FromQuery] GroupByOption? groupBy = null,
            [FromQuery] string? groupByString = null,
            [FromQuery] string format = "csv")
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting ExportPlayerDailyActionSummary request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Set default dates if not provided
                startDate ??= DateTime.UtcNow.Date.AddDays(-1); // Yesterday
                endDate ??= DateTime.UtcNow.Date; // Today

                // Process string-based group by if provided
                if (!string.IsNullOrEmpty(groupByString) && groupBy == null)
                {
                    // Try to parse as enum directly (case-insensitive)
                    if (Enum.TryParse<GroupByOption>(groupByString, true, out var parsedGroupBy))
                    {
                        groupBy = parsedGroupBy;
                        _logger.LogInformation("Converted groupByString '{GroupByString}' to groupBy enum value '{GroupBy}'",
                            groupByString, groupBy);
                    }
                    else
                    {
                        _logger.LogWarning("Could not parse groupByString '{GroupByString}' to a valid GroupByOption enum value",
                            groupByString);
                    }
                }

                // Log the parameters
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Exporting player daily action summary with parameters: " +
                    "startDate={StartDate}, endDate={EndDate}, casinoName={CasinoName}, country={Country}, " +
                    "currency={Currency}, groupBy={GroupBy}, groupByString={GroupByString}, format={Format}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    startDate?.ToString("yyyy-MM-dd"),
                    endDate?.ToString("yyyy-MM-dd"),
                    casinoName, country, currency, groupBy, groupByString, format);

                // Get players based on filters
                IEnumerable<PPrePorter.DailyActionsDB.Models.Players.Player> players;

                if (!string.IsNullOrEmpty(casinoName))
                {
                    players = await _playerService.GetPlayersByCasinoNameAsync(casinoName);
                }
                else if (!string.IsNullOrEmpty(country))
                {
                    players = await _playerService.GetPlayersByCountryAsync(country);
                }
                else if (!string.IsNullOrEmpty(currency))
                {
                    players = await _playerService.GetPlayersByCurrencyAsync(currency);
                }
                else
                {
                    // Get all players if no filters are specified
                    players = await _playerService.GetAllPlayersAsync();
                }

                // Get daily actions for the date range
                var dailyActions = await _dailyActionsService.GetDailyActionsAsync(startDate.Value, endDate.Value);

                // Group daily actions by player ID and calculate summaries
                var playerDailySummaries = new List<PlayerDailyActionSummaryDto>();

                // Group daily actions by player ID
                var groupedDailyActions = dailyActions
                    .Where(da => da.PlayerID.HasValue)
                    .GroupBy(da => da.PlayerID.Value);

                foreach (var group in groupedDailyActions)
                {
                    var playerId = group.Key;
                    var player = players.FirstOrDefault(p => p.PlayerID == playerId);

                    if (player == null) continue;

                    var summary = new PlayerDailyActionSummaryDto
                    {
                        PlayerId = player.PlayerID,
                        Alias = player.Alias,
                        FirstName = player.FirstName,
                        LastName = player.LastName,
                        Email = player.Email,
                        Country = player.Country,
                        Currency = player.Currency,
                        CasinoName = player.CasinoName,
                        RegisteredDate = player.RegisteredDate,
                        FirstDepositDate = player.FirstDepositDate,
                        LastLoginDate = player.LastLoginDate,
                        Balance = player.Balance,
                        VIPLevel = player.VIPLevel,

                        // Aggregate daily action metrics
                        TotalDeposits = group.Sum(da => da.Deposits ?? 0),
                        TotalCashouts = group.Sum(da => da.PaidCashouts ?? 0),
                        TotalBetsCasino = group.Sum(da => da.BetsCasino ?? 0),
                        TotalWinsCasino = group.Sum(da => da.WinsCasino ?? 0),
                        TotalBetsSport = group.Sum(da => da.BetsSport ?? 0),
                        TotalWinsSport = group.Sum(da => da.WinsSport ?? 0),
                        TotalBetsLive = group.Sum(da => da.BetsLive ?? 0),
                        TotalWinsLive = group.Sum(da => da.WinsLive ?? 0),
                        TotalBetsBingo = group.Sum(da => da.BetsBingo ?? 0),
                        TotalWinsBingo = group.Sum(da => da.WinsBingo ?? 0),
                        Registrations = group.Sum(da => da.Registration ?? 0),
                        FTDs = group.Sum(da => da.FTD ?? 0)
                    };

                    playerDailySummaries.Add(summary);
                }

                // Order by total GGR descending
                playerDailySummaries = playerDailySummaries.OrderByDescending(p => p.TotalGGR).ToList();

                // Generate file name
                string dateRange = $"{startDate:yyyyMMdd}-{endDate:yyyyMMdd}";
                string fileName = $"player-daily-action-summary_{dateRange}";

                // Export based on format
                if (format.Equals("json", StringComparison.OrdinalIgnoreCase))
                {
                    // Export as JSON
                    var jsonData = JsonSerializer.Serialize(playerDailySummaries, _jsonOptions);
                    byte[] jsonBytes = Encoding.UTF8.GetBytes(jsonData);

                    // Log total request time
                    var endTime = DateTime.UtcNow;
                    var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: Total ExportPlayerDailyActionSummary (JSON) request completed in {ElapsedMs}ms",
                        endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                    return File(jsonBytes, "application/json", $"{fileName}.json");
                }
                else
                {
                    // Export as CSV (default)
                    using var memoryStream = new MemoryStream();
                    using var writer = new StreamWriter(memoryStream);
                    using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                    // Write records
                    csv.WriteRecords(playerDailySummaries);
                    writer.Flush();

                    // Log total request time
                    var endTime = DateTime.UtcNow;
                    var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                    _logger.LogInformation("PERF [{Timestamp}]: Total ExportPlayerDailyActionSummary (CSV) request completed in {ElapsedMs}ms",
                        endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                    return File(memoryStream.ToArray(), "text/csv", $"{fileName}.csv");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting player daily action summary");
                return StatusCode(500, new { message = "An error occurred while exporting player daily action summary" });
            }
        }
    }
}
