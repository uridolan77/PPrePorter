using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Models.Lookups;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories.Lookups
{
    /// <summary>
    /// Repository for accessing lookup data from the MetadataItem table
    /// </summary>
    public class LookupRepository : ILookupRepository
    {
        private readonly DailyActionsDbContext _dbContext;
        private readonly ILogger<LookupRepository> _logger;
        private readonly IMemoryCache _cache;
        private readonly bool _enableCaching;
        private readonly TimeSpan _cacheExpiration;
        private const string _cacheKeyPrefix = "Lookup_";

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupRepository"/> class
        /// </summary>
        public LookupRepository(
            DailyActionsDbContext dbContext,
            ILogger<LookupRepository> logger,
            IMemoryCache cache)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _enableCaching = true;
            _cacheExpiration = TimeSpan.FromMinutes(30);
        }

        /// <summary>
        /// Gets all gender lookup values
        /// </summary>
        public async Task<IEnumerable<Gender>> GetGendersAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}Genders_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Gender> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.Gender);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var genders = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<Gender>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, genders, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return genders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genders");
                throw;
            }
        }

        /// <summary>
        /// Gets all status lookup values
        /// </summary>
        public async Task<IEnumerable<Status>> GetStatusesAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}Statuses_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Status> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.Status);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var statuses = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<Status>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, statuses, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return statuses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statuses");
                throw;
            }
        }

        /// <summary>
        /// Gets all registration play mode lookup values
        /// </summary>
        public async Task<IEnumerable<RegistrationPlayMode>> GetRegistrationPlayModesAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}RegistrationPlayModes_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<RegistrationPlayMode> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.RegistrationPlayMode);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var registrationPlayModes = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<RegistrationPlayMode>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, registrationPlayModes, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return registrationPlayModes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting registration play modes");
                throw;
            }
        }

        /// <summary>
        /// Gets all language lookup values
        /// </summary>
        public async Task<IEnumerable<Language>> GetLanguagesAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}Languages_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Language> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.Language);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var languages = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<Language>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, languages, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return languages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting languages");
                throw;
            }
        }

        /// <summary>
        /// Gets all platform lookup values
        /// </summary>
        public async Task<IEnumerable<Platform>> GetPlatformsAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}Platforms_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Platform> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.Platform);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var platforms = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<Platform>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, platforms, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return platforms;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platforms");
                throw;
            }
        }

        /// <summary>
        /// Gets all tracker lookup values
        /// </summary>
        public async Task<IEnumerable<Tracker>> GetTrackersAsync(bool includeInactive = false)
        {
            string cacheKey = $"{_cacheKeyPrefix}Trackers_{includeInactive}";

            // Try to get from cache first
            if (_enableCaching && _cache.TryGetValue(cacheKey, out IEnumerable<Tracker> cachedEntities))
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return cachedEntities;
            }

            // Get from database
            _logger.LogDebug("Cache miss for {CacheKey}, querying database", cacheKey);

            try
            {
                var query = _dbContext.Metadata
                    .AsNoTracking()
                    .TagWith("WITH (NOLOCK)")
                    .Where(m => m.MetadataType == MetadataTypes.Tracker);

                if (!includeInactive)
                {
                    query = query.Where(m => m.IsActive);
                }

                var metadataItems = await query
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
                    .ToListAsync();

                var trackers = metadataItems
                    .Select(m => LookupMetadataItem.FromMetadataItem<Tracker>(m))
                    .ToList();

                // Cache the result
                if (_enableCaching)
                {
                    _cache.Set(cacheKey, trackers, _cacheExpiration);
                    _logger.LogDebug("Cached result for {CacheKey}", cacheKey);
                }

                return trackers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trackers");
                throw;
            }
        }
    }
}
