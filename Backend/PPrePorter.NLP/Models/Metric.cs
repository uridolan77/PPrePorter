namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a metric entity extracted from a query
/// </summary>
public class Metric
{
    /// <summary>
    /// The name of the metric (revenue, deposits, etc.)
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Aggregation function to apply (sum, avg, max, min, count)
    /// </summary>
    public string? Aggregation { get; set; }
    
    /// <summary>
    /// The mapped database field for this metric
    /// </summary>
    public string? DatabaseField { get; set; }
    
    /// <summary>
    /// Confidence score of the entity extraction (0.0 to 1.0)
    /// </summary>
    public double MatchConfidence { get; set; } = 1.0;
    
    /// <summary>
    /// Indicates if this metric couldn't be resolved to a known database field
    /// </summary>
    public bool IsUnresolved { get; set; }
}