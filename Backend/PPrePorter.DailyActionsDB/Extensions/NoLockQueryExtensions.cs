using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;

namespace PPrePorter.DailyActionsDB.Extensions
{
    /// <summary>
    /// Extension methods for applying NOLOCK behavior to queries using transaction isolation levels
    /// </summary>
    public static class NoLockQueryExtensions
    {
        /// <summary>
        /// Executes a query with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the result</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The query results with NOLOCK behavior</returns>
        public static async Task<List<T>> ToListWithNoLockAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            List<T> result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                result = await query.ToListAsync(cancellationToken);
                scope.Complete();
            }
            return result;
        }

        /// <summary>
        /// Executes a query with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the result</typeparam>
        /// <param name="query">The query to execute</param>
        /// <returns>The query results with NOLOCK behavior</returns>
        public static List<T> ToListWithNoLock<T>(this IQueryable<T> query)
        {
            List<T> result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                }))
            {
                result = query.ToList();
                scope.Complete();
            }
            return result;
        }

        /// <summary>
        /// Executes FirstOrDefault with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the result</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The first result or default with NOLOCK behavior</returns>
        public static async Task<T> FirstOrDefaultWithNoLockAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            T result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                result = await query.FirstOrDefaultAsync(cancellationToken);
                scope.Complete();
            }
            return result;
        }

        /// <summary>
        /// Executes SingleOrDefault with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the result</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The single result or default with NOLOCK behavior</returns>
        public static async Task<T> SingleOrDefaultWithNoLockAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            T result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                result = await query.SingleOrDefaultAsync(cancellationToken);
                scope.Complete();
            }
            return result;
        }

        /// <summary>
        /// Executes AnyAsync with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if any elements match the query, otherwise false</returns>
        public static async Task<bool> AnyWithNoLockAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            bool result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                result = await query.AnyAsync(cancellationToken);
                scope.Complete();
            }
            return result;
        }

        /// <summary>
        /// Executes CountAsync with NOLOCK behavior by using READ UNCOMMITTED transaction isolation level
        /// </summary>
        /// <typeparam name="T">The type of the query</typeparam>
        /// <param name="query">The query to execute</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The count of elements that match the query</returns>
        public static async Task<int> CountWithNoLockAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            int result;
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                result = await query.CountAsync(cancellationToken);
                scope.Complete();
            }
            return result;
        }
    }
}
