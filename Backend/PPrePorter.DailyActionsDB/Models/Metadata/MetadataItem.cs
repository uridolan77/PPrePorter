using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Metadata
{
    /// <summary>
    /// Represents a metadata item in the system
    /// </summary>
    [Table("tbl_Metadata", Schema = "dbo")]
    public class MetadataItem
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
        /// Gets or sets whether the metadata item is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>
        /// Gets or sets the parent ID (for hierarchical metadata)
        /// </summary>
        public int? ParentId { get; set; }

        /// <summary>
        /// Gets or sets the additional data (JSON)
        /// </summary>
        [Column(TypeName = "nvarchar(max)")]
        public string? AdditionalData { get; set; }

        /// <summary>
        /// Gets or sets the created date
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Gets or sets the updated date
        /// </summary>
        public DateTime? UpdatedDate { get; set; }
    }

    /// <summary>
    /// Enum for metadata types
    /// </summary>
    public static class MetadataTypes
    {
        public const string Gender = "Gender";
        public const string Status = "Status";
        public const string RegistrationPlayMode = "RegistrationPlayMode";
        public const string Language = "Language";
        public const string Platform = "Platform";
        public const string Tracker = "Tracker";
    }
}
