using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PPrePorter.API.Features.Configuration;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Interfaces.Transactions;
using PPrePorter.DailyActionsDB.Interfaces;
using System.Text.Json;

namespace PPrePorter.API.Features.Reports.Controllers.Transactions
{
    /// <summary>
    /// Base partial class for TransactionController
    /// </summary>
    [ApiController]
    [Route("api/reports/transactions")]
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerGroups.Transactions)]
    public partial class TransactionController : ControllerBase
    {
        private readonly Core.Interfaces.Transactions.ITransactionService _transactionService;
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly IPlayerService _playerService;
        private readonly ILogger<TransactionController> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IGlobalCacheService _cacheService;

        // JSON serializer options for export
        private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

        /// <summary>
        /// Constructor for TransactionController
        /// </summary>
        public TransactionController(
            Core.Interfaces.Transactions.ITransactionService transactionService,
            IWhiteLabelService whiteLabelService,
            IPlayerService playerService,
            ILogger<TransactionController> logger,
            IMemoryCache memoryCache,
            IGlobalCacheService cacheService)
        {
            _transactionService = transactionService ?? throw new ArgumentNullException(nameof(transactionService));
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }
    }
}
