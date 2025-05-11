using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportMarket entities
    /// </summary>
    public interface ISportMarketRepository : IBaseRepository<SportMarket>
    {
        /// <summary>
        /// Get sport markets by match ID
        /// </summary>
        /// <param name="matchId">Match ID</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetByMatchIdAsync(int matchId);
        
        /// <summary>
        /// Get sport markets by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetBySportIdAsync(int sportId);
        
        /// <summary>
        /// Get sport markets by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport markets by match ID and active status
        /// </summary>
        /// <param name="matchId">Match ID</param>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetByMatchIdAndActiveStatusAsync(int matchId, bool isActive);
        
        /// <summary>
        /// Get sport markets by sport ID and active status
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetBySportIdAndActiveStatusAsync(int sportId, bool isActive);
    }
}
