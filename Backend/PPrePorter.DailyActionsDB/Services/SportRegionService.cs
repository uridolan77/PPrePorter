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
    /// Service for sport region operations using repository pattern
    /// </summary>
    public class SportRegionService : ISportRegionService
    {
        private readonly ISportRegionRepository _sportRegionRepository;
        private readonly ILogger<SportRegionService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportRegionService(
            ISportRegionRepository sportRegionRepository,
            ILogger<SportRegionService> logger)
        {
            _sportRegionRepository = sportRegionRepository ?? throw new ArgumentNullException(nameof(sportRegionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportRegion>> GetAllSportRegionsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport regions (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportRegionRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport regions");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportRegion?> GetSportRegionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport region by ID {Id}", id);
                return await _sportRegionRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport region by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportRegion?> GetSportRegionByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport region name cannot be null or empty", nameof(name));
            }
            
            try
            {
                _logger.LogInformation("Getting sport region by name {Name}", name);
                return await _sportRegionRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport region by name {Name}", name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportRegion>> GetSportRegionsByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport regions by active status {IsActive}", isActive);
                return await _sportRegionRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport regions by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportRegion>> GetSportRegionsBySportIdAsync(int sportId)
        {
            try
            {
                _logger.LogInformation("Getting sport regions by sport ID {SportId}", sportId);
                return await _sportRegionRepository.GetBySportIdAsync(sportId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport regions by sport ID {SportId}", sportId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportRegion> AddSportRegionAsync(SportRegion sportRegion)
        {
            if (sportRegion == null)
            {
                throw new ArgumentNullException(nameof(sportRegion));
            }
            
            try
            {
                _logger.LogInformation("Adding new sport region {Name}", sportRegion.Name);
                
                // Check if a sport region with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportRegion.Name))
                {
                    var existingSportRegion = await _sportRegionRepository.GetByNameAsync(sportRegion.Name);
                    if (existingSportRegion != null)
                    {
                        throw new InvalidOperationException($"A sport region with the name '{sportRegion.Name}' already exists");
                    }
                }
                
                return await _sportRegionRepository.AddAsync(sportRegion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport region {Name}", sportRegion.Name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportRegion> UpdateSportRegionAsync(SportRegion sportRegion)
        {
            if (sportRegion == null)
            {
                throw new ArgumentNullException(nameof(sportRegion));
            }
            
            try
            {
                _logger.LogInformation("Updating sport region with ID {Id}", sportRegion.ID);
                
                // Check if the sport region exists
                var existingSportRegion = await _sportRegionRepository.GetByIdAsync(sportRegion.ID);
                if (existingSportRegion == null)
                {
                    throw new InvalidOperationException($"Sport region with ID {sportRegion.ID} not found");
                }
                
                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportRegion.Name) && 
                    !string.IsNullOrWhiteSpace(existingSportRegion.Name) && 
                    existingSportRegion.Name != sportRegion.Name)
                {
                    var sportRegionWithSameName = await _sportRegionRepository.GetByNameAsync(sportRegion.Name);
                    if (sportRegionWithSameName != null && sportRegionWithSameName.ID != sportRegion.ID)
                    {
                        throw new InvalidOperationException($"A sport region with the name '{sportRegion.Name}' already exists");
                    }
                }
                
                return await _sportRegionRepository.UpdateAsync(sportRegion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport region with ID {Id}", sportRegion.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteSportRegionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport region with ID {Id}", id);
                
                // Check if the sport region exists
                var existingSportRegion = await _sportRegionRepository.GetByIdAsync(id);
                if (existingSportRegion == null)
                {
                    _logger.LogWarning("Sport region with ID {Id} not found", id);
                    return false;
                }
                
                // Instead of deleting, mark as inactive if it's a soft delete
                existingSportRegion.IsActive = false;
                await _sportRegionRepository.UpdateAsync(existingSportRegion);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport region with ID {Id}", id);
                throw;
            }
        }
    }
}
