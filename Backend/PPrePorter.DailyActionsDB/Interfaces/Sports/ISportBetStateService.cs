using PPrePorter.DailyActionsDB.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport bet state service
    /// </summary>
    public interface ISportBetStateService
    {
        /// <summary>
        /// Get all sport bet states
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport bet states</param>
        /// <returns>List of sport bet states</returns>
        Task<IEnumerable<SportBetState>> GetAllSportBetStatesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport bet state by ID
        /// </summary>
        /// <param name="id">Sport bet state ID</param>
        /// <returns>Sport bet state or null if not found</returns>
        Task<SportBetState?> GetSportBetStateByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport bet state by name
        /// </summary>
        /// <param name="name">Sport bet state name</param>
        /// <returns>Sport bet state or null if not found</returns>
        Task<SportBetState?> GetSportBetStateByNameAsync(string name);
        
        /// <summary>
        /// Get sport bet states by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport bet states</returns>
        Task<IEnumerable<SportBetState>> GetSportBetStatesByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Add a new sport bet state
        /// </summary>
        /// <param name="sportBetState">Sport bet state to add</param>
        /// <returns>Added sport bet state</returns>
        Task<SportBetState> AddSportBetStateAsync(SportBetState sportBetState);
        
        /// <summary>
        /// Update an existing sport bet state
        /// </summary>
        /// <param name="sportBetState">Sport bet state to update</param>
        /// <returns>Updated sport bet state</returns>
        Task<SportBetState> UpdateSportBetStateAsync(SportBetState sportBetState);
        
        /// <summary>
        /// Delete a sport bet state
        /// </summary>
        /// <param name="id">Sport bet state ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportBetStateAsync(int id);
    }
}
