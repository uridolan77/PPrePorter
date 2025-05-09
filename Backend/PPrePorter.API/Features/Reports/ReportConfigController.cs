using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Models.Reports;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace PPrePorter.API.Features.Reports
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportConfigController : ControllerBase
    {
        private readonly IReportConfigurationService _configService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<ReportConfigController> _logger;

        public ReportConfigController(
            IReportConfigurationService configService,
            IUserContextService userContextService,
            ILogger<ReportConfigController> logger)
        {
            _configService = configService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetReportTemplates()
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                // Create a mock user for now
                var user = new PPrePorter.Domain.Entities.PPReporter.User
                {
                    Id = int.Parse(currentUser.Id),
                    Username = currentUser.Username
                };

                var templates = await _configService.GetAvailableReportTemplatesAsync(user);

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates");
                return StatusCode(500, new { message = "An error occurred while retrieving report templates" });
            }
        }

        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedConfigurations()
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                var configurations = await _configService.GetSavedConfigurationsAsync(currentUser.Id);

                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved configurations");
                return StatusCode(500, new { message = "An error occurred while retrieving saved configurations" });
            }
        }

        [HttpGet("saved/{configId}")]
        public async Task<IActionResult> GetSavedConfiguration(string configId)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                var configuration = await _configService.GetConfigurationByIdAsync(configId);

                if (configuration == null || configuration.UserId != currentUser.Id)
                {
                    return NotFound(new { message = "Configuration not found" });
                }

                // Parse configuration
                if (!string.IsNullOrEmpty(configuration.ConfigurationJson))
                {
                    configuration.Configuration = JsonSerializer.Deserialize<ReportRequest>(configuration.ConfigurationJson);
                }

                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved configuration {ConfigId}", configId);
                return StatusCode(500, new { message = "An error occurred while retrieving saved configuration" });
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveConfiguration([FromBody] ReportConfiguration configuration)
        {
            try
            {
                if (string.IsNullOrEmpty(configuration.Name))
                {
                    return BadRequest(new { message = "Configuration name is required" });
                }

                var currentUser = await _userContextService.GetCurrentUserAsync();
                configuration.UserId = currentUser.Id;

                // Serialize configuration
                if (configuration.Configuration != null)
                {
                    configuration.ConfigurationJson = JsonSerializer.Serialize(configuration.Configuration);
                }

                // Let the service handle ID generation

                var result = await _configService.SaveConfigurationAsync(configuration);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving report configuration");
                return StatusCode(500, new { message = "An error occurred while saving report configuration" });
            }
        }

        [HttpPut("update/{configId}")]
        public async Task<IActionResult> UpdateConfiguration(string configId, [FromBody] ReportConfiguration configuration)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                var existingConfig = await _configService.GetConfigurationByIdAsync(configId);

                if (existingConfig == null || existingConfig.UserId != currentUser.Id)
                {
                    return NotFound(new { message = "Configuration not found" });
                }

                // Update properties
                existingConfig.Name = configuration.Name;
                existingConfig.Description = configuration.Description;

                // Serialize updated configuration
                if (configuration.Configuration != null)
                {
                    existingConfig.ConfigurationJson = JsonSerializer.Serialize(configuration.Configuration);
                }

                await _configService.UpdateConfigurationAsync(existingConfig);

                return Ok(existingConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating configuration {ConfigId}", configId);
                return StatusCode(500, new { message = "An error occurred while updating configuration" });
            }
        }

        [HttpDelete("delete/{configId}")]
        public async Task<IActionResult> DeleteConfiguration(string configId)
        {
            try
            {
                var currentUser = await _userContextService.GetCurrentUserAsync();
                await _configService.DeleteConfigurationAsync(configId, currentUser.Id);

                return Ok(new { message = "Configuration deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {ConfigId}", configId);
                return StatusCode(500, new { message = "An error occurred while deleting configuration" });
            }
        }
    }
}