namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a response to a clarification process
/// </summary>
public class ClarificationResponse
{
    /// <summary>
    /// Indicates if the query needs clarification
    /// </summary>
    public bool NeedsClarification { get; set; }
    
    /// <summary>
    /// List of entity conflicts that require clarification
    /// </summary>
    public List<EntityConflict>? Conflicts { get; set; }
    
    /// <summary>
    /// List of prompts to present to the user
    /// </summary>
    public List<ClarificationPrompt>? ClarificationPrompts { get; set; }
}