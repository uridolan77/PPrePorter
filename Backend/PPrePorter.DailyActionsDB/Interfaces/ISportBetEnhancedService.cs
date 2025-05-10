using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport bet enhanced service
    /// </summary>
    public interface ISportBetEnhancedService
    {
        /// <summary>
        /// Get all sport bets
        /// </summary>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetAllSportBetsAsync();
        
        /// <summary>
        /// Get a specific sport bet by ID
        /// </summary>
        /// <param name="id">Sport bet ID</param>
        /// <returns>Sport bet or null if not found</returns>
        Task<SportBetEnhanced?> GetSportBetByIdAsync(long id);
        
        /// <summary>
        /// Get sport bets by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get sport bets by bet type ID
        /// </summary>
        /// <param name="betTypeId">Bet type ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetTypeIdAsync(int betTypeId);
        
        /// <summary>
        /// Get sport bets by bet state ID
        /// </summary>
        /// <param name="betStateId">Bet state ID</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetStateIdAsync(int betStateId);
        
        /// <summary>
        /// Get sport bets by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by bet type ID and date range
        /// </summary>
        /// <param name="betTypeId">Bet type ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetTypeIdAndDateRangeAsync(int betTypeId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport bets by bet state ID and date range
        /// </summary>
        /// <param name="betStateId">Bet state ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport bets</returns>
        Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetStateIdAndDateRangeAsync(int betStateId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Add a new sport bet
        /// </summary>
        /// <param name="sportBet">Sport bet to add</param>
        /// <returns>Added sport bet</returns>
        Task<SportBetEnhanced> AddSportBetAsync(SportBetEnhanced sportBet);
        
        /// <summary>
        /// Update an existing sport bet
        /// </summary>
        /// <param name="sportBet">Sport bet to update</param>
        /// <returns>Updated sport bet</returns>
        Task<SportBetEnhanced> UpdateSportBetAsync(SportBetEnhanced sportBet);
        
        /// <summary>
        /// Delete a sport bet
        /// </summary>
        /// <param name="id">Sport bet ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportBetAsync(long id);
    }
}
