namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a request for getting model information.
    /// </summary>
    public class ModelInfoRequest
    {
        /// <summary>
        /// The name of the model.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model. If null, the latest version is used.
        /// </summary>
        public string? Version { get; set; }
        
        /// <summary>
        /// The stage of the model (e.g., production, staging, development).
        /// If null, all stages are considered.
        /// </summary>
        public string? Stage { get; set; }
    }
}
