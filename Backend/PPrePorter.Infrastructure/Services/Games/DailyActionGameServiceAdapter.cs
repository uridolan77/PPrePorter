using Microsoft.Extensions.Logging;
using PPrePorter.Core.Models.DTOs;
using PPrePorter.Infrastructure.Adapters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// Use aliases to disambiguate between the two interfaces
using CoreIDailyActionGameService = PPrePorter.Core.Interfaces.Games.IDailyActionGameService;
using DailyActionsDBIDailyActionGameService = PPrePorter.DailyActionsDB.Interfaces.IDailyActionGameService;
using DbDailyActionGame = PPrePorter.DailyActionsDB.Models.DailyActions.DailyActionGame;

namespace PPrePorter.Infrastructure.Services.Games
{
    /// <summary>
    /// Adapter for the DailyActionGameService that implements the Core IDailyActionGameService interface
    /// and uses the DailyActionsDB IDailyActionGameService implementation
    /// </summary>
    public class DailyActionGameServiceAdapter : CoreIDailyActionGameService
    {
        private readonly DailyActionsDBIDailyActionGameService _dailyActionGameService;
        private readonly ILogger<DailyActionGameServiceAdapter> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionGameServiceAdapter(
            DailyActionsDBIDailyActionGameService dailyActionGameService,
            ILogger<DailyActionGameServiceAdapter> logger)
        {
            _dailyActionGameService = dailyActionGameService ?? throw new ArgumentNullException(nameof(dailyActionGameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets daily action games by date range
        /// </summary>
        public async Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGames = await _dailyActionGameService.GetDailyActionGamesByDateRangeAsync(startDate, endDate);

                // Convert DailyActionsDB games to Core games using the adapter
                var games = dbGames.Select(g => ConvertToCoreDto(g)).ToList();

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by date range");
                throw;
            }
        }

        /// <summary>
        /// Gets daily action games by player ID
        /// </summary>
        public async Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByPlayerIdAsync(long playerId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGames = await _dailyActionGameService.GetDailyActionGamesByPlayerIdAsync(playerId);

                // Convert DailyActionsDB games to Core games using the adapter
                var games = dbGames.Select(g => ConvertToCoreDto(g)).ToList();

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by player ID {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Gets daily action games by game ID
        /// </summary>
        public async Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByGameIdAsync(long gameId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGames = await _dailyActionGameService.GetDailyActionGamesByGameIdAsync(gameId);

                // Convert DailyActionsDB games to Core games using the adapter
                var games = dbGames.Select(g => ConvertToCoreDto(g)).ToList();

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action games by game ID {GameId}", gameId);
                throw;
            }
        }

        /// <summary>
        /// Gets a daily action game by ID
        /// </summary>
        public async Task<DailyActionGameDto?> GetDailyActionGameByIdAsync(long id)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGame = await _dailyActionGameService.GetDailyActionGameByIdAsync(id);

                // If the game is not found, return null
                if (dbGame == null)
                {
                    return null;
                }

                // Convert DailyActionsDB game to Core game using the adapter
                var game = ConvertToCoreDto(dbGame);

                return game;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action game by ID {Id}", id);
                throw;
            }
        }

        /// <summary>
        /// Converts a DailyActionsDB DailyActionGame to a Core DailyActionGameDto
        /// </summary>
        private DailyActionGameDto ConvertToCoreDto(DbDailyActionGame g)
        {
            return new DailyActionGameDto
            {
                ID = (int)g.ID,
                GameID = g.GameID.HasValue ? (int)g.GameID.Value : 0,
                PlayerID = g.PlayerID.HasValue ? (int)g.PlayerID.Value : 0,
                GameDate = g.GameDate ?? DateTime.MinValue,
                RealBetAmount = g.RealBetAmount,
                BonusBetAmount = g.BonusBetAmount,
                RealWinAmount = g.RealWinAmount,
                BonusWinAmount = g.BonusWinAmount,
                Platform = g.Platform ?? "Unknown",
                WhiteLabelID = 0, // Not available in DbDailyActionGame
                NetGamingRevenue = g.NetGamingRevenue,
                NumberofRealBets = g.NumberofRealBets.HasValue ? (int?)g.NumberofRealBets.Value : null,
                NumberofBonusBets = g.NumberofBonusBets.HasValue ? (int?)g.NumberofBonusBets.Value : null,
                NumberofSessions = g.NumberofSessions.HasValue ? (int?)g.NumberofSessions.Value : null,
                NumberofRealWins = g.NumberofRealWins.HasValue ? (int?)g.NumberofRealWins.Value : null,
                NumberofBonusWins = g.NumberofBonusWins.HasValue ? (int?)g.NumberofBonusWins.Value : null,
                RealBetAmountOriginal = g.RealBetAmountOriginal,
                RealWinAmountOriginal = g.RealWinAmountOriginal,
                BonusBetAmountOriginal = g.BonusBetAmountOriginal,
                BonusWinAmountOriginal = g.BonusWinAmountOriginal,
                NetGamingRevenueOriginal = g.NetGamingRevenueOriginal,
                UpdateDate = g.UpdateDate
            };
        }
    }
}
