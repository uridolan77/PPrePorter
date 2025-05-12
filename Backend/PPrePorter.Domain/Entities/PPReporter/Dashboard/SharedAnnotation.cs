using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a shared annotation
    /// </summary>
    public class SharedAnnotation
    {
        /// <summary>
        /// ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Annotation ID
        /// </summary>
        public string AnnotationId { get; set; }

        /// <summary>
        /// User ID who shared the annotation
        /// </summary>
        public string SharedByUserId { get; set; }

        /// <summary>
        /// User ID with whom the annotation is shared
        /// </summary>
        public string SharedWithUserId { get; set; }

        /// <summary>
        /// When the annotation was shared
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// Whether the share is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Optional message with the share
        /// </summary>
        public string Message { get; set; }
    }
}
