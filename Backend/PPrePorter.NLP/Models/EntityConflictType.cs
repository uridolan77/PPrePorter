namespace PPrePorter.NLP.Models;

/// <summary>
/// Describes the type of entity conflict or ambiguity
/// </summary>
public enum EntityConflictType
{
    /// <summary>
    /// Entity is ambiguous and could be matched to multiple database fields
    /// </summary>
    Ambiguous,
    
    /// <summary>
    /// Entity is missing but required for the query
    /// </summary>
    MissingRequired,
    
    /// <summary>
    /// Entity is unknown and could not be mapped to any database field
    /// </summary>
    Unknown,
    
    /// <summary>
    /// Entity conflicts with another entity in the query
    /// </summary>
    Conflicting,
    
    /// <summary>
    /// Entity has an invalid value
    /// </summary>
    InvalidValue
}