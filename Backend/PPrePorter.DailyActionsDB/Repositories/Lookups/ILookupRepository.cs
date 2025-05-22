using PPrePorter.DailyActionsDB.Models.Lookups;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories.Lookups
{
    /// <summary>
    /// Interface for accessing lookup data
    /// </summary>
    public interface ILookupRepository
    {
        /// <summary>
        /// Gets all gender lookup values
        /// </summary>
        Task<IEnumerable<Gender>> GetGendersAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all status lookup values
        /// </summary>
        Task<IEnumerable<Status>> GetStatusesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all registration play mode lookup values
        /// </summary>
        Task<IEnumerable<RegistrationPlayMode>> GetRegistrationPlayModesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all language lookup values
        /// </summary>
        Task<IEnumerable<Language>> GetLanguagesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all platform lookup values
        /// </summary>
        Task<IEnumerable<Platform>> GetPlatformsAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all tracker lookup values
        /// </summary>
        Task<IEnumerable<Tracker>> GetTrackersAsync(bool includeInactive = false);
    }
}
