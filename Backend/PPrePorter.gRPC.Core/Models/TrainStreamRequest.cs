using System.Collections.Generic;

namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a request chunk for streaming model training.
    /// </summary>
    public class TrainStreamRequest
    {
        /// <summary>
        /// The chunk of training data.
        /// </summary>
        public string TrainingDataChunk { get; set; } = string.Empty;
        
        /// <summary>
        /// Indicates whether this is the last chunk.
        /// </summary>
        public bool IsLastChunk { get; set; }
        
        /// <summary>
        /// The ID of this chunk.
        /// </summary>
        public int ChunkId { get; set; }
        
        /// <summary>
        /// The total number of chunks.
        /// </summary>
        public int TotalChunks { get; set; }
        
        /// <summary>
        /// The name of the model to train.
        /// Only needed in the first chunk.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// Hyperparameters for training.
        /// Only needed in the first chunk.
        /// </summary>
        public Dictionary<string, string> Hyperparameters { get; set; } = new Dictionary<string, string>();
        
        /// <summary>
        /// Whether to validate the model after training.
        /// Only needed in the first chunk.
        /// </summary>
        public bool Validate { get; set; }
        
        /// <summary>
        /// The ML framework to use.
        /// Only needed in the first chunk.
        /// </summary>
        public string Framework { get; set; } = string.Empty;
        
        /// <summary>
        /// The initial stage for the model.
        /// Only needed in the first chunk.
        /// </summary>
        public string InitialStage { get; set; } = string.Empty;
    }
}
