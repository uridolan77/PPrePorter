namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents an entity conflict or ambiguity that requires clarification
/// </summary>
public class EntityConflict
{
    /// <summary>
    /// The type of conflict
    /// </summary>
    public EntityConflictType ConflictType { get; set; }
    
    /// <summary>
    /// The type of entity involved in the conflict (Metric, Dimension, Filter, etc.)
    /// </summary>
    public string EntityType { get; set; } = string.Empty;
    
    /// <summary>
    /// The original term or phrase from the query
    /// </summary>
    public string OriginalTerm { get; set; } = string.Empty;
    
    /// <summary>
    /// Descriptive message explaining the conflict
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Possible alternatives to resolve the conflict
    /// </summary>
    public string[]? Suggestions { get; set; }
}