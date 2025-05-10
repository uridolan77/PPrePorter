using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for GameCasinoSession entities
    /// </summary>
    public interface IGameCasinoSessionRepository : IBaseRepository<GameCasinoSession>
    {
        /// <summary>
        /// Get game casino sessions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get game casino sessions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game casino sessions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get game casino sessions by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get game casino sessions by game ID and date range
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetByGameIdAndDateRangeAsync(int gameId, DateTime startDate, DateTime endDate);
    }
}
