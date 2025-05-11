using PPrePorter.DailyActionsDB.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the metadata service
    /// </summary>
    public interface IMetadataService
    {
        /// <summary>
        /// Gets all metadata items of a specific type
        /// </summary>
        /// <param name="metadataType">The metadata type</param>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of metadata items</returns>
        Task<List<MetadataItem>> GetMetadataByTypeAsync(string metadataType, bool includeInactive = false);

        /// <summary>
        /// Gets a metadata item by type and code
        /// </summary>
        /// <param name="metadataType">The metadata type</param>
        /// <param name="code">The code</param>
        /// <returns>The metadata item</returns>
        Task<MetadataItem?> GetMetadataByTypeAndCodeAsync(string metadataType, string code);

        /// <summary>
        /// Gets all genders
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of gender metadata items</returns>
        Task<List<MetadataItem>> GetGendersAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all statuses
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of status metadata items</returns>
        Task<List<MetadataItem>> GetStatusesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all registration play modes
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of registration play mode metadata items</returns>
        Task<List<MetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all languages
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of language metadata items</returns>
        Task<List<MetadataItem>> GetLanguagesAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all platforms
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of platform metadata items</returns>
        Task<List<MetadataItem>> GetPlatformsAsync(bool includeInactive = false);

        /// <summary>
        /// Gets all trackers
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive items</param>
        /// <returns>A list of tracker metadata items</returns>
        Task<List<MetadataItem>> GetTrackersAsync(bool includeInactive = false);

        /// <summary>
        /// Preloads all metadata into the cache
        /// </summary>
        Task PreloadMetadataAsync();
    }
}
