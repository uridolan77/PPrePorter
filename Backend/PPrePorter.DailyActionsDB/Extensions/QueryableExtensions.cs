using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Linq;
using System.Reflection;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for IQueryable
    /// </summary>
    public static class QueryableExtensions
    {
        /// <summary>
        /// Adds NOLOCK hint to SQL Server queries
        /// This method tags the query with a special hint that will be processed by the NoLockInterceptor
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to add NOLOCK hint to</param>
        /// <returns>Query with NOLOCK hint comment</returns>
        public static IQueryable<T> WithNoLock<T>(this IQueryable<T> query) where T : class
        {
            return query.TagWith("WITH (NOLOCK)");
        }

        /// <summary>
        /// Adds NOLOCK hint to SQL Server queries for complex queries with joins and subqueries
        /// This is a specialized version that adds a specific tag to help the interceptor identify complex queries
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to add NOLOCK hint to</param>
        /// <returns>Query with complex NOLOCK hint comment</returns>
        public static IQueryable<T> WithComplexNoLock<T>(this IQueryable<T> query) where T : class
        {
            return query.TagWith("WITH (NOLOCK) COMPLEX_QUERY");
        }

        /// <summary>
        /// Adds NOLOCK hint to SQL Server queries for queries with CASE expressions
        /// This is a specialized version that adds a specific tag to help the interceptor identify queries with CASE expressions
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to add NOLOCK hint to</param>
        /// <returns>Query with CASE NOLOCK hint comment</returns>
        public static IQueryable<T> WithCaseNoLock<T>(this IQueryable<T> query) where T : class
        {
            return query.TagWith("WITH (NOLOCK) CASE_EXPRESSIONS");
        }

        /// <summary>
        /// Adds NOLOCK hint to all tables in a SQL Server query
        /// This method ensures that all tables in the query have NOLOCK hints
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to add NOLOCK hint to</param>
        /// <returns>Query with NOLOCK hints on all tables</returns>
        public static IQueryable<T> WithForceNoLock<T>(this IQueryable<T> query) where T : class
        {
            // Tag with a special hint that will be processed by the NoLockInterceptor
            // This will ensure that the interceptor applies NOLOCK hints to all tables in the query
            return query.TagWith("FORCE_NOLOCK_ON_ALL_TABLES");
        }

        /// <summary>
        /// Adds AsNoTracking and NOLOCK hint to a query for optimal read performance
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to optimize</param>
        /// <returns>Optimized query with AsNoTracking and NOLOCK hint</returns>
        public static IQueryable<T> AsReadOnly<T>(this IQueryable<T> query) where T : class
        {
            return query.AsNoTracking().WithForceNoLock();
        }
    }
}
