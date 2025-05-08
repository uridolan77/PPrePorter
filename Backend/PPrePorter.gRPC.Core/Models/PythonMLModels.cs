using System;
using System.Collections.Generic;

namespace PPrePorter.gRPC.Core.Models
{
    /// <summary>
    /// Represents the result of processing data with a Python ML model.
    /// </summary>
    public class ProcessResult
    {
        /// <summary>
        /// The processed result data.
        /// </summary>
        public string Result { get; set; } = string.Empty;
        
        /// <summary>
        /// Indicates whether processing was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The error message if processing failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// The confidence score of the result (if applicable).
        /// </summary>
        public float ConfidenceScore { get; set; }
        
        /// <summary>
        /// Additional metadata from the processing operation.
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Represents the result of training a Python ML model.
    /// </summary>
    public class TrainResult
    {
        /// <summary>
        /// Indicates whether training was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The unique identifier for the trained model.
        /// </summary>
        public string ModelId { get; set; } = string.Empty;
        
        /// <summary>
        /// The error message if training failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// Performance metrics for the trained model.
        /// </summary>
        public Dictionary<string, float> Metrics { get; set; } = new Dictionary<string, float>();
    }
    
    /// <summary>
    /// Represents information about a Python ML model.
    /// </summary>
    public class ModelInfo
    {
        /// <summary>
        /// The name of the model.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model.
        /// </summary>
        public string Version { get; set; } = string.Empty;
        
        /// <summary>
        /// The description of the model.
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// The operations supported by the model.
        /// </summary>
        public List<string> SupportedOperations { get; set; } = new List<string>();
        
        /// <summary>
        /// Additional properties of the model.
        /// </summary>
        public Dictionary<string, string> Properties { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// The ML framework used by the model (e.g., scikit-learn, tensorflow, pytorch).
        /// </summary>
        public string Framework { get; set; } = string.Empty;

        /// <summary>
        /// The current stage of the model (development, staging, production, archived).
        /// </summary>
        public string Stage { get; set; } = string.Empty;

        /// <summary>
        /// When the model was created.
        /// </summary>
        public string CreatedAt { get; set; } = string.Empty;

        /// <summary>
        /// When the model was last updated.
        /// </summary>
        public string UpdatedAt { get; set; } = string.Empty;

        /// <summary>
        /// All available versions of this model.
        /// </summary>
        public List<string> AvailableVersions { get; set; } = new List<string>();

        /// <summary>
        /// Mapping of stages to versions.
        /// </summary>
        public Dictionary<string, string> StageVersions { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Represents the health status of the Python ML service.
    /// </summary>
    public class HealthStatus
    {
        /// <summary>
        /// The status of the service.
        /// </summary>
        public ServiceStatus Status { get; set; }
        
        /// <summary>
        /// Additional details about the health status.
        /// </summary>
        public string Message { get; set; } = string.Empty;
        
        /// <summary>
        /// Enum representing different service health statuses.
        /// </summary>
        public enum ServiceStatus
        {
            /// <summary>
            /// Unknown status.
            /// </summary>
            Unknown = 0,
            
            /// <summary>
            /// Service is up and running.
            /// </summary>
            Serving = 1,
            
            /// <summary>
            /// Service is not available.
            /// </summary>
            NotServing = 2,
            
            /// <summary>
            /// Service exists but its status is unknown.
            /// </summary>
            ServiceUnknown = 3
        }
    }
    
    /// <summary>
    /// Exception thrown when PythonML operations fail.
    /// </summary>
    public class PythonMLException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the PythonMLException class.
        /// </summary>
        /// <param name="message">The error message.</param>
        public PythonMLException(string message) : base(message) { }
        
        /// <summary>
        /// Initializes a new instance of the PythonMLException class.
        /// </summary>
        /// <param name="message">The error message.</param>
        /// <param name="innerException">The inner exception.</param>
        public PythonMLException(string message, Exception innerException) 
            : base(message, innerException) { }
    }
    
    /// <summary>
    /// Represents the result of changing a model's stage.
    /// </summary>
    public class ModelStageResult
    {
        /// <summary>
        /// Indicates whether the stage change was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The name of the model.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model.
        /// </summary>
        public string Version { get; set; } = string.Empty;
        
        /// <summary>
        /// The previous stage of the model.
        /// </summary>
        public string PreviousStage { get; set; } = string.Empty;
        
        /// <summary>
        /// The new stage of the model.
        /// </summary>
        public string NewStage { get; set; } = string.Empty;
        
        /// <summary>
        /// The error message if the stage change failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Represents a summary of a Python ML model.
    /// Used in listing multiple models.
    /// </summary>
    public class ModelSummary
    {
        /// <summary>
        /// The name of the model.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model.
        /// </summary>
        public string Version { get; set; } = string.Empty;
        
        /// <summary>
        /// The description of the model.
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// The ML framework used by the model.
        /// </summary>
        public string Framework { get; set; } = string.Empty;
        
        /// <summary>
        /// The current stage of the model.
        /// </summary>
        public string Stage { get; set; } = string.Empty;
        
        /// <summary>
        /// When the model was created.
        /// </summary>
        public string CreatedAt { get; set; } = string.Empty;
        
        /// <summary>
        /// When the model was last updated.
        /// </summary>
        public string UpdatedAt { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Represents a chunk of a streamed processing result.
    /// </summary>
    public class ProcessResultChunk
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
    
    /// <summary>
    /// Represents a chunk of training data for streaming training.
    /// </summary>
    public class TrainRequestChunk
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
        public string? ModelName { get; set; }
        
        /// <summary>
        /// Hyperparameters for training.
        /// Only needed in the first chunk.
        /// </summary>
        public Dictionary<string, string>? Hyperparameters { get; set; }
        
        /// <summary>
        /// Whether to validate the model after training.
        /// Only needed in the first chunk.
        /// </summary>
        public bool? Validate { get; set; }
        
        /// <summary>
        /// The ML framework to use.
        /// Only needed in the first chunk.
        /// </summary>
        public string? Framework { get; set; }
        
        /// <summary>
        /// The initial stage for the model.
        /// Only needed in the first chunk.
        /// </summary>
        public string? InitialStage { get; set; }
    }
}