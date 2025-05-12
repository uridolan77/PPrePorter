using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a recommended dashboard component for a user
    /// </summary>
    public class DashboardComponentRecommendation
    {
        /// <summary>
        /// ID of the recommended component
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Type of component (e.g., "Chart", "Table", "KPI")
        /// </summary>
        public string ComponentType { get; set; }

        /// <summary>
        /// Title of the component
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description of the component
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Relevance score (0-1) indicating how relevant this component is to the user
        /// </summary>
        public double RelevanceScore { get; set; }

        /// <summary>
        /// Reason for recommending this component
        /// </summary>
        public string RecommendationReason { get; set; }

        /// <summary>
        /// List of metrics related to this component
        /// </summary>
        public List<string> RelatedMetrics { get; set; }

        /// <summary>
        /// Target user role for this recommendation
        /// </summary>
        public string TargetUserRole { get; set; }

        /// <summary>
        /// Type of visualization (e.g., "line", "bar", "pie")
        /// </summary>
        public string VisualizationType { get; set; }

        /// <summary>
        /// Configuration parameters for the component
        /// </summary>
        public Dictionary<string, object> ConfigurationParams { get; set; }
    }
}
