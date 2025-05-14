using PPrePorter.Core.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces.Games
{
    /// <summary>
    /// Interface for the Game Service
    /// </summary>
    public interface IGameService
    {
        /// <summary>
        /// Gets all games
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive games</param>
        /// <returns>A list of game DTOs</returns>
        Task<List<GameDto>> GetAllGamesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets a game by ID
        /// </summary>
        /// <param name="gameId">The game ID</param>
        /// <returns>The game DTO if found, null otherwise</returns>
        Task<GameDto> GetGameByIdAsync(long gameId);
    }
}
