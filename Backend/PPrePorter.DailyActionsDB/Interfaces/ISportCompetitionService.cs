using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport competition service
    /// </summary>
    public interface ISportCompetitionService
    {
        /// <summary>
        /// Get all sport competitions
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport competitions</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetAllSportCompetitionsAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport competition by ID
        /// </summary>
        /// <param name="id">Sport competition ID</param>
        /// <returns>Sport competition or null if not found</returns>
        Task<SportCompetition?> GetSportCompetitionByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport competition by name
        /// </summary>
        /// <param name="name">Sport competition name</param>
        /// <returns>Sport competition or null if not found</returns>
        Task<SportCompetition?> GetSportCompetitionByNameAsync(string name);
        
        /// <summary>
        /// Get sport competitions by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetSportCompetitionsByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport competitions by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetSportCompetitionsBySportIdAsync(int sportId);
        
        /// <summary>
        /// Get sport competitions by region ID
        /// </summary>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetSportCompetitionsByRegionIdAsync(int regionId);
        
        /// <summary>
        /// Get sport competitions by sport ID and region ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetSportCompetitionsBySportIdAndRegionIdAsync(int sportId, int regionId);
        
        /// <summary>
        /// Add a new sport competition
        /// </summary>
        /// <param name="sportCompetition">Sport competition to add</param>
        /// <returns>Added sport competition</returns>
        Task<SportCompetition> AddSportCompetitionAsync(SportCompetition sportCompetition);
        
        /// <summary>
        /// Update an existing sport competition
        /// </summary>
        /// <param name="sportCompetition">Sport competition to update</param>
        /// <returns>Updated sport competition</returns>
        Task<SportCompetition> UpdateSportCompetitionAsync(SportCompetition sportCompetition);
        
        /// <summary>
        /// Delete a sport competition
        /// </summary>
        /// <param name="id">Sport competition ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportCompetitionAsync(int id);
    }
}
