using System.Collections.Generic;

namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a response chunk from the streaming data processing.
    /// </summary>
    public class ProcessStreamResponse
    {
        /// <summary>
        /// The chunk of processed result data.
        /// </summary>
        public string ResultChunk { get; set; } = string.Empty;
        
        /// <summary>
        /// Indicates whether this is the last chunk.
        /// </summary>
        public bool IsLastChunk { get; set; }
        
        /// <summary>
        /// Indicates whether processing was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The error message if processing failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// The ID of this chunk.
        /// </summary>
        public int ChunkId { get; set; }
        
        /// <summary>
        /// The total number of chunks.
        /// </summary>
        public int TotalChunks { get; set; }
        
        /// <summary>
        /// The confidence score (only available in the last chunk).
        /// </summary>
        public float ConfidenceScore { get; set; }
        
        /// <summary>
        /// Additional metadata (only available in the last chunk).
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
}
