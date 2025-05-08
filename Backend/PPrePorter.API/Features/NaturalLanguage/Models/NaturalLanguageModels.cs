using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace PPrePorter.API.Features.NaturalLanguage.Models
{
    /// <summary>
    /// Request model for natural language queries
    /// </summary>
    public class NaturalLanguageQueryRequest
    {
        /// <summary>
        /// The natural language query text
        /// </summary>
        [JsonPropertyName("query")]
        public string Query { get; set; }
        
        /// <summary>
        /// Optional context information to help process the query
        /// </summary>
        [JsonPropertyName("context")]
        public Dictionary<string, string> Context { get; set; }
    }
    
    /// <summary>
    /// Request model for follow-up questions
    /// </summary>
    public class FollowUpQueryRequest
    {
        /// <summary>
        /// The follow-up question text
        /// </summary>
        [JsonPropertyName("query")]
        public string Query { get; set; }
        
        /// <summary>
        /// The ID of the previous query to maintain context
        /// </summary>
        [JsonPropertyName("previousQueryId")]
        public string PreviousQueryId { get; set; }
    }
    
    /// <summary>
    /// Response from the user to clarification questions
    /// </summary>
    public class ClarificationResponse
    {
        /// <summary>
        /// The original query that needed clarification
        /// </summary>
        [JsonPropertyName("originalQuery")]
        public string OriginalQuery { get; set; }
        
        /// <summary>
        /// User responses to clarification questions
        /// </summary>
        [JsonPropertyName("responses")]
        public Dictionary<string, string> Responses { get; set; }
    }
    
    /// <summary>
    /// Response model for natural language queries
    /// </summary>
    public class NaturalLanguageQueryResponse
    {
        /// <summary>
        /// Status of the query processing: Success, Clarification, Error
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; }
        
        /// <summary>
        /// Results of the query (null if status is not Success)
        /// </summary>
        [JsonPropertyName("results")]
        public object Results { get; set; }
        
        /// <summary>
        /// Explanation of how the query was processed
        /// </summary>
        [JsonPropertyName("queryExplanation")]
        public string QueryExplanation { get; set; }
        
        /// <summary>
        /// Clarification questions if the query was ambiguous
        /// </summary>
        [JsonPropertyName("clarificationQuestions")]
        public List<ClarificationQuestion> ClarificationQuestions { get; set; }
        
        /// <summary>
        /// Error message if the query processing failed
        /// </summary>
        [JsonPropertyName("errorMessage")]
        public string ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Represents a clarification question for ambiguous queries
    /// </summary>
    public class ClarificationQuestion
    {
        /// <summary>
        /// Unique identifier for the question
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        /// <summary>
        /// The question text
        /// </summary>
        [JsonPropertyName("question")]
        public string Question { get; set; }
        
        /// <summary>
        /// Type of question: MultipleChoice, FreeText, YesNo, etc.
        /// </summary>
        [JsonPropertyName("type")]
        public string Type { get; set; }
        
        /// <summary>
        /// Available options for multiple-choice questions
        /// </summary>
        [JsonPropertyName("options")]
        public List<string> Options { get; set; }
    }
}