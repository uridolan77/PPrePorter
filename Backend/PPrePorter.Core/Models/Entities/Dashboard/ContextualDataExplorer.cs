using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a request for contextual data exploration
    /// </summary>
    public class ContextualDataExplorerRequest
    {
        /// <summary>
        /// Natural language query
        /// </summary>
        public string Query { get; set; }

        /// <summary>
        /// Start date for the data
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date for the data
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// White label ID filter (optional)
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// Game ID filter (optional)
        /// </summary>
        public int? GameId { get; set; }

        /// <summary>
        /// Country code filter (optional)
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Player ID filter (optional)
        /// </summary>
        public int? PlayerId { get; set; }

        /// <summary>
        /// User ID making the request
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Maximum number of results to return
        /// </summary>
        public int Limit { get; set; } = 100;
    }

    /// <summary>
    /// Represents the result of contextual data exploration
    /// </summary>
    public class ContextualDataExplorerResult
    {
        /// <summary>
        /// Original query
        /// </summary>
        public string Query { get; set; }

        /// <summary>
        /// Interpreted query
        /// </summary>
        public string InterpretedQuery { get; set; }

        /// <summary>
        /// Data points matching the query
        /// </summary>
        public List<ExplorerDataPoint> DataPoints { get; set; } = new List<ExplorerDataPoint>();

        /// <summary>
        /// Metrics included in the result
        /// </summary>
        public List<string> Metrics { get; set; } = new List<string>();

        /// <summary>
        /// Dimensions included in the result
        /// </summary>
        public List<string> Dimensions { get; set; } = new List<string>();

        /// <summary>
        /// Filters applied to the result
        /// </summary>
        public Dictionary<string, object> Filters { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Suggested follow-up queries
        /// </summary>
        public List<string> SuggestedQueries { get; set; } = new List<string>();

        /// <summary>
        /// Insights derived from the data
        /// </summary>
        public List<DashboardInsight> Insights { get; set; } = new List<DashboardInsight>();

        /// <summary>
        /// Visualization type recommended for the data
        /// </summary>
        public string RecommendedVisualization { get; set; }

        /// <summary>
        /// Confidence score for the result (0-1)
        /// </summary>
        public double ConfidenceScore { get; set; }
    }

    /// <summary>
    /// Represents a data point in the explorer result
    /// </summary>
    public class ExplorerDataPoint
    {
        /// <summary>
        /// Label for the data point
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Dimension values for the data point
        /// </summary>
        public Dictionary<string, object> Dimensions { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Metric values for the data point
        /// </summary>
        public Dictionary<string, decimal> Metrics { get; set; } = new Dictionary<string, decimal>();

        /// <summary>
        /// Timestamp for the data point
        /// </summary>
        public DateTime? Timestamp { get; set; }
    }
}
