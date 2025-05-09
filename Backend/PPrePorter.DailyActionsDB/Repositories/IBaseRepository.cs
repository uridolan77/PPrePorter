using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Generic base repository interface for database operations
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IBaseRepository<T> where T : class
    {
        /// <summary>
        /// Get all entities
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive entities</param>
        /// <returns>List of entities</returns>
        Task<IEnumerable<T>> GetAllAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get entities by a filter expression
        /// </summary>
        /// <param name="filter">Filter expression</param>
        /// <returns>Filtered list of entities</returns>
        Task<IEnumerable<T>> GetByFilterAsync(Expression<Func<T, bool>> filter);
        
        /// <summary>
        /// Get entity by ID
        /// </summary>
        /// <param name="id">Entity ID</param>
        /// <returns>Entity or null if not found</returns>
        Task<T?> GetByIdAsync(int id);
        
        /// <summary>
        /// Add a new entity
        /// </summary>
        /// <param name="entity">Entity to add</param>
        /// <returns>Added entity</returns>
        Task<T> AddAsync(T entity);
        
        /// <summary>
        /// Update an existing entity
        /// </summary>
        /// <param name="entity">Entity to update</param>
        /// <returns>Updated entity</returns>
        Task<T> UpdateAsync(T entity);
        
        /// <summary>
        /// Delete an entity
        /// </summary>
        /// <param name="id">Entity ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteAsync(int id);
        
        /// <summary>
        /// Check if any entity matches the filter
        /// </summary>
        /// <param name="filter">Filter expression</param>
        /// <returns>True if any entity matches, false otherwise</returns>
        Task<bool> AnyAsync(Expression<Func<T, bool>> filter);
    }
}
