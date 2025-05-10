using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport odds type service
    /// </summary>
    public interface ISportOddsTypeService
    {
        /// <summary>
        /// Get all sport odds types
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport odds types</param>
        /// <returns>List of sport odds types</returns>
        Task<IEnumerable<SportOddsType>> GetAllSportOddsTypesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport odds type by ID
        /// </summary>
        /// <param name="id">Sport odds type ID</param>
        /// <returns>Sport odds type or null if not found</returns>
        Task<SportOddsType?> GetSportOddsTypeByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport odds type by name
        /// </summary>
        /// <param name="name">Sport odds type name</param>
        /// <returns>Sport odds type or null if not found</returns>
        Task<SportOddsType?> GetSportOddsTypeByNameAsync(string name);
        
        /// <summary>
        /// Get sport odds types by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport odds types</returns>
        Task<IEnumerable<SportOddsType>> GetSportOddsTypesByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Add a new sport odds type
        /// </summary>
        /// <param name="sportOddsType">Sport odds type to add</param>
        /// <returns>Added sport odds type</returns>
        Task<SportOddsType> AddSportOddsTypeAsync(SportOddsType sportOddsType);
        
        /// <summary>
        /// Update an existing sport odds type
        /// </summary>
        /// <param name="sportOddsType">Sport odds type to update</param>
        /// <returns>Updated sport odds type</returns>
        Task<SportOddsType> UpdateSportOddsTypeAsync(SportOddsType sportOddsType);
        
        /// <summary>
        /// Delete a sport odds type
        /// </summary>
        /// <param name="id">Sport odds type ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportOddsTypeAsync(int id);
    }
}
