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
    /// Service for game operations using repository pattern
    /// </summary>
    public class GameService : IGameService
    {
        private readonly IGameRepository _gameRepository;
        private readonly ILogger<GameService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameService(
            IGameRepository gameRepository,
            ILogger<GameService> logger)
        {
            _gameRepository = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Game>> GetAllGamesAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all games (includeInactive: {IncludeInactive})", includeInactive);
                return await _gameRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all games");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Game?> GetGameByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game by ID {Id}", id);
                return await _gameRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Game?> GetGameByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Game name cannot be null or empty", nameof(name));
            }

            try
            {
                _logger.LogInformation("Getting game by name {Name}", name);
                return await _gameRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game by name {Name}", name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Game>> GetGamesByProviderAsync(string provider)
        {
            if (string.IsNullOrWhiteSpace(provider))
            {
                throw new ArgumentException("Provider cannot be null or empty", nameof(provider));
            }

            try
            {
                _logger.LogInformation("Getting games by provider {Provider}", provider);
                return await _gameRepository.GetByProviderAsync(provider);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting games by provider {Provider}", provider);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Game>> GetGamesByGameTypeAsync(string gameType)
        {
            if (string.IsNullOrWhiteSpace(gameType))
            {
                throw new ArgumentException("Game type cannot be null or empty", nameof(gameType));
            }

            try
            {
                _logger.LogInformation("Getting games by game type {GameType}", gameType);
                return await _gameRepository.GetByGameTypeAsync(gameType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting games by game type {GameType}", gameType);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Game>> GetGamesNotExcludedForCountryAsync(int countryId)
        {
            try
            {
                _logger.LogInformation("Getting games not excluded for country {CountryId}", countryId);
                return await _gameRepository.GetNotExcludedForCountryAsync(countryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting games not excluded for country {CountryId}", countryId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Game> AddGameAsync(Game game)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }

            try
            {
                _logger.LogInformation("Adding new game {Name}", game.GameName);

                // Check if a game with the same name already exists
                var existingGame = await _gameRepository.GetByNameAsync(game.GameName);
                if (existingGame != null)
                {
                    throw new InvalidOperationException($"A game with the name '{game.GameName}' already exists");
                }

                return await _gameRepository.AddAsync(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game {Name}", game.GameName);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Game> UpdateGameAsync(Game game)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }

            try
            {
                _logger.LogInformation("Updating game with ID {Id}", game.GameID);

                // Check if the game exists
                var existingGame = await _gameRepository.GetByIdAsync(game.GameID);
                if (existingGame == null)
                {
                    throw new InvalidOperationException($"Game with ID {game.GameID} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (existingGame.GameName != game.GameName)
                {
                    var gameWithSameName = await _gameRepository.GetByNameAsync(game.GameName);
                    if (gameWithSameName != null && gameWithSameName.GameID != game.GameID)
                    {
                        throw new InvalidOperationException($"A game with the name '{game.GameName}' already exists");
                    }
                }

                return await _gameRepository.UpdateAsync(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game with ID {Id}", game.GameID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteGameAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting game with ID {Id}", id);

                // Check if the game exists
                var existingGame = await _gameRepository.GetByIdAsync(id);
                if (existingGame == null)
                {
                    _logger.LogWarning("Game with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _gameRepository.UpdateAsync(existingGame);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game with ID {Id}", id);
                throw;
            }
        }
    }
}
