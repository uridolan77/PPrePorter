using PPrePorter.DailyActionsDB.Models.Transactions;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for bonus service
    /// </summary>
    public interface IBonusService
    {
        /// <summary>
        /// Get all bonuses
        /// </summary>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetAllBonusesAsync();
        
        /// <summary>
        /// Get a specific bonus by ID
        /// </summary>
        /// <param name="id">Bonus ID</param>
        /// <returns>Bonus or null if not found</returns>
        Task<Bonus?> GetBonusByIdAsync(int id);
        
        /// <summary>
        /// Get a specific bonus by name
        /// </summary>
        /// <param name="name">Bonus name</param>
        /// <returns>Bonus or null if not found</returns>
        Task<Bonus?> GetBonusByNameAsync(string name);
        
        /// <summary>
        /// Get bonuses by internal name
        /// </summary>
        /// <param name="internalName">Internal name</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetBonusesByInternalNameAsync(string internalName);
        
        /// <summary>
        /// Get bonuses by status
        /// </summary>
        /// <param name="status">Status</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetBonusesByStatusAsync(string status);
        
        /// <summary>
        /// Get bonuses by coupon code
        /// </summary>
        /// <param name="couponCode">Coupon code</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetBonusesByCouponCodeAsync(string couponCode);
        
        /// <summary>
        /// Get bonuses by type
        /// </summary>
        /// <param name="type">Bonus type</param>
        /// <returns>List of bonuses</returns>
        Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(string type);
        
        /// <summary>
        /// Add a new bonus
        /// </summary>
        /// <param name="bonus">Bonus to add</param>
        /// <returns>Added bonus</returns>
        Task<Bonus> AddBonusAsync(Bonus bonus);
        
        /// <summary>
        /// Update an existing bonus
        /// </summary>
        /// <param name="bonus">Bonus to update</param>
        /// <returns>Updated bonus</returns>
        Task<Bonus> UpdateBonusAsync(Bonus bonus);
        
        /// <summary>
        /// Delete a bonus
        /// </summary>
        /// <param name="id">Bonus ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteBonusAsync(int id);
    }
}
