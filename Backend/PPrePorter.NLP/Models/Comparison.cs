namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a comparison operation extracted from a query (e.g., "compare with previous period")
/// </summary>
public class Comparison
{
    /// <summary>
    /// The type of comparison (previous_period, year_over_year, etc.)
    /// </summary>
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// The time period to compare (day, week, month, quarter, year)
    /// </summary>
    public string TimePeriod { get; set; } = string.Empty;
}