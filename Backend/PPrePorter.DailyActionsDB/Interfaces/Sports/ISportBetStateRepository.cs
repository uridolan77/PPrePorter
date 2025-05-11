using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportBetState entities
    /// </summary>
    public interface ISportBetStateRepository : IBaseRepository<SportBetState>
    {
        /// <summary>
        /// Get sport bet state by name
        /// </summary>
        /// <param name="name">Sport bet state name</param>
        /// <returns>Sport bet state or null if not found</returns>
        Task<SportBetState?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport bet states by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport bet states</returns>
        Task<IEnumerable<SportBetState>> GetByActiveStatusAsync(bool isActive);
    }
}
