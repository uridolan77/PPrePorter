using PPrePorter.DailyActionsDB.Data;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for Unit of Work pattern
    /// </summary>
    public interface IUnitOfWork
    {
        /// <summary>
        /// Get the DbContext
        /// </summary>
        DailyActionsDbContext DbContext { get; }

        /// <summary>
        /// Begin a transaction
        /// </summary>
        Task BeginTransactionAsync();

        /// <summary>
        /// Commit the transaction
        /// </summary>
        Task CommitTransactionAsync();

        /// <summary>
        /// Rollback the transaction
        /// </summary>
        Task RollbackTransactionAsync();

        /// <summary>
        /// Save changes to the database
        /// </summary>
        Task<int> SaveChangesAsync();
    }
}
