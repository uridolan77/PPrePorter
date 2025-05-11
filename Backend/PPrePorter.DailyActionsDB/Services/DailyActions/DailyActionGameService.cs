using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for daily action game operations using repository pattern
    /// </summary>
    public class DailyActionGameService : IDailyActionGameService
    {
        private readonly IDailyActionGameRepository _dailyActionGameRepository;
        private readonly ILogger<DailyActionGameService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionGameService(
            IDailyActionGameRepository dailyActionGameRepository,
            ILogger<DailyActionGameService> logger)
        {
            _dailyActionGameRepository = dailyActionGameRepository ?? throw new ArgumentNullException(nameof(dailyActionGameRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetAllDailyActionGamesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all daily action games");
                return await _dailyActionGameRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all daily action games");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyActionGame?> GetDailyActionGameByIdAsync(long id)
        {
            try
            {
                _logger.LogInformation("Getting daily action game by ID {Id}", id);
                return await _dailyActionGameRepository.GetByIdAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action game by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlayerIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting daily action games by player ID {PlayerId}", playerId);
                return await _dailyActionGameRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by player ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByGameIdAsync(long gameId)
        {
            try
            {
                _logger.LogInformation("Getting daily action games by game ID {GameId}", gameId);
                return await _dailyActionGameRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by game ID {GameId}", gameId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting daily action games by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _dailyActionGameRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting daily action games by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                return await _dailyActionGameRepository.GetByPlayerIdAndDateRangeAsync(playerId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByGameIdAndDateRangeAsync(long gameId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting daily action games by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                return await _dailyActionGameRepository.GetByGameIdAndDateRangeAsync(gameId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlatformAsync(string platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be null or empty", nameof(platform));
            }
            
            try
            {
                _logger.LogInformation("Getting daily action games by platform {Platform}", platform);
                return await _dailyActionGameRepository.GetByPlatformAsync(platform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by platform {Platform}", platform);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyActionGame> AddDailyActionGameAsync(DailyActionGame dailyActionGame)
        {
            if (dailyActionGame == null)
            {
                throw new ArgumentNullException(nameof(dailyActionGame));
            }
            
            try
            {
                _logger.LogInformation("Adding new daily action game");
                return await _dailyActionGameRepository.AddAsync(dailyActionGame);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding daily action game");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyActionGame> UpdateDailyActionGameAsync(DailyActionGame dailyActionGame)
        {
            if (dailyActionGame == null)
            {
                throw new ArgumentNullException(nameof(dailyActionGame));
            }
            
            try
            {
                _logger.LogInformation("Updating daily action game with ID {Id}", dailyActionGame.ID);
                
                // Check if the daily action game exists
                var existingDailyActionGame = await _dailyActionGameRepository.GetByIdAsync((int)dailyActionGame.ID);
                if (existingDailyActionGame == null)
                {
                    throw new InvalidOperationException($"Daily action game with ID {dailyActionGame.ID} not found");
                }
                
                return await _dailyActionGameRepository.UpdateAsync(dailyActionGame);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily action game with ID {Id}", dailyActionGame.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteDailyActionGameAsync(long id)
        {
            try
            {
                _logger.LogInformation("Deleting daily action game with ID {Id}", id);
                return await _dailyActionGameRepository.DeleteAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting daily action game with ID {Id}", id);
                throw;
            }
        }
    }
}
