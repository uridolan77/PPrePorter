using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Interfaces.Games;
using PPrePorter.Core.Interfaces.Players;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Base partial class for DailyActionGameController
    /// </summary>
    [ApiController]
    [Route("api/reports/daily-action-games")]
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerGroups.DailyActionGames)]
    public partial class DailyActionGameController : ControllerBase
    {
        private readonly Core.Interfaces.Games.IDailyActionGameService _dailyActionGameService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly Core.Interfaces.Games.IGameService _gameService;
        private readonly Core.Interfaces.Players.IPlayerService _playerService;
        private readonly ILogger<DailyActionGameController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for DailyActionGameController
        /// </summary>
        public DailyActionGameController(
            Core.Interfaces.Games.IDailyActionGameService dailyActionGameService,
            IWhiteLabelService whiteLabelService,
            Core.Interfaces.Games.IGameService gameService,
            Core.Interfaces.Players.IPlayerService playerService,
            ILogger<DailyActionGameController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _dailyActionGameService = dailyActionGameService ?? throw new ArgumentNullException(nameof(dailyActionGameService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
