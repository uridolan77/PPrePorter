using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents an insight generated from dashboard data
    /// </summary>
    public class DashboardInsight
    {
        /// <summary>
        /// Unique identifier for the insight
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Title of the insight
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description of the insight
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Category of the insight (e.g., "Summary", "Revenue", "Registration", "Game", "Transaction")
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Importance level (1-10, with 10 being most important)
        /// </summary>
        public int Importance { get; set; }

        /// <summary>
        /// Date and time when the insight was generated
        /// </summary>
        public DateTime GeneratedAt { get; set; }

        /// <summary>
        /// Metric key associated with the insight (if applicable)
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Trend direction ("Positive", "Negative", "Neutral")
        /// </summary>
        public string TrendDirection { get; set; }

        /// <summary>
        /// Type of insight ("Pattern", "Anomaly", "Forecast", "Correlation")
        /// </summary>
        public string InsightType { get; set; }

        /// <summary>
        /// Supporting data points for the insight
        /// </summary>
        public List<DataPoint> SupportingData { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Recommended actions based on the insight
        /// </summary>
        public List<string> RecommendedActions { get; set; } = new List<string>();

        /// <summary>
        /// Related insights
        /// </summary>
        public List<int> RelatedInsightIds { get; set; } = new List<int>();

        /// <summary>
        /// Tags associated with the insight
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// Confidence score for the insight (0-1)
        /// </summary>
        public double ConfidenceScore { get; set; }

        /// <summary>
        /// Whether the insight has been read by the user
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// Whether the insight has been bookmarked by the user
        /// </summary>
        public bool IsBookmarked { get; set; }

        /// <summary>
        /// User ID who generated the insight
        /// </summary>
        public int UserId { get; set; }
    }
}
