namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a dimension entity extracted from a query for grouping/segmentation
/// </summary>
public class Dimension
{
    /// <summary>
    /// The name of the dimension (game, country, etc.)
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// The mapped database field for this dimension
    /// </summary>
    public string? DatabaseField { get; set; }
    
    /// <summary>
    /// Confidence score of the entity extraction (0.0 to 1.0)
    /// </summary>
    public double MatchConfidence { get; set; } = 1.0;
    
    /// <summary>
    /// Indicates if this dimension couldn't be resolved to a known database field
    /// </summary>
    public bool IsUnresolved { get; set; }
}