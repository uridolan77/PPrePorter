namespace PPrePorter.NLP.Models.Dictionaries;

/// <summary>
/// Represents a database metric with mapping information for NLP resolution
/// </summary>
public class DbMetric
{
    /// <summary>
    /// The standardized name of the metric
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// The actual database field this metric maps to
    /// </summary>
    public string DatabaseField { get; set; } = string.Empty;
    
    /// <summary>
    /// Default aggregation function to apply (sum, avg, etc.)
    /// </summary>
    public string DefaultAggregation { get; set; } = "sum";
    
    /// <summary>
    /// Alternative terms that should map to this metric
    /// </summary>
    public string[] Synonyms { get; set; } = Array.Empty<string>();
    
    /// <summary>
    /// Data type of the metric (currency, percentage, count, etc.)
    /// </summary>
    public string DataType { get; set; } = "number";
    
    /// <summary>
    /// Format string to use when displaying this metric
    /// </summary>
    public string FormatString { get; set; } = string.Empty;
}