namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Request for changing a model's stage.
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
