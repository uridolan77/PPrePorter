using PPrePorter.Core.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces.Games
{
    /// <summary>
    /// Interface for the Daily Action Game Service
    /// </summary>
    public interface IDailyActionGameService
    {
        /// <summary>
        /// Gets daily action games by date range
        /// </summary>
        /// <param name="startDate">The start date</param>
        /// <param name="endDate">The end date</param>
        /// <returns>A list of daily action game DTOs</returns>
        Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets daily action games by player ID
        /// </summary>
        /// <param name="playerId">The player ID</param>
        /// <returns>A list of daily action game DTOs</returns>
        Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByPlayerIdAsync(long playerId);

        /// <summary>
        /// Gets daily action games by game ID
        /// </summary>
        /// <param name="gameId">The game ID</param>
        /// <returns>A list of daily action game DTOs</returns>
        Task<IEnumerable<DailyActionGameDto>> GetDailyActionGamesByGameIdAsync(long gameId);

        /// <summary>
        /// Gets a daily action game by ID
        /// </summary>
        /// <param name="id">The daily action game ID</param>
        /// <returns>The daily action game DTO or null if not found</returns>
        Task<DailyActionGameDto?> GetDailyActionGameByIdAsync(long id);
    }
}
