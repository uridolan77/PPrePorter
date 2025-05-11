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
    /// Service for game excluded by jurisdiction operations using repository pattern
    /// </summary>
    public class GameExcludedByJurisdictionService : IGameExcludedByJurisdictionService
    {
        private readonly IGameExcludedByJurisdictionRepository _gameExcludedByJurisdictionRepository;
        private readonly ILogger<GameExcludedByJurisdictionService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByJurisdictionService(
            IGameExcludedByJurisdictionRepository gameExcludedByJurisdictionRepository,
            ILogger<GameExcludedByJurisdictionService> logger)
        {
            _gameExcludedByJurisdictionRepository = gameExcludedByJurisdictionRepository ?? throw new ArgumentNullException(nameof(gameExcludedByJurisdictionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByJurisdiction>> GetAllGameExclusionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all game exclusions");
                return await _gameExcludedByJurisdictionRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all game exclusions");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByJurisdiction?> GetGameExclusionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by ID {Id}", id);
                return await _gameExcludedByJurisdictionRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByJurisdiction>> GetGameExclusionsByGameIdAsync(int gameId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by game ID {GameId}", gameId);
                return await _gameExcludedByJurisdictionRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by game ID {GameId}", gameId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByJurisdiction>> GetGameExclusionsByJurisdictionIdAsync(int jurisdictionId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by jurisdiction ID {JurisdictionId}", jurisdictionId);
                return await _gameExcludedByJurisdictionRepository.GetByJurisdictionIdAsync(jurisdictionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by jurisdiction ID {JurisdictionId}", jurisdictionId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByJurisdiction?> GetGameExclusionByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by game ID {GameId} and jurisdiction ID {JurisdictionId}", gameId, jurisdictionId);
                return await _gameExcludedByJurisdictionRepository.GetByGameIdAndJurisdictionIdAsync(gameId, jurisdictionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and jurisdiction ID {JurisdictionId}", gameId, jurisdictionId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> IsGameExcludedForJurisdictionAsync(int gameId, int jurisdictionId)
        {
            try
            {
                _logger.LogInformation("Checking if game {GameId} is excluded for jurisdiction {JurisdictionId}", gameId, jurisdictionId);
                return await _gameExcludedByJurisdictionRepository.IsGameExcludedForJurisdictionAsync(gameId, jurisdictionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for jurisdiction {JurisdictionId}", gameId, jurisdictionId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForJurisdictionAsync(int jurisdictionId)
        {
            try
            {
                _logger.LogInformation("Getting excluded game IDs for jurisdiction {JurisdictionId}", jurisdictionId);
                return await _gameExcludedByJurisdictionRepository.GetExcludedGameIdsForJurisdictionAsync(jurisdictionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting excluded game IDs for jurisdiction {JurisdictionId}", jurisdictionId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByJurisdiction> AddGameExclusionAsync(GameExcludedByJurisdiction gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Adding new game exclusion for game ID {GameId} and jurisdiction ID {JurisdictionId}", gameExclusion.GameID, gameExclusion.JurisdictionID);
                
                // Check if a game exclusion with the same game ID and jurisdiction ID already exists
                var existingGameExclusion = await _gameExcludedByJurisdictionRepository.GetByGameIdAndJurisdictionIdAsync(gameExclusion.GameID, gameExclusion.JurisdictionID);
                if (existingGameExclusion != null)
                {
                    throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and jurisdiction ID {gameExclusion.JurisdictionID} already exists");
                }
                
                // Set the updated date to now if not provided
                if (gameExclusion.UpdatedDate == default)
                {
                    gameExclusion.UpdatedDate = DateTime.UtcNow;
                }
                
                return await _gameExcludedByJurisdictionRepository.AddAsync(gameExclusion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game exclusion for game ID {GameId} and jurisdiction ID {JurisdictionId}", gameExclusion.GameID, gameExclusion.JurisdictionID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByJurisdiction> UpdateGameExclusionAsync(GameExcludedByJurisdiction gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Updating game exclusion with ID {Id}", gameExclusion.ID);
                
                // Check if the game exclusion exists
                var existingGameExclusion = await _gameExcludedByJurisdictionRepository.GetByIdAsync(gameExclusion.ID);
                if (existingGameExclusion == null)
                {
                    throw new InvalidOperationException($"Game exclusion with ID {gameExclusion.ID} not found");
                }
                
                // Check if the game ID and jurisdiction ID are being changed and if the new combination already exists
                if (existingGameExclusion.GameID != gameExclusion.GameID || existingGameExclusion.JurisdictionID != gameExclusion.JurisdictionID)
                {
                    var gameExclusionWithSameGameIdAndJurisdictionId = await _gameExcludedByJurisdictionRepository.GetByGameIdAndJurisdictionIdAsync(gameExclusion.GameID, gameExclusion.JurisdictionID);
                    if (gameExclusionWithSameGameIdAndJurisdictionId != null && gameExclusionWithSameGameIdAndJurisdictionId.ID != gameExclusion.ID)
                    {
                        throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and jurisdiction ID {gameExclusion.JurisdictionID} already exists");
                    }
                }
                
                // Set the updated date to now
                gameExclusion.UpdatedDate = DateTime.UtcNow;
                
                return await _gameExcludedByJurisdictionRepository.UpdateAsync(gameExclusion);
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
                return await _gameExcludedByJurisdictionRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion with ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteGameExclusionByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId)
        {
            try
            {
                _logger.LogInformation("Deleting game exclusion by game ID {GameId} and jurisdiction ID {JurisdictionId}", gameId, jurisdictionId);
                
                // Get the game exclusion by game ID and jurisdiction ID
                var gameExclusion = await _gameExcludedByJurisdictionRepository.GetByGameIdAndJurisdictionIdAsync(gameId, jurisdictionId);
                if (gameExclusion == null)
                {
                    _logger.LogWarning("Game exclusion for game ID {GameId} and jurisdiction ID {JurisdictionId} not found", gameId, jurisdictionId);
                    return false;
                }
                
                // Delete the game exclusion
                return await _gameExcludedByJurisdictionRepository.DeleteAsync(gameExclusion.ID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion by game ID {GameId} and jurisdiction ID {JurisdictionId}", gameId, jurisdictionId);
                throw;
            }
        }
    }
}
