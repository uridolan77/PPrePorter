using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for WhiteLabel entities
    /// </summary>
    public interface IWhiteLabelRepository : IBaseRepository<WhiteLabel>
    {
        /// <summary>
        /// Get white label by name
        /// </summary>
        /// <param name="name">White label name</param>
        /// <returns>White label or null if not found</returns>
        Task<WhiteLabel?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get white labels by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of white labels</returns>
        Task<IEnumerable<WhiteLabel>> GetByActiveStatusAsync(bool isActive);
    }
}
