using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Models;

/// <summary>
/// Represents the complete result of a natural language query processing operation
/// </summary>
public class NlpQueryResult
{
    /// <summary>
    /// Indicates if the query processing was successful
    /// </summary>
    public bool IsSuccessful { get; set; }
    
    /// <summary>
    /// Indicates if the query needs further clarification from the user
    /// </summary>
    public bool NeedsClarification { get; set; }
    
    /// <summary>
    /// The extracted and processed entities from the query
    /// </summary>
    public QueryEntities? Entities { get; set; }
    
    /// <summary>
    /// The SQL generated from the processed entities
    /// </summary>
    public string? Sql { get; set; }
    
    /// <summary>
    /// Error message if query processing failed
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Clarification response if the query needs further clarification
    /// </summary>
    public ClarificationResponse? ClarificationResponse { get; set; }
}