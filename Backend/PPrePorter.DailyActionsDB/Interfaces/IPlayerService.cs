using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for player service
    /// </summary>
    public interface IPlayerService
    {
        /// <summary>
        /// Get all players
        /// </summary>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetAllPlayersAsync();
        
        /// <summary>
        /// Get a specific player by ID
        /// </summary>
        /// <param name="playerId">Player ID</param>
        /// <returns>Player or null if not found</returns>
        Task<Player?> GetPlayerByIdAsync(long playerId);
        
        /// <summary>
        /// Get players by casino name
        /// </summary>
        /// <param name="casinoName">Casino name</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetPlayersByCasinoNameAsync(string casinoName);
        
        /// <summary>
        /// Get players by country
        /// </summary>
        /// <param name="country">Country</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetPlayersByCountryAsync(string country);
        
        /// <summary>
        /// Get players by currency
        /// </summary>
        /// <param name="currency">Currency</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetPlayersByCurrencyAsync(string currency);
        
        /// <summary>
        /// Get players registered between dates
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetPlayersByRegistrationDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get players with first deposit between dates
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of players</returns>
        Task<IEnumerable<Player>> GetPlayersByFirstDepositDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Add a new player
        /// </summary>
        /// <param name="player">Player to add</param>
        /// <returns>Added player</returns>
        Task<Player> AddPlayerAsync(Player player);
        
        /// <summary>
        /// Update an existing player
        /// </summary>
        /// <param name="player">Player to update</param>
        /// <returns>Updated player</returns>
        Task<Player> UpdatePlayerAsync(Player player);
    }
}
