using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Players;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for player operations using repository pattern
    /// </summary>
    public class PlayerService : IPlayerService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly ILogger<PlayerService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public PlayerService(
            IPlayerRepository playerRepository,
            ILogger<PlayerService> logger)
        {
            _playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetAllPlayersAsync()
        {
            try
            {
                _logger.LogInformation("Getting all players");
                return await _playerRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all players");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Player?> GetPlayerByIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting player by ID {PlayerId}", playerId);
                return await _playerRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player by ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetPlayersByCasinoNameAsync(string casinoName)
        {
            if (string.IsNullOrWhiteSpace(casinoName))
            {
                throw new ArgumentException("Casino name cannot be null or empty", nameof(casinoName));
            }
            
            try
            {
                _logger.LogInformation("Getting players by casino name {CasinoName}", casinoName);
                return await _playerRepository.GetByCasinoNameAsync(casinoName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by casino name {CasinoName}", casinoName);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetPlayersByCountryAsync(string country)
        {
            if (string.IsNullOrWhiteSpace(country))
            {
                throw new ArgumentException("Country cannot be null or empty", nameof(country));
            }
            
            try
            {
                _logger.LogInformation("Getting players by country {Country}", country);
                return await _playerRepository.GetByCountryAsync(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by country {Country}", country);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetPlayersByCurrencyAsync(string currency)
        {
            if (string.IsNullOrWhiteSpace(currency))
            {
                throw new ArgumentException("Currency cannot be null or empty", nameof(currency));
            }
            
            try
            {
                _logger.LogInformation("Getting players by currency {Currency}", currency);
                return await _playerRepository.GetByCurrencyAsync(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by currency {Currency}", currency);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetPlayersByRegistrationDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting players by registration date range {StartDate} to {EndDate}", startDate, endDate);
                return await _playerRepository.GetByRegistrationDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by registration date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Player>> GetPlayersByFirstDepositDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting players by first deposit date range {StartDate} to {EndDate}", startDate, endDate);
                return await _playerRepository.GetByFirstDepositDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by first deposit date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Player> AddPlayerAsync(Player player)
        {
            if (player == null)
            {
                throw new ArgumentNullException(nameof(player));
            }
            
            try
            {
                _logger.LogInformation("Adding new player with ID {PlayerId}", player.PlayerID);
                
                // Check if a player with the same ID already exists
                var existingPlayer = await _playerRepository.GetByPlayerIdAsync(player.PlayerID);
                if (existingPlayer != null)
                {
                    throw new InvalidOperationException($"A player with the ID '{player.PlayerID}' already exists");
                }
                
                return await _playerRepository.AddAsync(player);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding player with ID {PlayerId}", player.PlayerID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Player> UpdatePlayerAsync(Player player)
        {
            if (player == null)
            {
                throw new ArgumentNullException(nameof(player));
            }
            
            try
            {
                _logger.LogInformation("Updating player with ID {PlayerId}", player.PlayerID);
                
                // Check if the player exists
                var existingPlayer = await _playerRepository.GetByPlayerIdAsync(player.PlayerID);
                if (existingPlayer == null)
                {
                    throw new InvalidOperationException($"Player with ID {player.PlayerID} not found");
                }
                
                return await _playerRepository.UpdateAsync(player);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating player with ID {PlayerId}", player.PlayerID);
                throw;
            }
        }
    }
}
