using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents data for a player journey Sankey diagram
    /// </summary>
    public class PlayerJourneySankeyData
    {
        /// <summary>
        /// Nodes in the Sankey diagram
        /// </summary>
        public List<SankeyNode> Nodes { get; set; } = new List<SankeyNode>();

        /// <summary>
        /// Links between nodes in the Sankey diagram
        /// </summary>
        public List<SankeyLink> Links { get; set; } = new List<SankeyLink>();
    }

    /// <summary>
    /// Represents a node in a Sankey diagram
    /// </summary>
    public class SankeyNode
    {
        /// <summary>
        /// Node ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Node name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Node category
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Node value
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Node color
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Node stage in the journey (0-based)
        /// </summary>
        public int Stage { get; set; }
    }

    /// <summary>
    /// Represents a link between nodes in a Sankey diagram
    /// </summary>
    public class SankeyLink
    {
        /// <summary>
        /// Source node ID
        /// </summary>
        public string Source { get; set; }

        /// <summary>
        /// Target node ID
        /// </summary>
        public string Target { get; set; }

        /// <summary>
        /// Link value (width)
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Link color
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Link label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Conversion rate (percentage)
        /// </summary>
        public decimal ConversionRate { get; set; }
    }
}
