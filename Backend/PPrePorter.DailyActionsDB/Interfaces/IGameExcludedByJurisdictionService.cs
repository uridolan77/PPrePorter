using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game excluded by jurisdiction service
    /// </summary>
    public interface IGameExcludedByJurisdictionService
    {
        /// <summary>
        /// Get all game exclusions
        /// </summary>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetAllGameExclusionsAsync();
        
        /// <summary>
        /// Get a specific game exclusion by ID
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByJurisdiction?> GetGameExclusionByIdAsync(int id);
        
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetGameExclusionsByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by jurisdiction ID
        /// </summary>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetGameExclusionsByJurisdictionIdAsync(int jurisdictionId);
        
        /// <summary>
        /// Get game exclusion by game ID and jurisdiction ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByJurisdiction?> GetGameExclusionByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId);
        
        /// <summary>
        /// Check if a game is excluded for a jurisdiction
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>True if excluded, false otherwise</returns>
        Task<bool> IsGameExcludedForJurisdictionAsync(int gameId, int jurisdictionId);
        
        /// <summary>
        /// Get all games excluded for a jurisdiction
        /// </summary>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>List of game IDs</returns>
        Task<IEnumerable<int>> GetExcludedGameIdsForJurisdictionAsync(int jurisdictionId);
        
        /// <summary>
        /// Add a new game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to add</param>
        /// <returns>Added game exclusion</returns>
        Task<GameExcludedByJurisdiction> AddGameExclusionAsync(GameExcludedByJurisdiction gameExclusion);
        
        /// <summary>
        /// Update an existing game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to update</param>
        /// <returns>Updated game exclusion</returns>
        Task<GameExcludedByJurisdiction> UpdateGameExclusionAsync(GameExcludedByJurisdiction gameExclusion);
        
        /// <summary>
        /// Delete a game exclusion
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionAsync(int id);
        
        /// <summary>
        /// Delete a game exclusion by game ID and jurisdiction ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId);
    }
}
