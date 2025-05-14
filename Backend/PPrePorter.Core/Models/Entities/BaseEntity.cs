using System;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Base class for all entities
    /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Entity ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Date and time when the entity was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// User who created the entity
        /// </summary>
        public string CreatedBy { get; set; }

        /// <summary>
        /// Date and time when the entity was last modified
        /// </summary>
        public DateTime? ModifiedAt { get; set; }

        /// <summary>
        /// User who last modified the entity
        /// </summary>
        public string ModifiedBy { get; set; }

        /// <summary>
        /// Whether the entity is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Interface for entities that can be audited
    /// </summary>
    public interface IAuditableEntity
    {
        /// <summary>
        /// Date and time when the entity was created
        /// </summary>
        DateTime CreatedAt { get; set; }

        /// <summary>
        /// User who created the entity
        /// </summary>
        string CreatedBy { get; set; }

        /// <summary>
        /// Date and time when the entity was last modified
        /// </summary>
        DateTime? ModifiedAt { get; set; }

        /// <summary>
        /// User who last modified the entity
        /// </summary>
        string ModifiedBy { get; set; }
    }
}
