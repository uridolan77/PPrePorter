using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a user in the system
    /// </summary>
    public class User : BaseEntity
    {
        /// <summary>
        /// Username for login
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Hashed password
        /// </summary>
        public string PasswordHash { get; set; }

        /// <summary>
        /// First name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Whether the user is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Date and time when the user was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date and time of the last login
        /// </summary>
        public DateTime? LastLogin { get; set; }

        /// <summary>
        /// Role ID
        /// </summary>
        public int RoleId { get; set; }

        /// <summary>
        /// Role
        /// </summary>
        public virtual Role Role { get; set; }

        /// <summary>
        /// User preferences
        /// </summary>
        public virtual ICollection<UserPreference> Preferences { get; set; }

        /// <summary>
        /// Refresh token for authentication
        /// </summary>
        public string? RefreshToken { get; set; }

        /// <summary>
        /// Expiry time for the refresh token
        /// </summary>
        public DateTime? RefreshTokenExpiryTime { get; set; }

        /// <summary>
        /// Number of failed login attempts
        /// </summary>
        public int FailedLoginAttempts { get; set; }

        /// <summary>
        /// Date and time when the user's lockout ends
        /// </summary>
        public DateTime? LockoutEnd { get; set; }

        /// <summary>
        /// Date and time of the last failed login attempt
        /// </summary>
        public DateTime? LastFailedLoginAttempt { get; set; }

        /// <summary>
        /// Whether the user is currently locked out
        /// </summary>
        public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd > DateTime.UtcNow;
    }
}
