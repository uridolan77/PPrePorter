using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for GameExcludedByLabel entities
    /// </summary>
    public interface IGameExcludedByLabelRepository : IBaseRepository<GameExcludedByLabel>
    {
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByLabel>> GetByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by label ID
        /// </summary>
        /// <param name="labelId">Label ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByLabel>> GetByLabelIdAsync(int labelId);
        
        /// <summary>
        /// Get game exclusion by game ID and label ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="labelId">Label ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByLabel?> GetByGameIdAndLabelIdAsync(int gameId, int labelId);
        
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
    }
}
