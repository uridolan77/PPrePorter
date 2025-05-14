using System;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a user preference
    /// </summary>
    public class UserPreference : BaseEntity
    {
        /// <summary>
        /// User ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Preference key
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Preference value
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Date and time when the preference was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date and time when the preference was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// User
        /// </summary>
        public virtual User User { get; set; }
    }
}
