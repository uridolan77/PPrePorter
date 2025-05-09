using PPrePorter.DailyActionsDB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for country service
    /// </summary>
    public interface ICountryService
    {
        /// <summary>
        /// Get all countries
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive countries</param>
        /// <returns>List of countries</returns>
        Task<IEnumerable<Country>> GetAllCountriesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific country by ID
        /// </summary>
        /// <param name="id">Country ID</param>
        /// <returns>Country or null if not found</returns>
        Task<Country?> GetCountryByIdAsync(int id);
        
        /// <summary>
        /// Get a specific country by ISO code
        /// </summary>
        /// <param name="isoCode">ISO code</param>
        /// <returns>Country or null if not found</returns>
        Task<Country?> GetCountryByIsoCodeAsync(string isoCode);
        
        /// <summary>
        /// Add a new country
        /// </summary>
        /// <param name="country">Country to add</param>
        /// <returns>Added country</returns>
        Task<Country> AddCountryAsync(Country country);
        
        /// <summary>
        /// Update an existing country
        /// </summary>
        /// <param name="country">Country to update</param>
        /// <returns>Updated country</returns>
        Task<Country> UpdateCountryAsync(Country country);
        
        /// <summary>
        /// Delete a country
        /// </summary>
        /// <param name="id">Country ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteCountryAsync(int id);
    }
}
