namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Application settings
    /// </summary>
    public class AppSettings
    {
        /// <summary>
        /// Gets or sets whether authentication is enabled
        /// </summary>
        public bool EnableAuthentication { get; set; } = true;

        /// <summary>
        /// Gets or sets whether Redis is enabled
        /// </summary>
        public bool UseRedis { get; set; } = false;
    }
}
