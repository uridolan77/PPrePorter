using PPrePorter.DailyActionsDB.Models.Sports;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportBetEnhanced entities
    /// </summary>
    public interface ISportBetEnhancedRepository : IBaseRepository<SportBetEnhanced>
    {
        /// <summary>
        /// Get sport bets by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get sport bets by bet type ID
        /// </summary>
        /// <param name="betTypeId">Bet type ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByBetTypeIdAsync(int betTypeId);
        
        /// <summary>
        /// Get sport bets by bet state ID
        /// </summary>
        /// <param name="betStateId">Bet state ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByBetStateIdAsync(int betStateId);
        
        /// <summary>
        /// Get sport bets by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by bet type ID and date range
        /// </summary>
        /// <param name="betTypeId">Bet type ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByBetTypeIdAndDateRangeAsync(int betTypeId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by bet state ID and date range
        /// </summary>
        /// <param name="betStateId">Bet state ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetByBetStateIdAndDateRangeAsync(int betStateId, DateTime startDate, DateTime endDate);
    }
}
