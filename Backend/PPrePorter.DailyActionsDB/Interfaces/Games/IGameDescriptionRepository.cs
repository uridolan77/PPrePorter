using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for GameDescription entities
    /// </summary>
    public interface IGameDescriptionRepository : IBaseRepository<GameDescription>
    {
        /// <summary>
        /// Get game descriptions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game descriptions</returns>
        Task<IEnumerable<GameDescription>> GetByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game descriptions by language
        /// </summary>
        /// <param name="language">Language</param>
        /// <returns>List of game descriptions</returns>
        Task<IEnumerable<GameDescription>> GetByLanguageAsync(string language);
        
        /// <summary>
        /// Get game description by game ID and language
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="language">Language</param>
        /// <returns>Game description or null if not found</returns>
        Task<GameDescription?> GetByGameIdAndLanguageAsync(int gameId, string language);
    }
}
