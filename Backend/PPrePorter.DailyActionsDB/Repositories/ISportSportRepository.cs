using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportSport entities
    /// </summary>
    public interface ISportSportRepository : IBaseRepository<SportSport>
    {
        /// <summary>
        /// Get sport by name
        /// </summary>
        /// <param name="name">Sport name</param>
        /// <returns>Sport or null if not found</returns>
        Task<SportSport?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sports by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sports by region ID
        /// </summary>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetByRegionIdAsync(int regionId);
    }
}
