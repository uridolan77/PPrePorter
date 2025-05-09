using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.gRPC.Core.Interfaces;
using PPrePorter.gRPC.Core.Models;
using PPrePorter.PythonML.Configuration;
using PPrePorter.PythonML.Interfaces;
using PPrePorter.PythonML.Models;

namespace PPrePorter.PythonML.Services
{
    /// <summary>
    /// Implementation of the PythonML service that uses gRPC to communicate with Python.
    /// </summary>
    public class PythonMLService : IPythonMLService
    {
        private readonly IPythonMLClientFactory _clientFactory;
        private readonly PythonMLOptions _options;
        private readonly ILogger<PythonMLService> _logger;
        private readonly Dictionary<string, Dictionary<string, MLModel>> _modelCache = new();
        private readonly SemaphoreSlim _cacheLock = new(1, 1);

        /// <summary>
        /// Initializes a new instance of the PythonMLService class.
        /// </summary>
        /// <param name="clientFactory">The factory for creating gRPC clients.</param>
        /// <param name="options">The service options.</param>
        /// <param name="logger">The logger.</param>
        public PythonMLService(
            IPythonMLClientFactory clientFactory,
            IOptions<PythonMLOptions> options,
            ILogger<PythonMLService> logger)
        {
            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<PredictionResult> PredictAsync(
            string inputData,
            string? modelName = null,
            Dictionary<string, string>? parameters = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(inputData))
                throw new ArgumentException("Input data cannot be null or empty.", nameof(inputData));

            // Use default model if not specified
            modelName ??= _options.DefaultModel;

            _logger.LogInformation("Processing prediction with model: {ModelName}", modelName);
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var client = _clientFactory.CreateClient(_options.ClientInstanceName);
                
                // Process the data using the gRPC client
                var result = await client.ProcessDataAsync(
                    inputData,
                    modelName,
                    parameters,
                    null,  // version
                    null,  // stage
                    cancellationToken);

                stopwatch.Stop();

                // Convert to PredictionResult
                var predictionResult = new PredictionResult
                {
                    Result = result.Result,
                    Success = result.Success,
                    ErrorMessage = result.ErrorMessage,
                    ConfidenceScore = result.ConfidenceScore,
                    Metadata = result.Metadata,
                    ModelName = modelName,
                    ProcessingTimeMs = stopwatch.ElapsedMilliseconds
                };

                if (predictionResult.Success)
                {
                    _logger.LogInformation(
                        "Successfully processed prediction with model {ModelName} in {ElapsedMilliseconds}ms",
                        modelName, 
                        stopwatch.ElapsedMilliseconds);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to process prediction with model {ModelName}: {ErrorMessage}",
                        modelName, 
                        predictionResult.ErrorMessage);
                }

                return predictionResult;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "Error processing prediction with model {ModelName}: {ErrorMessage}",
                    modelName,
                    ex.Message);

