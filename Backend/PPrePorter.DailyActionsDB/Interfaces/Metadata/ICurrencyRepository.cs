using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Currency entities
    /// </summary>
    public interface ICurrencyRepository : IBaseRepository<Currency>
    {
        /// <summary>
        /// Get currency by code
        /// </summary>
        /// <param name="code">Currency code</param>
        /// <returns>Currency or null if not found</returns>
        Task<Currency?> GetByCodeAsync(string code);

        /// <summary>
        /// Get currencies ordered by name
        /// </summary>
        /// <returns>List of currencies</returns>
        Task<IEnumerable<Currency>> GetOrderedByNameAsync();
    }
}
