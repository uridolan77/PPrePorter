using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.Infrastructure.Entities
{
    /// <summary>
    /// Entity for storing dashboard annotations in the database
    /// </summary>
    [Table("Annotations")]
    public class Annotation
    {
        /// <summary>
        /// Unique identifier for the annotation
        /// </summary>
        [Key]
        public string Id { get; set; }

        /// <summary>
        /// Title of the annotation
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Title { get; set; }

        /// <summary>
        /// Detailed description of the annotation
        /// </summary>
        [MaxLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// Type of data being annotated (e.g., Revenue, Registration)
        /// </summary>
        [MaxLength(50)]
        public string Type { get; set; }

        /// <summary>
        /// The dimension related to this annotation (e.g., Date, Player, Game)
        /// </summary>
        [MaxLength(50)]
        public string RelatedDimension { get; set; }

        /// <summary>
        /// The metric related to this annotation (e.g., Revenue, Registrations)
        /// </summary>
        [MaxLength(50)]
        public string RelatedMetric { get; set; }

        /// <summary>
        /// Name of the user who created the annotation
        /// </summary>
        [MaxLength(100)]
        public string CreatedBy { get; set; }

        /// <summary>
        /// Date and time when the annotation was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// ID of the user who created the annotation
        /// </summary>
        [MaxLength(50)]
        public string UserId { get; set; }

        /// <summary>
        /// Date and time when the annotation was last modified
        /// </summary>
        public DateTime ModifiedAt { get; set; }
    }
}
