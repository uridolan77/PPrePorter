using Microsoft.Extensions.Logging;
using PPrePorter.Core.Models.DTOs;
using PPrePorter.Infrastructure.Adapters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// Use aliases to disambiguate between the two interfaces
using CoreIGameService = PPrePorter.Core.Interfaces.Games.IGameService;
using DailyActionsDBIGameService = PPrePorter.DailyActionsDB.Interfaces.IGameService;
using DbGame = PPrePorter.DailyActionsDB.Models.Games.Game;

namespace PPrePorter.Infrastructure.Services.Games
{
    /// <summary>
    /// Adapter for the GameService that implements the Core IGameService interface
    /// and uses the DailyActionsDB IGameService implementation
    /// </summary>
    public class GameServiceAdapter : CoreIGameService
    {
        private readonly DailyActionsDBIGameService _gameService;
        private readonly ILogger<GameServiceAdapter> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public GameServiceAdapter(
            DailyActionsDBIGameService gameService,
            ILogger<GameServiceAdapter> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all games
        /// </summary>
        public async Task<List<GameDto>> GetAllGamesAsync(bool includeInactive = false)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGames = await _gameService.GetAllGamesAsync(includeInactive);

                // Convert DailyActionsDB games to Core games
                var games = dbGames.Select(g => new GameDto
                {
                    GameID = g.GameID,
                    GameName = g.GameName ?? "Unknown",
                    Provider = g.Provider ?? "Unknown",
                    SubProvider = g.SubProvider ?? "Unknown",
                    GameType = g.GameType ?? "Unknown",
                    GameFilters = g.GameFilters ?? "Unknown",
                    GameOrder = g.GameOrder,
                    IsActive = g.IsActive,
                    DemoEnabled = g.DemoEnabled ?? false,
                    WagerPercent = g.WagerPercent ?? 0,
                    JackpotContribution = g.JackpotContribution ?? 0,
                    PayoutLow = g.PayoutLow ?? 0,
                    PayoutHigh = g.PayoutHigh ?? 0,
                    Volatility = g.Volatility ?? string.Empty,
                    UKCompliant = g.UKCompliant ?? false,
                    IsDesktop = g.IsDesktop ?? true,
                    ServerGameID = g.ServerGameID ?? string.Empty,
                    ProviderTitle = g.ProviderTitle ?? "Unknown",
                    IsMobile = g.IsMobile ?? false,
                    MobileServerGameID = g.MobileServerGameID ?? "Unknown",
                    MobileProviderTitle = g.MobileProviderTitle ?? "Unknown",
                    CreatedDate = g.CreatedDate ?? DateTime.Now,
                    ReleaseDate = g.ReleaseDate ?? DateTime.Now,
                    UpdatedDate = g.UpdatedDate ?? DateTime.Now,
                    HideInLobby = g.HideInLobby ?? false,
                    ExcludedCountries = g.ExcludedCountries ?? "Unknown"
                }).ToList();

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all games");
                throw;
            }
        }

        /// <summary>
        /// Gets a game by ID
        /// </summary>
        public async Task<GameDto> GetGameByIdAsync(long gameId)
        {
            try
            {
                // Call the DailyActionsDB service
                var dbGame = await _gameService.GetGameByIdAsync((int)gameId);

                // Convert DailyActionsDB game to Core game
                var game = dbGame != null ? new GameDto
                {
                    GameID = dbGame.GameID,
                    GameName = dbGame.GameName ?? "Unknown",
                    Provider = dbGame.Provider ?? "Unknown",
                    SubProvider = dbGame.SubProvider ?? "Unknown",
                    GameType = dbGame.GameType ?? "Unknown",
                    GameFilters = dbGame.GameFilters ?? "Unknown",
                    GameOrder = dbGame.GameOrder,
                    IsActive = dbGame.IsActive,
                    DemoEnabled = dbGame.DemoEnabled ?? false,
                    WagerPercent = dbGame.WagerPercent ?? 0,
                    JackpotContribution = dbGame.JackpotContribution ?? 0,
                    PayoutLow = dbGame.PayoutLow ?? 0,
                    PayoutHigh = dbGame.PayoutHigh ?? 0,
                    Volatility = dbGame.Volatility ?? string.Empty,
                    UKCompliant = dbGame.UKCompliant ?? false,
                    IsDesktop = dbGame.IsDesktop ?? true,
                    ServerGameID = dbGame.ServerGameID ?? string.Empty,
                    ProviderTitle = dbGame.ProviderTitle ?? "Unknown",
                    IsMobile = dbGame.IsMobile ?? false,
                    MobileServerGameID = dbGame.MobileServerGameID ?? "Unknown",
                    MobileProviderTitle = dbGame.MobileProviderTitle ?? "Unknown",
                    CreatedDate = dbGame.CreatedDate ?? DateTime.Now,
                    ReleaseDate = dbGame.ReleaseDate ?? DateTime.Now,
                    UpdatedDate = dbGame.UpdatedDate ?? DateTime.Now,
                    HideInLobby = dbGame.HideInLobby ?? false,
                    ExcludedCountries = dbGame.ExcludedCountries ?? "Unknown"
                } : null;

                return game;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game by ID {GameId}", gameId);
                throw;
            }
        }

        // The ConvertToCoreDto method has been replaced by inline conversion in each method
    }
}
