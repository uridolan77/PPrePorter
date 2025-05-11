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
        /// Note: This is a comment-based approach and doesn't actually add the NOLOCK hint to the SQL query.
        /// For actual NOLOCK hints, we need to use SQL Server-specific features or interceptors.
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
    }
}
