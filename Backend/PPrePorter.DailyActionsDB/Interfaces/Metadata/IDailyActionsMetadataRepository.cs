using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces.Metadata
{
    /// <summary>
    /// Repository interface for DailyActionsMetadata entities
    /// </summary>
    public interface IDailyActionsMetadataRepository
    {
        /// <summary>
        /// Gets all metadata items of a specific type
        /// </summary>
        /// <param name="metadataType">The metadata type</param>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetByTypeAsync(string metadataType, bool includeInactive = false);

        /// <summary>
        /// Gets a metadata item by type and code
        /// </summary>
        /// <param name="metadataType">The metadata type</param>
        /// <param name="code">The code</param>
        /// <returns>The metadata item or null if not found</returns>
        Task<DailyActionsMetadataItem?> GetByTypeAndCodeAsync(string metadataType, string code);

        /// <summary>
        /// Gets all white labels from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of white label metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetWhiteLabelsAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all countries from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of country metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetCountriesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all currencies from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of currency metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetCurrenciesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all languages from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of language metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetLanguagesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all platforms from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of platform metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetPlatformsAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all genders from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of gender metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetGendersAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all statuses from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of status metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetStatusesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all registration play modes from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of registration play mode metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all trackers from metadata
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of tracker metadata items</returns>
        Task<List<DailyActionsMetadataItem>> GetTrackersAsync(bool includeInactive = false);
    }
}
