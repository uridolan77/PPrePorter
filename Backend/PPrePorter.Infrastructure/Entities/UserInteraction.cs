using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.Infrastructure.Entities
{
    /// <summary>
    /// Entity for storing user interactions with dashboard components
    /// </summary>
    [Table("UserInteractions")]
    public class UserInteraction
    {
        /// <summary>
        /// Unique identifier for the interaction
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// ID of the user who performed the interaction
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// ID of the component the user interacted with
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string ComponentId { get; set; }

        /// <summary>
        /// Type of interaction (e.g., "click", "hover", "filter", "drill-down")
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string InteractionType { get; set; }

        /// <summary>
        /// Key of the metric involved in the interaction
        /// </summary>
        [MaxLength(50)]
        public string MetricKey { get; set; }

        /// <summary>
        /// When the interaction occurred
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Additional data about the interaction (stored as JSON)
        /// </summary>
        public string AdditionalData { get; set; }

        // Navigation property to the user removed to avoid ambiguity
    }
}
