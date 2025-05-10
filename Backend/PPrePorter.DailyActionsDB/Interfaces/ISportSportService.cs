using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport service
    /// </summary>
    public interface ISportSportService
    {
        /// <summary>
        /// Get all sports
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sports</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetAllSportsAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport by ID
        /// </summary>
        /// <param name="id">Sport ID</param>
        /// <returns>Sport or null if not found</returns>
        Task<SportSport?> GetSportByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport by name
        /// </summary>
        /// <param name="name">Sport name</param>
        /// <returns>Sport or null if not found</returns>
        Task<SportSport?> GetSportByNameAsync(string name);
        
        /// <summary>
        /// Get sports by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetSportsByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sports by region ID
        /// </summary>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetSportsByRegionIdAsync(int regionId);
        
        /// <summary>
        /// Add a new sport
        /// </summary>
        /// <param name="sport">Sport to add</param>
        /// <returns>Added sport</returns>
        Task<SportSport> AddSportAsync(SportSport sport);
        
        /// <summary>
        /// Update an existing sport
        /// </summary>
        /// <param name="sport">Sport to update</param>
        /// <returns>Updated sport</returns>
        Task<SportSport> UpdateSportAsync(SportSport sport);
        
        /// <summary>
        /// Delete a sport
        /// </summary>
        /// <param name="id">Sport ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportAsync(int id);
    }
}
