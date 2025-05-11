using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers.SportMetaData
{
    /// <summary>
    /// Partial class for SportMetaDataController containing data retrieval endpoints
    /// </summary>
    public partial class SportMetaDataController
    {
        /// <summary>
        /// Get all sport bet states
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive bet states (default: false)</param>
        [HttpGet("bet-states")]
        public async Task<IActionResult> GetSportBetStates([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSportBetStates request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"SportBetStates_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var betStates = await _sportBetStateService.GetAllSportBetStatesAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSportBetStates completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = betStates.Select(state => new
                {
                    id = state.ID,
                    betStateId = state.BetStateID,
                    betStateName = state.BetStateName,
                    createdDate = state.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSportBetStates request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sport bet states");
                return StatusCode(500, new { message = "An error occurred while retrieving sport bet states" });
            }
        }

        /// <summary>
        /// Get all sport bet types
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive bet types (default: false)</param>
        [HttpGet("bet-types")]
        public async Task<IActionResult> GetSportBetTypes([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSportBetTypes request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"SportBetTypes_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var betTypes = await _sportBetTypeService.GetAllSportBetTypesAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSportBetTypes completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = betTypes.Select(type => new
                {
                    id = type.ID,
                    betTypeId = type.BetTypeID,
                    betTypeName = type.BetTypeName,
                    createdDate = type.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSportBetTypes request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sport bet types");
                return StatusCode(500, new { message = "An error occurred while retrieving sport bet types" });
            }
        }

        /// <summary>
        /// Get all sports
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sports (default: false)</param>
        [HttpGet("sports")]
        public async Task<IActionResult> GetSports([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSports request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"Sports_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var sports = await _sportSportService.GetAllSportsAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSports completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = sports.Select(sport => new
                {
                    id = sport.ID,
                    sportId = sport.SportID,
                    sportName = sport.SportName,
                    createdDate = sport.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSports request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sports");
                return StatusCode(500, new { message = "An error occurred while retrieving sports" });
            }
        }

        /// <summary>
        /// Get all sport competitions
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive competitions (default: false)</param>
        [HttpGet("competitions")]
        public async Task<IActionResult> GetSportCompetitions([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSportCompetitions request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"SportCompetitions_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var competitions = await _sportCompetitionService.GetAllSportCompetitionsAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSportCompetitions completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = competitions.Select(competition => new
                {
                    id = competition.ID,
                    competitionId = competition.CompetitionID,
                    competitionName = competition.CompetitionName,
                    createdDate = competition.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSportCompetitions request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sport competitions");
                return StatusCode(500, new { message = "An error occurred while retrieving sport competitions" });
            }
        }

        /// <summary>
        /// Get all sport markets
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive markets (default: false)</param>
        [HttpGet("markets")]
        public async Task<IActionResult> GetSportMarkets([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSportMarkets request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"SportMarkets_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var markets = await _sportMarketService.GetAllSportMarketsAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSportMarkets completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = markets.Select(market => new
                {
                    id = market.ID,
                    marketTypeId = market.MarketTypeID,
                    marketName = market.MarketName,
                    createdDate = market.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSportMarkets request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sport markets");
                return StatusCode(500, new { message = "An error occurred while retrieving sport markets" });
            }
        }

        /// <summary>
        /// Get all sport odds types
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive odds types (default: false)</param>
        [HttpGet("odds-types")]
        public async Task<IActionResult> GetSportOddsTypes([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetSportOddsTypes request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"SportOddsTypes_{includeInactive}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get data - measure time
                var getDataStartTime = DateTime.UtcNow;
                var oddsTypes = await _sportOddsTypeService.GetAllSportOddsTypesAsync(includeInactive);
                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetSportOddsTypes completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Create response
                var result = oddsTypes.Select(oddsType => new
                {
                    id = oddsType.ID,
                    oddTypeId = oddsType.OddTypeID,
                    oddTypeName = oddsType.OddTypeName,
                    createdDate = oddsType.CreatedDate
                }).ToList();

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetSportOddsTypes request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(new
                {
                    data = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sport odds types");
                return StatusCode(500, new { message = "An error occurred while retrieving sport odds types" });
            }
        }

        /// <summary>
        /// Get all sport metadata in a single call
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items (default: false)</param>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllSportMetadata([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetAllSportMetadata request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Get all data in parallel
                var betStatesTask = _sportBetStateService.GetAllSportBetStatesAsync(includeInactive);
                var betTypesTask = _sportBetTypeService.GetAllSportBetTypesAsync(includeInactive);
                var sportsTask = _sportSportService.GetAllSportsAsync(includeInactive);
                var competitionsTask = _sportCompetitionService.GetAllSportCompetitionsAsync(includeInactive);
                var marketsTask = _sportMarketService.GetAllSportMarketsAsync(includeInactive);
                var oddsTypesTask = _sportOddsTypeService.GetAllSportOddsTypesAsync(includeInactive);
                var regionsTask = _sportRegionService.GetAllSportRegionsAsync(includeInactive);

                // Wait for all tasks to complete
                await Task.WhenAll(
                    betStatesTask,
                    betTypesTask,
                    sportsTask,
                    competitionsTask,
                    marketsTask,
                    oddsTypesTask,
                    regionsTask
                );

                // Get results
                var betStates = await betStatesTask;
                var betTypes = await betTypesTask;
                var sports = await sportsTask;
                var competitions = await competitionsTask;
                var markets = await marketsTask;
                var oddsTypes = await oddsTypesTask;
                var regions = await regionsTask;

                // Create response
                var response = new
                {
                    betStates = betStates.Select(state => new
                    {
                        id = state.ID,
                        betStateId = state.BetStateID,
                        betStateName = state.BetStateName
                    }).ToList(),
                    betTypes = betTypes.Select(type => new
                    {
                        id = type.ID,
                        betTypeId = type.BetTypeID,
                        betTypeName = type.BetTypeName
                    }).ToList(),
                    sports = sports.Select(sport => new
                    {
                        id = sport.ID,
                        sportId = sport.SportID,
                        sportName = sport.SportName
                    }).ToList(),
                    competitions = competitions.Select(competition => new
                    {
                        id = competition.ID,
                        competitionId = competition.CompetitionID,
                        competitionName = competition.CompetitionName
                    }).ToList(),
                    markets = markets.Select(market => new
                    {
                        id = market.ID,
                        marketTypeId = market.MarketTypeID,
                        marketName = market.MarketName
                    }).ToList(),
                    oddsTypes = oddsTypes.Select(oddsType => new
                    {
                        id = oddsType.ID,
                        oddTypeId = oddsType.OddTypeID,
                        oddTypeName = oddsType.OddTypeName
                    }).ToList(),
                    regions = regions.Select(region => new
                    {
                        id = region.ID,
                        regionId = region.RegionID,
                        regionName = region.RegionName
                    }).ToList()
                };

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetAllSportMetadata request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all sport metadata");
                return StatusCode(500, new { message = "An error occurred while retrieving sport metadata" });
            }
        }
    }
}
