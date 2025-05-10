using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository implementation for SportBetType entities
    /// </summary>
    public class SportBetTypeRepository : NamedEntityRepository<SportBetType>, ISportBetTypeRepository
    {
        private readonly DailyActionsDbContext _dailyActionsDbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetTypeRepository(
            DailyActionsDbContext dbContext,
            ILogger<SportBetTypeRepository> logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
            _dailyActionsDbContext = dbContext;
        }

        /// <summary>
        /// Apply active filter to query
        /// </summary>
        protected override IQueryable<SportBetType> ApplyActiveFilter(IQueryable<SportBetType> query)
        {
            return query;
        }
    }
}
