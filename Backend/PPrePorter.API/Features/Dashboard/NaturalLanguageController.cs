using Microsoft.AspNetCore.Mvc;
using PPrePorter.NLP.Models;
using PPrePorter.NLP.Services;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard;

/// <summary>
/// Controller for natural language query features in the dashboard
/// </summary>
[ApiController]
[Route("api/Dashboard/NaturalLanguage")]
public class NaturalLanguageController : ControllerBase
{
    private readonly NaturalLanguageQueryService _nlpService;

    public NaturalLanguageController(NaturalLanguageQueryService nlpService)
    {
        _nlpService = nlpService;
    }

    /// <summary>
    /// Processes a natural language query and returns structured results or clarification prompts
    /// </summary>
    /// <param name="query">The natural language query text</param>
    /// <returns>Query results or clarification prompts if needed</returns>
    [HttpPost("query")]
    public async Task<IActionResult> ProcessQuery([FromBody] string query)
    {
        var result = await _nlpService.ProcessQueryAsync(query);

        if (!result.IsSuccessful)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        if (result.NeedsClarification)
        {
            // Return clarification prompts to the client
            return Ok(new
            {
                needsClarification = true,
                originalEntities = result.Entities,
                clarificationPrompts = result.ClarificationResponse?.ClarificationPrompts
            });
        }

        // In a real implementation, you would execute the SQL here
        // var data = await _dataService.ExecuteQueryAsync(result.Sql);

        return Ok(new
        {
            query = query,
            entities = result.Entities,
            sql = result.Sql,
            // Replace with actual data when implementing
            data = new [] { new { placeholder = "Sample data - replace with actual query results" } }
        });
    }

    /// <summary>
    /// Applies user clarification responses and completes the query processing
    /// </summary>
    /// <param name="request">The clarification request with user responses</param>
    /// <returns>Query results or additional clarification prompts if needed</returns>
    [HttpPost("clarify")]
    public async Task<IActionResult> ApplyClarification([FromBody] ClarificationRequest request)
    {
        var result = await _nlpService.ApplyClarificationAsync(
            request.OriginalEntities,
            request.ClarificationResponses);

        if (!result.IsSuccessful)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        if (result.NeedsClarification)
        {
            // Additional clarification is needed
            return Ok(new
            {
                needsClarification = true,
                originalEntities = result.Entities,
                clarificationPrompts = result.ClarificationResponse?.ClarificationPrompts
            });
        }

        // In a real implementation, you would execute the SQL here
        // var data = await _dataService.ExecuteQueryAsync(result.Sql);

        return Ok(new
        {
            entities = result.Entities,
            sql = result.Sql,
            // Replace with actual data when implementing
            data = new [] { new { placeholder = "Sample data - replace with actual query results" } }
        });
    }
}