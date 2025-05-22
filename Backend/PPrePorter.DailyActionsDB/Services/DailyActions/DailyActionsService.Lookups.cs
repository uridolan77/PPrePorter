using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Lookup-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Gets all languages using the lookup repository
        /// </summary>
        private async Task<List<LanguageDto>> GetLanguagesAsync()
        {
            try
            {
                // Get languages from lookup repository
                var languages = await _lookupRepository.GetLanguagesAsync();
                var languageDtos = languages.Select(l => new LanguageDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    Code = l.Code
                }).ToList();
                
                _logger.LogInformation("Retrieved {Count} languages from lookup repository", languageDtos.Count);
                return languageDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving languages from lookup repository");
                return new List<LanguageDto>();
            }
        }

        /// <summary>
        /// Gets all platforms using the lookup repository
        /// </summary>
        private async Task<List<string>> GetPlatformsAsync()
        {
            try
            {
                // Get platforms from lookup repository
                var platformItems = await _lookupRepository.GetPlatformsAsync();
                var platforms = platformItems.Select(p => p.Code).ToList();
                
                _logger.LogInformation("Retrieved {Count} platforms from lookup repository", platforms.Count);
                return platforms;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platforms from lookup repository");
                return new List<string>();
            }
        }

        /// <summary>
        /// Gets all genders using the lookup repository
        /// </summary>
        private async Task<List<string>> GetGendersAsync()
        {
            try
            {
                // Get genders from lookup repository
                var genderItems = await _lookupRepository.GetGendersAsync();
                var genders = genderItems.Select(g => g.Code).ToList();
                
                _logger.LogInformation("Retrieved {Count} genders from lookup repository", genders.Count);
                return genders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving genders from lookup repository");
                return new List<string> { "Male", "Female", "Other" };
            }
        }

        /// <summary>
        /// Gets all statuses using the lookup repository
        /// </summary>
        private async Task<List<string>> GetStatusesAsync()
        {
            try
            {
                // Get statuses from lookup repository
                var statusItems = await _lookupRepository.GetStatusesAsync();
                var statuses = statusItems.Select(s => s.Code).ToList();
                
                _logger.LogInformation("Retrieved {Count} statuses from lookup repository", statuses.Count);
                return statuses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statuses from lookup repository");
                return new List<string> { "Active", "Inactive", "Blocked" };
            }
        }

        /// <summary>
        /// Gets all registration play modes using the lookup repository
        /// </summary>
        private async Task<List<string>> GetRegistrationPlayModesAsync()
        {
            try
            {
                // Get registration play modes from lookup repository
                var registrationPlayModeItems = await _lookupRepository.GetRegistrationPlayModesAsync();
                var registrationPlayModes = registrationPlayModeItems.Select(r => r.Code).ToList();
                
                _logger.LogInformation("Retrieved {Count} registration play modes from lookup repository", registrationPlayModes.Count);
                return registrationPlayModes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registration play modes from lookup repository");
                return new List<string> { "Real", "Fun" };
            }
        }

        /// <summary>
        /// Gets all trackers using the lookup repository
        /// </summary>
        private async Task<List<string>> GetTrackersAsync()
        {
            try
            {
                // Get trackers from lookup repository
                var trackerItems = await _lookupRepository.GetTrackersAsync();
                var trackers = trackerItems.Select(t => t.Code).ToList();
                
                _logger.LogInformation("Retrieved {Count} trackers from lookup repository", trackers.Count);
                return trackers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trackers from lookup repository");
                return new List<string>();
            }
        }
    }
}
