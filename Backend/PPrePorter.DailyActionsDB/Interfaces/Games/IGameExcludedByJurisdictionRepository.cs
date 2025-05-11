using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for GameExcludedByJurisdiction entities
    /// </summary>
    public interface IGameExcludedByJurisdictionRepository : IBaseRepository<GameExcludedByJurisdiction>
    {
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by jurisdiction ID
        /// </summary>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetByJurisdictionIdAsync(int jurisdictionId);
        
        /// <summary>
        /// Get game exclusion by game ID and jurisdiction ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="jurisdictionId">Jurisdiction ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByJurisdiction?> GetByGameIdAndJurisdictionIdAsync(int gameId, int jurisdictionId);
        
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
    }
}
