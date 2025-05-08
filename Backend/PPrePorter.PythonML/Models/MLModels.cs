using System;
using System.Collections.Generic;

namespace PPrePorter.PythonML.Models
{
    /// <summary>
    /// Represents a machine learning model.
    /// </summary>
    public class MLModel
    {
        /// <summary>
        /// The unique identifier of the model.
        /// </summary>
        public string Id { get; set; } = string.Empty;
        
        /// <summary>
        /// The name of the model.
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model.
        /// </summary>
        public string Version { get; set; } = string.Empty;
        
        /// <summary>
        /// The description of the model.
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// The creation date of the model.
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// The last update date of the model.
        /// </summary>
        public DateTime UpdatedAt { get; set; }
        
        /// <summary>
        /// The type of the model.
        /// </summary>
        public ModelType Type { get; set; }
        
        /// <summary>
        /// The framework used to build the model.
        /// </summary>
        public string Framework { get; set; } = string.Empty;
        
        /// <summary>
        /// The operations supported by the model.
        /// </summary>
        public List<string> SupportedOperations { get; set; } = new List<string>();
        
        /// <summary>
        /// Additional model metadata.
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// The type of machine learning model.
    /// </summary>
    public enum ModelType
    {
        /// <summary>
        /// Classification model.
        /// </summary>
        Classification,
        
        /// <summary>
        /// Regression model.
        /// </summary>
        Regression,
        
        /// <summary>
        /// Clustering model.
        /// </summary>
        Clustering,
        
        /// <summary>
        /// Natural language processing model.
        /// </summary>
        NLP,
        
        /// <summary>
        /// Computer vision model.
        /// </summary>
        Vision,
        
        /// <summary>
        /// Time series model.
        /// </summary>
        TimeSeries,
        
        /// <summary>
        /// Recommendation model.
        /// </summary>
        Recommendation,
        
        /// <summary>
        /// Anomaly detection model.
        /// </summary>
        AnomalyDetection,
        
        /// <summary>
        /// Other model type.
        /// </summary>
        Other
    }
    
    /// <summary>
    /// Represents the result of a prediction or inference operation.
    /// </summary>
    public class PredictionResult
    {
        /// <summary>
        /// The unique identifier of the prediction.
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// The result of the prediction.
        /// </summary>
        public string Result { get; set; } = string.Empty;
        
        /// <summary>
        /// Indicates whether the prediction was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The error message if the prediction failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// The confidence score of the prediction.
        /// </summary>
        public float ConfidenceScore { get; set; }
        
        /// <summary>
        /// The timestamp of the prediction.
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// The model used for the prediction.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the model used for the prediction.
        /// </summary>
        public string ModelVersion { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional metadata about the prediction.
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
        
        /// <summary>
        /// The processing time in milliseconds.
        /// </summary>
        public long ProcessingTimeMs { get; set; }
    }
    
    /// <summary>
    /// Represents the result of a training operation.
    /// </summary>
    public class TrainingResult
    {
        /// <summary>
        /// The unique identifier of the training operation.
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// Indicates whether the training was successful.
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The error message if the training failed.
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// The identifier of the trained model.
        /// </summary>
        public string ModelId { get; set; } = string.Empty;
        
        /// <summary>
        /// The name of the trained model.
        /// </summary>
        public string ModelName { get; set; } = string.Empty;
        
        /// <summary>
        /// The version of the trained model.
        /// </summary>
        public string ModelVersion { get; set; } = string.Empty;
        
        /// <summary>
        /// The start time of the training.
        /// </summary>
        public DateTime StartTime { get; set; }
        
        /// <summary>
        /// The end time of the training.
        /// </summary>
        public DateTime EndTime { get; set; }
        
        /// <summary>
        /// The performance metrics of the trained model.
        /// </summary>
        public Dictionary<string, float> Metrics { get; set; } = new Dictionary<string, float>();
        
        /// <summary>
        /// Additional metadata about the training.
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
}