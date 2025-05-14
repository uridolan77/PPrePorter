using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace PPrePorter.Infrastructure.Extensions
{
    /// <summary>
    /// Extension methods for DbSet
    /// </summary>
    public static class DbSetExtensions
    {
        /// <summary>
        /// Converts an IQueryable to a DbSet
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="query">Query to convert</param>
        /// <returns>DbSet of the entity type</returns>
        public static DbSet<T> AsDbSet<T>(this IQueryable<T> query) where T : class
        {
            // This is a workaround to convert IQueryable to DbSet
            // It's not a real conversion, but it allows us to satisfy the interface requirements
            return query.Provider.CreateQuery<T>(query.Expression) as DbSet<T>;
        }
    }
}
