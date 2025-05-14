using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.Core.Models.Metadata
{
    /// <summary>
    /// Represents a metadata item from the PPrePorterDB.dbo.DailyActionsMetadata table
    /// This is a view/proxy class for PPrePorter.Infrastructure.Models.Metadata.MetadataItem
    /// </summary>
    [NotMapped] // This entity is not directly mapped to a database table
    public class DailyActionsMetadataItem
    {
        /// <summary>
        /// Gets or sets the ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the metadata type
        /// </summary>
        public string MetadataType { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the code
        /// </summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets whether the item is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>
        /// Gets or sets the parent ID
        /// </summary>
        public int? ParentId { get; set; }

        /// <summary>
        /// Gets or sets additional data
        /// </summary>
        public string? AdditionalData { get; set; }

        /// <summary>
        /// Gets or sets the created date
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Gets or sets the updated date
        /// </summary>
        public DateTime? UpdatedDate { get; set; }

        // Conversion methods are implemented as extension methods in the Infrastructure project
        // to avoid circular references between Core and Infrastructure projects
    }
}
