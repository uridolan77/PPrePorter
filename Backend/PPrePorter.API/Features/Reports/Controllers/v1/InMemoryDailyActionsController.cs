using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.API.Features.Reports.Models;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
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
    }
}
