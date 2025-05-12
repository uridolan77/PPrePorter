using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.Infrastructure.Entities
{
    /// <summary>
    /// Entity for storing shared annotations in the database
    /// </summary>
    [Table("SharedAnnotations")]
    public class SharedAnnotation
    {
        /// <summary>
        /// Unique identifier for the shared annotation
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// ID of the annotation being shared
        /// </summary>
        [Required]
        public string AnnotationId { get; set; }

        /// <summary>
        /// ID of the user the annotation is shared with
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string SharedWithUserId { get; set; }

        /// <summary>
        /// Date and time when the annotation was shared
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// Navigation property to the annotation
        /// </summary>
        [ForeignKey("AnnotationId")]
        public virtual Annotation Annotation { get; set; }
    }
}
