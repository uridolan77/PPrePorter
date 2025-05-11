using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Partial class for DailyActionsController containing metadata endpoints
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Get all white labels
        /// </summary>
        [HttpGet("white-labels")]
        public async Task<IActionResult> GetWhiteLabels()
        {
            try
            {
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync();
                return Ok(whiteLabels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving white labels");
                return StatusCode(500, new { message = "An error occurred while retrieving white labels" });
            }
        }

        /// <summary>
        /// Get all metadata for daily actions report
        /// </summary>
        [HttpGet("metadata")]
        public async Task<IActionResult> GetMetadata()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily actions metadata");
                return StatusCode(500, new { message = "An error occurred while retrieving daily actions metadata" });
            }
        }

        /// <summary>
        /// Get all countries
        /// </summary>
        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Countries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries");
                return StatusCode(500, new { message = "An error occurred while retrieving countries" });
            }
        }

        /// <summary>
        /// Get all currencies
        /// </summary>
        [HttpGet("currencies")]
        public async Task<IActionResult> GetCurrencies()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Currencies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving currencies");
                return StatusCode(500, new { message = "An error occurred while retrieving currencies" });
            }
        }

        /// <summary>
        /// Get all languages
        /// </summary>
        [HttpGet("languages")]
        public async Task<IActionResult> GetLanguages()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Languages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving languages");
                return StatusCode(500, new { message = "An error occurred while retrieving languages" });
            }
        }

        /// <summary>
        /// Get all platforms
        /// </summary>
        [HttpGet("platforms")]
        public async Task<IActionResult> GetPlatforms()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Platforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platforms");
                return StatusCode(500, new { message = "An error occurred while retrieving platforms" });
            }
        }

        /// <summary>
        /// Get all genders
        /// </summary>
        [HttpGet("genders")]
        public async Task<IActionResult> GetGenders()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Genders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving genders");
                return StatusCode(500, new { message = "An error occurred while retrieving genders" });
            }
        }

        /// <summary>
        /// Get all statuses
        /// </summary>
        [HttpGet("statuses")]
        public async Task<IActionResult> GetStatuses()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Statuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statuses");
                return StatusCode(500, new { message = "An error occurred while retrieving statuses" });
            }
        }

        /// <summary>
        /// Get all player types
        /// </summary>
        [HttpGet("player-types")]
        public async Task<IActionResult> GetPlayerTypes()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.PlayerTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving player types");
                return StatusCode(500, new { message = "An error occurred while retrieving player types" });
            }
        }

        /// <summary>
        /// Get all trackers
        /// </summary>
        [HttpGet("trackers")]
        public async Task<IActionResult> GetTrackers()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.Trackers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trackers");
                return StatusCode(500, new { message = "An error occurred while retrieving trackers" });
            }
        }

        /// <summary>
        /// Get all registration play modes
        /// </summary>
        [HttpGet("reg-play-modes")]
        public async Task<IActionResult> GetRegPlayModes()
        {
            try
            {
                var metadata = await _dailyActionsService.GetDailyActionsMetadataAsync();
                return Ok(metadata.RegistrationPlayModes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registration play modes");
                return StatusCode(500, new { message = "An error occurred while retrieving registration play modes" });
            }
        }
    }
}
