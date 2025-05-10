using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for daily action game service
    /// </summary>
    public interface IDailyActionGameService
    {
        /// <summary>
        /// Get all daily action games
        /// </summary>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetAllDailyActionGamesAsync();
        
        /// <summary>
        /// Get a specific daily action game by ID
        /// </summary>
        /// <param name="id">Daily action game ID</param>
        /// <returns>Daily action game or null if not found</returns>
        Task<DailyActionGame?> GetDailyActionGameByIdAsync(long id);
        
        /// <summary>
        /// Get daily action games by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get daily action games by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByGameIdAsync(long gameId);
        
        /// <summary>
        /// Get daily action games by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get daily action games by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get daily action games by game ID and date range
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByGameIdAndDateRangeAsync(long gameId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get daily action games by platform
        /// </summary>
        /// <param name="platform">Platform</param>
        /// <returns>List of daily action games</returns>
        Task<IEnumerable<DailyActionGame>> GetDailyActionGamesByPlatformAsync(string platform);
        
        /// <summary>
        /// Add a new daily action game
        /// </summary>
        /// <param name="dailyActionGame">Daily action game to add</param>
        /// <returns>Added daily action game</returns>
        Task<DailyActionGame> AddDailyActionGameAsync(DailyActionGame dailyActionGame);
        
        /// <summary>
        /// Update an existing daily action game
        /// </summary>
        /// <param name="dailyActionGame">Daily action game to update</param>
        /// <returns>Updated daily action game</returns>
        Task<DailyActionGame> UpdateDailyActionGameAsync(DailyActionGame dailyActionGame);
        
        /// <summary>
        /// Delete a daily action game
        /// </summary>
        /// <param name="id">Daily action game ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteDailyActionGameAsync(long id);
    }
}
