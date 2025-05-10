using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Player entities
    /// </summary>
    public interface IPlayerRepository : IBaseRepository<Player>
    {
        /// <summary>
        /// Get player by ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>Player or null if not found</returns>
        Task<Player?> GetByPlayerIdAsync(long playerId);
        
        /// <summary>
        /// Get players by casino name
        /// </summary>
        /// <param name="casinoName">Casino name</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetByCasinoNameAsync(string casinoName);
        
        /// <summary>
        /// Get players by country
        /// </summary>
        /// <param name="country">Country</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetByCountryAsync(string country);
        
        /// <summary>
        /// Get players by currency
        /// </summary>
        /// <param name="currency">Currency</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetByCurrencyAsync(string currency);
        
        /// <summary>
        /// Get players registered between dates
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetByRegistrationDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get players with first deposit between dates
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetByFirstDepositDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
