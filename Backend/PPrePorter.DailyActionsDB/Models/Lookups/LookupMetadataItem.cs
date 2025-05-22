using PPrePorter.DailyActionsDB.Models.Metadata;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Base class for lookup entities that map to the DailyActionsMetadata table
    /// </summary>
    [NotMapped]
    public abstract class LookupMetadataItem
    {
        /// <summary>
        /// Gets the metadata type for this lookup
        /// </summary>
        public abstract string MetadataType { get; }

        /// <summary>
        /// Converts a MetadataItem to a specific lookup type
        /// </summary>
        /// <param name="metadataItem">The metadata item to convert</param>
        /// <returns>The converted lookup item</returns>
        public static T FromMetadataItem<T>(MetadataItem metadataItem) where T : LookupMetadataItem, new()
        {
            var item = new T
            {
                Id = metadataItem.Id,
                Code = metadataItem.Code,
                Name = metadataItem.Name,
                Description = metadataItem.Description,
                IsActive = metadataItem.IsActive,
                DisplayOrder = metadataItem.DisplayOrder
            };
            return item;
        }

        /// <summary>
        /// Primary key
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Unique code for the lookup value
        /// </summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Display name for the lookup value
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Optional description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Whether the lookup value is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Display order for UI presentation
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
    }
}
