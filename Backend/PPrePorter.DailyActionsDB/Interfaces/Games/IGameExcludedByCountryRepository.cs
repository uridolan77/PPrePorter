using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for GameExcludedByCountry entities
    /// </summary>
    public interface IGameExcludedByCountryRepository : IBaseRepository<GameExcludedByCountry>
    {
        /// <summary>
        /// Get game exclusions by game ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByCountry>> GetByGameIdAsync(int gameId);
        
        /// <summary>
        /// Get game exclusions by country ID
        /// </summary>
        /// <param name="countryId">Country ID</param>
        /// <returns>List of game exclusions</returns>
        Task<IEnumerable<GameExcludedByCountry>> GetByCountryIdAsync(int countryId);
        
        /// <summary>
        /// Get game exclusion by game ID and country ID
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="countryId">Country ID</param>
        /// <returns>Game exclusion or null if not found</returns>
        Task<GameExcludedByCountry?> GetByGameIdAndCountryIdAsync(int gameId, int countryId);
        
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
    }
}
