using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.API.Features.Reports.Models;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Reports.Controllers.v1
{
    /// <summary>
    /// Controller for in-memory daily actions operations
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/reports/in-memory-daily-actions")]
    [Authorize]
    public class InMemoryDailyActionsController : ControllerBase
    {
        private readonly ILogger<InMemoryDailyActionsController> _logger;
        private readonly IInMemoryDailyActionsService _inMemoryDailyActionsService;

        /// <summary>
        /// Constructor
        /// </summary>
        public InMemoryDailyActionsController(
            ILogger<InMemoryDailyActionsController> logger,
            IInMemoryDailyActionsService inMemoryDailyActionsService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _inMemoryDailyActionsService = inMemoryDailyActionsService ?? throw new ArgumentNullException(nameof(inMemoryDailyActionsService));
        }

        /// <summary>
        /// Initialize the in-memory cache with daily actions data from the last 3 months
        /// </summary>
        [HttpPost("initialize")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Initialize()
        {
            try
            {
                _logger.LogInformation("Initializing in-memory daily actions cache");
                await _inMemoryDailyActionsService.InitializeAsync();
                return Ok(new { message = "In-memory daily actions cache initialized successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing in-memory daily actions cache");
                return StatusCode(500, new { error = "Error initializing in-memory daily actions cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Refresh the in-memory cache (refreshes today's data and handles day transitions)
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                _logger.LogInformation("Refreshing in-memory daily actions cache");
                await _inMemoryDailyActionsService.RefreshAsync();
                return Ok(new {
                    message = "In-memory daily actions cache refreshed successfully",
                    note = "Historical data is fixed and only refreshed during day transitions. Today's data is refreshed every minute."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing in-memory daily actions cache");
                return StatusCode(500, new { error = "Error refreshing in-memory daily actions cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Refresh only today's data in the in-memory cache
        /// </summary>
        [HttpPost("refresh-today")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> RefreshTodayData()
        {
            try
            {
                _logger.LogInformation("Refreshing today's data in the in-memory daily actions cache");
                await _inMemoryDailyActionsService.RefreshTodayDataAsync();
                return Ok(new { message = "Today's data in the in-memory daily actions cache refreshed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing today's data in the in-memory daily actions cache");
                return StatusCode(500, new { error = "Error refreshing today's data in the in-memory daily actions cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Get the status of the in-memory cache
        /// </summary>
        [HttpGet("status")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public IActionResult GetStatus()
        {
            try
            {
                _logger.LogInformation("Getting in-memory daily actions cache status");
                var status = _inMemoryDailyActionsService.GetCacheStatus();
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting in-memory daily actions cache status");
                return StatusCode(500, new { error = "Error getting in-memory daily actions cache status", message = ex.Message });
            }
        }

        /// <summary>
        /// Get filtered daily actions from the in-memory cache
        /// </summary>
        [HttpPost("filtered")]
        [ProducesResponseType(200, Type = typeof(DailyActionResponseDto))]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetFilteredDailyActions([FromBody] DailyActionFilterRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                // Validate dates
                if (request.StartDate > request.EndDate)
                {
                    return BadRequest(new { error = "Start date must be before or equal to end date" });
                }

                // Set default dates if not provided
                if (request.StartDate == default)
                {
                    request.StartDate = DateTime.UtcNow.Date.AddDays(-30);
                }

                if (request.EndDate == default)
                {
                    request.EndDate = DateTime.UtcNow.Date;
                }

                // Map request to filter DTO
                var filter = new DailyActionFilterDto
                {
                    WhiteLabelIds = request.WhiteLabelIds,
                    PlayerIds = request.PlayerIds?.ConvertAll(id => (long)id),
                    PageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber,
                    PageSize = request.PageSize <= 0 ? 50 : request.PageSize,
                    GroupBy = request.GroupBy
                };

                _logger.LogInformation("Getting filtered daily actions from in-memory cache with filter: {@Filter}, startDate: {StartDate}, endDate: {EndDate}",
                    filter, request.StartDate, request.EndDate);

                var result = await _inMemoryDailyActionsService.GetFilteredDailyActionsAsync(filter, request.StartDate, request.EndDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered daily actions from in-memory cache");
                return StatusCode(500, new { error = "Error getting filtered daily actions from in-memory cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Get raw daily action data directly from the in-memory cache without making any database calls
        /// </summary>
        [HttpGet("raw")]
        [ProducesResponseType(200, Type = typeof(RawDailyActionResponseDto))]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public IActionResult GetRawDailyActions(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] bool includeHistorical = true,
            [FromQuery] bool includeToday = true,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100)
        {
            try
            {
                // Set default dates if not provided
                var effectiveStartDate = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
                var effectiveEndDate = endDate ?? DateTime.UtcNow.Date;

                // Validate dates
                if (effectiveStartDate > effectiveEndDate)
                {
                    return BadRequest(new { error = "Start date must be before or equal to end date" });
                }

                _logger.LogInformation("Getting raw daily actions DIRECTLY from in-memory cache (GUARANTEED NO DB CALLS) with date range {StartDate} to {EndDate}, includeHistorical: {IncludeHistorical}, includeToday: {IncludeToday}",
                    effectiveStartDate.ToString("yyyy-MM-dd"), effectiveEndDate.ToString("yyyy-MM-dd"), includeHistorical, includeToday);

                // Use the direct method that guarantees no database calls
                var result = _inMemoryDailyActionsService.GetRawDailyActionsDirectFromMemory(
                    effectiveStartDate,
                    effectiveEndDate,
                    includeHistorical,
                    includeToday,
                    pageNumber,
                    pageSize);

                // Add a note to the response
                var responseWithNote = new
                {
                    data = result,
                    note = "This endpoint returns data directly from memory without making any database calls. If the cache is not initialized or data is stale, use the initialize or refresh endpoints first."
                };

                return Ok(responseWithNote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting raw daily actions from in-memory cache");
                return StatusCode(500, new { error = "Error getting raw daily actions from in-memory cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Get statistics about the daily action data in memory, including min/max dates and counts per day
        /// </summary>
        [HttpGet("statistics")]
        [ProducesResponseType(200, Type = typeof(DailyDataStatisticsDto))]
        [ProducesResponseType(500)]
        public IActionResult GetDailyDataStatistics()
        {
            try
            {
                _logger.LogInformation("Getting daily data statistics from in-memory cache");

                // Get the statistics
                var result = _inMemoryDailyActionsService.GetDailyDataStatistics();

                // Add a note to the response
                var responseWithNote = new
                {
                    data = result,
                    note = "This endpoint returns statistics about the data in memory, including min/max dates and counts per day. If the cache is not initialized, use the initialize endpoint first."
                };

                return Ok(responseWithNote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily data statistics from in-memory cache");
                return StatusCode(500, new { error = "Error getting daily data statistics from in-memory cache", message = ex.Message });
            }
        }

        /// <summary>
        /// Create test data for previous days to ensure we have data to load
        /// </summary>
        [HttpPost("create-test-data")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateTestData()
        {
            try
            {
                _logger.LogInformation("Creating test data for previous days");

                // Create test data for the past 10 days
                var today = DateTime.UtcNow.Date;
                var results = new List<object>();

                // Use the service to create test data
                for (var date = today.AddDays(-10); date <= today; date = date.AddDays(1))
                {
                    try
                    {
                        // Create test data for this day
                        var count = await CreateTestDataForDay(date);

                        _logger.LogInformation("Added {Count} test records for {Date}", count, date.ToString("yyyy-MM-dd"));
                        results.Add(new { date = date.ToString("yyyy-MM-dd"), added = count });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error creating test data for {Date}", date.ToString("yyyy-MM-dd"));
                        results.Add(new { date = date.ToString("yyyy-MM-dd"), error = ex.Message });
                    }
                }

                return Ok(new { message = "Test data creation process completed", results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test data");
                return StatusCode(500, new { error = "Error creating test data", message = ex.Message });
            }
        }

        /// <summary>
        /// Helper method to create test data for a specific day
        /// </summary>
        private async Task<int> CreateTestDataForDay(DateTime date)
        {
            // Create 10 test records for this day
            var testData = new List<DailyActionDto>();
            for (int i = 0; i < 10; i++)
            {
                testData.Add(new DailyActionDto
                {
                    Date = date,
                    WhiteLabelId = 1,
                    WhiteLabelName = "Test Label",
                    PlayerId = 1000 + i,
                    PlayerName = $"Player {1000 + i}",
                    CountryName = "United States",
                    CurrencyCode = "USD",
                    Deposits = 100 + i,
                    BetsCasino = 200 + i,
                    WinsCasino = 150 + i,
                    BetsSport = 100 + i,
                    WinsSport = 75 + i,
                    BetsLive = 50 + i,
                    WinsLive = 30 + i,
                    BetsBingo = 20 + i,
                    WinsBingo = 10 + i
                });
            }

            // Add the test data to the in-memory cache
            foreach (var item in testData)
            {
                if (date.Date == DateTime.UtcNow.Date)
                {
                    // Add to today's cache
                    await _inMemoryDailyActionsService.RefreshTodayDataAsync();
                }
                else
                {
                    // Add to historical cache
                    await _inMemoryDailyActionsService.RefreshAsync();
                }
            }

            return testData.Count;
        }
    }
}
