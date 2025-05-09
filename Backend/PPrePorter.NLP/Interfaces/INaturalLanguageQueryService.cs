using PPrePorter.NLP.Models;

namespace PPrePorter.NLP.Interfaces
{
    /// <summary>
    /// Interface for the main natural language query processing service
    /// </summary>
    public interface INaturalLanguageQueryService
    {
        /// <summary>
        /// Processes a natural language query and extracts structured entities
        /// </summary>
        /// <param name="query">The natural language query from the user</param>
        /// <returns>A result containing the extracted entities and clarification needs</returns>
        Task<NlpQueryResult> ProcessQueryAsync(string query);
    }
}
