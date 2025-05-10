using PPrePorter.Domain.Common;

namespace PPrePorter.Core.Repositories
{
    /// <summary>
    /// Unit of work interface for managing transactions
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Gets a repository for the specified entity type
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <returns>Repository for the entity type</returns>
        IRepository<T> Repository<T>() where T : BaseEntity;

        /// <summary>
        /// Saves all changes made in this unit of work to the database
        /// </summary>
        /// <returns>The number of state entries written to the database</returns>
        Task<int> SaveChangesAsync();

        /// <summary>
        /// Begins a transaction
        /// </summary>
        Task BeginTransactionAsync();

        /// <summary>
        /// Commits the transaction
        /// </summary>
        Task CommitTransactionAsync();

        /// <summary>
        /// Rolls back the transaction
        /// </summary>
        Task RollbackTransactionAsync();
    }
}
