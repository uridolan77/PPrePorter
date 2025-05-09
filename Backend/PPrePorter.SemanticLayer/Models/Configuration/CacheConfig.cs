namespace PPrePorter.SemanticLayer.Models.Configuration
{
    /// <summary>
    /// Cache configuration
    /// </summary>
    public class CacheConfig
    {
        /// <summary>
        /// Gets or sets whether caching is enabled
        /// </summary>
        public bool Enabled { get; set; } = true;
        
        /// <summary>
        /// Gets or sets the cache duration in minutes
        /// </summary>
        public int DurationMinutes { get; set; } = 15;
        
        /// <summary>
        /// Gets or sets the maximum number of entries to keep in the cache
        /// </summary>
        public int MaxEntries { get; set; } = 1000;
        
        /// <summary>
        /// Gets or sets whether to cache natural language queries
        /// </summary>
        public bool CacheNaturalLanguageQueries { get; set; } = true;
        
        /// <summary>
        /// Gets or sets whether to cache structured queries
        /// </summary>
        public bool CacheStructuredQueries { get; set; } = true;
    }
}
