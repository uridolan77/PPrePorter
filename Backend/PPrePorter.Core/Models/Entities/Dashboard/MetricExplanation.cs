using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an explanation of a metric for the dashboard
    /// </summary>
    public class MetricExplanation
    {
        /// <summary>
        /// Metric key
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Display name of the metric
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Description of the metric
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Category of the metric (e.g., "Revenue", "Player", "Game")
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Formula used to calculate the metric
        /// </summary>
        public string Formula { get; set; }

        /// <summary>
        /// Unit of measurement (e.g., "currency", "count", "percentage")
        /// </summary>
        public string Unit { get; set; }

        /// <summary>
        /// Interpretation guidelines for the metric
        /// </summary>
        public string Interpretation { get; set; }

        /// <summary>
        /// Typical range of values for the metric
        /// </summary>
        public string TypicalRange { get; set; }

        /// <summary>
        /// Factors that influence the metric
        /// </summary>
        public List<string> InfluencingFactors { get; set; } = new List<string>();

        /// <summary>
        /// Related metrics
        /// </summary>
        public List<string> RelatedMetrics { get; set; } = new List<string>();

        /// <summary>
        /// Best practices for improving the metric
        /// </summary>
        public List<string> BestPractices { get; set; } = new List<string>();

        /// <summary>
        /// Common misconceptions about the metric
        /// </summary>
        public List<string> CommonMisconceptions { get; set; } = new List<string>();

        /// <summary>
        /// Examples of the metric in context
        /// </summary>
        public List<MetricExample> Examples { get; set; } = new List<MetricExample>();

        /// <summary>
        /// Experience level required to understand the metric (1-3)
        /// </summary>
        public int ExperienceLevel { get; set; }
    }

    /// <summary>
    /// Represents an example of a metric in context
    /// </summary>
    public class MetricExample
    {
        /// <summary>
        /// Scenario description
        /// </summary>
        public string Scenario { get; set; }

        /// <summary>
        /// Value of the metric in the scenario
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Interpretation of the value in the scenario
        /// </summary>
        public string Interpretation { get; set; }

        /// <summary>
        /// Recommended actions based on the value
        /// </summary>
        public List<string> RecommendedActions { get; set; } = new List<string>();
    }
}
