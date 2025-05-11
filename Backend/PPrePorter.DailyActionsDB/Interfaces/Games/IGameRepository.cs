using PPrePorter.DailyActionsDB.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Game entities
    /// </summary>
    public interface IGameRepository : IBaseRepository<Game>
    {
        /// <summary>
        /// Get game by name
        /// </summary>
        /// <param name="name">Game name</param>
        /// <returns>Game or null if not found</returns>
        Task<Game?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get games by provider
        /// </summary>
        /// <param name="provider">Provider name</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetByProviderAsync(string provider);
        
        /// <summary>
        /// Get games by game type
        /// </summary>
        /// <param name="gameType">Game type</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetByGameTypeAsync(string gameType);
        
        /// <summary>
        /// Get games by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get games ordered by game order
        /// </summary>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetOrderedByGameOrderAsync();
        
        /// <summary>
        /// Get games that are not excluded for a specific country
        /// </summary>
        /// <param name="countryId">Country ID</param>
        /// <returns>List of games</returns>
        Task<IEnumerable<Game>> GetNotExcludedForCountryAsync(int countryId);
    }
}
