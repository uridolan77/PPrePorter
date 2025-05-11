using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport bet type service
    /// </summary>
    public interface ISportBetTypeService
    {
        /// <summary>
        /// Get all sport bet types
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport bet types</param>
        /// <returns>List of sport bet types</returns>
        Task<IEnumerable<SportBetType>> GetAllSportBetTypesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport bet type by ID
        /// </summary>
        /// <param name="id">Sport bet type ID</param>
        /// <returns>Sport bet type or null if not found</returns>
        Task<SportBetType?> GetSportBetTypeByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport bet type by name
        /// </summary>
        /// <param name="name">Sport bet type name</param>
        /// <returns>Sport bet type or null if not found</returns>
        Task<SportBetType?> GetSportBetTypeByNameAsync(string name);
        
        /// <summary>
        /// Get sport bet types by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport bet types</returns>
        Task<IEnumerable<SportBetType>> GetSportBetTypesByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Add a new sport bet type
        /// </summary>
        /// <param name="sportBetType">Sport bet type to add</param>
        /// <returns>Added sport bet type</returns>
        Task<SportBetType> AddSportBetTypeAsync(SportBetType sportBetType);
        
        /// <summary>
        /// Update an existing sport bet type
        /// </summary>
        /// <param name="sportBetType">Sport bet type to update</param>
        /// <returns>Updated sport bet type</returns>
        Task<SportBetType> UpdateSportBetTypeAsync(SportBetType sportBetType);
        
        /// <summary>
        /// Delete a sport bet type
        /// </summary>
        /// <param name="id">Sport bet type ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportBetTypeAsync(int id);
    }
}
