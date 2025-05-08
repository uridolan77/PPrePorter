using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using PPrePorter.PythonML.Models;

namespace PPrePorter.PythonML.Interfaces
{
    /// <summary>
    /// Interface for the PythonML service.
    /// </summary>
    public interface IPythonMLService
    {
        /// <summary>
        /// Process data using a machine learning model.
        /// </summary>
        /// <param name="inputData">The input data to process.</param>
        /// <param name="modelName">The name of the model to use.</param>
        /// <param name="parameters">Optional parameters for processing.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of the prediction.</returns>
        Task<PredictionResult> PredictAsync(
            string inputData,
            string? modelName = null,
            Dictionary<string, string>? parameters = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Train a machine learning model with the provided data.
        /// </summary>
        /// <param name="trainingData">The training data.</param>
        /// <param name="modelName">The name of the model to train.</param>
        /// <param name="hyperparameters">Optional hyperparameters for training.</param>
        /// <param name="validate">Whether to validate the model after training.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of the training operation.</returns>
        Task<TrainingResult> TrainModelAsync(
            string trainingData,
            string modelName,
            Dictionary<string, string>? hyperparameters = null,
            bool validate = true,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Get information about a machine learning model.
        /// </summary>
        /// <param name="modelName">The name of the model.</param>
        /// <param name="version">The version of the model (optional).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Information about the model.</returns>
        Task<MLModel> GetModelInfoAsync(
            string modelName,
            string? version = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// List all available machine learning models.
        /// </summary>
        /// <param name="filter">Optional filter for model types.</param>
        /// <param name="includeVersions">Whether to include all versions of each model.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of available models.</returns>
        Task<IReadOnlyList<MLModel>> ListModelsAsync(
            ModelType? filter = null,
            bool includeVersions = false,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Delete a machine learning model.
        /// </summary>
        /// <param name="modelName">The name of the model to delete.</param>
        /// <param name="version">The version of the model to delete (optional).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>True if the model was deleted; otherwise, false.</returns>
        Task<bool> DeleteModelAsync(
            string modelName,
            string? version = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Check if the PythonML service is healthy.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>True if the service is healthy; otherwise, false.</returns>
        Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default);
    }
}