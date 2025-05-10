using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Data;

namespace PPrePorter.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for DailyAction entities
    /// </summary>
    public class DailyActionRepository : Repository<DailyAction>, IDailyActionRepository
    {
        private readonly PPRePorterDbContext _ppReporterDbContext;

        public DailyActionRepository(PPRePorterDbContext dbContext, ILogger<DailyActionRepository> logger)
            : base(dbContext, logger)
        {
            _ppReporterDbContext = dbContext;
        }

        /// <summary>
        /// Gets daily actions for a specific date range
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                return await _ppReporterDbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date <= endDate)
                    .Include(da => da.WhiteLabel)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate}", 
                    startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Gets daily actions for a specific white label
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByWhiteLabelIdAsync(int whiteLabelId)
        {
            try
            {
                return await _ppReporterDbContext.DailyActions
                    .Where(da => da.WhiteLabelID == whiteLabelId)
                    .Include(da => da.WhiteLabel)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Gets daily actions for a specific date range and white label
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, int whiteLabelId)
        {
            try
            {
                return await _ppReporterDbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date <= endDate && da.WhiteLabelID == whiteLabelId)
                    .Include(da => da.WhiteLabel)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate} and white label ID {WhiteLabelId}", 
                    startDate, endDate, whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Gets daily actions for a specific date range and white labels
        /// </summary>
        public async Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<int> whiteLabelIds)
        {
            try
            {
                return await _ppReporterDbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date <= endDate && whiteLabelIds.Contains(da.WhiteLabelID))
                    .Include(da => da.WhiteLabel)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions for date range {StartDate} to {EndDate} and white label IDs {WhiteLabelIds}", 
                    startDate, endDate, string.Join(", ", whiteLabelIds));
                throw;
            }
        }

        /// <summary>
        /// Gets aggregated daily actions for a specific date range
        /// </summary>
        public async Task<DailyActionAggregateResult> GetAggregatedByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var dailyActions = await _ppReporterDbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date <= endDate)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();

                return AggregateResults(dailyActions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting aggregated daily actions for date range {StartDate} to {EndDate}", 
                    startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Gets aggregated daily actions for a specific date range and white label
        /// </summary>
        public async Task<DailyActionAggregateResult> GetAggregatedByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, int whiteLabelId)
        {
            try
            {
                var dailyActions = await _ppReporterDbContext.DailyActions
                    .Where(da => da.Date >= startDate && da.Date <= endDate && da.WhiteLabelID == whiteLabelId)
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .ToListAsync();

                return AggregateResults(dailyActions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting aggregated daily actions for date range {StartDate} to {EndDate} and white label ID {WhiteLabelId}", 
                    startDate, endDate, whiteLabelId);
                throw;
            }
        }

        /// <summary>
        /// Aggregates daily actions
        /// </summary>
        private static DailyActionAggregateResult AggregateResults(IEnumerable<DailyAction> dailyActions)
        {
            return new DailyActionAggregateResult
            {
                TotalRegistrations = dailyActions.Sum(da => da.Registration),
                TotalFTD = dailyActions.Sum(da => da.FTD),
                TotalDeposits = dailyActions.Sum(da => da.Deposits ?? 0),
                TotalPaidCashouts = dailyActions.Sum(da => da.PaidCashouts ?? 0),
                TotalBetsCasino = dailyActions.Sum(da => da.BetsCasino ?? 0),
                TotalWinsCasino = dailyActions.Sum(da => da.WinsCasino ?? 0),
                TotalBetsSport = dailyActions.Sum(da => da.BetsSport ?? 0),
                TotalWinsSport = dailyActions.Sum(da => da.WinsSport ?? 0),
                TotalBetsLive = dailyActions.Sum(da => da.BetsLive ?? 0),
                TotalWinsLive = dailyActions.Sum(da => da.WinsLive ?? 0),
                TotalBetsBingo = dailyActions.Sum(da => da.BetsBingo ?? 0),
                TotalWinsBingo = dailyActions.Sum(da => da.WinsBingo ?? 0)
            };
        }
    }
}
