using Microsoft.AspNetCore.Mvc;
using PPrePorter.Core.Models.DTOs;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Partial class for DailyActionGameController containing data retrieval endpoints
    /// </summary>
    public partial class DailyActionGameController
    {
        /// <summary>
        /// Get daily action games data with basic filters
        /// </summary>
        /// <param name="startDate">Start date (defaults to yesterday)</param>
        /// <param name="endDate">End date (defaults to today)</param>
        /// <param name="playerId">Optional player ID filter</param>
        /// <param name="gameId">Optional game ID filter</param>
        [HttpGet("data")]
        public async Task<IActionResult> GetDailyActionGamesData(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] long? playerId = null,
            [FromQuery] long? gameId = null)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetDailyActionGamesData request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var start = startDate?.Date ?? yesterday;
                var end = endDate?.Date ?? today;

                // Log the parameters being used for the cache key
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Getting daily action games with parameters: startDate={StartDate}, endDate={EndDate}, playerId={PlayerId}, gameId={GameId}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), playerId, gameId);

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"DailyActionGames_Data_{start:yyyyMMdd}_{end:yyyyMMdd}_{playerId?.ToString() ?? "all"}_{gameId?.ToString() ?? "all"}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get daily action games data - measure time
                var getDataStartTime = DateTime.UtcNow;

                // Get data based on filters
                IEnumerable<DailyActionGameDto> dailyActionGames;

                if (playerId.HasValue)
                {
                    // Use the method that filters by player ID
                    var playerGames = await _dailyActionGameService.GetDailyActionGamesByPlayerIdAsync(playerId.Value);
                    // Apply date range filter
                    dailyActionGames = playerGames.Where(g => g.GameDate >= start && g.GameDate <= end);
                }
                else if (gameId.HasValue)
                {
                    // Use the method that filters by game ID
                    var gameGames = await _dailyActionGameService.GetDailyActionGamesByGameIdAsync(gameId.Value);
                    // Apply date range filter
                    dailyActionGames = gameGames.Where(g => g.GameDate >= start && g.GameDate <= end);
                }
                else
                {
                    // Use the method that filters by date range
                    dailyActionGames = await _dailyActionGameService.GetDailyActionGamesByDateRangeAsync(start, end);
                }

                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetDailyActionGamesData completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Limit the number of records to prevent Swagger UI from crashing
                var limitedDailyActionGames = dailyActionGames.Take(100).ToList();
                _logger.LogInformation("Retrieved {TotalCount} daily action games, limiting to {LimitedCount} for the response",
                    dailyActionGames.Count(), limitedDailyActionGames.Count);

                // Create a dynamic object with all properties from DailyActionGame
                var result = limitedDailyActionGames.Select(game =>
                {
                    // Create a dynamic object to hold all properties
                    var obj = new ExpandoObject() as IDictionary<string, object>;

                    // Add all properties from DailyActionGame
                    obj["id"] = game.ID;
                    obj["gameDate"] = game.GameDate;
                    obj["playerId"] = game.PlayerID;
                    obj["gameId"] = game.GameID;
                    obj["platform"] = game.Platform;
                    obj["realBetAmount"] = game.RealBetAmount ?? 0;
                    obj["realWinAmount"] = game.RealWinAmount ?? 0;
                    obj["bonusBetAmount"] = game.BonusBetAmount ?? 0;
                    obj["bonusWinAmount"] = game.BonusWinAmount ?? 0;
                    obj["netGamingRevenue"] = game.NetGamingRevenue ?? 0;
                    obj["numberOfRealBets"] = game.NumberofRealBets ?? 0;
                    obj["numberOfBonusBets"] = game.NumberofBonusBets ?? 0;
                    obj["numberOfSessions"] = game.NumberofSessions ?? 0;
                    obj["numberOfRealWins"] = game.NumberofRealWins ?? 0;
                    obj["numberOfBonusWins"] = game.NumberofBonusWins ?? 0;
                    obj["realBetAmountOriginal"] = game.RealBetAmountOriginal ?? 0;
                    obj["realWinAmountOriginal"] = game.RealWinAmountOriginal ?? 0;
                    obj["bonusBetAmountOriginal"] = game.BonusBetAmountOriginal ?? 0;
                    obj["bonusWinAmountOriginal"] = game.BonusWinAmountOriginal ?? 0;
                    obj["netGamingRevenueOriginal"] = game.NetGamingRevenueOriginal ?? 0;
                    obj["updateDate"] = game.UpdateDate;

                    return obj;
                }).ToList();

                // Prepare response
                var response = new
                {
                    data = result,
                    totalCount = dailyActionGames.Count(),
                    startDate = start,
                    endDate = end
                };

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetDailyActionGamesData request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily action games data");
                return StatusCode(500, new { message = "An error occurred while retrieving daily action games data" });
            }
        }

        /// <summary>
        /// Get a specific daily action game by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDailyActionGameById(long id)
        {
            try
            {
                var dailyActionGame = await _dailyActionGameService.GetDailyActionGameByIdAsync(id);

                if (dailyActionGame == null)
                {
                    return NotFound(new { message = $"Daily action game with ID {id} not found" });
                }

                // Create a dynamic object with all properties from DailyActionGame
                var obj = new ExpandoObject() as IDictionary<string, object>;

                // Add all properties
                obj["id"] = dailyActionGame.ID;
                obj["gameDate"] = dailyActionGame.GameDate;
                obj["playerId"] = dailyActionGame.PlayerID;
                obj["gameId"] = dailyActionGame.GameID;
                obj["platform"] = dailyActionGame.Platform;
                obj["realBetAmount"] = dailyActionGame.RealBetAmount ?? 0;
                obj["realWinAmount"] = dailyActionGame.RealWinAmount ?? 0;
                obj["bonusBetAmount"] = dailyActionGame.BonusBetAmount ?? 0;
                obj["bonusWinAmount"] = dailyActionGame.BonusWinAmount ?? 0;
                obj["netGamingRevenue"] = dailyActionGame.NetGamingRevenue ?? 0;
                obj["numberOfRealBets"] = dailyActionGame.NumberofRealBets ?? 0;
                obj["numberOfBonusBets"] = dailyActionGame.NumberofBonusBets ?? 0;
                obj["numberOfSessions"] = dailyActionGame.NumberofSessions ?? 0;
                obj["numberOfRealWins"] = dailyActionGame.NumberofRealWins ?? 0;
                obj["numberOfBonusWins"] = dailyActionGame.NumberofBonusWins ?? 0;
                obj["realBetAmountOriginal"] = dailyActionGame.RealBetAmountOriginal ?? 0;
                obj["realWinAmountOriginal"] = dailyActionGame.RealWinAmountOriginal ?? 0;
                obj["bonusBetAmountOriginal"] = dailyActionGame.BonusBetAmountOriginal ?? 0;
                obj["bonusWinAmountOriginal"] = dailyActionGame.BonusWinAmountOriginal ?? 0;
                obj["netGamingRevenueOriginal"] = dailyActionGame.NetGamingRevenueOriginal ?? 0;
                obj["updateDate"] = dailyActionGame.UpdateDate;

                return Ok(obj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily action game with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the daily action game" });
            }
        }
    }
}
