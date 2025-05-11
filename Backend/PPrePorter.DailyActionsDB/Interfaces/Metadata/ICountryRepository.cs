using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for Country entities
    /// </summary>
    public interface ICountryRepository : IBaseRepository<Country>
    {
        /// <summary>
        /// Get country by ISO code
        /// </summary>
        /// <param name="isoCode">ISO code</param>
        /// <returns>Country or null if not found</returns>
        Task<Country?> GetByIsoCodeAsync(string isoCode);
        
        /// <summary>
        /// Get countries by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of countries</returns>
        Task<IEnumerable<Country>> GetByActiveStatusAsync(bool isActive);
    }
}
