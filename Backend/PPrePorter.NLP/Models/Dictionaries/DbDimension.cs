namespace PPrePorter.NLP.Models.Dictionaries;

/// <summary>
/// Represents a database dimension with mapping information for NLP resolution
/// </summary>
public class DbDimension
{
    /// <summary>
    /// The standardized name of the dimension
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// The actual database field this dimension maps to
    /// </summary>
    public string DatabaseField { get; set; } = string.Empty;
    
    /// <summary>
    /// Alternative terms that should map to this dimension
    /// </summary>
    public string[] Synonyms { get; set; } = Array.Empty<string>();
    
    /// <summary>
    /// Data type of the dimension (string, date, enum, etc.)
    /// </summary>
    public string DataType { get; set; } = "string";
    
    /// <summary>
    /// Possible values for enum-type dimensions
    /// </summary>
    public Dictionary<string, string>? AllowedValues { get; set; }
}