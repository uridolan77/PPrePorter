using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Extensions;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Simplified service for daily actions operations
    /// </summary>
    public class DailyActionsSimpleService : IDailyActionsSimpleService
    {
        private readonly DailyActionsSimpleDbContext _dbContext;
        private readonly ILogger<DailyActionsSimpleService> _logger;

        public DailyActionsSimpleService(
            DailyActionsSimpleDbContext dbContext,
            ILogger<DailyActionsSimpleService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<DailyActionSimple>> GetDailyActionsAsync(DateTime startDate, DateTime endDate, int? whiteLabelId = null)
        {
            try
            {
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                // Build query with NOLOCK hint
                var query = _dbContext.DailyActions
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(da => da.Date >= start && da.Date <= end);

                // Apply white label filter if specified
                if (whiteLabelId.HasValue)
                {
                    query = query.Where(da => da.WhiteLabelID == whiteLabelId.Value);
                }

                // Execute query with NOLOCK hint
                return await query.ToListWithNoLockAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<DailyActionSimple?> GetDailyActionByIdAsync(int id)
        {
            try
            {
                return await _dbContext.DailyActions
                    .AsNoTracking()
                    .WithForceNoLock()
                    .Where(da => da.Id == id)
                    .FirstOrDefaultWithNoLockAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action with ID {Id}", id);
                throw;
            }
        }
    }
}
