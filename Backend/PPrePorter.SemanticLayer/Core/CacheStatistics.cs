namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Statistics for the cache
    /// </summary>
    public class CacheStatistics
    {
        /// <summary>
        /// Number of items in the cache
        /// </summary>
        public int ItemCount { get; set; }

        /// <summary>
        /// Total size of the cache in bytes
        /// </summary>
        public long SizeInBytes { get; set; }

        /// <summary>
        /// Total size of the cache in bytes (alias for SizeInBytes)
        /// </summary>
        public long TotalSizeBytes
        {
            get => SizeInBytes;
            set => SizeInBytes = value;
        }

        /// <summary>
        /// Total number of cache hits
        /// </summary>
        public long HitCount { get; set; }

        /// <summary>
        /// Total number of cache misses
        /// </summary>
        public long MissCount { get; set; }

        /// <summary>
        /// Cache hit rate (0-1)
        /// </summary>
        public double HitRate => (HitCount + MissCount) > 0
            ? (double)HitCount / (HitCount + MissCount)
            : 0;
    }
}
