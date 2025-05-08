namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a filter condition extracted from a query
/// </summary>
public class Filter
{
    /// <summary>
    /// The dimension to filter on (country, game, etc.)
    /// </summary>
    public string Dimension { get; set; } = string.Empty;
    
    /// <summary>
    /// The operator for the filter (equals, greater_than, less_than, contains, in)
    /// </summary>
    public string Operator { get; set; } = string.Empty;
    
    /// <summary>
    /// The value to filter by
    /// </summary>
    public string Value { get; set; } = string.Empty;
    
    /// <summary>
    /// Indicates if the filter is negated (NOT condition)
    /// </summary>
    public bool IsNegated { get; set; }
    
    /// <summary>
    /// The mapped database field for the dimension
    /// </summary>
    public string? DatabaseField { get; set; }
    
    /// <summary>
    /// Confidence score of the entity extraction (0.0 to 1.0)
    /// </summary>
    public double MatchConfidence { get; set; } = 1.0;
}