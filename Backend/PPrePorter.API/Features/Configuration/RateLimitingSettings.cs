namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Settings for rate limiting
    /// </summary>
    public class RateLimitingSettings
    {
        /// <summary>
        /// Gets or sets whether rate limiting is enabled
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// Gets or sets the maximum number of requests allowed in the time window
        /// </summary>
        public int MaxRequests { get; set; } = 100;

        /// <summary>
        /// Gets or sets the time window in seconds
        /// </summary>
        public int WindowSeconds { get; set; } = 60;

        /// <summary>
        /// Gets or sets the maximum number of failed login attempts before account lockout
        /// </summary>
        public int MaxFailedLoginAttempts { get; set; } = 5;

        /// <summary>
        /// Gets or sets the account lockout duration in minutes
        /// </summary>
        public int LockoutDurationMinutes { get; set; } = 15;
    }
}
