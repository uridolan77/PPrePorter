using System.Collections.Generic;

namespace PPrePorter.gRPC.Core
{
    // Add missing gRPC type references
    // These are just for compilation, the actual classes are generated from proto files

    /// <summary>
    /// Represents a request to change a model's stage.
    /// This is a wrapper for the protobuf generated ModelStageRequest.
    /// </summary>
    public class ChangeModelStageRequest
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
        /// The new stage for the model.
        /// </summary>
        public string NewStage { get; set; } = string.Empty;
    }
}
