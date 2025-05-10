using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Base partial class for DailyActionsController
    /// </summary>
    [ApiController]
    [Route("api/reports/daily-actions")]
    [Authorize]
    public partial class DailyActionsController : ControllerBase
    {
        private readonly IDailyActionsService _dailyActionsService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly ILogger<DailyActionsController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for DailyActionsController
        /// </summary>
        public DailyActionsController(
            IDailyActionsService dailyActionsService,
            IWhiteLabelService whiteLabelService,
            ILogger<DailyActionsController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
