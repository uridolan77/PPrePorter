using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportCompetition entities
    /// </summary>
    public interface ISportCompetitionRepository : IBaseRepository<SportCompetition>
    {
        /// <summary>
        /// Get sport competition by name
        /// </summary>
        /// <param name="name">Sport competition name</param>
        /// <returns>Sport competition or null if not found</returns>
        Task<SportCompetition?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport competitions by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport competitions by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetBySportIdAsync(int sportId);
        
        /// <summary>
        /// Get sport competitions by region ID
        /// </summary>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetByRegionIdAsync(int regionId);
        
        /// <summary>
        /// Get sport competitions by sport ID and region ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sport competitions</returns>
        Task<IEnumerable<SportCompetition>> GetBySportIdAndRegionIdAsync(int sportId, int regionId);
    }
}
