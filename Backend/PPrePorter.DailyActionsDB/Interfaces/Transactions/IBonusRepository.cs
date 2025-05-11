using PPrePorter.DailyActionsDB.Models.Transactions;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Bonus entities
    /// </summary>
    public interface IBonusRepository : IBaseRepository<Bonus>
    {
        /// <summary>
        /// Get bonus by name
        /// </summary>
        /// <param name="name">Bonus name</param>
        /// <returns>Bonus or null if not found</returns>
        Task<Bonus?> GetByNameAsync(string name);

        /// <summary>
        /// Get bonuses by internal name
        /// </summary>
        /// <param name="internalName">Internal name</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetByInternalNameAsync(string internalName);

        /// <summary>
        /// Get bonuses by status
        /// </summary>
        /// <param name="status">Status</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetByStatusAsync(string status);

        /// <summary>
        /// Get bonuses by coupon code
        /// </summary>
        /// <param name="couponCode">Coupon code</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetByCouponCodeAsync(string couponCode);

        /// <summary>
        /// Get bonuses by type
        /// </summary>
        /// <param name="type">Bonus type</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetByTypeAsync(string type);
    }
}
