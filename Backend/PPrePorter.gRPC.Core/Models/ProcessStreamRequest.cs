using System.Collections.Generic;

namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a request for streaming data processing.
    /// </summary>
    public class ProcessStreamRequest
    {
        /// <summary>
        /// The input data to process.
        /// </summary>
        public string InputData { get; set; } = string.Empty;
        
        /// <summary>
        /// The name of the model to use for processing.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional parameters for processing.
        /// </summary>
        public Dictionary<string, string> Parameters { get; set; } = new Dictionary<string, string>();
        
        /// <summary>
        /// The version of the model to use. If null, the latest version is used.
        /// </summary>
        public string? Version { get; set; }
        
        /// <summary>
        /// The stage of the model to use (e.g., production, staging, development). 
        /// If null, the default is determined by the server.
        /// </summary>
        public string? Stage { get; set; }
    }
}
