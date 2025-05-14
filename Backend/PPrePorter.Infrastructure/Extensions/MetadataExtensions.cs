using PPrePorter.Core.Models.Metadata;
using PPrePorter.Infrastructure.Models.Metadata;

namespace PPrePorter.Infrastructure.Extensions
{
    /// <summary>
    /// Extension methods for metadata-related classes
    /// </summary>
    public static class MetadataExtensions
    {
        /// <summary>
        /// Converts a MetadataItem to a DailyActionsMetadataItem
        /// </summary>
        public static DailyActionsMetadataItem ToDailyActionsMetadataItem(this MetadataItem source)
        {
            return new DailyActionsMetadataItem
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

        /// <summary>
        /// Converts a DailyActionsMetadataItem to a MetadataItem
        /// </summary>
        public static MetadataItem ToMetadataItem(this DailyActionsMetadataItem source)
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
