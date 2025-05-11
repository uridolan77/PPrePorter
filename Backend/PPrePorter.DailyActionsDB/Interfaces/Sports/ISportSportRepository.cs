using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportSport entities
    /// </summary>
    public interface ISportSportRepository : INamedEntityRepository<SportSport>
    {
        /// <summary>
        /// Get sports by region ID
        /// </summary>
        /// <param name="regionId">Region ID</param>
        /// <returns>List of sports</returns>
        Task<IEnumerable<SportSport>> GetByRegionIdAsync(int regionId);
    }
}
