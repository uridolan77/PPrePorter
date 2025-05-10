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
    /// Service for sport odds type operations using repository pattern
    /// </summary>
    public class SportOddsTypeService : ISportOddsTypeService
    {
        private readonly ISportOddsTypeRepository _sportOddsTypeRepository;
        private readonly ILogger<SportOddsTypeService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportOddsTypeService(
            ISportOddsTypeRepository sportOddsTypeRepository,
            ILogger<SportOddsTypeService> logger)
        {
            _sportOddsTypeRepository = sportOddsTypeRepository ?? throw new ArgumentNullException(nameof(sportOddsTypeRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportOddsType>> GetAllSportOddsTypesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport odds types (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportOddsTypeRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport odds types");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportOddsType?> GetSportOddsTypeByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport odds type by ID {Id}", id);
                return await _sportOddsTypeRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport odds type by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportOddsType?> GetSportOddsTypeByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport odds type name cannot be null or empty", nameof(name));
            }
            
            try
            {
                _logger.LogInformation("Getting sport odds type by name {Name}", name);
                return await _sportOddsTypeRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport odds type by name {Name}", name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportOddsType>> GetSportOddsTypesByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport odds types by active status {IsActive}", isActive);
                return await _sportOddsTypeRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport odds types by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportOddsType> AddSportOddsTypeAsync(SportOddsType sportOddsType)
        {
            if (sportOddsType == null)
            {
                throw new ArgumentNullException(nameof(sportOddsType));
            }
            
            try
            {
                _logger.LogInformation("Adding new sport odds type {Name}", sportOddsType.Name);
                
                // Check if a sport odds type with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportOddsType.Name))
                {
                    var existingSportOddsType = await _sportOddsTypeRepository.GetByNameAsync(sportOddsType.Name);
                    if (existingSportOddsType != null)
                    {
                        throw new InvalidOperationException($"A sport odds type with the name '{sportOddsType.Name}' already exists");
                    }
                }
                
                return await _sportOddsTypeRepository.AddAsync(sportOddsType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport odds type {Name}", sportOddsType.Name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportOddsType> UpdateSportOddsTypeAsync(SportOddsType sportOddsType)
        {
            if (sportOddsType == null)
            {
                throw new ArgumentNullException(nameof(sportOddsType));
            }
            
            try
            {
                _logger.LogInformation("Updating sport odds type with ID {Id}", sportOddsType.ID);
                
                // Check if the sport odds type exists
                var existingSportOddsType = await _sportOddsTypeRepository.GetByIdAsync(sportOddsType.ID);
                if (existingSportOddsType == null)
                {
                    throw new InvalidOperationException($"Sport odds type with ID {sportOddsType.ID} not found");
                }
                
                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportOddsType.Name) && 
                    !string.IsNullOrWhiteSpace(existingSportOddsType.Name) && 
                    existingSportOddsType.Name != sportOddsType.Name)
                {
                    var sportOddsTypeWithSameName = await _sportOddsTypeRepository.GetByNameAsync(sportOddsType.Name);
                    if (sportOddsTypeWithSameName != null && sportOddsTypeWithSameName.ID != sportOddsType.ID)
                    {
                        throw new InvalidOperationException($"A sport odds type with the name '{sportOddsType.Name}' already exists");
                    }
                }
                
                return await _sportOddsTypeRepository.UpdateAsync(sportOddsType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport odds type with ID {Id}", sportOddsType.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteSportOddsTypeAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport odds type with ID {Id}", id);
                
                // Check if the sport odds type exists
                var existingSportOddsType = await _sportOddsTypeRepository.GetByIdAsync(id);
                if (existingSportOddsType == null)
                {
                    _logger.LogWarning("Sport odds type with ID {Id} not found", id);
                    return false;
                }
                
                // Instead of deleting, mark as inactive if it's a soft delete
                existingSportOddsType.IsActive = false;
                await _sportOddsTypeRepository.UpdateAsync(existingSportOddsType);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport odds type with ID {Id}", id);
                throw;
            }
        }
    }
}
