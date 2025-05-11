using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for accessing metadata
    /// </summary>
    public class MetadataService : IMetadataService
    {
        private readonly DailyActionsDbContext _dbContext;
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<MetadataService> _logger;
        private const string CacheKeyPrefix = "Metadata_";

        public MetadataService(
            DailyActionsDbContext dbContext,
            IGlobalCacheService cacheService,
            ILogger<MetadataService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all metadata items of a specific type
        /// </summary>
        public async Task<List<MetadataItem>> GetMetadataByTypeAsync(string metadataType, bool includeInactive = false)
        {
            string cacheKey = $"{CacheKeyPrefix}{metadataType}_{includeInactive}";

            // Try to get from cache first
            if (_cacheService.TryGetValue(cacheKey, out List<MetadataItem>? cachedItems) && cachedItems != null)
            {
                _logger.LogDebug("Cache HIT: Retrieved {Count} {MetadataType} items from cache", 
                    cachedItems.Count, metadataType);
                return cachedItems;
            }

            _logger.LogDebug("Cache MISS: Getting {MetadataType} items from database", metadataType);

            // Get from database
            var query = _dbContext.Metadata
                .Where(m => m.MetadataType == metadataType);

            if (!includeInactive)
            {
                query = query.Where(m => m.IsActive);
            }

            var items = await query
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Name)
                .ToListAsync();

            // Cache the result
            _cacheService.Set(cacheKey, items, TimeSpan.FromHours(1));

            _logger.LogDebug("Retrieved {Count} {MetadataType} items from database and cached", 
                items.Count, metadataType);

            return items;
        }

        /// <summary>
        /// Gets a metadata item by type and code
        /// </summary>
        public async Task<MetadataItem?> GetMetadataByTypeAndCodeAsync(string metadataType, string code)
        {
            string cacheKey = $"{CacheKeyPrefix}{metadataType}_{code}";

            // Try to get from cache first
            if (_cacheService.TryGetValue(cacheKey, out MetadataItem? cachedItem) && cachedItem != null)
            {
                _logger.LogDebug("Cache HIT: Retrieved {MetadataType} item with code {Code} from cache", 
                    metadataType, code);
                return cachedItem;
            }

            _logger.LogDebug("Cache MISS: Getting {MetadataType} item with code {Code} from database", 
                metadataType, code);

            // Get from database
            var item = await _dbContext.Metadata
                .FirstOrDefaultAsync(m => m.MetadataType == metadataType && m.Code == code);

            if (item != null)
            {
                // Cache the result
                _cacheService.Set(cacheKey, item, TimeSpan.FromHours(1));
                _logger.LogDebug("Retrieved {MetadataType} item with code {Code} from database and cached", 
                    metadataType, code);
            }
            else
            {
                _logger.LogWarning("No {MetadataType} item found with code {Code}", metadataType, code);
            }

            return item;
        }

        /// <summary>
        /// Gets all genders
        /// </summary>
        public Task<List<MetadataItem>> GetGendersAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.Gender, includeInactive);
        }

        /// <summary>
        /// Gets all statuses
        /// </summary>
        public Task<List<MetadataItem>> GetStatusesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.Status, includeInactive);
        }

        /// <summary>
        /// Gets all registration play modes
        /// </summary>
        public Task<List<MetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.RegistrationPlayMode, includeInactive);
        }

        /// <summary>
        /// Gets all languages
        /// </summary>
        public Task<List<MetadataItem>> GetLanguagesAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.Language, includeInactive);
        }

        /// <summary>
        /// Gets all platforms
        /// </summary>
        public Task<List<MetadataItem>> GetPlatformsAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.Platform, includeInactive);
        }

        /// <summary>
        /// Gets all trackers
        /// </summary>
        public Task<List<MetadataItem>> GetTrackersAsync(bool includeInactive = false)
        {
            return GetMetadataByTypeAsync(MetadataTypes.Tracker, includeInactive);
        }

        /// <summary>
        /// Preloads all metadata into the cache
        /// </summary>
        public async Task PreloadMetadataAsync()
        {
            _logger.LogInformation("Preloading metadata into cache");

            // Get all metadata types
            var metadataTypes = await _dbContext.Metadata
                .Select(m => m.MetadataType)
                .Distinct()
                .ToListAsync();

            // Preload each metadata type
            foreach (var metadataType in metadataTypes)
            {
                _logger.LogDebug("Preloading {MetadataType} metadata", metadataType);
                
                // Preload active items
                await GetMetadataByTypeAsync(metadataType, false);
                
                // Preload all items (including inactive)
                await GetMetadataByTypeAsync(metadataType, true);
            }

            _logger.LogInformation("Preloaded {Count} metadata types into cache", metadataTypes.Count);
        }
    }
}
