using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Models.Metadata;
using PPrePorter.Infrastructure.Extensions;
using PPrePorter.Infrastructure.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.Infrastructure.Data
{
    /// <summary>
    /// Custom query provider for DailyActionsMetadataItem
    /// This class provides methods to query MetadataItem entities and convert them to DailyActionsMetadataItem entities
    /// </summary>
    public class DailyActionsMetadataQueryProvider
    {
        private readonly PPRePorterDbContext _dbContext;

        public DailyActionsMetadataQueryProvider(PPRePorterDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        /// <summary>
        /// Gets all DailyActionsMetadataItem entities
        /// </summary>
        public async Task<List<DailyActionsMetadataItem>> GetAllAsync()
        {
            var metadataItems = await _dbContext.Metadata.ToListAsync();
            return metadataItems.Select(m => m.ToDailyActionsMetadataItem()).ToList();
        }

        /// <summary>
        /// Gets all DailyActionsMetadataItem entities of a specific type
        /// </summary>
        public async Task<List<DailyActionsMetadataItem>> GetByTypeAsync(string metadataType, bool includeInactive = false)
        {
            var query = _dbContext.Metadata.Where(m => m.MetadataType == metadataType);

            if (!includeInactive)
            {
                query = query.Where(m => m.IsActive);
            }

            var metadataItems = await query.ToListAsync();
            return metadataItems.Select(m => m.ToDailyActionsMetadataItem()).ToList();
        }

        /// <summary>
        /// Gets a DailyActionsMetadataItem entity by type and code
        /// </summary>
        public async Task<DailyActionsMetadataItem?> GetByTypeAndCodeAsync(string metadataType, string code)
        {
            var metadataItem = await _dbContext.Metadata
                .FirstOrDefaultAsync(m => m.MetadataType == metadataType && m.Code == code);

            return metadataItem?.ToDailyActionsMetadataItem();
        }

        /// <summary>
        /// Adds a new DailyActionsMetadataItem entity
        /// </summary>
        public async Task<DailyActionsMetadataItem> AddAsync(DailyActionsMetadataItem item)
        {
            var metadataItem = item.ToMetadataItem();
            _dbContext.Metadata.Add(metadataItem);
            await _dbContext.SaveChangesAsync();
            return metadataItem.ToDailyActionsMetadataItem();
        }

        /// <summary>
        /// Updates an existing DailyActionsMetadataItem entity
        /// </summary>
        public async Task<DailyActionsMetadataItem> UpdateAsync(DailyActionsMetadataItem item)
        {
            var metadataItem = await _dbContext.Metadata.FindAsync(item.Id);
            if (metadataItem is null)
            {
                throw new KeyNotFoundException($"MetadataItem with ID {item.Id} not found");
            }

            // Update properties
            metadataItem.MetadataType = item.MetadataType;
            metadataItem.Code = item.Code;
            metadataItem.Name = item.Name;
            metadataItem.Description = item.Description;
            metadataItem.IsActive = item.IsActive;
            metadataItem.DisplayOrder = item.DisplayOrder;
            metadataItem.ParentId = item.ParentId;
            metadataItem.AdditionalData = item.AdditionalData;
            metadataItem.UpdatedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return metadataItem.ToDailyActionsMetadataItem();
        }

        /// <summary>
        /// Deletes a DailyActionsMetadataItem entity
        /// </summary>
        public async Task DeleteAsync(int id)
        {
            var metadataItem = await _dbContext.Metadata.FindAsync(id);
            if (metadataItem is null)
            {
                throw new KeyNotFoundException($"MetadataItem with ID {id} not found");
            }

            _dbContext.Metadata.Remove(metadataItem);
            await _dbContext.SaveChangesAsync();
        }
    }
}
