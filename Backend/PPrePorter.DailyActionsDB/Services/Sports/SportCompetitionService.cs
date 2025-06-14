using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Sports;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for sport competition operations using repository pattern
    /// </summary>
    public class SportCompetitionService : ISportCompetitionService
    {
        private readonly ISportCompetitionRepository _sportCompetitionRepository;
        private readonly ILogger<SportCompetitionService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportCompetitionService(
            ISportCompetitionRepository sportCompetitionRepository,
            ILogger<SportCompetitionService> logger)
        {
            _sportCompetitionRepository = sportCompetitionRepository ?? throw new ArgumentNullException(nameof(sportCompetitionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportCompetition>> GetAllSportCompetitionsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport competitions (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportCompetitionRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport competitions");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportCompetition?> GetSportCompetitionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport competition by ID {Id}", id);
                return await _sportCompetitionRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competition by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportCompetition?> GetSportCompetitionByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport competition name cannot be null or empty", nameof(name));
            }

            try
            {
                _logger.LogInformation("Getting sport competition by name {Name}", name);
                return await _sportCompetitionRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competition by name {Name}", name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportCompetition>> GetSportCompetitionsByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport competitions by active status {IsActive}", isActive);
                return await _sportCompetitionRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competitions by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportCompetition>> GetSportCompetitionsBySportIdAsync(int sportId)
        {
            try
            {
                _logger.LogInformation("Getting sport competitions by sport ID {SportId}", sportId);
                return await _sportCompetitionRepository.GetBySportIdAsync(sportId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competitions by sport ID {SportId}", sportId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportCompetition>> GetSportCompetitionsByRegionIdAsync(int regionId)
        {
            try
            {
                _logger.LogInformation("Getting sport competitions by region ID {RegionId}", regionId);
                return await _sportCompetitionRepository.GetByRegionIdAsync(regionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competitions by region ID {RegionId}", regionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportCompetition>> GetSportCompetitionsBySportIdAndRegionIdAsync(int sportId, int regionId)
        {
            try
            {
                _logger.LogInformation("Getting sport competitions by sport ID {SportId} and region ID {RegionId}", sportId, regionId);
                return await _sportCompetitionRepository.GetBySportIdAndRegionIdAsync(sportId, regionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport competitions by sport ID {SportId} and region ID {RegionId}", sportId, regionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportCompetition> AddSportCompetitionAsync(SportCompetition sportCompetition)
        {
            if (sportCompetition == null)
            {
                throw new ArgumentNullException(nameof(sportCompetition));
            }

            try
            {
                _logger.LogInformation("Adding new sport competition {Name}", sportCompetition.CompetitionName);

                // Check if a sport competition with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportCompetition.CompetitionName))
                {
                    var existingSportCompetition = await _sportCompetitionRepository.GetByNameAsync(sportCompetition.CompetitionName);
                    if (existingSportCompetition != null)
                    {
                        throw new InvalidOperationException($"A sport competition with the name '{sportCompetition.CompetitionName}' already exists");
                    }
                }

                return await _sportCompetitionRepository.AddAsync(sportCompetition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport competition {Name}", sportCompetition.CompetitionName);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportCompetition> UpdateSportCompetitionAsync(SportCompetition sportCompetition)
        {
            if (sportCompetition == null)
            {
                throw new ArgumentNullException(nameof(sportCompetition));
            }

            try
            {
                _logger.LogInformation("Updating sport competition with ID {Id}", sportCompetition.ID);

                // Check if the sport competition exists
                var existingSportCompetition = await _sportCompetitionRepository.GetByIdAsync((int)sportCompetition.ID);
                if (existingSportCompetition == null)
                {
                    throw new InvalidOperationException($"Sport competition with ID {sportCompetition.ID} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportCompetition.CompetitionName) &&
                    !string.IsNullOrWhiteSpace(existingSportCompetition.CompetitionName) &&
                    existingSportCompetition.CompetitionName != sportCompetition.CompetitionName)
                {
                    var sportCompetitionWithSameName = await _sportCompetitionRepository.GetByNameAsync(sportCompetition.CompetitionName);
                    if (sportCompetitionWithSameName != null && sportCompetitionWithSameName.ID != sportCompetition.ID)
                    {
                        throw new InvalidOperationException($"A sport competition with the name '{sportCompetition.CompetitionName}' already exists");
                    }
                }

                return await _sportCompetitionRepository.UpdateAsync(sportCompetition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport competition with ID {Id}", sportCompetition.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSportCompetitionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport competition with ID {Id}", id);

                // Check if the sport competition exists
                var existingSportCompetition = await _sportCompetitionRepository.GetByIdAsync((int)id);
                if (existingSportCompetition == null)
                {
                    _logger.LogWarning("Sport competition with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _sportCompetitionRepository.UpdateAsync(existingSportCompetition);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport competition with ID {Id}", id);
                throw;
            }
        }
    }
}
