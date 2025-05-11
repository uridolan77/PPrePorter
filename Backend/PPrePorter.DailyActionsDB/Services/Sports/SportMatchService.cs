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
    /// Service for sport match operations using repository pattern
    /// </summary>
    public class SportMatchService : ISportMatchService
    {
        private readonly ISportMatchRepository _sportMatchRepository;
        private readonly ILogger<SportMatchService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportMatchService(
            ISportMatchRepository sportMatchRepository,
            ILogger<SportMatchService> logger)
        {
            _sportMatchRepository = sportMatchRepository ?? throw new ArgumentNullException(nameof(sportMatchRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetAllSportMatchesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport matches (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportMatchRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport matches");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMatch?> GetSportMatchByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport match by ID {Id}", id);
                return await _sportMatchRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport match by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMatch?> GetSportMatchByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Sport match name cannot be null or empty", nameof(name));
            }

            try
            {
                _logger.LogInformation("Getting sport match by name {Name}", name);
                return await _sportMatchRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport match by name {Name}", name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetSportMatchesByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport matches by active status {IsActive}", isActive);
                return await _sportMatchRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport matches by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetSportMatchesByCompetitionIdAsync(int competitionId)
        {
            try
            {
                _logger.LogInformation("Getting sport matches by competition ID {CompetitionId}", competitionId);
                return await _sportMatchRepository.GetByCompetitionIdAsync(competitionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport matches by competition ID {CompetitionId}", competitionId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetSportMatchesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport matches by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _sportMatchRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport matches by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetSportMatchesByCompetitionIdAndDateRangeAsync(int competitionId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport matches by competition ID {CompetitionId} and date range {StartDate} to {EndDate}", competitionId, startDate, endDate);
                return await _sportMatchRepository.GetByCompetitionIdAndDateRangeAsync(competitionId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport matches by competition ID {CompetitionId} and date range {StartDate} to {EndDate}", competitionId, startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMatch>> GetUpcomingSportMatchesAsync(int count = 10)
        {
            try
            {
                _logger.LogInformation("Getting upcoming sport matches (count: {Count})", count);
                return await _sportMatchRepository.GetUpcomingMatchesAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming sport matches (count: {Count})", count);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMatch> AddSportMatchAsync(SportMatch sportMatch)
        {
            if (sportMatch == null)
            {
                throw new ArgumentNullException(nameof(sportMatch));
            }

            try
            {
                _logger.LogInformation("Adding new sport match {Name}", sportMatch.MatchName);

                // Check if a sport match with the same name already exists
                if (!string.IsNullOrWhiteSpace(sportMatch.MatchName))
                {
                    var existingSportMatch = await _sportMatchRepository.GetByNameAsync(sportMatch.MatchName);
                    if (existingSportMatch != null)
                    {
                        throw new InvalidOperationException($"A sport match with the name '{sportMatch.MatchName}' already exists");
                    }
                }

                return await _sportMatchRepository.AddAsync(sportMatch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport match {Name}", sportMatch.MatchName);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMatch> UpdateSportMatchAsync(SportMatch sportMatch)
        {
            if (sportMatch == null)
            {
                throw new ArgumentNullException(nameof(sportMatch));
            }

            try
            {
                _logger.LogInformation("Updating sport match with ID {Id}", sportMatch.ID);

                // Check if the sport match exists
                var existingSportMatch = await _sportMatchRepository.GetByIdAsync((int)sportMatch.ID);
                if (existingSportMatch == null)
                {
                    throw new InvalidOperationException($"Sport match with ID {sportMatch.ID} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(sportMatch.MatchName) &&
                    !string.IsNullOrWhiteSpace(existingSportMatch.MatchName) &&
                    existingSportMatch.MatchName != sportMatch.MatchName)
                {
                    var sportMatchWithSameName = await _sportMatchRepository.GetByNameAsync(sportMatch.MatchName);
                    if (sportMatchWithSameName != null && sportMatchWithSameName.ID != sportMatch.ID)
                    {
                        throw new InvalidOperationException($"A sport match with the name '{sportMatch.MatchName}' already exists");
                    }
                }

                return await _sportMatchRepository.UpdateAsync(sportMatch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport match with ID {Id}", sportMatch.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSportMatchAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport match with ID {Id}", id);

                // Check if the sport match exists
                var existingSportMatch = await _sportMatchRepository.GetByIdAsync((int)id);
                if (existingSportMatch == null)
                {
                    _logger.LogWarning("Sport match with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _sportMatchRepository.UpdateAsync(existingSportMatch);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport match with ID {Id}", id);
                throw;
            }
        }
    }
}
