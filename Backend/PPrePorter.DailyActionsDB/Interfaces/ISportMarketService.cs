using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport market service
    /// </summary>
    public interface ISportMarketService
    {
        /// <summary>
        /// Get all sport markets
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport markets</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetAllSportMarketsAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport market by ID
        /// </summary>
        /// <param name="id">Sport market ID</param>
        /// <returns>Sport market or null if not found</returns>
        Task<SportMarket?> GetSportMarketByIdAsync(int id);
        
        /// <summary>
        /// Get sport markets by match ID
        /// </summary>
        /// <param name="matchId">Match ID</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetSportMarketsByMatchIdAsync(int matchId);
        
        /// <summary>
        /// Get sport markets by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetSportMarketsBySportIdAsync(int sportId);
        
        /// <summary>
        /// Get sport markets by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetSportMarketsByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport markets by match ID and active status
        /// </summary>
        /// <param name="matchId">Match ID</param>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetSportMarketsByMatchIdAndActiveStatusAsync(int matchId, bool isActive);
        
        /// <summary>
        /// Get sport markets by sport ID and active status
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport markets</returns>
        Task<IEnumerable<SportMarket>> GetSportMarketsBySportIdAndActiveStatusAsync(int sportId, bool isActive);
        
        /// <summary>
        /// Add a new sport market
        /// </summary>
        /// <param name="sportMarket">Sport market to add</param>
        /// <returns>Added sport market</returns>
        Task<SportMarket> AddSportMarketAsync(SportMarket sportMarket);
        
        /// <summary>
        /// Update an existing sport market
        /// </summary>
        /// <param name="sportMarket">Sport market to update</param>
        /// <returns>Updated sport market</returns>
        Task<SportMarket> UpdateSportMarketAsync(SportMarket sportMarket);
        
        /// <summary>
        /// Delete a sport market
        /// </summary>
        /// <param name="id">Sport market ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportMarketAsync(int id);
    }
}
