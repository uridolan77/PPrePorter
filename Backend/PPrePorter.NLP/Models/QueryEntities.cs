using System.Collections.Generic;

namespace PPrePorter.NLP.Models;

/// <summary>
/// Container for all entities extracted from a natural language query
/// </summary>
public class QueryEntities
{
    /// <summary>
    /// Time range information extracted from the query
    /// </summary>
    public TimeRange? TimeRange { get; set; }
    
    /// <summary>
    /// Metrics to be calculated (e.g., revenue, deposits, etc.)
    /// </summary>
    public List<Metric>? Metrics { get; set; }
    
    /// <summary>
    /// Dimensions for grouping/segmentation (e.g., country, game, etc.)
    /// </summary>
    public List<Dimension>? Dimensions { get; set; }
    
    /// <summary>
    /// Filter conditions to apply to the query
    /// </summary>
    public List<Filter>? Filters { get; set; }
    
    /// <summary>
    /// Sorting criteria for the results
    /// </summary>
    public SortOption? SortBy { get; set; }
    
    /// <summary>
    /// Limit for the number of results (e.g., top 10)
    /// </summary>
    public int? Limit { get; set; }
    
    /// <summary>
    /// Time-based comparison operations
    /// </summary>
    public List<Comparison>? Comparisons { get; set; }
    
    /// <summary>
    /// Entity conflicts or ambiguities that need clarification
    /// </summary>
    public List<EntityConflict>? Conflicts { get; set; }
    
    /// <summary>
    /// Overall confidence score for the entity extraction (0.0 to 1.0)
    /// </summary>
    public double OverallConfidence { get; set; } = 1.0;
}