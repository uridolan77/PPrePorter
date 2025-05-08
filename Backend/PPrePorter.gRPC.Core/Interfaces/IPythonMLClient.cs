using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using PPrePorter.gRPC.Core.Models;

namespace PPrePorter.gRPC.Core.Interfaces
{
    /// <summary>
    /// Interface for the PythonML gRPC client.
    /// </summary>
    public interface IPythonMLClient
    {
        /// <summary>
        /// Process data using a Python ML model.
        /// </summary>
        /// <param name="inputData">The input data for processing.</param>
        /// <param name="modelName">The name of the model to use.</param>
        /// <param name="parameters">Optional parameters for processing.</param>
        /// <param name="version">Optional specific version to use.</param>
        /// <param name="stage">Optional stage to select the model from (development, staging, production).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of processing the data.</returns>
        Task<ProcessResult> ProcessDataAsync(
            string inputData,
            string modelName,
            Dictionary<string, string>? parameters = null,
            string? version = null,
            string? stage = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Process data using a model and stream the results.
        /// </summary>
        /// <param name="inputData">The input data for processing.</param>
        /// <param name="modelName">The name of the model to use.</param>
        /// <param name="parameters">Optional parameters for processing.</param>
        /// <param name="version">Optional specific version to use.</param>
        /// <param name="stage">Optional stage to select the model from (development, staging, production).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A stream of process response chunks.</returns>
        IAsyncEnumerable<ProcessResultChunk> ProcessDataStreamAsync(
            string inputData,
            string modelName,
            Dictionary<string, string>? parameters = null,
            string? version = null,
            string? stage = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Train a Python ML model with provided data.
        /// </summary>
        /// <param name="trainingData">The training data.</param>
        /// <param name="modelName">The name of the model to train.</param>
        /// <param name="hyperparameters">Optional hyperparameters for training.</param>
        /// <param name="validate">Whether to validate the model after training.</param>
        /// <param name="framework">Optional ML framework to use (scikit-learn, tensorflow, pytorch).</param>
        /// <param name="initialStage">Optional initial stage for the model (defaults to development).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of training the model.</returns>
        Task<TrainResult> TrainModelAsync(
            string trainingData,
            string modelName,
            Dictionary<string, string>? hyperparameters = null,
            bool validate = true,
            string? framework = null,
            string? initialStage = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Train a model with streaming data.
        /// </summary>
        /// <param name="trainingDataStream">The stream of training data chunks.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of training the model.</returns>
        Task<TrainResult> TrainModelStreamAsync(
            IAsyncEnumerable<TrainRequestChunk> trainingDataStream,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Get information about a Python ML model.
        /// </summary>
        /// <param name="modelName">The name of the model.</param>
        /// <param name="version">Optional specific version to get info for.</param>
        /// <param name="stage">Optional stage to select the model from.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Information about the model.</returns>
        Task<ModelInfo> GetModelInfoAsync(
            string modelName,
            string? version = null,
            string? stage = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// List all available models with optional filtering.
        /// </summary>
        /// <param name="frameworkFilter">Optional filter by ML framework.</param>
        /// <param name="stageFilter">Optional filter by stage.</param>
        /// <param name="nameFilter">Optional filter by name pattern.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of model summaries.</returns>
        Task<IReadOnlyList<ModelSummary>> ListModelsAsync(
            string? frameworkFilter = null,
            string? stageFilter = null,
            string? nameFilter = null,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Change the stage of a model.
        /// </summary>
        /// <param name="modelName">The name of the model.</param>
        /// <param name="version">The version of the model.</param>
        /// <param name="newStage">The new stage for the model (development, staging, production, archived).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The result of the stage change operation.</returns>
        Task<ModelStageResult> ChangeModelStageAsync(
            string modelName,
            string version,
            string newStage,
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Check the health of the Python ML service.
        /// </summary>
        /// <param name="component">Optional component to check.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The health status of the service.</returns>
        Task<HealthStatus> CheckHealthAsync(
            string? component = null,
            CancellationToken cancellationToken = default);
    }
    
    /// <summary>
    /// Interface for a factory that creates PythonML clients.
    /// </summary>
    public interface IPythonMLClientFactory
    {
        /// <summary>
        /// Create a new PythonML client.
        /// </summary>
        /// <param name="instanceName">Optional instance name for the client.</param>
        /// <returns>A new PythonML client.</returns>
        IPythonMLClient CreateClient(string instanceName = "Default");
    }
}