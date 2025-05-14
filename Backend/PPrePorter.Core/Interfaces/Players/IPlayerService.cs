using PPrePorter.Core.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces.Players
{
    /// <summary>
    /// Interface for the Player Service
    /// </summary>
    public interface IPlayerService
    {
        /// <summary>
        /// Gets all players
        /// </summary>
        /// <returns>A list of player DTOs</returns>
        Task<List<PlayerDto>> GetAllPlayersAsync();

        /// <summary>
        /// Gets a player by ID
        /// </summary>
        /// <param name="playerId">The player ID</param>
        /// <returns>The player DTO if found, null otherwise</returns>
        Task<PlayerDto> GetPlayerByIdAsync(long playerId);

        /// <summary>
        /// Gets players by white label ID
        /// </summary>
        /// <param name="whiteLabelId">The white label ID</param>
        /// <returns>A list of player DTOs</returns>
        Task<List<PlayerDto>> GetPlayersByWhiteLabelIdAsync(int whiteLabelId);
    }
}
