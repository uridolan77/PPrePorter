namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a health check request.
    /// </summary>
    public class HealthCheckRequest
    {
        /// <summary>
        /// The component to check. If null, the entire service is checked.
        /// </summary>
        public string? Component { get; set; }
    }
}
