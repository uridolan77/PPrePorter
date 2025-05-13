using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for white label service
    /// </summary>
    public interface IWhiteLabelService
    {
        /// <summary>
        /// Get all white labels
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive white labels</param>
        /// <returns>List of white labels</returns>
        Task<IEnumerable<WhiteLabel>> GetAllWhiteLabelsAsync(bool includeInactive = false);

        /// <summary>
        /// Get a specific white label by ID
        /// </summary>
        /// <param name="id">White label ID</param>
        /// <returns>White label or null if not found</returns>
        Task<WhiteLabel?> GetWhiteLabelByIdAsync(int id);

        /// <summary>
        /// Get a specific white label by Code
        /// </summary>
        /// <param name="code">White label Code</param>
        /// <returns>White label or null if not found</returns>
        Task<WhiteLabel?> GetWhiteLabelByCodeAsync(string code);

        /// <summary>
        /// Add a new white label
        /// </summary>
        /// <param name="whiteLabel">White label to add</param>
        /// <returns>Added white label</returns>
        Task<WhiteLabel> AddWhiteLabelAsync(WhiteLabel whiteLabel);

        /// <summary>
        /// Update an existing white label
        /// </summary>
        /// <param name="whiteLabel">White label to update</param>
        /// <returns>Updated white label</returns>
        Task<WhiteLabel> UpdateWhiteLabelAsync(WhiteLabel whiteLabel);

        /// <summary>
        /// Delete a white label
        /// </summary>
        /// <param name="id">White label ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteWhiteLabelAsync(int id);
    }
}
