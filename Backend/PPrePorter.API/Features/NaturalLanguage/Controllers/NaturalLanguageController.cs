using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.API.Features.NaturalLanguage.Models;
using PPrePorter.SemanticLayer.Core;
using System;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.NaturalLanguage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NaturalLanguageController : ControllerBase
    {
        private readonly ISemanticLayerService _semanticLayerService;

        public NaturalLanguageController(ISemanticLayerService semanticLayerService)
        {
            _semanticLayerService = semanticLayerService;
        }

        /// <summary>
        /// Process a natural language query and return the results
        /// </summary>
        /// <param name="request">The natural language query request</param>
        /// <returns>Query results based on the natural language input</returns>
        [HttpPost("query")]
        public async Task<IActionResult> Query(NaturalLanguageQueryRequest request)
        {
            try
            {
                // Translate the natural language query to SQL using the semantic layer
                var translationResult = await _semanticLayerService.TranslateToSqlAsync(request.Query);

                // In a real implementation, we would execute the query here
                // For now, we'll just return the translated SQL
                var queryResults = new { Sql = translationResult.Sql };

                return Ok(new NaturalLanguageQueryResponse
                {
                    Status = "Success",
                    Results = queryResults,
                    QueryExplanation = translationResult.ErrorMessage ?? "Query processed successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new NaturalLanguageQueryResponse
                {
                    Status = "Error",
                    ErrorMessage = $"Error processing query: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Process a follow-up question based on previous context
        /// </summary>
        /// <param name="request">The follow-up question request</param>
        /// <returns>Query results based on the follow-up question</returns>
        [HttpPost("followup")]
        public async Task<IActionResult> FollowUp(FollowUpQueryRequest request)
        {
            try
            {
                // In a real implementation, we would use the previous query context
                // For now, we'll just translate the query directly
                var translationResult = await _semanticLayerService.TranslateToSqlAsync(request.Query);

                // In a real implementation, we would execute the query here
                // For now, we'll just return the translated SQL
                var queryResults = new { Sql = translationResult.Sql };

                return Ok(new NaturalLanguageQueryResponse
                {
                    Status = "Success",
                    Results = queryResults,
                    QueryExplanation = translationResult.ErrorMessage ?? "Follow-up query processed successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new NaturalLanguageQueryResponse
                {
                    Status = "Error",
                    ErrorMessage = $"Error processing follow-up query: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Provide clarification for a previously asked query
        /// </summary>
        /// <param name="request">The clarification response from the user</param>
        /// <returns>Query results based on the clarified information</returns>
        [HttpPost("clarify")]
        public async Task<IActionResult> ProvideClarification(ClarificationResponse request)
        {
            try
            {
                // In a real implementation, we would process the clarification responses
                // For now, we'll just translate the original query
                var translationResult = await _semanticLayerService.TranslateToSqlAsync(request.OriginalQuery);

                // In a real implementation, we would execute the query here
                // For now, we'll just return the translated SQL
                var queryResults = new { Sql = translationResult.Sql };

                return Ok(new NaturalLanguageQueryResponse
                {
                    Status = "Success",
                    Results = queryResults,
                    QueryExplanation = translationResult.ErrorMessage ?? "Clarification processed successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new NaturalLanguageQueryResponse
                {
                    Status = "Error",
                    ErrorMessage = $"Error processing clarification: {ex.Message}"
                });
            }
        }
    }
}