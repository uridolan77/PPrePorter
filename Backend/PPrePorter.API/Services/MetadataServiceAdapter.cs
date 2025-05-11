using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.API.Services
{
    /// <summary>
    /// Adapter that implements DailyActionsDB's IMetadataService but uses Infrastructure's IMetadataService
    /// </summary>
    public class MetadataServiceAdapter : IMetadataService
    {
        private readonly PPrePorter.Infrastructure.Interfaces.IMetadataService _infrastructureMetadataService;
        private readonly ILogger<MetadataServiceAdapter> _logger;

        public MetadataServiceAdapter(
            PPrePorter.Infrastructure.Interfaces.IMetadataService infrastructureMetadataService,
            ILogger<MetadataServiceAdapter> logger)
        {
            _infrastructureMetadataService = infrastructureMetadataService ?? throw new ArgumentNullException(nameof(infrastructureMetadataService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all metadata items of a specific type
        /// </summary>
        public async Task<List<MetadataItem>> GetMetadataByTypeAsync(string metadataType, bool includeInactive = false)
        {
            _logger.LogDebug("Adapter: Getting metadata for type {MetadataType}", metadataType);

            // Get metadata from Infrastructure's service
            var infrastructureMetadata = await _infrastructureMetadataService.GetMetadataByTypeAsync(metadataType, includeInactive);

            // Convert to DailyActionsDB's MetadataItem
            var result = infrastructureMetadata.Select(ConvertToDailyActionsMetadataItem).ToList();

            _logger.LogDebug("Adapter: Converted {Count} metadata items for type {MetadataType}", result.Count, metadataType);

            return result;
        }

        /// <summary>
        /// Gets a metadata item by type and code
        /// </summary>
        public async Task<MetadataItem?> GetMetadataByTypeAndCodeAsync(string metadataType, string code)
        {
            _logger.LogDebug("Adapter: Getting metadata for type {MetadataType} and code {Code}", metadataType, code);

            // Get metadata from Infrastructure's service
            var infrastructureMetadata = await _infrastructureMetadataService.GetMetadataByTypeAndCodeAsync(metadataType, code);

            // Convert to DailyActionsDB's MetadataItem if not null
            var result = infrastructureMetadata != null ? ConvertToDailyActionsMetadataItem(infrastructureMetadata) : null;

            _logger.LogDebug("Adapter: Converted metadata item for type {MetadataType} and code {Code}", metadataType, code);

            return result;
        }

        /// <summary>
        /// Gets all genders
        /// </summary>
        public Task<List<MetadataItem>> GetGendersAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("Gender", includeInactive);
        }

        /// <summary>
        /// Gets all statuses
        /// </summary>
        public Task<List<MetadataItem>> GetStatusesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("Status", includeInactive);
        }

        /// <summary>
        /// Gets all registration play modes
        /// </summary>
        public Task<List<MetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("RegistrationPlayMode", includeInactive);
        }

        /// <summary>
        /// Gets all languages
        /// </summary>
        public Task<List<MetadataItem>> GetLanguagesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("Language", includeInactive);
        }

        /// <summary>
        /// Gets all platforms
        /// </summary>
        public Task<List<MetadataItem>> GetPlatformsAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("Platform", includeInactive);
        }

        /// <summary>
        /// Gets all trackers
        /// </summary>
        public Task<List<MetadataItem>> GetTrackersAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync("Tracker", includeInactive);
        }

        /// <summary>
        /// Preloads all metadata into the cache
        /// </summary>
        public async Task PreloadMetadataAsync()
        {
            _logger.LogInformation("Adapter: Preloading metadata");

            // Use Infrastructure's service to preload metadata
            await _infrastructureMetadataService.PreloadMetadataAsync();

            _logger.LogInformation("Adapter: Preloaded metadata");
        }

        /// <summary>
        /// Converts an Infrastructure MetadataItem to a DailyActionsDB MetadataItem
        /// </summary>
        private MetadataItem ConvertToDailyActionsMetadataItem(PPrePorter.Infrastructure.Models.Metadata.MetadataItem source)
        {
            return new MetadataItem
            {
                Id = source.Id,
                MetadataType = source.MetadataType,
                Code = source.Code,
                Name = source.Name,
                Description = source.Description,
                IsActive = source.IsActive,
                DisplayOrder = source.DisplayOrder,
                ParentId = source.ParentId,
                AdditionalData = source.AdditionalData,
                CreatedDate = source.CreatedDate,
                UpdatedDate = source.UpdatedDate
            };
        }
    }
}
