using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces.Players;
using PPrePorter.Core.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.Infrastructure.Services.Players
{
    /// <summary>
    /// Adapter for the PlayerService that implements the Core IPlayerService interface
    /// and uses the DailyActionsDB IPlayerService implementation
    /// </summary>
    public class PlayerServiceAdapter : Core.Interfaces.Players.IPlayerService
    {
        private readonly PPrePorter.DailyActionsDB.Interfaces.IPlayerService _playerService;
        private readonly ILogger<PlayerServiceAdapter> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public PlayerServiceAdapter(
            PPrePorter.DailyActionsDB.Interfaces.IPlayerService playerService,
            ILogger<PlayerServiceAdapter> logger)
        {
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all players
        /// </summary>
        public async Task<List<PlayerDto>> GetAllPlayersAsync()
        {
            try
            {
                // Call the DailyActionsDB service
                var dbPlayers = await _playerService.GetAllPlayersAsync();

                // Convert DailyActionsDB players to Core players
                var players = dbPlayers.Select(ConvertToCoreDto).ToList();

                return players;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all players");
                throw;
            }
        }

        /// <summary>
        /// Gets a player by ID
        /// </summary>
        public async Task<PlayerDto> GetPlayerByIdAsync(long playerId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbPlayer = await _playerService.GetPlayerByIdAsync(playerId);

                // Convert DailyActionsDB player to Core player
                var player = dbPlayer != null ? ConvertToCoreDto(dbPlayer) : null;

                return player;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player by ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Gets players by white label ID
        /// </summary>
        public async Task<List<PlayerDto>> GetPlayersByWhiteLabelIdAsync(int whiteLabelId)
        {
            try
            {
                // Call the DailyActionsDB service to get all players
                var dbPlayers = await _playerService.GetAllPlayersAsync();

                // Filter by white label ID (casino name)
                var filteredPlayers = dbPlayers
                    .Where(p => p.CasinoName != null && p.CasinoName.Contains(whiteLabelId.ToString()))
                    .Select(ConvertToCoreDto)
                    .ToList();

                return filteredPlayers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players by white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Converts a DailyActionsDB player to a Core player DTO
        /// </summary>
        private PlayerDto ConvertToCoreDto(PPrePorter.DailyActionsDB.Models.Players.Player dbPlayer)
        {
            return new PlayerDto
            {
                PlayerID = dbPlayer.PlayerID,
                CasinoName = dbPlayer.CasinoName,
                Alias = dbPlayer.Alias,
                RegisteredDate = dbPlayer.RegisteredDate,
                FirstDepositDate = dbPlayer.FirstDepositDate,
                DateOfBirth = dbPlayer.DateOfBirth,
                Gender = dbPlayer.Gender,
                Country = dbPlayer.Country,
                Currency = dbPlayer.Currency,
                Balance = dbPlayer.Balance,
                OriginalBalance = dbPlayer.OriginalBalance,
                AffiliateID = dbPlayer.AffiliateID,
                Language = dbPlayer.Language,
                RegisteredPlatform = dbPlayer.RegisteredPlatform,
                Email = dbPlayer.Email,
                IsOptIn = dbPlayer.IsOptIn,
                IsBlocked = dbPlayer.IsBlocked,
                IsTest = dbPlayer.IsTest,
                LastLoginDate = dbPlayer.LastLoginDate,
                VIPLevel = dbPlayer.VIPLevel,
                LastUpdated = dbPlayer.LastUpdated,
                TotalDeposits = dbPlayer.TotalDeposits,
                TotalWithdrawals = dbPlayer.TotalWithdrawals,
                MailEnabled = dbPlayer.MailEnabled,
                PromotionsEnabled = dbPlayer.PromotionsEnabled,
                BonusesEnabled = dbPlayer.BonusesEnabled,
                IP = dbPlayer.IP,
                PromotionCode = dbPlayer.PromotionCode,
                LoggedIn = dbPlayer.LoggedIn,
                Status = dbPlayer.Status
            };
        }
    }
}
