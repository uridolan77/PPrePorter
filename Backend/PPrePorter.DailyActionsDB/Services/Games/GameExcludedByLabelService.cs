using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Games;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for game excluded by label operations using repository pattern
    /// </summary>
    public class GameExcludedByLabelService : IGameExcludedByLabelService
    {
        private readonly IGameExcludedByLabelRepository _gameExcludedByLabelRepository;
        private readonly ILogger<GameExcludedByLabelService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByLabelService(
            IGameExcludedByLabelRepository gameExcludedByLabelRepository,
            ILogger<GameExcludedByLabelService> logger)
        {
            _gameExcludedByLabelRepository = gameExcludedByLabelRepository ?? throw new ArgumentNullException(nameof(gameExcludedByLabelRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByLabel>> GetAllGameExclusionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all game exclusions");
                return await _gameExcludedByLabelRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all game exclusions");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByLabel?> GetGameExclusionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by ID {Id}", id);
                return await _gameExcludedByLabelRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByLabel>> GetGameExclusionsByGameIdAsync(int gameId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by game ID {GameId}", gameId);
                return await _gameExcludedByLabelRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by game ID {GameId}", gameId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByLabel>> GetGameExclusionsByLabelIdAsync(int labelId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by label ID {LabelId}", labelId);
                return await _gameExcludedByLabelRepository.GetByLabelIdAsync(labelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by label ID {LabelId}", labelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByLabel?> GetGameExclusionByGameIdAndLabelIdAsync(int gameId, int labelId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by game ID {GameId} and label ID {LabelId}", gameId, labelId);
                return await _gameExcludedByLabelRepository.GetByGameIdAndLabelIdAsync(gameId, labelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and label ID {LabelId}", gameId, labelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> IsGameExcludedForLabelAsync(int gameId, int labelId)
        {
            try
            {
                _logger.LogInformation("Checking if game {GameId} is excluded for label {LabelId}", gameId, labelId);
                return await _gameExcludedByLabelRepository.IsGameExcludedForLabelAsync(gameId, labelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for label {LabelId}", gameId, labelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForLabelAsync(int labelId)
        {
            try
            {
                _logger.LogInformation("Getting excluded game IDs for label {LabelId}", labelId);
                return await _gameExcludedByLabelRepository.GetExcludedGameIdsForLabelAsync(labelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting excluded game IDs for label {LabelId}", labelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByLabel> AddGameExclusionAsync(GameExcludedByLabel gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Adding new game exclusion for game ID {GameId} and label ID {LabelId}", gameExclusion.GameID, gameExclusion.LabelID);
                
                // Check if a game exclusion with the same game ID and label ID already exists
                var existingGameExclusion = await _gameExcludedByLabelRepository.GetByGameIdAndLabelIdAsync(gameExclusion.GameID, gameExclusion.LabelID);
                if (existingGameExclusion != null)
                {
                    throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and label ID {gameExclusion.LabelID} already exists");
                }
                
                // Set the updated date to now if not provided
                if (gameExclusion.UpdatedDate == default)
                {
                    gameExclusion.UpdatedDate = DateTime.UtcNow;
                }
                
                return await _gameExcludedByLabelRepository.AddAsync(gameExclusion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game exclusion for game ID {GameId} and label ID {LabelId}", gameExclusion.GameID, gameExclusion.LabelID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByLabel> UpdateGameExclusionAsync(GameExcludedByLabel gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Updating game exclusion with ID {Id}", gameExclusion.ID);
                
                // Check if the game exclusion exists
                var existingGameExclusion = await _gameExcludedByLabelRepository.GetByIdAsync(gameExclusion.ID);
                if (existingGameExclusion == null)
                {
                    throw new InvalidOperationException($"Game exclusion with ID {gameExclusion.ID} not found");
                }
                
                // Check if the game ID and label ID are being changed and if the new combination already exists
                if (existingGameExclusion.GameID != gameExclusion.GameID || existingGameExclusion.LabelID != gameExclusion.LabelID)
                {
                    var gameExclusionWithSameGameIdAndLabelId = await _gameExcludedByLabelRepository.GetByGameIdAndLabelIdAsync(gameExclusion.GameID, gameExclusion.LabelID);
                    if (gameExclusionWithSameGameIdAndLabelId != null && gameExclusionWithSameGameIdAndLabelId.ID != gameExclusion.ID)
                    {
                        throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and label ID {gameExclusion.LabelID} already exists");
                    }
                }
                
                // Set the updated date to now
                gameExclusion.UpdatedDate = DateTime.UtcNow;
                
                return await _gameExcludedByLabelRepository.UpdateAsync(gameExclusion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game exclusion with ID {Id}", gameExclusion.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteGameExclusionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting game exclusion with ID {Id}", id);
                return await _gameExcludedByLabelRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion with ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteGameExclusionByGameIdAndLabelIdAsync(int gameId, int labelId)
        {
            try
            {
                _logger.LogInformation("Deleting game exclusion by game ID {GameId} and label ID {LabelId}", gameId, labelId);
                
                // Get the game exclusion by game ID and label ID
                var gameExclusion = await _gameExcludedByLabelRepository.GetByGameIdAndLabelIdAsync(gameId, labelId);
                if (gameExclusion == null)
                {
                    _logger.LogWarning("Game exclusion for game ID {GameId} and label ID {LabelId} not found", gameId, labelId);
                    return false;
                }
                
                // Delete the game exclusion
                return await _gameExcludedByLabelRepository.DeleteAsync(gameExclusion.ID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion by game ID {GameId} and label ID {LabelId}", gameId, labelId);
                throw;
            }
        }
    }
}
