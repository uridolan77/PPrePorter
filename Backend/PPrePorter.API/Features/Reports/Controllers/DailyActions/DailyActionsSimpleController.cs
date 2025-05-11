using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.API.Features.Configuration;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    [ApiController]
    [Route("api/reports/daily-actions-simple")]
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerGroups.DailyActionsSimple)]
    public class DailyActionsSimpleController : ControllerBase
    {
        private readonly IDailyActionsSimpleService _dailyActionsService;
        private readonly ILogger<DailyActionsSimpleController> _logger;

        public DailyActionsSimpleController(
            IDailyActionsSimpleService dailyActionsService,
            ILogger<DailyActionsSimpleController> logger)
        {
            _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets daily actions data for a date range
        /// </summary>
        /// <param name="startDate">Start date (defaults to 7 days ago)</param>
        /// <param name="endDate">End date (defaults to today)</param>
        /// <param name="whiteLabelId">Optional white label ID filter</param>
        /// <returns>Collection of daily actions</returns>
        [HttpGet("data")]
        public async Task<ActionResult<IEnumerable<DailyActionSimple>>> GetDailyActionsData(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? whiteLabelId = null)
        {
            try
            {
                // Default date range is last 7 days
                var start = startDate ?? DateTime.Today.AddDays(-7);
                var end = endDate ?? DateTime.Today;

                var result = await _dailyActionsService.GetDailyActionsAsync(start, end, whiteLabelId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily actions data");
                return StatusCode(500, "An error occurred while retrieving daily actions data");
            }
        }

        /// <summary>
        /// Gets a daily action by ID
        /// </summary>
        /// <param name="id">Daily action ID</param>
        /// <returns>Daily action</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<DailyActionSimple>> GetDailyAction(int id)
        {
            try
            {
                var dailyAction = await _dailyActionsService.GetDailyActionByIdAsync(id);
                if (dailyAction == null)
                {
                    return NotFound();
                }

                return Ok(dailyAction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily action with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the daily action");
            }
        }
    }
}
