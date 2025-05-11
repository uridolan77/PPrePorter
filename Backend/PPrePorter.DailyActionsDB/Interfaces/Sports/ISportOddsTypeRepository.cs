using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportOddsType entities
    /// </summary>
    public interface ISportOddsTypeRepository : IBaseRepository<SportOddsType>
    {
        /// <summary>
        /// Get sport odds type by name
        /// </summary>
        /// <param name="name">Sport odds type name</param>
        /// <returns>Sport odds type or null if not found</returns>
        Task<SportOddsType?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport odds types by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport odds types</returns>
        Task<IEnumerable<SportOddsType>> GetByActiveStatusAsync(bool isActive);
    }
}
