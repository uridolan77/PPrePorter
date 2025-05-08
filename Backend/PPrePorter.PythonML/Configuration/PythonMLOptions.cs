using System;

namespace PPrePorter.PythonML.Configuration
{
    /// <summary>
    /// Configuration options for the PythonML service.
    /// </summary>
    public class PythonMLOptions
    {
        /// <summary>
        /// The instance name of the gRPC client to use.
        /// </summary>
        public string ClientInstanceName { get; set; } = "Default";
        
        /// <summary>
        /// The base path for model storage.
        /// </summary>
        public string ModelBasePath { get; set; } = "Models";
        
        /// <summary>
        /// The maximum allowed size for input data in MB.
        /// </summary>
        public int MaxInputSizeMB { get; set; } = 100;
        
        /// <summary>
        /// The timeout for model operations in seconds.
        /// </summary>
        public int OperationTimeoutSeconds { get; set; } = 600; // 10 minutes
        
        /// <summary>
        /// The default model to use when not specified.
        /// </summary>
        public string DefaultModel { get; set; } = "default";
        
        /// <summary>
        /// Whether to enable model versioning.
        /// </summary>
        public bool EnableModelVersioning { get; set; } = true;
        
        /// <summary>
        /// The maximum number of model versions to keep.
        /// </summary>
        public int MaxModelVersions { get; set; } = 5;
    }
}