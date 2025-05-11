using PPrePorter.DailyActionsDB.Models.DailyActions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for DailyActionGame entities
    /// </summary>
    public interface IDailyActionGameRepository : IBaseRepository<DailyActionGame>
    {
        /// <summary>
        /// Get daily action games by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByPlayerIdAsync(long playerId);

        /// <summary>
        /// Get daily action games by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByGameIdAsync(long gameId);

        /// <summary>
        /// Get daily action games by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get daily action games by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get daily action games by game ID and date range
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByGameIdAndDateRangeAsync(long gameId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get daily action games by platform
        /// </summary>
        /// <param name="platform">Platform</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetByPlatformAsync(string platform);
    }
}
