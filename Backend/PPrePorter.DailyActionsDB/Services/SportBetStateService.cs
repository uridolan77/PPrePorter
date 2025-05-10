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
    /// Service for sport bet state operations using repository pattern
    /// </summary>
    public class SportBetStateService : ISportBetStateService
    {
        private readonly ISportBetStateRepository _sportBetStateRepository;
        private readonly ILogger<SportBetStateService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetStateService(
            ISportBetStateRepository sportBetStateRepository,
            ILogger<SportBetStateService> logger)
        {
            _sportBetStateRepository = sportBetStateRepository ?? throw new ArgumentNullException(nameof(sportBetStateRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetState>> GetAllSportBetStatesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport bet states (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportBetStateRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport bet states");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportBetState?> GetSportBetStateByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport bet state by ID {Id}", id);
                return await _sportBetStateRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet state by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportBetState?> GetSportBetStateByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport bet state name cannot be null or empty", nameof(name));
            }

            try
            {
                _logger.LogInformation("Getting sport bet state by name {Name}", name);
                return await _sportBetStateRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet state by name {Name}", name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetState>> GetSportBetStatesByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport bet states by active status {IsActive}", isActive);
                return await _sportBetStateRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet states by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportBetState> AddSportBetStateAsync(SportBetState sportBetState)
        {
            if (sportBetState == null)
            {
                throw new ArgumentNullException(nameof(sportBetState));
            }

            try
            {
                _logger.LogInformation("Adding new sport bet state {Name}", sportBetState.BetStateName);

                // Check if a sport bet state with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportBetState.BetStateName))
                {
                    var existingSportBetState = await _sportBetStateRepository.GetByNameAsync(sportBetState.BetStateName);
                    if (existingSportBetState != null)
                    {
                        throw new InvalidOperationException($"A sport bet state with the name '{sportBetState.BetStateName}' already exists");
                    }
                }

                return await _sportBetStateRepository.AddAsync(sportBetState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport bet state {Name}", sportBetState.BetStateName);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportBetState> UpdateSportBetStateAsync(SportBetState sportBetState)
        {
            if (sportBetState == null)
            {
                throw new ArgumentNullException(nameof(sportBetState));
            }

            try
            {
                _logger.LogInformation("Updating sport bet state with ID {Id}", sportBetState.ID);

                // Check if the sport bet state exists
                var existingSportBetState = await _sportBetStateRepository.GetByIdAsync((int)sportBetState.ID);
                if (existingSportBetState == null)
                {
                    throw new InvalidOperationException($"Sport bet state with ID {sportBetState.ID} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportBetState.BetStateName) &&
                    !string.IsNullOrWhiteSpace(existingSportBetState.BetStateName) &&
                    existingSportBetState.BetStateName != sportBetState.BetStateName)
                {
                    var sportBetStateWithSameName = await _sportBetStateRepository.GetByNameAsync(sportBetState.BetStateName);
                    if (sportBetStateWithSameName != null && sportBetStateWithSameName.ID != sportBetState.ID)
                    {
                        throw new InvalidOperationException($"A sport bet state with the name '{sportBetState.BetStateName}' already exists");
                    }
                }

                return await _sportBetStateRepository.UpdateAsync(sportBetState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport bet state with ID {Id}", sportBetState.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSportBetStateAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport bet state with ID {Id}", id);

                // Check if the sport bet state exists
                var existingSportBetState = await _sportBetStateRepository.GetByIdAsync((int)id);
                if (existingSportBetState == null)
                {
                    _logger.LogWarning("Sport bet state with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _sportBetStateRepository.UpdateAsync(existingSportBetState);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport bet state with ID {Id}", id);
                throw;
            }
        }
    }
}
