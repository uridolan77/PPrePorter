using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for IQueryable
    /// </summary>
    public static class QueryableExtensions
    {
        /// <summary>
        /// Adds NOLOCK hint to SQL Server queries
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to add NOLOCK hint to</param>
        /// <returns>Query with NOLOCK hint</returns>
        public static IQueryable<T> WithNoLock<T>(this IQueryable<T> query) where T : class
        {
            return query.TagWith("WITH (NOLOCK)");
        }
    }
}
