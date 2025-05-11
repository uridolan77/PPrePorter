using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game description service
    /// </summary>
    public interface IGameDescriptionService
    {
        /// <summary>
        /// Get all game descriptions
        /// </summary>
        /// <returns>List of game descriptions</returns>
        Task<IEnumerable<GameDescription>> GetAllGameDescriptionsAsync();
        
        /// <summary>
        /// Get a specific game description by ID
        /// </summary>
        /// <param name="id">Game description ID</param>
        /// <returns>Game description or null if not found</returns>
        Task<GameDescription?> GetGameDescriptionByIdAsync(int id);
        
        /// <summary>
        /// Get game descriptions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game descriptions</returns>
        Task<IEnumerable<GameDescription>> GetGameDescriptionsByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game descriptions by language
        /// </summary>
        /// <param name="language">Language</param>
        /// <returns>List of game descriptions</returns>
        Task<IEnumerable<GameDescription>> GetGameDescriptionsByLanguageAsync(string language);
        
        /// <summary>
        /// Get game description by game ID and language
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="language">Language</param>
        /// <returns>Game description or null if not found</returns>
        Task<GameDescription?> GetGameDescriptionByGameIdAndLanguageAsync(int gameId, string language);
        
        /// <summary>
        /// Add a new game description
        /// </summary>
        /// <param name="gameDescription">Game description to add</param>
        /// <returns>Added game description</returns>
        Task<GameDescription> AddGameDescriptionAsync(GameDescription gameDescription);
        
        /// <summary>
        /// Update an existing game description
        /// </summary>
        /// <param name="gameDescription">Game description to update</param>
        /// <returns>Updated game description</returns>
        Task<GameDescription> UpdateGameDescriptionAsync(GameDescription gameDescription);
        
        /// <summary>
        /// Delete a game description
        /// </summary>
        /// <param name="id">Game description ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameDescriptionAsync(int id);
    }
}