                return new PredictionResult
                {
                    Success = false,
                    ErrorMessage = $"Error processing prediction: {ex.Message}",
                    ModelName = modelName,
                    ProcessingTimeMs = stopwatch.ElapsedMilliseconds
                };
            }
        }

        /// <inheritdoc/>
        public async Task<TrainingResult> TrainModelAsync(
            string trainingData,
            string modelName,
            Dictionary<string, string>? hyperparameters = null,
            bool validate = true,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(trainingData))
                throw new ArgumentException("Training data cannot be null or empty.", nameof(trainingData));
            
            if (string.IsNullOrEmpty(modelName))
                throw new ArgumentException("Model name cannot be null or empty.", nameof(modelName));

            _logger.LogInformation("Training model: {ModelName}", modelName);
            var startTime = DateTime.UtcNow;
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var client = _clientFactory.CreateClient(_options.ClientInstanceName);
                
                // Train the model using the gRPC client
                var result = await client.TrainModelAsync(
                    trainingData,
                    modelName,
                    hyperparameters,
                    validate,
                    null,  // framework
                    null,  // initialStage
                    cancellationToken);

                stopwatch.Stop();
                var endTime = DateTime.UtcNow;

                // Convert to TrainingResult
                var trainingResult = new TrainingResult
                {
                    Success = result.Success,
                    ErrorMessage = result.ErrorMessage,
                    ModelId = result.ModelId,
                    ModelName = modelName,
                    StartTime = startTime,
                    EndTime = endTime,
                    Metrics = result.Metrics
                };

                if (trainingResult.Success)
                {
                    _logger.LogInformation(
                        "Successfully trained model {ModelName} in {ElapsedMilliseconds}ms",
                        modelName, 
                        stopwatch.ElapsedMilliseconds);
                    
                    // Invalidate the model cache
                    await InvalidateModelCacheAsync(modelName, cancellationToken);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to train model {ModelName}: {ErrorMessage}",
                        modelName, 
                        trainingResult.ErrorMessage);
                }

                return trainingResult;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "Error training model {ModelName}: {ErrorMessage}",
                    modelName,
                    ex.Message);

                return new TrainingResult
                {
                    Success = false,
                    ErrorMessage = $"Error training model: {ex.Message}",
                    ModelName = modelName,
                    StartTime = startTime,
                    EndTime = DateTime.UtcNow
                };
            }
        }

        /// <inheritdoc/>
        public async Task<MLModel> GetModelInfoAsync(
            string modelName,
            string? version = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(modelName))
                throw new ArgumentException("Model name cannot be null or empty.", nameof(modelName));

            _logger.LogInformation("Getting info for model: {ModelName}, version: {Version}", modelName, version ?? "latest");

            try
            {                // Check the model cache first
                if (version != null)
                {
                    var (found, cachedModel) = await TryGetModelFromCacheAsync(modelName, version, cancellationToken);
                    if (found && cachedModel != null)
                    {
                        return cachedModel;
                    }
                }

                var client = _clientFactory.CreateClient(_options.ClientInstanceName);
                  // Get model info using the gRPC client
                var modelInfo = await client.GetModelInfoAsync(modelName, null, null, cancellationToken);

                // Convert to MLModel
                var mlModel = new MLModel
                {
                    Id = $"{modelName}:{modelInfo.Version}",
                    Name = modelName,
                    Version = modelInfo.Version,
                    Description = modelInfo.Description,
                    CreatedAt = DateTime.UtcNow, // This information might not be available from gRPC
                    UpdatedAt = DateTime.UtcNow,
                    SupportedOperations = modelInfo.SupportedOperations
                };                // Set the model type based on properties
                ModelType modelType = ModelType.Other;
                if (modelInfo.Properties.TryGetValue("type", out var typeStr) &&
                    Enum.TryParse<ModelType>(typeStr, true, out modelType))
                {
                    // modelType already set by TryParse
                }
                
                mlModel.Type = modelType;

                // Set the framework
                if (modelInfo.Properties.TryGetValue("framework", out var framework))
                {
                    mlModel.Framework = framework;
                }

                // Set metadata
                mlModel.Metadata = new Dictionary<string, string>(modelInfo.Properties);

                // Cache the model
                await CacheModelAsync(mlModel, cancellationToken);

                return mlModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error getting info for model {ModelName}: {ErrorMessage}",
                    modelName,
                    ex.Message);

                throw new InvalidOperationException($"Error getting model info: {ex.Message}", ex);
            }
        }

        /// <inheritdoc/>
        public async Task<IReadOnlyList<MLModel>> ListModelsAsync(
            ModelType? filter = null,
            bool includeVersions = false,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Listing models with filter: {Filter}", filter?.ToString() ?? "none");

            try
            {
                // We don't have a direct way to list models via gRPC yet
                // For now, return the models from the cache
                await _cacheLock.WaitAsync(cancellationToken);
                try
                {
                    var models = new List<MLModel>();

                    foreach (var modelVersions in _modelCache.Values)
                    {
                        if (includeVersions)
                        {
                            // Add all versions
                            models.AddRange(modelVersions.Values.Where(m => 
                                filter == null || m.Type == filter.Value));
                        }
                        else
                        {
                            // Add only the latest version
                            var latestVersion = modelVersions.Values
                                .OrderByDescending(m => m.Version)
                                .FirstOrDefault();

                            if (latestVersion != null && (filter == null || latestVersion.Type == filter.Value))
                            {
                                models.Add(latestVersion);
                            }
                        }
                    }

                    return models;
                }
                finally
                {
                    _cacheLock.Release();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing models: {ErrorMessage}", ex.Message);
                throw new InvalidOperationException($"Error listing models: {ex.Message}", ex);
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteModelAsync(
            string modelName,
            string? version = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(modelName))
                throw new ArgumentException("Model name cannot be null or empty.", nameof(modelName));

            _logger.LogInformation("Deleting model: {ModelName}, version: {Version}", modelName, version ?? "all versions");

            // For now, we'll just remove from the cache since our gRPC protocol doesn't yet support model deletion
            await _cacheLock.WaitAsync(cancellationToken);
            try
            {
                if (_modelCache.TryGetValue(modelName, out var versionDict))
                {
                    if (version == null)
                    {
                        // Remove all versions
                        _modelCache.Remove(modelName);
                        return true;
                    }
                    else
                    {
                        // Remove specific version
                        return versionDict.Remove(version);
                    }
                }

                return false;
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        /// <inheritdoc/>
        public async Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var client = _clientFactory.CreateClient(_options.ClientInstanceName);
                
                // Check health using the gRPC client
                var health = await client.CheckHealthAsync(cancellationToken: cancellationToken);
                
                return health.Status == HealthStatus.ServiceStatus.Serving;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking health: {ErrorMessage}", ex.Message);
                return false;
            }
        }

        #region Helper Methods
        
        private async Task<(bool found, MLModel? model)> TryGetModelFromCacheAsync(
            string modelName,
            string version,
            CancellationToken cancellationToken)
        {
            await _cacheLock.WaitAsync(cancellationToken);
            try
            {
                if (_modelCache.TryGetValue(modelName, out var versionDict) &&
                    versionDict.TryGetValue(version, out var model))
                {
                    return (true, model);
                }

                return (false, null);
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        private async Task CacheModelAsync(MLModel model, CancellationToken cancellationToken)
        {
            await _cacheLock.WaitAsync(cancellationToken);
            try
            {
                if (!_modelCache.TryGetValue(model.Name, out var versionDict))
                {
                    versionDict = new Dictionary<string, MLModel>();
                    _modelCache[model.Name] = versionDict;
                }

                versionDict[model.Version] = model;

                // Limit the number of versions in cache if configured
                if (_options.EnableModelVersioning && _options.MaxModelVersions > 0 &&
                    versionDict.Count > _options.MaxModelVersions)
                {
                    // Remove oldest versions
                    var versionsToRemove = versionDict.Keys
                        .OrderBy(v => v)
                        .Take(versionDict.Count - _options.MaxModelVersions)
                        .ToList();

                    foreach (var v in versionsToRemove)
                    {
                        versionDict.Remove(v);
                    }
                }
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        private async Task InvalidateModelCacheAsync(string modelName, CancellationToken cancellationToken)
        {
            await _cacheLock.WaitAsync(cancellationToken);
            try
            {
                _modelCache.Remove(modelName);
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        #endregion
    }
}