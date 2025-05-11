using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Base partial class for GameController
    /// </summary>
    [ApiController]
    [Route("api/reports/games")]
    [Authorize]
    public partial class GameController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly IGameExcludedByCountryService _gameExcludedByCountryService;
        private readonly IGameExcludedByJurisdictionService _gameExcludedByJurisdictionService;
        private readonly IGameExcludedByLabelService _gameExcludedByLabelService;
        private readonly ICountryService _countryService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly ILogger<GameController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for GameController
        /// </summary>
        public GameController(
            IGameService gameService,
            IGameExcludedByCountryService gameExcludedByCountryService,
            IGameExcludedByJurisdictionService gameExcludedByJurisdictionService,
            IGameExcludedByLabelService gameExcludedByLabelService,
            ICountryService countryService,
            IWhiteLabelService whiteLabelService,
            ILogger<GameController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _gameExcludedByCountryService = gameExcludedByCountryService ?? throw new ArgumentNullException(nameof(gameExcludedByCountryService));
            _gameExcludedByJurisdictionService = gameExcludedByJurisdictionService ?? throw new ArgumentNullException(nameof(gameExcludedByJurisdictionService));
            _gameExcludedByLabelService = gameExcludedByLabelService ?? throw new ArgumentNullException(nameof(gameExcludedByLabelService));
            _countryService = countryService ?? throw new ArgumentNullException(nameof(countryService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
