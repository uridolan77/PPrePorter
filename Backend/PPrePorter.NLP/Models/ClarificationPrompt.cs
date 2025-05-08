namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a prompt for clarifying ambiguous or conflicting entities
/// </summary>
public class ClarificationPrompt
{
    /// <summary>
    /// Type of prompt (selection, text, confirmation, etc.)
    /// </summary>
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// The question to ask the user
    /// </summary>
    public string Question { get; set; } = string.Empty;
    
    /// <summary>
    /// Options for selection-type prompts
    /// </summary>
    public string[]? Options { get; set; }
    
    /// <summary>
    /// Identifier for the conflict being addressed
    /// </summary>
    public string ConflictId { get; set; } = string.Empty;
}