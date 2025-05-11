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
    /// Service for game description operations using repository pattern
    /// </summary>
    public class GameDescriptionService : IGameDescriptionService
    {
        private readonly IGameDescriptionRepository _gameDescriptionRepository;
        private readonly ILogger<GameDescriptionService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameDescriptionService(
            IGameDescriptionRepository gameDescriptionRepository,
            ILogger<GameDescriptionService> logger)
        {
            _gameDescriptionRepository = gameDescriptionRepository ?? throw new ArgumentNullException(nameof(gameDescriptionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameDescription>> GetAllGameDescriptionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all game descriptions");
                return await _gameDescriptionRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all game descriptions");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameDescription?> GetGameDescriptionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game description by ID {Id}", id);
                return await _gameDescriptionRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game description by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameDescription>> GetGameDescriptionsByGameIdAsync(int gameId)
        {
            try
            {
                _logger.LogInformation("Getting game descriptions by game ID {GameId}", gameId);
                return await _gameDescriptionRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game descriptions by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameDescription>> GetGameDescriptionsByLanguageAsync(string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                throw new ArgumentException("Language cannot be null or empty", nameof(language));
            }

            try
            {
                _logger.LogInformation("Getting game descriptions by language {Language}", language);
                return await _gameDescriptionRepository.GetByLanguageAsync(language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game descriptions by language {Language}", language);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameDescription?> GetGameDescriptionByGameIdAndLanguageAsync(int gameId, string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                throw new ArgumentException("Language cannot be null or empty", nameof(language));
            }

            try
            {
                _logger.LogInformation("Getting game description by game ID {GameId} and language {Language}", gameId, language);
                return await _gameDescriptionRepository.GetByGameIdAndLanguageAsync(gameId, language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game description by game ID {GameId} and language {Language}", gameId, language);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameDescription> AddGameDescriptionAsync(GameDescription gameDescription)
        {
            if (gameDescription == null)
            {
                throw new ArgumentNullException(nameof(gameDescription));
            }

            try
            {
                _logger.LogInformation("Adding new game description for game ID {GameId} and language {Language}", gameDescription.GameID, gameDescription.LanguageID);

                // Check if a game description with the same game ID and language already exists
                var existingGameDescription = await _gameDescriptionRepository.GetByGameIdAndLanguageAsync(gameDescription.GameID, gameDescription.LanguageID.ToString());
                if (existingGameDescription != null)
                {
                    throw new InvalidOperationException($"A game description for game ID {gameDescription.GameID} and language {gameDescription.LanguageID} already exists");
                }

                return await _gameDescriptionRepository.AddAsync(gameDescription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game description for game ID {GameId} and language {Language}", gameDescription.GameID, gameDescription.LanguageID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameDescription> UpdateGameDescriptionAsync(GameDescription gameDescription)
        {
            if (gameDescription == null)
            {
                throw new ArgumentNullException(nameof(gameDescription));
            }

            try
            {
                _logger.LogInformation("Updating game description with ID {Id}", gameDescription.ID);

                // Check if the game description exists
                var existingGameDescription = await _gameDescriptionRepository.GetByIdAsync(gameDescription.ID);
                if (existingGameDescription == null)
                {
                    throw new InvalidOperationException($"Game description with ID {gameDescription.ID} not found");
                }

                // Check if the game ID and language are being changed and if the new combination already exists
                if ((existingGameDescription.GameID != gameDescription.GameID || existingGameDescription.LanguageID != gameDescription.LanguageID))
                {
                    var gameDescriptionWithSameGameIdAndLanguage = await _gameDescriptionRepository.GetByGameIdAndLanguageAsync(gameDescription.GameID, gameDescription.LanguageID.ToString());
                    if (gameDescriptionWithSameGameIdAndLanguage != null && gameDescriptionWithSameGameIdAndLanguage.ID != gameDescription.ID)
                    {
                        throw new InvalidOperationException($"A game description for game ID {gameDescription.GameID} and language {gameDescription.LanguageID} already exists");
                    }
                }

                return await _gameDescriptionRepository.UpdateAsync(gameDescription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game description with ID {Id}", gameDescription.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteGameDescriptionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting game description with ID {Id}", id);
                return await _gameDescriptionRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game description with ID {Id}", id);
                throw;
            }
        }
    }
}
