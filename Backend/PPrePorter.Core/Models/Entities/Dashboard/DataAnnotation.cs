using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an annotation on dashboard data
    /// </summary>
    public class DataAnnotation : BaseEntity
    {

        /// <summary>
        /// Annotation title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Annotation description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Annotation type (e.g., "note", "alert", "insight")
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Data type (e.g., "revenue", "registrations", "deposits")
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Related dimension
        /// </summary>
        public string RelatedDimension { get; set; }

        /// <summary>
        /// Related metric
        /// </summary>
        public string RelatedMetric { get; set; }

        /// <summary>
        /// User who created the annotation
        /// </summary>
        public string CreatedBy { get; set; }

        /// <summary>
        /// Date and time when the annotation was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Date and time when the annotation was modified
        /// </summary>
        public DateTime ModifiedAt { get; set; }

        /// <summary>
        /// Date and time when the annotation was updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Start date for the annotation
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date for the annotation
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Annotation color
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Annotation icon
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Additional data
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; }
    }
}
