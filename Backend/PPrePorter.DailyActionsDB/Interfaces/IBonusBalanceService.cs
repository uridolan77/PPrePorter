using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for bonus balance service
    /// </summary>
    public interface IBonusBalanceService
    {
        /// <summary>
        /// Get all bonus balances
        /// </summary>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetAllBonusBalancesAsync();
        
        /// <summary>
        /// Get a specific bonus balance by ID
        /// </summary>
        /// <param name="id">Bonus balance ID</param>
        /// <returns>Bonus balance or null if not found</returns>
        Task<BonusBalance?> GetBonusBalanceByIdAsync(int id);
        
        /// <summary>
        /// Get bonus balances by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetBonusBalancesByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get bonus balances by bonus ID
        /// </summary>
        /// <param name="bonusId">Bonus ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetBonusBalancesByBonusIdAsync(int bonusId);
        
        /// <summary>
        /// Get bonus balances by status
        /// </summary>
        /// <param name="status">Status</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetBonusBalancesByStatusAsync(string status);
        
        /// <summary>
        /// Get bonus balances by player ID and bonus ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="bonusId">Bonus ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetBonusBalancesByPlayerIdAndBonusIdAsync(long playerId, int bonusId);
        
        /// <summary>
        /// Add a new bonus balance
        /// </summary>
        /// <param name="bonusBalance">Bonus balance to add</param>
        /// <returns>Added bonus balance</returns>
        Task<BonusBalance> AddBonusBalanceAsync(BonusBalance bonusBalance);
        
        /// <summary>
        /// Update an existing bonus balance
        /// </summary>
        /// <param name="bonusBalance">Bonus balance to update</param>
        /// <returns>Updated bonus balance</returns>
        Task<BonusBalance> UpdateBonusBalanceAsync(BonusBalance bonusBalance);
        
        /// <summary>
        /// Delete a bonus balance
        /// </summary>
        /// <param name="id">Bonus balance ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteBonusBalanceAsync(int id);
    }
}
