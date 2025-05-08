namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents sorting criteria extracted from a query
/// </summary>
public class SortOption
{
    /// <summary>
    /// The field to sort by (typically a metric)
    /// </summary>
    public string Field { get; set; } = string.Empty;
    
    /// <summary>
    /// The direction of sorting (asc/desc)
    /// </summary>
    public string Direction { get; set; } = "desc";
    
    /// <summary>
    /// The mapped database field for the sort field
    /// </summary>
    public string? DatabaseField { get; set; }
}