using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces.Metadata;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.Infrastructure.Data;
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
        private readonly PPRePorterDbContext _ppReporterDbContext;
        private readonly IGlobalCacheService _cacheService;
        private readonly ILogger<DailyActionsMetadataRepository> _logger;
        private const string CacheKeyPrefix = "DailyActionsMetadataItem_";

        public DailyActionsMetadataRepository(
            PPRePorterDbContext ppReporterDbContext,
            IGlobalCacheService cacheService,
            ILogger<DailyActionsMetadataRepository> logger)
        {
            _ppReporterDbContext = ppReporterDbContext ?? throw new ArgumentNullException(nameof(ppReporterDbContext));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

            _logger.LogDebug("Cache MISS: Getting {MetadataType} items from database", metadataType);

            try
            {
                // Create a SQL command to query the DailyActionsMetadata table in PPrePorterDB
                var connection = _ppReporterDbContext.Database.GetDbConnection();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT Id, MetadataType, Code, Name, Description, IsActive, DisplayOrder, ParentId, AdditionalData, CreatedDate, UpdatedDate
                    FROM [dbo].[DailyActionsMetadata] WITH (NOLOCK)
                    WHERE MetadataType = @MetadataType
                    " + (includeInactive ? "" : "AND IsActive = 1") + @"
                    ORDER BY DisplayOrder, Name";

                command.Parameters.Add(new SqlParameter("@MetadataType", metadataType));

                // Ensure the connection is open
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                var items = new List<DailyActionsMetadataItem>();
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        items.Add(new DailyActionsMetadataItem
                        {
                            Id = reader.GetInt32(0),
                            MetadataType = reader.GetString(1),
                            Code = reader.GetString(2),
                            Name = reader.GetString(3),
                            Description = reader.IsDBNull(4) ? null : reader.GetString(4),
                            IsActive = reader.GetBoolean(5),
                            DisplayOrder = reader.GetInt32(6),
                            ParentId = reader.IsDBNull(7) ? null : (int?)reader.GetInt32(7),
                            AdditionalData = reader.IsDBNull(8) ? null : reader.GetString(8),
                            CreatedDate = reader.GetDateTime(9),
                            UpdatedDate = reader.IsDBNull(10) ? null : (DateTime?)reader.GetDateTime(10)
                        });
                    }
                }

                // Cache the result
                _cacheService.Set(cacheKey, items, TimeSpan.FromHours(1));

                _logger.LogDebug("Retrieved {Count} {MetadataType} items from database and cached",
                    items.Count, metadataType);

                return items;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {MetadataType} items from database", metadataType);
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

            _logger.LogDebug("Cache MISS: Getting {MetadataType} item with code {Code} from database",
                metadataType, code);

            try
            {
                // Create a SQL command to query the DailyActionsMetadata table in PPrePorterDB
                var connection = _ppReporterDbContext.Database.GetDbConnection();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT Id, MetadataType, Code, Name, Description, IsActive, DisplayOrder, ParentId, AdditionalData, CreatedDate, UpdatedDate
                    FROM [dbo].[DailyActionsMetadata] WITH (NOLOCK)
                    WHERE MetadataType = @MetadataType AND Code = @Code";

                command.Parameters.Add(new SqlParameter("@MetadataType", metadataType));
                command.Parameters.Add(new SqlParameter("@Code", code));

                // Ensure the connection is open
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                DailyActionsMetadataItem? item = null;
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        item = new DailyActionsMetadataItem
                        {
                            Id = reader.GetInt32(0),
                            MetadataType = reader.GetString(1),
                            Code = reader.GetString(2),
                            Name = reader.GetString(3),
                            Description = reader.IsDBNull(4) ? null : reader.GetString(4),
                            IsActive = reader.GetBoolean(5),
                            DisplayOrder = reader.GetInt32(6),
                            ParentId = reader.IsDBNull(7) ? null : (int?)reader.GetInt32(7),
                            AdditionalData = reader.IsDBNull(8) ? null : reader.GetString(8),
                            CreatedDate = reader.GetDateTime(9),
                            UpdatedDate = reader.IsDBNull(10) ? null : (DateTime?)reader.GetDateTime(10)
                        };
                    }
                }

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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {MetadataType} item with code {Code} from database", metadataType, code);
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
