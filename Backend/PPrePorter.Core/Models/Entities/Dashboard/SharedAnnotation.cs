using PPrePorter.Core.Common;
using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a shared annotation
    /// </summary>
    public class SharedAnnotation : BaseEntity
    {
        /// <summary>
        /// Annotation ID
        /// </summary>
        public string AnnotationId { get; set; }

        /// <summary>
        /// User ID with whom the annotation is shared
        /// </summary>
        public string SharedWithUserId { get; set; }

        /// <summary>
        /// Date and time when the annotation was shared
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// Whether the shared user can edit the annotation
        /// </summary>
        public bool CanEdit { get; set; }
    }
}
