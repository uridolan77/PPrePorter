using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Interfaces;

/// <summary>
/// Defines functionality for handling ambiguity and clarification dialogs
/// </summary>
public interface IClarificationService
{
    /// <summary>
    /// Determines if a query needs clarification based on detected conflicts
    /// </summary>
    /// <param name="entities">The entities extracted from the query</param>
    /// <returns>A clarification response with prompts if needed</returns>
    Task<ClarificationResponse> RequestClarificationAsync(QueryEntities entities);
    
    /// <summary>
    /// Processes user responses to clarification prompts
    /// </summary>
    /// <param name="originalEntities">The original entities with conflicts</param>
    /// <param name="clarificationResponses">The user's responses to the clarification prompts</param>
    /// <returns>Updated entities with conflicts resolved</returns>
    Task<QueryEntities> ApplyClarificationResponsesAsync(QueryEntities originalEntities, Dictionary<string, string> clarificationResponses);
    
    /// <summary>
    /// Generates appropriate clarification prompts based on entity conflicts
    /// </summary>
    /// <param name="conflicts">The list of conflicts that need resolution</param>
    /// <returns>A list of prompts to present to the user</returns>
    List<ClarificationPrompt> GenerateClarificationPrompts(List<EntityConflict> conflicts);
}