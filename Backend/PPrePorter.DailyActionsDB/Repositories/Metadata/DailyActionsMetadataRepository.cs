using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces.Metadata;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories.Metadata
{
    /// <summary>
    /// Repository implementation for DailyActionsMetadata entities
    /// </summary>
    public class DailyActionsMetadataRepository : IDailyActionsMetadataRepository
    {
        private readonly IMetadataService _metadataService;
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<DailyActionsMetadataRepository> _logger;
        private const string CacheKeyPrefix = "DailyActionsMetadataItem_";

        public DailyActionsMetadataRepository(
            IMetadataService metadataService,
            IGlobalCacheService cacheService,
            ILogger<DailyActionsMetadataRepository> logger)
        {
            _metadataService = metadataService ?? throw new ArgumentNullException(nameof(metadataService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Converts a MetadataItem to a DailyActionsMetadataItem
        /// </summary>
        private DailyActionsMetadataItem ConvertToDailyActionsMetadataItem(MetadataItem metadataItem)
        {
            return new DailyActionsMetadataItem
            {
                Id = metadataItem.Id,
                MetadataType = metadataItem.MetadataType,
                Code = metadataItem.Code,
                Name = metadataItem.Name,
                Description = metadataItem.Description,
                IsActive = metadataItem.IsActive,
                DisplayOrder = metadataItem.DisplayOrder,
                ParentId = metadataItem.ParentId,
                AdditionalData = metadataItem.AdditionalData,
                CreatedDate = metadataItem.CreatedDate,
                UpdatedDate = metadataItem.UpdatedDate
            };
        }

        /// <summary>
        /// Gets all metadata items of a specific type
        /// </summary>
        public async Task<List<DailyActionsMetadataItem>> GetByTypeAsync(string metadataType, bool includeInactive = false)
        {
            string cacheKey = $"{CacheKeyPrefix}{metadataType}_{includeInactive}";

            // Try to get from cache first
            if (_cacheService.TryGetValue(cacheKey, out List<DailyActionsMetadataItem>? cachedItems) && cachedItems != null)
            {
                _logger.LogDebug("Cache HIT: Retrieved {Count} {MetadataType} items from cache",
                    cachedItems.Count, metadataType);
                return cachedItems;
            }

            _logger.LogDebug("Cache MISS: Getting {MetadataType} items from metadata service", metadataType);

            try
            {
                // Get metadata items from the metadata service
                var metadataItems = await _metadataService.GetMetadataByTypeAsync(metadataType, includeInactive);

                // Convert to DailyActionsMetadataItem
                var items = metadataItems.Select(ConvertToDailyActionsMetadataItem).ToList();

                // Cache the result
                _cacheService.Set(cacheKey, items, TimeSpan.FromHours(1));

                _logger.LogDebug("Retrieved {Count} {MetadataType} items from metadata service and cached",
                    items.Count, metadataType);

                return items;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {MetadataType} items from metadata service", metadataType);
                throw;
            }
        }

        /// <summary>
        /// Gets a metadata item by type and code
        /// </summary>
        public async Task<DailyActionsMetadataItem?> GetByTypeAndCodeAsync(string metadataType, string code)
        {
            string cacheKey = $"{CacheKeyPrefix}{metadataType}_{code}";

            // Try to get from cache first
            if (_cacheService.TryGetValue(cacheKey, out DailyActionsMetadataItem? cachedItem) && cachedItem != null)
            {
                _logger.LogDebug("Cache HIT: Retrieved {MetadataType} item with code {Code} from cache",
                    metadataType, code);
                return cachedItem;
            }

            _logger.LogDebug("Cache MISS: Getting {MetadataType} item with code {Code} from metadata service",
                metadataType, code);

            try
            {
                // Get metadata item from the metadata service
                var metadataItem = await _metadataService.GetMetadataByTypeAndCodeAsync(metadataType, code);

                // Convert to DailyActionsMetadataItem if not null
                DailyActionsMetadataItem? item = null;
                if (metadataItem != null)
                {
                    item = ConvertToDailyActionsMetadataItem(metadataItem);
                }

                if (item != null)
                {
                    // Cache the result
                    _cacheService.Set(cacheKey, item, TimeSpan.FromHours(1));
                    _logger.LogDebug("Retrieved {MetadataType} item with code {Code} from metadata service and cached",
                        metadataType, code);
                }
                else
                {
                    _logger.LogWarning("No {MetadataType} item found with code {Code}", metadataType, code);
                }

                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {MetadataType} item with code {Code} from metadata service", metadataType, code);
                throw;
            }
        }

        /// <summary>
        /// Gets all white labels from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetWhiteLabelsAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("WhiteLabel", includeInactive);
        }

        /// <summary>
        /// Gets all countries from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetCountriesAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Country", includeInactive);
        }

        /// <summary>
        /// Gets all currencies from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetCurrenciesAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Currency", includeInactive);
        }

        /// <summary>
        /// Gets all languages from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetLanguagesAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Language", includeInactive);
        }

        /// <summary>
        /// Gets all platforms from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetPlatformsAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Platform", includeInactive);
        }

        /// <summary>
        /// Gets all genders from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetGendersAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Gender", includeInactive);
        }

        /// <summary>
        /// Gets all statuses from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetStatusesAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Status", includeInactive);
        }

        /// <summary>
        /// Gets all registration play modes from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("RegistrationPlayMode", includeInactive);
        }

        /// <summary>
        /// Gets all trackers from metadata
        /// </summary>
        public Task<List<DailyActionsMetadataItem>> GetTrackersAsync(bool includeInactive = false)
        {
            return GetByTypeAsync("Tracker", includeInactive);
        }
    }
}
