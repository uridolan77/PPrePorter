using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for game excluded by country service
    /// </summary>
    public interface IGameExcludedByCountryService
    {
        /// <summary>
        /// Get all game exclusions
        /// </summary>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByCountry>> GetAllGameExclusionsAsync();
        
        /// <summary>
        /// Get a specific game exclusion by ID
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByCountry?> GetGameExclusionByIdAsync(int id);
        
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByCountry>> GetGameExclusionsByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by country ID
        /// </summary>
        /// <param name="countryId">Country ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByCountry>> GetGameExclusionsByCountryIdAsync(int countryId);
        
        /// <summary>
        /// Get game exclusion by game ID and country ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="countryId">Country ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByCountry?> GetGameExclusionByGameIdAndCountryIdAsync(int gameId, int countryId);
        
        /// <summary>
        /// Check if a game is excluded for a country
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="countryId">Country ID</param>
        /// <returns>True if excluded, false otherwise</returns>
        Task<bool> IsGameExcludedForCountryAsync(int gameId, int countryId);
        
        /// <summary>
        /// Get all games excluded for a country
        /// </summary>
        /// <param name="countryId">Country ID</param>
        /// <returns>List of game IDs</returns>
        Task<IEnumerable<int>> GetExcludedGameIdsForCountryAsync(int countryId);
        
        /// <summary>
        /// Add a new game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to add</param>
        /// <returns>Added game exclusion</returns>
        Task<GameExcludedByCountry> AddGameExclusionAsync(GameExcludedByCountry gameExclusion);
        
        /// <summary>
        /// Update an existing game exclusion
        /// </summary>
        /// <param name="gameExclusion">Game exclusion to update</param>
        /// <returns>Updated game exclusion</returns>
        Task<GameExcludedByCountry> UpdateGameExclusionAsync(GameExcludedByCountry gameExclusion);
        
        /// <summary>
        /// Delete a game exclusion
        /// </summary>
        /// <param name="id">Game exclusion ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionAsync(int id);
        
        /// <summary>
        /// Delete a game exclusion by game ID and country ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="countryId">Country ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteGameExclusionByGameIdAndCountryIdAsync(int gameId, int countryId);
    }
}
