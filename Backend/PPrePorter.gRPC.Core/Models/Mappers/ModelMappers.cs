using System.Collections.Generic;

namespace PPrePorter.gRPC.Core.Models.Mappers
{
    /// <summary>
    /// Provides mapping functions between client models and proto-generated models.
    /// </summary>
    internal static class ModelMappers
    {
        /// <summary>
        /// Maps a client ProcessRequest to a proto ProcessRequest.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request.</returns>
        public static ProcessRequest ToProto(this Models.Client.ProcessStreamRequest request)
        {
            var result = new ProcessRequest
            {
                InputData = request.InputData,
                ModelName = request.ModelName
            };

            if (!string.IsNullOrEmpty(request.Version))
            {
                result.Version = request.Version;
            }

            if (!string.IsNullOrEmpty(request.Stage))
            {
                result.Stage = request.Stage;
            }

            foreach (var param in request.Parameters)
            {
                result.Parameters.Add(param.Key, param.Value);
            }

            return result;
        }

        /// <summary>
        /// Maps a client ModelInfoRequest to a proto ModelInfoRequest.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request.</returns>
        public static ModelInfoRequest ToProto(this Models.Client.ModelInfoRequest request)
        {
            var result = new ModelInfoRequest
            {
                ModelName = request.ModelName
            };

            if (!string.IsNullOrEmpty(request.Version))
            {
                result.Version = request.Version;
            }

            if (!string.IsNullOrEmpty(request.Stage))
            {
                result.Stage = request.Stage;
            }

            return result;
        }

        /// <summary>
        /// Maps a client ListModelsRequest to a proto ListModelsRequest.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request.</returns>
        public static ListModelsRequest ToProto(this Models.Client.ListModelsRequest request)
        {
            var result = new ListModelsRequest
            {
                IncludeAllVersions = request.IncludeAllVersions
            };

            if (!string.IsNullOrEmpty(request.FrameworkFilter))
            {
                result.FrameworkFilter = request.FrameworkFilter;
            }

            if (!string.IsNullOrEmpty(request.StageFilter))
            {
                result.StageFilter = request.StageFilter;
            }

            if (!string.IsNullOrEmpty(request.NameFilter))
            {
                result.NameFilter = request.NameFilter;
            }

            return result;
        }

        /// <summary>
        /// Maps a client ModelStageRequest to a proto ModelStageRequest.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request.</returns>
        public static ModelStageRequest ToProto(this Models.Client.ChangeModelStageRequest request)
        {
            var result = new ModelStageRequest
            {
                ModelName = request.ModelName,
                Version = request.Version,
                NewStage = request.NewStage
            };

            return result;
        }

        /// <summary>
        /// Maps a client HealthCheckRequest to a proto HealthCheckRequest.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request.</returns>
        public static HealthCheckRequest ToProto(this Models.Client.HealthCheckRequest request)
        {
            var result = new HealthCheckRequest();

            if (!string.IsNullOrEmpty(request.Component))
            {
                result.Component = request.Component;
            }

            return result;
        }

        /// <summary>
        /// Maps a client TrainStreamRequest to a proto TrainRequestChunk.
        /// </summary>
        /// <param name="request">The client request.</param>
        /// <returns>The proto request chunk.</returns>
        public static TrainRequestChunk ToProto(this Models.Client.TrainStreamRequest request)
        {
            var result = new TrainRequestChunk
            {
                TrainingDataChunk = request.TrainingDataChunk,
                IsLastChunk = request.IsLastChunk,
                ChunkId = request.ChunkId,
                TotalChunks = request.TotalChunks
            };

            if (!string.IsNullOrEmpty(request.ModelName))
            {
                result.ModelName = request.ModelName;
            }

            result.Validate = request.Validate;

            if (!string.IsNullOrEmpty(request.Framework))
            {
                result.Framework = request.Framework;
            }

            if (!string.IsNullOrEmpty(request.InitialStage))
            {
                result.InitialStage = request.InitialStage;
            }

            foreach (var param in request.Hyperparameters)
            {
                result.Hyperparameters.Add(param.Key, param.Value);
            }

            return result;
        }
    }
}
