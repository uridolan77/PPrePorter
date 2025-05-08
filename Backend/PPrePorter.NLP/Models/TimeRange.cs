namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a time range entity extracted from a query
/// </summary>
public class TimeRange
{
    /// <summary>
    /// Start date in YYYY-MM-DD format
    /// </summary>
    public string? Start { get; set; }
    
    /// <summary>
    /// End date in YYYY-MM-DD format
    /// </summary>
    public string? End { get; set; }
    
    /// <summary>
    /// Time granularity (hourly, daily, weekly, monthly, quarterly, yearly)
    /// </summary>
    public string? Period { get; set; }
    
    /// <summary>
    /// Indicates if this is a relative time range (e.g., "last month")
    /// </summary>
    public bool IsRelative { get; set; }
    
    /// <summary>
    /// The relative period identifier if IsRelative is true (today, yesterday, this_week, last_week, etc.)
    /// </summary>
    public string? RelativePeriod { get; set; }
}