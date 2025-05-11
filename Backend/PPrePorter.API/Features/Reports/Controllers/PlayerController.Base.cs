using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Base partial class for PlayerController
    /// </summary>
    [ApiController]
    [Route("api/reports/players")]
    [Authorize]
    public partial class PlayerController : ControllerBase
    {
        private readonly IPlayerService _playerService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly ICountryService _countryService;
        private readonly ICurrencyService _currencyService;
        private readonly ILogger<PlayerController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for PlayerController
        /// </summary>
        public PlayerController(
            IPlayerService playerService,
            IWhiteLabelService whiteLabelService,
            ICountryService countryService,
            ICurrencyService currencyService,
            ILogger<PlayerController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _countryService = countryService ?? throw new ArgumentNullException(nameof(countryService));
            _currencyService = currencyService ?? throw new ArgumentNullException(nameof(currencyService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
