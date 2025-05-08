using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class ContextualDataExplorerRequest
    {
        public string UserId { get; set; }
        public int? WhiteLabelId { get; set; }
        public string PlayMode { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        // Specific to contextual exploration
        public string ExplorationContext { get; set; } // e.g., "revenue", "players", "games"
        public string DrillDownKey { get; set; } // The key to drill down on, e.g., a specific game ID, player segment
        public int? DrillDownLevel { get; set; } // How deep to drill down into the data
        public List<string> Dimensions { get; set; } // Dimensions to analyze (e.g., "time", "geography", "player_segment")
        public List<string> Metrics { get; set; } // Metrics to include (e.g., "revenue", "active_players", "conversion_rate")
        
        // For "what-if" scenario modeling
        public Dictionary<string, object> ScenarioParameters { get; set; } // Parameters for scenario modeling
        public bool EnablePredictiveModeling { get; set; } // Whether to apply predictive modeling
    }
}