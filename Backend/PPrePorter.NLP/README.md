# PPrePorter.NLP - Natural Language Processing Library

## Overview

The PPrePorter.NLP library provides comprehensive natural language processing capabilities for the PPrePorter gaming analytics platform. It enables users to query analytics data using natural language and transforms these queries into structured database operations.

## Features

- **Natural Language Query Processing**: Convert free-text queries into structured analytics operations
- **Entity Extraction**: Identify and extract key entities from user queries (metrics, dimensions, filters, time periods)
- **Query Clarification**: Interactive disambiguation when queries contain ambiguities
- **Domain-Specific Knowledge**: Built-in understanding of gaming industry terminology and metrics
- **SQL Generation**: Transform natural language requests into executable SQL

## Usage Example

```csharp
// Add NLP services to dependency injection
services.AddNlpServices();

// In your controller or service
public class AnalyticsController : ControllerBase
{
    private readonly NaturalLanguageQueryService _nlpService;
    
    public AnalyticsController(NaturalLanguageQueryService nlpService)
    {
        _nlpService = nlpService;
    }
    
    [HttpPost("query")]
    public async Task<IActionResult> ProcessQuery([FromBody] string query)
    {
        // Process the natural language query
        var result = await _nlpService.ProcessQueryAsync(query);
        
        if (!result.IsSuccessful)
        {
            return BadRequest(result.ErrorMessage);
        }
        
        if (result.NeedsClarification)
        {
            // Return clarification prompts to the client
            return Ok(new
            {
                needsClarification = true,
                clarificationPrompts = result.ClarificationResponse?.ClarificationPrompts
            });
        }
        
        // Execute the generated SQL and return the results
        // var data = await _dataService.ExecuteQueryAsync(result.Sql);
        
        return Ok(new
        {
            query = query,
            entities = result.Entities,
            sql = result.Sql,
            // data = data
        });
    }
    
    [HttpPost("clarify")]
    public async Task<IActionResult> ApplyClarification([FromBody] ClarificationRequest request)
    {
        // Apply user responses to clarification prompts
        var result = await _nlpService.ApplyClarificationAsync(
            request.OriginalEntities, 
            request.ClarificationResponses);
            
        if (!result.IsSuccessful)
        {
            return BadRequest(result.ErrorMessage);
        }
        
        if (result.NeedsClarification)
        {
            // Additional clarification is needed
            return Ok(new
            {
                needsClarification = true,
                clarificationPrompts = result.ClarificationResponse?.ClarificationPrompts
            });
        }
        
        // Execute the generated SQL and return the results
        // var data = await _dataService.ExecuteQueryAsync(result.Sql);
        
        return Ok(new
        {
            entities = result.Entities,
            sql = result.Sql,
            // data = data
        });
    }
}
```

## Example Queries

The NLP engine can handle queries like:

- "Show me the top 10 games by revenue for UK players over the last month"
- "What was our GGR by country last quarter?"
- "Compare deposits vs withdrawals by payment method this year"
- "Show me retention rates for mobile players segmented by game type"
- "Which white labels had the highest player growth in the last 30 days?"

## Architecture

The library is composed of the following key components:

1. **EntityExtractionService**: Extracts and processes entities from natural language
2. **ClarificationService**: Handles ambiguities through interactive clarification
3. **DomainKnowledgeService**: Provides gaming-specific knowledge for entity resolution
4. **NaturalLanguageQueryService**: Main facade service that coordinates the NLP process

## Continuous Improvement

The NLP system continuously improves through feedback:

- Tracking query understanding accuracy
- Collecting user feedback on entity extraction correctness
- Monitoring unresolved entities and clarification requests
- Expanding domain knowledge with new terms and mappings