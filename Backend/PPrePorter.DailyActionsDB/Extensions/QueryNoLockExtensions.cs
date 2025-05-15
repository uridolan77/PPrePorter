using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for IQueryable to add NOLOCK behavior
    /// These methods tag queries with special comments that are recognized by the ReadUncommittedInterceptor
    /// </summary>
    public static class QueryNoLockExtensions
    {
        /// <summary>
        /// Adds a tag to the query to indicate that it should use NOLOCK behavior
        /// This will be processed by the ReadUncommittedInterceptor
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to tag</param>
        /// <returns>The tagged query</returns>
        public static IQueryable<T> WithNoLock<T>(this IQueryable<T> query)
        {
            return query.TagWith("WITH (NOLOCK)");
        }

        /// <summary>
        /// Adds a tag to the query to indicate that all tables should use NOLOCK behavior
        /// This will be processed by the ReadUncommittedInterceptor
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to tag</param>
        /// <returns>The tagged query</returns>
        public static IQueryable<T> WithForceNoLock<T>(this IQueryable<T> query)
        {
            return query.TagWith("FORCE_NOLOCK_ON_ALL_TABLES");
        }

        /// <summary>
        /// Configures a query for optimal read performance by making it non-tracking and adding NOLOCK behavior
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to configure</param>
        /// <returns>The configured query</returns>
        public static IQueryable<T> AsReadOnly<T>(this IQueryable<T> query) where T : class
        {
            return query.AsNoTracking().WithForceNoLock();
        }

        /// <summary>
        /// Executes a query with NOLOCK behavior and returns the results as a list
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Optional cancellation token</param>
        /// <returns>The query results</returns>
        public static async Task<List<T>> ToListWithNoLockAsync<T>(
            this IQueryable<T> query, 
            CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK tag
            query = query.WithForceNoLock();
            
            // Execute the query
            return await query.ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK behavior and returns the first result or default
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Optional cancellation token</param>
        /// <returns>The first result or default</returns>
        public static async Task<T?> FirstOrDefaultWithNoLockAsync<T>(
            this IQueryable<T> query, 
            CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK tag
            query = query.WithForceNoLock();
            
            // Execute the query
            return await query.FirstOrDefaultAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK behavior and returns whether any results exist
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Optional cancellation token</param>
        /// <returns>True if any results exist, false otherwise</returns>
        public static async Task<bool> AnyWithNoLockAsync<T>(
            this IQueryable<T> query, 
            CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK tag
            query = query.WithForceNoLock();
            
            // Execute the query
            return await query.AnyAsync(cancellationToken);
        }
    }
}
