using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for sport operations using repository pattern
    /// </summary>
    public class SportSportService : ISportSportService
    {
        private readonly ISportSportRepository _sportSportRepository;
        private readonly ILogger<SportSportService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportSportService(
            ISportSportRepository sportSportRepository,
            ILogger<SportSportService> logger)
        {
            _sportSportRepository = sportSportRepository ?? throw new ArgumentNullException(nameof(sportSportRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportSport>> GetAllSportsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sports (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportSportRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sports");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportSport?> GetSportByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport by ID {Id}", id);
                return await _sportSportRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportSport?> GetSportByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport name cannot be null or empty", nameof(name));
            }

            try
            {
                _logger.LogInformation("Getting sport by name {Name}", name);
                return await _sportSportRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport by name {Name}", name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportSport>> GetSportsByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sports by active status {IsActive}", isActive);
                return await _sportSportRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sports by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportSport>> GetSportsByRegionIdAsync(int regionId)
        {
            try
            {
                _logger.LogInformation("Getting sports by region ID {RegionId}", regionId);
                return await _sportSportRepository.GetByRegionIdAsync(regionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sports by region ID {RegionId}", regionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportSport> AddSportAsync(SportSport sport)
        {
            if (sport == null)
            {
                throw new ArgumentNullException(nameof(sport));
            }

            try
            {
                _logger.LogInformation("Adding new sport {Name}", sport.SportName);

                // Check if a sport with the same name already exists
                if (!string.IsNullOrWhiteSpace(sport.SportName))
                {
                    var existingSport = await _sportSportRepository.GetByNameAsync(sport.SportName);
                    if (existingSport != null)
                    {
                        throw new InvalidOperationException($"A sport with the name '{sport.SportName}' already exists");
                    }
                }

                return await _sportSportRepository.AddAsync(sport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport {Name}", sport.SportName);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportSport> UpdateSportAsync(SportSport sport)
        {
            if (sport == null)
            {
                throw new ArgumentNullException(nameof(sport));
            }

            try
            {
                _logger.LogInformation("Updating sport with ID {Id}", sport.ID);

                // Check if the sport exists
                var existingSport = await _sportSportRepository.GetByIdAsync((int)sport.ID);
                if (existingSport == null)
                {
                    throw new InvalidOperationException($"Sport with ID {sport.ID} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sport.SportName) &&
                    !string.IsNullOrWhiteSpace(existingSport.SportName) &&
                    existingSport.SportName != sport.SportName)
                {
                    var sportWithSameName = await _sportSportRepository.GetByNameAsync(sport.SportName);
                    if (sportWithSameName != null && sportWithSameName.ID != sport.ID)
                    {
                        throw new InvalidOperationException($"A sport with the name '{sport.SportName}' already exists");
                    }
                }

                return await _sportSportRepository.UpdateAsync(sport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport with ID {Id}", sport.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSportAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport with ID {Id}", id);

                // Check if the sport exists
                var existingSport = await _sportSportRepository.GetByIdAsync((int)id);
                if (existingSport == null)
                {
                    _logger.LogWarning("Sport with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _sportSportRepository.UpdateAsync(existingSport);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport with ID {Id}", id);
                throw;
            }
        }
    }
}
