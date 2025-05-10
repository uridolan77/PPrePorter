using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for BonusBalance entities
    /// </summary>
    public interface IBonusBalanceRepository : IBaseRepository<BonusBalance>
    {
        /// <summary>
        /// Get bonus balances by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get bonus balances by bonus ID
        /// </summary>
        /// <param name="bonusId">Bonus ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetByBonusIdAsync(int bonusId);
        
        /// <summary>
        /// Get bonus balances by status
        /// </summary>
        /// <param name="status">Status</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetByStatusAsync(string status);
        
        /// <summary>
        /// Get bonus balances by player ID and bonus ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="bonusId">Bonus ID</param>
        /// <returns>List of bonus balances</returns>
        Task<IEnumerable<BonusBalance>> GetByPlayerIdAndBonusIdAsync(long playerId, int bonusId);
    }
}
