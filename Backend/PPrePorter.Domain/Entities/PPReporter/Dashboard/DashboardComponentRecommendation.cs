using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a recommendation for a dashboard component
    /// </summary>
    public class DashboardComponentRecommendation
    {
        /// <summary>
        /// Component identifier
        /// </summary>
        public string ComponentId { get; set; }

        /// <summary>
        /// Component type
        /// </summary>
        public string ComponentType { get; set; }

        /// <summary>
        /// Title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Recommendation score (0-1)
        /// </summary>
        public double Score { get; set; }

        /// <summary>
        /// Relevance score
        /// </summary>
        public double RelevanceScore { get; set; }

        /// <summary>
        /// Reason for the recommendation
        /// </summary>
        public string RecommendationReason { get; set; }

        /// <summary>
        /// Related metrics
        /// </summary>
        public List<string> RelatedMetrics { get; set; }

        /// <summary>
        /// Target user role
        /// </summary>
        public string TargetUserRole { get; set; }

        /// <summary>
        /// Visualization type
        /// </summary>
        public string VisualizationType { get; set; }

        /// <summary>
        /// Configuration parameters
        /// </summary>
        public Dictionary<string, object> ConfigurationParams { get; set; }
    }
}
