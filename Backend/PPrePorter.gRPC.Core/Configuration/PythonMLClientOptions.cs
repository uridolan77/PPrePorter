using System;

namespace PPrePorter.gRPC.Core.Configuration
{
    /// <summary>
    /// Configuration options for the PythonML gRPC client.
    /// </summary>
    public class PythonMLClientOptions
    {
        /// <summary>
        /// The address of the PythonML gRPC service.
        /// </summary>
        public string ServiceAddress { get; set; } = "http://localhost:50051";
        
        /// <summary>
        /// The timeout for gRPC calls in seconds.
        /// </summary>
        public int TimeoutSeconds { get; set; } = 30;
        
        /// <summary>
        /// The maximum retry attempts for failed gRPC calls.
        /// </summary>
        public int MaxRetryAttempts { get; set; } = 3;
        
        /// <summary>
        /// The initial backoff delay for retries in milliseconds.
        /// </summary>
        public int InitialBackoffMs { get; set; } = 100;
        
        /// <summary>
        /// Indicates whether to use secure connection.
        /// </summary>
        public bool UseSecureConnection { get; set; } = false;
        
        /// <summary>
        /// The path to client certificate file for mutual TLS.
        /// </summary>
        public string? ClientCertificatePath { get; set; }
        
        /// <summary>
        /// The client certificate password.
        /// </summary>
        public string? ClientCertificatePassword { get; set; }
        
        /// <summary>
        /// Cache configuration options.
        /// </summary>
        public CacheOptions CacheOptions { get; set; } = new CacheOptions();
    }
    
    /// <summary>
    /// Configuration options for caching.
    /// </summary>
    public class CacheOptions
    {
        /// <summary>
        /// Indicates whether caching is enabled.
        /// </summary>
        public bool Enabled { get; set; } = true;
        
        /// <summary>
        /// The absolute expiration time in minutes.
        /// </summary>
        public int AbsoluteExpirationMinutes { get; set; } = 30;
        
        /// <summary>
        /// The sliding expiration time in minutes.
        /// </summary>
        public int SlidingExpirationMinutes { get; set; } = 10;
        
        /// <summary>
        /// The cache size limit in items.
        /// </summary>
        public int SizeLimit { get; set; } = 1000;
    }
}