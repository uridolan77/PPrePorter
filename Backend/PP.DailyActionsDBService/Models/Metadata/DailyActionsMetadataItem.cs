using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Metadata
{
    /// <summary>
    /// Represents a metadata item from the PPrePorterDB.dbo.DailyActionsMetadata table
    /// </summary>
    [Table("DailyActionsMetadata", Schema = "dbo")]
    public class DailyActionsMetadataItem
    {
        /// <summary>
        /// Gets or sets the ID
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the metadata type
        /// </summary>
        [Required]
        [StringLength(50)]
        public string MetadataType { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the code
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the description
        /// </summary>
        [StringLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets whether the item is active
        /// </summary>
        [Required]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        [Required]
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
        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Gets or sets the updated date
        /// </summary>
        public DateTime? UpdatedDate { get; set; }
    }
}
