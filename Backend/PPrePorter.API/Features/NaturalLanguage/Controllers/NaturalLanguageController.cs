using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.API.Features.NaturalLanguage.Models;
using PPrePorter.NLP.Interfaces;
using PPrePorter.SemanticLayer.Core;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.NaturalLanguage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NaturalLanguageController : ControllerBase
    {
        private readonly INaturalLanguageQueryService _nlpQueryService;
        private readonly ISemanticLayerService _semanticLayerService;
        private readonly IClarificationService _clarificationService;

        public NaturalLanguageController(
            INaturalLanguageQueryService nlpQueryService,
            ISemanticLayerService semanticLayerService,
            IClarificationService clarificationService)
        {
            _nlpQueryService = nlpQueryService;
            _semanticLayerService = semanticLayerService;
            _clarificationService = clarificationService;
        }

        /// <summary>
        /// Process a natural language query and return the results
        /// </summary>
        /// <param name="request">The natural language query request</param>
        /// <returns>Query results based on the natural language input</returns>
        [HttpPost("query")]
        public async Task<IActionResult> Query(NaturalLanguageQueryRequest request)
        {
            // Extract entities from the natural language query
            var extractedEntities = await _nlpQueryService.ExtractEntitiesAsync(request.Query);

            // If we need clarification, ask the user
            if (extractedEntities.NeedsClarification)
            {
                var clarificationQuestions = await _clarificationService.GenerateClarificationQuestionsAsync(
                    request.Query, 
                    extractedEntities);
                
                return Ok(new NaturalLanguageQueryResponse 
                { 
                    Status = "Clarification", 
                    ClarificationQuestions = clarificationQuestions 
                });
            }

            // Translate the natural language query to SQL using the semantic layer
            var translationResult = await _semanticLayerService.TranslateNaturalLanguageQueryAsync(
                request.Query, 
                extractedEntities.Entities);

            // Execute the query and return the results
            var queryResults = await _semanticLayerService.ExecuteQueryAsync(translationResult.TranslatedQuery);

            return Ok(new NaturalLanguageQueryResponse 
            { 
                Status = "Success", 
                Results = queryResults,
                QueryExplanation = translationResult.Explanation
            });
        }

        /// <summary>
        /// Process a follow-up question based on previous context
        /// </summary>
        /// <param name="request">The follow-up question request</param>
        /// <returns>Query results based on the follow-up question</returns>
        [HttpPost("followup")]
        public async Task<IActionResult> FollowUp(FollowUpQueryRequest request)
        {
            // Process the follow-up question with context from the previous query
            var translationResult = await _semanticLayerService.TranslateFollowUpQueryAsync(
                request.Query, 
                request.PreviousQueryId);

            // Execute the query and return the results
            var queryResults = await _semanticLayerService.ExecuteQueryAsync(translationResult.TranslatedQuery);

            return Ok(new NaturalLanguageQueryResponse 
            { 
                Status = "Success", 
                Results = queryResults,
                QueryExplanation = translationResult.Explanation
            });
        }

        /// <summary>
        /// Provide clarification for a previously asked query
        /// </summary>
        /// <param name="request">The clarification response from the user</param>
        /// <returns>Query results based on the clarified information</returns>
        [HttpPost("clarify")]
        public async Task<IActionResult> ProvideClarification(ClarificationResponse request)
        {
            // Process the clarification and get a refined query
            var refinedQuery = await _clarificationService.ProcessClarificationResponseAsync(
                request.OriginalQuery, 
                request.Responses);

            // Now process the refined query
            var translationResult = await _semanticLayerService.TranslateNaturalLanguageQueryAsync(
                refinedQuery, 
                null); // Entities are already in the refined query

            // Execute the query and return the results
            var queryResults = await _semanticLayerService.ExecuteQueryAsync(translationResult.TranslatedQuery);

            return Ok(new NaturalLanguageQueryResponse 
            { 
                Status = "Success", 
                Results = queryResults,
                QueryExplanation = translationResult.Explanation
            });
        }
    }
}