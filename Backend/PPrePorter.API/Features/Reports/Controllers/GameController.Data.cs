using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Partial class for GameController containing data retrieval endpoints
    /// </summary>
    public partial class GameController
    {
        /// <summary>
        /// Get games data with basic filters
        /// </summary>
        /// <param name="provider">Optional provider filter</param>
        /// <param name="gameType">Optional game type filter</param>
        /// <param name="includeInactive">Whether to include inactive games (default: false)</param>
        [HttpGet("data")]
        public async Task<IActionResult> GetGamesData(
            [FromQuery] string? provider = null,
            [FromQuery] string? gameType = null,
            [FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetGamesData request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Log the parameters
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Getting games with parameters: provider={Provider}, gameType={GameType}, includeInactive={IncludeInactive}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    provider, gameType, includeInactive);

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"Games_Data_{provider ?? "all"}_{gameType ?? "all"}_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get games data - measure time
                var getDataStartTime = DateTime.UtcNow;

                // Get data based on filters
                IEnumerable<Game> games;

                if (!string.IsNullOrEmpty(provider))
                {
                    games = await _gameService.GetGamesByProviderAsync(provider);
                    // Apply additional filter for inactive games if needed
                    if (!includeInactive)
                    {
                        games = games.Where(g => g.IsActive);
                    }
                }
                else if (!string.IsNullOrEmpty(gameType))
                {
                    games = await _gameService.GetGamesByGameTypeAsync(gameType);
                    // Apply additional filter for inactive games if needed
                    if (!includeInactive)
                    {
                        games = games.Where(g => g.IsActive);
                    }
                }
                else
                {
                    // Get all games
                    games = await _gameService.GetAllGamesAsync(includeInactive);
                }

                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetGamesData completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Limit the number of records to prevent Swagger UI from crashing
                var limitedGames = games.Take(100).ToList();
                _logger.LogInformation("Retrieved {TotalCount} games, limiting to {LimitedCount} for the response",
                    games.Count(), limitedGames.Count);

                // Create a dynamic object with all properties from Game
                var result = limitedGames.Select(game =>
                {
                    // Create a dynamic object to hold all properties
                    var obj = new ExpandoObject() as IDictionary<string, object>;

                    // Add all properties from Game
                    obj["gameId"] = game.GameID;
                    obj["gameName"] = game.GameName;
                    obj["provider"] = game.Provider;
                    obj["subProvider"] = game.SubProvider;
                    obj["gameType"] = game.GameType;
                    obj["gameFilters"] = game.GameFilters;
                    obj["gameOrder"] = game.GameOrder;
                    obj["isActive"] = game.IsActive;
                    obj["demoEnabled"] = game.DemoEnabled ?? false;
                    obj["wagerPercent"] = game.WagerPercent ?? 0;
                    obj["jackpotContribution"] = game.JackpotContribution ?? 0;
                    obj["payoutLow"] = game.PayoutLow ?? 0;
                    obj["payoutHigh"] = game.PayoutHigh ?? 0;
                    obj["volatility"] = game.Volatility;
                    obj["ukCompliant"] = game.UKCompliant ?? false;
                    obj["isDesktop"] = game.IsDesktop ?? false;
                    obj["serverGameId"] = game.ServerGameID;
                    obj["providerTitle"] = game.ProviderTitle;
                    obj["isMobile"] = game.IsMobile ?? false;
                    obj["mobileServerGameId"] = game.MobileServerGameID;
                    obj["mobileProviderTitle"] = game.MobileProviderTitle;
                    obj["createdDate"] = game.CreatedDate;
                    obj["releaseDate"] = game.ReleaseDate;
                    obj["updatedDate"] = game.UpdatedDate;
                    obj["hideInLobby"] = game.HideInLobby ?? false;
                    obj["excludedCountries"] = game.ExcludedCountries;
                    obj["excludedJurisdictions"] = game.ExcludedJurisdictions;

                    return obj;
                }).ToList();

                // Prepare response
                var response = new
                {
                    data = result,
                    totalCount = games.Count(),
                    filters = new
                    {
                        provider,
                        gameType,
                        includeInactive
                    }
                };

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetGamesData request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games data");
                return StatusCode(500, new { message = "An error occurred while retrieving games data" });
            }
        }

        /// <summary>
        /// Get a specific game by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGameById(int id)
        {
            try
            {
                var game = await _gameService.GetGameByIdAsync(id);

                if (game == null)
                {
                    return NotFound(new { message = $"Game with ID {id} not found" });
                }

                // Create a dynamic object with all properties from Game
                var obj = new ExpandoObject() as IDictionary<string, object>;

                // Add all properties
                obj["gameId"] = game.GameID;
                obj["gameName"] = game.GameName;
                obj["provider"] = game.Provider;
                obj["subProvider"] = game.SubProvider;
                obj["gameType"] = game.GameType;
                obj["gameFilters"] = game.GameFilters;
                obj["gameOrder"] = game.GameOrder;
                obj["isActive"] = game.IsActive;
                obj["demoEnabled"] = game.DemoEnabled ?? false;
                obj["wagerPercent"] = game.WagerPercent ?? 0;
                obj["jackpotContribution"] = game.JackpotContribution ?? 0;
                obj["payoutLow"] = game.PayoutLow ?? 0;
                obj["payoutHigh"] = game.PayoutHigh ?? 0;
                obj["volatility"] = game.Volatility;
                obj["ukCompliant"] = game.UKCompliant ?? false;
                obj["isDesktop"] = game.IsDesktop ?? false;
                obj["serverGameId"] = game.ServerGameID;
                obj["providerTitle"] = game.ProviderTitle;
                obj["isMobile"] = game.IsMobile ?? false;
                obj["mobileServerGameId"] = game.MobileServerGameID;
                obj["mobileProviderTitle"] = game.MobileProviderTitle;
                obj["createdDate"] = game.CreatedDate;
                obj["releaseDate"] = game.ReleaseDate;
                obj["updatedDate"] = game.UpdatedDate;
                obj["hideInLobby"] = game.HideInLobby ?? false;
                obj["excludedCountries"] = game.ExcludedCountries;
                obj["excludedJurisdictions"] = game.ExcludedJurisdictions;

                return Ok(obj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving game with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the game" });
            }
        }

        /// <summary>
        /// Get games excluded for a specific country
        /// </summary>
        [HttpGet("excluded-by-country/{countryId}")]
        public async Task<IActionResult> GetGamesExcludedByCountry(int countryId)
        {
            try
            {
                var excludedGames = await _gameExcludedByCountryService.GetGameExclusionsByCountryIdAsync(countryId);

                // Get country name for reference
                var country = await _countryService.GetCountryByIdAsync(countryId);
                var countryName = country?.CountryName ?? "Unknown";

                // Get full game details for each excluded game
                var gameDetails = new List<object>();
                foreach (var exclusion in excludedGames)
                {
                    var game = await _gameService.GetGameByIdAsync(exclusion.GameID);
                    if (game != null)
                    {
                        gameDetails.Add(new
                        {
                            exclusionId = exclusion.ID,
                            gameId = game.GameID,
                            gameName = game.GameName,
                            provider = game.Provider,
                            gameType = game.GameType,
                            updatedDate = exclusion.UpdatedDate
                        });
                    }
                }

                return Ok(new
                {
                    countryId,
                    countryName,
                    excludedGames = gameDetails,
                    totalCount = gameDetails.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games excluded for country ID {CountryId}", countryId);
                return StatusCode(500, new { message = "An error occurred while retrieving excluded games" });
            }
        }

        /// <summary>
        /// Get games excluded for a specific jurisdiction
        /// </summary>
        [HttpGet("excluded-by-jurisdiction/{jurisdictionId}")]
        public async Task<IActionResult> GetGamesExcludedByJurisdiction(int jurisdictionId)
        {
            try
            {
                var excludedGames = await _gameExcludedByJurisdictionService.GetGameExclusionsByJurisdictionIdAsync(jurisdictionId);

                // Get full game details for each excluded game
                var gameDetails = new List<object>();
                foreach (var exclusion in excludedGames)
                {
                    var game = await _gameService.GetGameByIdAsync(exclusion.GameID);
                    if (game != null)
                    {
                        gameDetails.Add(new
                        {
                            exclusionId = exclusion.ID,
                            gameId = game.GameID,
                            gameName = game.GameName,
                            provider = game.Provider,
                            gameType = game.GameType,
                            updatedDate = exclusion.UpdatedDate
                        });
                    }
                }

                return Ok(new
                {
                    jurisdictionId,
                    excludedGames = gameDetails,
                    totalCount = gameDetails.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games excluded for jurisdiction ID {JurisdictionId}", jurisdictionId);
                return StatusCode(500, new { message = "An error occurred while retrieving excluded games" });
            }
        }

        /// <summary>
        /// Get games excluded for a specific label
        /// </summary>
        [HttpGet("excluded-by-label/{labelId}")]
        public async Task<IActionResult> GetGamesExcludedByLabel(int labelId)
        {
            try
            {
                var excludedGames = await _gameExcludedByLabelService.GetGameExclusionsByLabelIdAsync(labelId);

                // Get label name for reference
                var label = await _whiteLabelService.GetWhiteLabelByIdAsync(labelId);
                var labelName = label?.Name ?? "Unknown";

                // Get full game details for each excluded game
                var gameDetails = new List<object>();
                foreach (var exclusion in excludedGames)
                {
                    var game = await _gameService.GetGameByIdAsync(exclusion.GameID);
                    if (game != null)
                    {
                        gameDetails.Add(new
                        {
                            exclusionId = exclusion.ID,
                            gameId = game.GameID,
                            gameName = game.GameName,
                            provider = game.Provider,
                            gameType = game.GameType,
                            updatedDate = exclusion.UpdatedDate
                        });
                    }
                }

                return Ok(new
                {
                    labelId,
                    labelName,
                    excludedGames = gameDetails,
                    totalCount = gameDetails.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games excluded for label ID {LabelId}", labelId);
                return StatusCode(500, new { message = "An error occurred while retrieving excluded games" });
            }
        }
    }
}
