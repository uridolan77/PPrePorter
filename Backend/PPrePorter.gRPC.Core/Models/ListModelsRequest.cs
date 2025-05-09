namespace PPrePorter.gRPC.Core.Models.Client
{
    /// <summary>
    /// Represents a request for listing models.
    /// </summary>
    public class ListModelsRequest
    {
        /// <summary>
        /// Filter by framework (e.g., tensorflow, pytorch, scikit-learn).
        /// </summary>
        public string? FrameworkFilter { get; set; }
        
        /// <summary>
        /// Filter by stage (e.g., production, staging, development).
        /// </summary>
        public string? StageFilter { get; set; }
        
        /// <summary>
        /// Filter by model name pattern.
        /// </summary>
        public string? NameFilter { get; set; }
        
        /// <summary>
        /// Include all versions of each model instead of just the latest.
        /// </summary>
        public bool IncludeAllVersions { get; set; }
    }
}
