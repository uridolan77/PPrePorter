using PPrePorter.Domain.Common;
using System.Linq.Expressions;

namespace PPrePorter.Core.Repositories
{
    /// <summary>
    /// Generic repository interface for CRUD operations
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IRepository<T> where T : BaseEntity
    {
        /// <summary>
        /// Gets an entity by ID
        /// </summary>
        /// <param name="id">Entity ID</param>
        /// <returns>The entity</returns>
        Task<T?> GetByIdAsync(int id);

        /// <summary>
        /// Gets all entities
        /// </summary>
        /// <returns>All entities</returns>
        Task<IEnumerable<T>> GetAllAsync();

        /// <summary>
        /// Gets entities that match the specified predicate
        /// </summary>
        /// <param name="predicate">Filter predicate</param>
        /// <returns>Matching entities</returns>
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Gets a single entity that matches the specified predicate
        /// </summary>
        /// <param name="predicate">Filter predicate</param>
        /// <returns>The matching entity or null</returns>
        Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Adds a new entity
        /// </summary>
        /// <param name="entity">Entity to add</param>
        /// <returns>The added entity</returns>
        Task<T> AddAsync(T entity);

        /// <summary>
        /// Updates an existing entity
        /// </summary>
        /// <param name="entity">Entity to update</param>
        Task UpdateAsync(T entity);

        /// <summary>
        /// Deletes an entity by ID
        /// </summary>
        /// <param name="id">Entity ID</param>
        Task DeleteAsync(int id);

        /// <summary>
        /// Gets a queryable for the entity
        /// </summary>
        /// <returns>Queryable for the entity</returns>
        IQueryable<T> Query();

        /// <summary>
        /// Gets a queryable with no tracking for the entity
        /// </summary>
        /// <returns>Queryable with no tracking for the entity</returns>
        IQueryable<T> QueryNoTracking();

        /// <summary>
        /// Checks if any entity matches the specified predicate
        /// </summary>
        /// <param name="predicate">Filter predicate</param>
        /// <returns>True if any entity matches, false otherwise</returns>
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Counts entities that match the specified predicate
        /// </summary>
        /// <param name="predicate">Filter predicate</param>
        /// <returns>Count of matching entities</returns>
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
    }
}
