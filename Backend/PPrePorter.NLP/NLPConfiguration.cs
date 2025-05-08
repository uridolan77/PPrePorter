using System;
using System.Collections.Generic;

namespace PPrePorter.NLP
{
    /// <summary>
    /// Configuration options for NLP services
    /// </summary>
    public class NLPConfiguration
    {
        /// <summary>
        /// The API key for external NLP services (if used)
        /// </summary>
        public string ApiKey { get; set; }
        
        /// <summary>
        /// The endpoint URL for external NLP services (if used)
        /// </summary>
        public string EndpointUrl { get; set; }
        
        /// <summary>
        /// Maximum timeout in seconds for NLP operations
        /// </summary>
        public int TimeoutSeconds { get; set; } = 30;
        
        /// <summary>
        /// Whether to use cached results when possible
        /// </summary>
        public bool EnableCaching { get; set; } = true;
        
        /// <summary>
        /// Cache expiration time in minutes
        /// </summary>
        public int CacheExpirationMinutes { get; set; } = 60;
        
        /// <summary>
        /// Confidence threshold for entity extraction (0.0 - 1.0)
        /// </summary>
        public double ConfidenceThreshold { get; set; } = 0.7;
        
        /// <summary>
        /// Domain-specific terminology mappings
        /// </summary>
        public Dictionary<string, string> TerminologyMappings { get; set; } = new Dictionary<string, string>();
    }
}