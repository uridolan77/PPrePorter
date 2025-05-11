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
    /// Service for game casino session operations using repository pattern
    /// </summary>
    public class GameCasinoSessionService : IGameCasinoSessionService
    {
        private readonly IGameCasinoSessionRepository _gameCasinoSessionRepository;
        private readonly ILogger<GameCasinoSessionService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameCasinoSessionService(
            IGameCasinoSessionRepository gameCasinoSessionRepository,
            ILogger<GameCasinoSessionService> logger)
        {
            _gameCasinoSessionRepository = gameCasinoSessionRepository ?? throw new ArgumentNullException(nameof(gameCasinoSessionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetAllGameCasinoSessionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all game casino sessions");
                return await _gameCasinoSessionRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all game casino sessions");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameCasinoSession?> GetGameCasinoSessionByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting game casino session by ID {Id}", id);
                return await _gameCasinoSessionRepository.GetByIdAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino session by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByPlayerIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting game casino sessions by player ID {PlayerId}", playerId);
                return await _gameCasinoSessionRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino sessions by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByGameIdAsync(int gameId)
        {
            try
            {
                _logger.LogInformation("Getting game casino sessions by game ID {GameId}", gameId);
                return await _gameCasinoSessionRepository.GetByGameIdAsync(gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino sessions by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting game casino sessions by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _gameCasinoSessionRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino sessions by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting game casino sessions by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                return await _gameCasinoSessionRepository.GetByPlayerIdAndDateRangeAsync(playerId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino sessions by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByGameIdAndDateRangeAsync(int gameId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting game casino sessions by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                return await _gameCasinoSessionRepository.GetByGameIdAndDateRangeAsync(gameId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game casino sessions by game ID {GameId} and date range {StartDate} to {EndDate}", gameId, startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameCasinoSession> AddGameCasinoSessionAsync(GameCasinoSession gameCasinoSession)
        {
            if (gameCasinoSession == null)
            {
                throw new ArgumentNullException(nameof(gameCasinoSession));
            }

            try
            {
                _logger.LogInformation("Adding new game casino session for player ID {PlayerId} and game ID {GameId}", gameCasinoSession.PlayerID, gameCasinoSession.GameID);
                return await _gameCasinoSessionRepository.AddAsync(gameCasinoSession);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game casino session for player ID {PlayerId} and game ID {GameId}", gameCasinoSession.PlayerID, gameCasinoSession.GameID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<GameCasinoSession> UpdateGameCasinoSessionAsync(GameCasinoSession gameCasinoSession)
        {
            if (gameCasinoSession == null)
            {
                throw new ArgumentNullException(nameof(gameCasinoSession));
            }

            try
            {
                _logger.LogInformation("Updating game casino session with ID {Id}", gameCasinoSession.ID);

                // Check if the game casino session exists
                var existingGameCasinoSession = await _gameCasinoSessionRepository.GetByIdAsync((int)gameCasinoSession.ID);
                if (existingGameCasinoSession == null)
                {
                    throw new InvalidOperationException($"Game casino session with ID {gameCasinoSession.ID} not found");
                }

                return await _gameCasinoSessionRepository.UpdateAsync(gameCasinoSession);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game casino session with ID {Id}", gameCasinoSession.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteGameCasinoSessionAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting game casino session with ID {Id}", id);
                return await _gameCasinoSessionRepository.DeleteAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game casino session with ID {Id}", id);
                throw;
            }
        }
    }
}
