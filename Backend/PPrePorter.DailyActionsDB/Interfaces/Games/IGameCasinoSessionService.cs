using PPrePorter.DailyActionsDB.Models.Games;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game casino session service
    /// </summary>
    public interface IGameCasinoSessionService
    {
        /// <summary>
        /// Get all game casino sessions
        /// </summary>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetAllGameCasinoSessionsAsync();
        
        /// <summary>
        /// Get a specific game casino session by ID
        /// </summary>
        /// <param name="id">Game casino session ID</param>
        /// <returns>Game casino session or null if not found</returns>
        Task<GameCasinoSession?> GetGameCasinoSessionByIdAsync(int id);
        
        /// <summary>
        /// Get game casino sessions by player ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get game casino sessions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game casino sessions by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get game casino sessions by player ID and date range
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get game casino sessions by game ID and date range
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of game casino sessions</returns>
        Task<IEnumerable<GameCasinoSession>> GetGameCasinoSessionsByGameIdAndDateRangeAsync(int gameId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Add a new game casino session
        /// </summary>
        /// <param name="gameCasinoSession">Game casino session to add</param>
        /// <returns>Added game casino session</returns>
        Task<GameCasinoSession> AddGameCasinoSessionAsync(GameCasinoSession gameCasinoSession);
        
        /// <summary>
        /// Update an existing game casino session
        /// </summary>
        /// <param name="gameCasinoSession">Game casino session to update</param>
        /// <returns>Updated game casino session</returns>
        Task<GameCasinoSession> UpdateGameCasinoSessionAsync(GameCasinoSession gameCasinoSession);
        
        /// <summary>
        /// Delete a game casino session
        /// </summary>
        /// <param name="id">Game casino session ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameCasinoSessionAsync(int id);
    }
}
