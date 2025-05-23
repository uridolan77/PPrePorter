using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for SportSport entities
    /// </summary>
    public class SportSportRepository : NamedEntityRepository<SportSport>, ISportSportRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportSportRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportSportRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Get sports by region ID
        /// </summary>
        public async Task<IEnumerable<SportSport>> GetByRegionIdAsync(int regionId)
        {
            string cacheKey = $"{_cacheKeyPrefix}RegionId_{regionId}";

            return await GetCachedResultAsync(cacheKey, async () =>
            {
                // Optimized query to get sports related to a region
                // This uses a more efficient approach with a single query
                // that joins the necessary tables

                // Get sports related to the region through competitions and matches
                var sportIds = await _dailyActionsDbContext.SportBetsEnhanced
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(sbe => sbe.RegionId == regionId)
                    .Select(sbe => sbe.SportId)
                    .Distinct()
                    .ToListAsync();

                // Get the sport entities
                return await _dbSet
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(s => sportIds.Contains(s.SportID))
                    .ToListAsync();
            });
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportSport> ApplyActiveFilter(IQueryable<SportSport> query)
        {
            return query;
        }
    }
}
