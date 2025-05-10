using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportBetType entities
    /// </summary>
    public interface ISportBetTypeRepository : IBaseRepository<SportBetType>
    {
        /// <summary>
        /// Get sport bet type by name
        /// </summary>
        /// <param name="name">Sport bet type name</param>
        /// <returns>Sport bet type or null if not found</returns>
        Task<SportBetType?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport bet types by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport bet types</returns>
        Task<IEnumerable<SportBetType>> GetByActiveStatusAsync(bool isActive);
    }
}
