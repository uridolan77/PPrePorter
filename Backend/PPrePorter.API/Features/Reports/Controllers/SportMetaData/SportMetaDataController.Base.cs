using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers.SportMetaData
{
    /// <summary>
    /// Base partial class for SportMetaDataController
    /// </summary>
    [ApiController]
    [Route("api/reports/sport-metadata")]
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerGroups.SportMetadata)]
    public partial class SportMetaDataController : ControllerBase
    {
        private readonly ISportBetStateService _sportBetStateService;
        private readonly ISportBetTypeService _sportBetTypeService;
        private readonly ISportSportService _sportSportService;
        private readonly ISportCompetitionService _sportCompetitionService;
        private readonly ISportMatchService _sportMatchService;
        private readonly ISportMarketService _sportMarketService;
        private readonly ISportOddsTypeService _sportOddsTypeService;
        private readonly ISportRegionService _sportRegionService;
        private readonly ISportBetEnhancedService _sportBetEnhancedService;
        private readonly ILogger<SportMetaDataController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for SportMetaDataController
        /// </summary>
        public SportMetaDataController(
            ISportBetStateService sportBetStateService,
            ISportBetTypeService sportBetTypeService,
            ISportSportService sportSportService,
            ISportCompetitionService sportCompetitionService,
            ISportMatchService sportMatchService,
            ISportMarketService sportMarketService,
            ISportOddsTypeService sportOddsTypeService,
            ISportRegionService sportRegionService,
            ISportBetEnhancedService sportBetEnhancedService,
            ILogger<SportMetaDataController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _sportBetStateService = sportBetStateService ?? throw new ArgumentNullException(nameof(sportBetStateService));
            _sportBetTypeService = sportBetTypeService ?? throw new ArgumentNullException(nameof(sportBetTypeService));
            _sportSportService = sportSportService ?? throw new ArgumentNullException(nameof(sportSportService));
            _sportCompetitionService = sportCompetitionService ?? throw new ArgumentNullException(nameof(sportCompetitionService));
            _sportMatchService = sportMatchService ?? throw new ArgumentNullException(nameof(sportMatchService));
            _sportMarketService = sportMarketService ?? throw new ArgumentNullException(nameof(sportMarketService));
            _sportOddsTypeService = sportOddsTypeService ?? throw new ArgumentNullException(nameof(sportOddsTypeService));
            _sportRegionService = sportRegionService ?? throw new ArgumentNullException(nameof(sportRegionService));
            _sportBetEnhancedService = sportBetEnhancedService ?? throw new ArgumentNullException(nameof(sportBetEnhancedService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
