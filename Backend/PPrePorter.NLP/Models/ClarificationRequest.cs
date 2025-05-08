using System.Collections.Generic;
using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents a request to apply user clarification responses to a query
/// </summary>
public class ClarificationRequest
{
    /// <summary>
    /// The original entities extracted from the query that need clarification
    /// </summary>
    public QueryEntities OriginalEntities { get; set; } = new QueryEntities();
    
    /// <summary>
    /// The user's responses to the clarification prompts
    /// Dictionary mapping conflict IDs to selected values
    /// </summary>
    public Dictionary<string, string> ClarificationResponses { get; set; } = new Dictionary<string, string>();
}