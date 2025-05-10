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
    /// Service for sport bet type operations using repository pattern
    /// </summary>
    public class SportBetTypeService : ISportBetTypeService
    {
        private readonly ISportBetTypeRepository _sportBetTypeRepository;
        private readonly ILogger<SportBetTypeService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetTypeService(
            ISportBetTypeRepository sportBetTypeRepository,
            ILogger<SportBetTypeService> logger)
        {
            _sportBetTypeRepository = sportBetTypeRepository ?? throw new ArgumentNullException(nameof(sportBetTypeRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetType>> GetAllSportBetTypesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport bet types (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportBetTypeRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport bet types");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetType?> GetSportBetTypeByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport bet type by ID {Id}", id);
                return await _sportBetTypeRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet type by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetType?> GetSportBetTypeByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport bet type name cannot be null or empty", nameof(name));
            }
            
            try
            {
                _logger.LogInformation("Getting sport bet type by name {Name}", name);
                return await _sportBetTypeRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet type by name {Name}", name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetType>> GetSportBetTypesByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport bet types by active status {IsActive}", isActive);
                return await _sportBetTypeRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet types by active status {IsActive}", isActive);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetType> AddSportBetTypeAsync(SportBetType sportBetType)
        {
            if (sportBetType == null)
            {
                throw new ArgumentNullException(nameof(sportBetType));
            }
            
            try
            {
                _logger.LogInformation("Adding new sport bet type {Name}", sportBetType.Name);
                
                // Check if a sport bet type with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportBetType.Name))
                {
                    var existingSportBetType = await _sportBetTypeRepository.GetByNameAsync(sportBetType.Name);
                    if (existingSportBetType != null)
                    {
                        throw new InvalidOperationException($"A sport bet type with the name '{sportBetType.Name}' already exists");
                    }
                }
                
                return await _sportBetTypeRepository.AddAsync(sportBetType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport bet type {Name}", sportBetType.Name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetType> UpdateSportBetTypeAsync(SportBetType sportBetType)
        {
            if (sportBetType == null)
            {
                throw new ArgumentNullException(nameof(sportBetType));
            }
            
            try
            {
                _logger.LogInformation("Updating sport bet type with ID {Id}", sportBetType.ID);
                
                // Check if the sport bet type exists
                var existingSportBetType = await _sportBetTypeRepository.GetByIdAsync(sportBetType.ID);
                if (existingSportBetType == null)
                {
                    throw new InvalidOperationException($"Sport bet type with ID {sportBetType.ID} not found");
                }
                
                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportBetType.Name) && 
                    !string.IsNullOrWhiteSpace(existingSportBetType.Name) && 
                    existingSportBetType.Name != sportBetType.Name)
                {
                    var sportBetTypeWithSameName = await _sportBetTypeRepository.GetByNameAsync(sportBetType.Name);
                    if (sportBetTypeWithSameName != null && sportBetTypeWithSameName.ID != sportBetType.ID)
                    {
                        throw new InvalidOperationException($"A sport bet type with the name '{sportBetType.Name}' already exists");
                    }
                }
                
                return await _sportBetTypeRepository.UpdateAsync(sportBetType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport bet type with ID {Id}", sportBetType.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteSportBetTypeAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport bet type with ID {Id}", id);
                
                // Check if the sport bet type exists
                var existingSportBetType = await _sportBetTypeRepository.GetByIdAsync(id);
                if (existingSportBetType == null)
                {
                    _logger.LogWarning("Sport bet type with ID {Id} not found", id);
                    return false;
                }
                
                // Instead of deleting, mark as inactive if it's a soft delete
                existingSportBetType.IsActive = false;
                await _sportBetTypeRepository.UpdateAsync(existingSportBetType);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport bet type with ID {Id}", id);
                throw;
            }
        }
    }
}
