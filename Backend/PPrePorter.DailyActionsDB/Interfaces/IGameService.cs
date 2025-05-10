using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game service
    /// </summary>
    public interface IGameService
    {
        /// <summary>
        /// Get all games
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive games</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetAllGamesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific game by ID
        /// </summary>
        /// <param name="id">Game ID</param>
        /// <returns>Game or null if not found</returns>
        Task<Game?> GetGameByIdAsync(int id);
        
        /// <summary>
        /// Get a specific game by name
        /// </summary>
        /// <param name="name">Game name</param>
        /// <returns>Game or null if not found</returns>
        Task<Game?> GetGameByNameAsync(string name);
        
        /// <summary>
        /// Get games by provider
        /// </summary>
        /// <param name="provider">Provider name</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetGamesByProviderAsync(string provider);
        
        /// <summary>
        /// Get games by game type
        /// </summary>
        /// <param name="gameType">Game type</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetGamesByGameTypeAsync(string gameType);
        
        /// <summary>
        /// Get games not excluded for a specific country
        /// </summary>
        /// <param name="countryId">Country ID</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetGamesNotExcludedForCountryAsync(int countryId);
        
        /// <summary>
        /// Add a new game
        /// </summary>
        /// <param name="game">Game to add</param>
        /// <returns>Added game</returns>
        Task<Game> AddGameAsync(Game game);
        
        /// <summary>
        /// Update an existing game
        /// </summary>
        /// <param name="game">Game to update</param>
        /// <returns>Updated game</returns>
        Task<Game> UpdateGameAsync(Game game);
        
        /// <summary>
        /// Delete a game
        /// </summary>
        /// <param name="id">Game ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameAsync(int id);
    }
}
