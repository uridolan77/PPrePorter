using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game excluded by label service
    /// </summary>
    public interface IGameExcludedByLabelService
    {
        /// <summary>
        /// Get all game exclusions
        /// </summary>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByLabel>> GetAllGameExclusionsAsync();
        
        /// <summary>
        /// Get a specific game exclusion by ID
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByLabel?> GetGameExclusionByIdAsync(int id);
        
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByLabel>> GetGameExclusionsByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by label ID
        /// </summary>
        /// <param name="labelId">Label ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByLabel>> GetGameExclusionsByLabelIdAsync(int labelId);
        
        /// <summary>
        /// Get game exclusion by game ID and label ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="labelId">Label ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByLabel?> GetGameExclusionByGameIdAndLabelIdAsync(int gameId, int labelId);
        
        /// <summary>
        /// Check if a game is excluded for a label
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="labelId">Label ID</param>
        /// <returns>True if excluded, false otherwise</returns>
        Task<bool> IsGameExcludedForLabelAsync(int gameId, int labelId);
        
        /// <summary>
        /// Get all games excluded for a label
        /// </summary>
        /// <param name="labelId">Label ID</param>
        /// <returns>List of game IDs</returns>
        Task<IEnumerable<int>> GetExcludedGameIdsForLabelAsync(int labelId);
        
        /// <summary>
        /// Add a new game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to add</param>
        /// <returns>Added game exclusion</returns>
        Task<GameExcludedByLabel> AddGameExclusionAsync(GameExcludedByLabel gameExclusion);
        
        /// <summary>
        /// Update an existing game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to update</param>
        /// <returns>Updated game exclusion</returns>
        Task<GameExcludedByLabel> UpdateGameExclusionAsync(GameExcludedByLabel gameExclusion);
        
        /// <summary>
        /// Delete a game exclusion
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionAsync(int id);
        
        /// <summary>
        /// Delete a game exclusion by game ID and label ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="labelId">Label ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionByGameIdAndLabelIdAsync(int gameId, int labelId);
    }
}
