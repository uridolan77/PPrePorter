using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportRegion entities
    /// </summary>
    public interface ISportRegionRepository : IBaseRepository<SportRegion>
    {
        /// <summary>
        /// Get sport region by name
        /// </summary>
        /// <param name="name">Sport region name</param>
        /// <returns>Sport region or null if not found</returns>
        Task<SportRegion?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport regions by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport regions</returns>
        Task<IEnumerable<SportRegion>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport regions by sport ID
        /// </summary>
        /// <param name="sportId">Sport ID</param>
        /// <returns>List of sport regions</returns>
        Task<IEnumerable<SportRegion>> GetBySportIdAsync(int sportId);
    }
}
