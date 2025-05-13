using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for adding NOLOCK hints to queries
    /// </summary>
    public static class SqlNoLockExtensions
    {
        /// <summary>
        /// Adds NOLOCK hint to all tables in the query
        /// </summary>
        public static IQueryable<T> WithSqlNoLock<T>(this IQueryable<T> query)
        {
            return query.TagWith("-- FORCE_NOLOCK_ON_ALL_TABLES");
        }

        /// <summary>
        /// Executes a query with NOLOCK hint and returns the results as a list
        /// </summary>
        public static async Task<List<T>> ToListWithSqlNoLock<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK hint
            query = query.WithSqlNoLock();

            // Execute the query
            return await query.ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK hint and returns the first result or default
        /// </summary>
        public static async Task<T> FirstOrDefaultWithSqlNoLock<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK hint
            query = query.WithSqlNoLock();

            // Execute the query
            return await query.FirstOrDefaultAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK hint and returns the single result or default
        /// </summary>
        public static async Task<T> SingleOrDefaultWithSqlNoLock<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK hint
            query = query.WithSqlNoLock();

            // Execute the query
            return await query.SingleOrDefaultAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK hint and returns whether any elements match the query
        /// </summary>
        public static async Task<bool> AnyWithSqlNoLock<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK hint
            query = query.WithSqlNoLock();

            // Execute the query
            return await query.AnyAsync(cancellationToken);
        }

        /// <summary>
        /// Executes a query with NOLOCK hint and returns the count of elements
        /// </summary>
        public static async Task<int> CountWithSqlNoLock<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            // Add the NOLOCK hint
            query = query.WithSqlNoLock();

            // Execute the query
            return await query.CountAsync(cancellationToken);
        }

        /// <summary>
        /// Adds AsNoTracking and NOLOCK hint to a query for optimal read performance
        /// </summary>
        public static IQueryable<T> AsReadOnlyWithSqlNoLock<T>(this IQueryable<T> query) where T : class
        {
            return query.AsNoTracking().WithSqlNoLock();
        }
    }
}
