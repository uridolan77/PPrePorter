using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Base repository implementation for entities with name and active status
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public abstract class NamedEntityRepository<T> : BaseRepository<T>, INamedEntityRepository<T> where T : class
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="logger">Logger</param>
        /// <param name="cache">Memory cache</param>
        /// <param name="enableCaching">Whether to enable caching</param>
        /// <param name="cacheExpirationMinutes">Cache expiration in minutes</param>
        protected NamedEntityRepository(
            DbContext dbContext,
            ILogger logger,
            IMemoryCache cache,
            bool enableCaching = true,
            int cacheExpirationMinutes = 30)
            : base(dbContext, logger, cache, enableCaching, cacheExpirationMinutes)
        {
        }

        /// <summary>
        /// Get entity by name
        /// </summary>
        /// <param name="name">Entity name</param>
        /// <returns>Entity or null if not found</returns>
        public virtual async Task<T?> GetByNameAsync(string name)
        {
            return await GetByNamePropertyAsync(name);
        }

        /// <summary>
        /// Get entities by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of entities</returns>
        public virtual async Task<IEnumerable<T>> GetByActiveStatusAsync(bool isActive)
        {
            return await GetByActiveStatusPropertyAsync(isActive);
        }
    }
}
