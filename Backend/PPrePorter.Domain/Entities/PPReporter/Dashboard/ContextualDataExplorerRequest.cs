using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Request for contextual data exploration
    /// </summary>
    public class ContextualDataExplorerRequest
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// White label ID
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// Play mode
        /// </summary>
        public string PlayMode { get; set; }

        /// <summary>
        /// Start date for data
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// End date for data
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Context for exploration (e.g., "revenue", "players", "games")
        /// </summary>
        public string ExplorationContext { get; set; }

        /// <summary>
        /// Context for exploration (alias for ExplorationContext)
        /// </summary>
        public string Context {
            get => ExplorationContext;
            set => ExplorationContext = value;
        }

        /// <summary>
        /// The key to drill down on (e.g., a specific game ID, player segment)
        /// </summary>
        public string DrillDownKey { get; set; }

        /// <summary>
        /// How deep to drill down into the data
        /// </summary>
        public int? DrillDownLevel { get; set; }

        /// <summary>
        /// Dimensions to analyze (e.g., "time", "geography", "player_segment")
        /// </summary>
        public List<string> Dimensions { get; set; }

        /// <summary>
        /// Dimension to explore (alias for first dimension in Dimensions)
        /// </summary>
        public string Dimension {
            get => Dimensions?.Count > 0 ? Dimensions[0] : null;
            set {
                if (Dimensions == null)
                    Dimensions = new List<string>();
                if (Dimensions.Count == 0)
                    Dimensions.Add(value);
                else
                    Dimensions[0] = value;
            }
        }

        /// <summary>
        /// Metrics to include (e.g., "revenue", "active_players", "conversion_rate")
        /// </summary>
        public List<string> Metrics { get; set; }

        /// <summary>
        /// Parameters for scenario modeling
        /// </summary>
        public Dictionary<string, object> ScenarioParameters { get; set; }

        /// <summary>
        /// Whether to apply predictive modeling
        /// </summary>
        public bool EnablePredictiveModeling { get; set; }
    }
}