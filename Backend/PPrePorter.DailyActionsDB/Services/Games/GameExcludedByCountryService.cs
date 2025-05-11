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
    /// Service for game excluded by country operations using repository pattern
    /// </summary>
    public class GameExcludedByCountryService : IGameExcludedByCountryService
    {
        private readonly IGameExcludedByCountryRepository _gameExcludedByCountryRepository;
        private readonly ILogger<GameExcludedByCountryService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public GameExcludedByCountryService(
            IGameExcludedByCountryRepository gameExcludedByCountryRepository,
            ILogger<GameExcludedByCountryService> logger)
        {
            _gameExcludedByCountryRepository = gameExcludedByCountryRepository ?? throw new ArgumentNullException(nameof(gameExcludedByCountryRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByCountry>> GetAllGameExclusionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all game exclusions");
                return await _gameExcludedByCountryRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all game exclusions");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByCountry?> GetGameExclusionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by ID {Id}", id);
                return await _gameExcludedByCountryRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByCountry>> GetGameExclusionsByGameIdAsync(int gameId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by game ID {GameId}", gameId);
                return await _gameExcludedByCountryRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by game ID {GameId}", gameId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<GameExcludedByCountry>> GetGameExclusionsByCountryIdAsync(int countryId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusions by country ID {CountryId}", countryId);
                return await _gameExcludedByCountryRepository.GetByCountryIdAsync(countryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusions by country ID {CountryId}", countryId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByCountry?> GetGameExclusionByGameIdAndCountryIdAsync(int gameId, int countryId)
        {
            try
            {
                _logger.LogInformation("Getting game exclusion by game ID {GameId} and country ID {CountryId}", gameId, countryId);
                return await _gameExcludedByCountryRepository.GetByGameIdAndCountryIdAsync(gameId, countryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game exclusion by game ID {GameId} and country ID {CountryId}", gameId, countryId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> IsGameExcludedForCountryAsync(int gameId, int countryId)
        {
            try
            {
                _logger.LogInformation("Checking if game {GameId} is excluded for country {CountryId}", gameId, countryId);
                return await _gameExcludedByCountryRepository.IsGameExcludedForCountryAsync(gameId, countryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if game {GameId} is excluded for country {CountryId}", gameId, countryId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<int>> GetExcludedGameIdsForCountryAsync(int countryId)
        {
            try
            {
                _logger.LogInformation("Getting excluded game IDs for country {CountryId}", countryId);
                return await _gameExcludedByCountryRepository.GetExcludedGameIdsForCountryAsync(countryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting excluded game IDs for country {CountryId}", countryId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByCountry> AddGameExclusionAsync(GameExcludedByCountry gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Adding new game exclusion for game ID {GameId} and country ID {CountryId}", gameExclusion.GameID, gameExclusion.CountryID);
                
                // Check if a game exclusion with the same game ID and country ID already exists
                var existingGameExclusion = await _gameExcludedByCountryRepository.GetByGameIdAndCountryIdAsync(gameExclusion.GameID, gameExclusion.CountryID);
                if (existingGameExclusion != null)
                {
                    throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and country ID {gameExclusion.CountryID} already exists");
                }
                
                // Set the updated date to now if not provided
                if (gameExclusion.UpdatedDate == default)
                {
                    gameExclusion.UpdatedDate = DateTime.UtcNow;
                }
                
                return await _gameExcludedByCountryRepository.AddAsync(gameExclusion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game exclusion for game ID {GameId} and country ID {CountryId}", gameExclusion.GameID, gameExclusion.CountryID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<GameExcludedByCountry> UpdateGameExclusionAsync(GameExcludedByCountry gameExclusion)
        {
            if (gameExclusion == null)
            {
                throw new ArgumentNullException(nameof(gameExclusion));
            }
            
            try
            {
                _logger.LogInformation("Updating game exclusion with ID {Id}", gameExclusion.ID);
                
                // Check if the game exclusion exists
                var existingGameExclusion = await _gameExcludedByCountryRepository.GetByIdAsync(gameExclusion.ID);
                if (existingGameExclusion == null)
                {
                    throw new InvalidOperationException($"Game exclusion with ID {gameExclusion.ID} not found");
                }
                
                // Check if the game ID and country ID are being changed and if the new combination already exists
                if (existingGameExclusion.GameID != gameExclusion.GameID || existingGameExclusion.CountryID != gameExclusion.CountryID)
                {
                    var gameExclusionWithSameGameIdAndCountryId = await _gameExcludedByCountryRepository.GetByGameIdAndCountryIdAsync(gameExclusion.GameID, gameExclusion.CountryID);
                    if (gameExclusionWithSameGameIdAndCountryId != null && gameExclusionWithSameGameIdAndCountryId.ID != gameExclusion.ID)
                    {
                        throw new InvalidOperationException($"A game exclusion for game ID {gameExclusion.GameID} and country ID {gameExclusion.CountryID} already exists");
                    }
                }
                
                // Set the updated date to now
                gameExclusion.UpdatedDate = DateTime.UtcNow;
                
                return await _gameExcludedByCountryRepository.UpdateAsync(gameExclusion);
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
                return await _gameExcludedByCountryRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion with ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteGameExclusionByGameIdAndCountryIdAsync(int gameId, int countryId)
        {
            try
            {
                _logger.LogInformation("Deleting game exclusion by game ID {GameId} and country ID {CountryId}", gameId, countryId);
                
                // Get the game exclusion by game ID and country ID
                var gameExclusion = await _gameExcludedByCountryRepository.GetByGameIdAndCountryIdAsync(gameId, countryId);
                if (gameExclusion == null)
                {
                    _logger.LogWarning("Game exclusion for game ID {GameId} and country ID {CountryId} not found", gameId, countryId);
                    return false;
                }
                
                // Delete the game exclusion
                return await _gameExcludedByCountryRepository.DeleteAsync(gameExclusion.ID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game exclusion by game ID {GameId} and country ID {CountryId}", gameId, countryId);
                throw;
            }
        }
    }
}
