using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport region service
    /// </summary>
    public interface ISportRegionService
    {
        /// <summary>
        /// Get all sport regions
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport regions</param>
        /// <returns>List of sport regions</returns>
        Task<IEnumerable<SportRegion>> GetAllSportRegionsAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport region by ID
        /// </summary>
        /// <param name="id">Sport region ID</param>
        /// <returns>Sport region or null if not found</returns>
        Task<SportRegion?> GetSportRegionByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport region by name
        /// </summary>
        /// <param name="name">Sport region name</param>
        /// <returns>Sport region or null if not found</returns>
        Task<SportRegion?> GetSportRegionByNameAsync(string name);
        
        /// <summary>
        /// Get sport regions by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport regions</returns>
        Task<IEnumerable<SportRegion>> GetSportRegionsByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport regions by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport regions</returns>
        Task<IEnumerable<SportRegion>> GetSportRegionsBySportIdAsync(int sportId);
        
        /// <summary>
        /// Add a new sport region
        /// </summary>
        /// <param name="sportRegion">Sport region to add</param>
        /// <returns>Added sport region</returns>
        Task<SportRegion> AddSportRegionAsync(SportRegion sportRegion);
        
        /// <summary>
        /// Update an existing sport region
        /// </summary>
        /// <param name="sportRegion">Sport region to update</param>
        /// <returns>Updated sport region</returns>
        Task<SportRegion> UpdateSportRegionAsync(SportRegion sportRegion);
        
        /// <summary>
        /// Delete a sport region
        /// </summary>
        /// <param name="id">Sport region ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportRegionAsync(int id);
    }
}
