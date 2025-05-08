# Natural Language Processing and Semantic Layer Integration

This document outlines how the PPrePorter.NLP and PPrePorter.SemanticLayer projects have been integrated with the existing PPrePorter solution.

## Overview

The integration adds natural language processing and semantic querying capabilities to PPrePorter, allowing users to:

1. Query data using natural language instead of SQL
2. Receive clarification prompts when queries are ambiguous
3. Get explanations of how their queries were processed
4. Ask follow-up questions that maintain context from previous queries

## Backend Integration

### Projects Added

- **PPrePorter.NLP**: Provides natural language processing capabilities
  - Entity extraction
  - Domain knowledge management
  - Query clarification

- **PPrePorter.SemanticLayer**: Provides semantic understanding of data models
  - SQL translation
  - Data model management
  - Entity mapping

### Integration Points

1. **Service Registration**:
   Both projects are registered in `Program.cs` using extension methods:
   ```csharp
   // Register NLP services
   builder.Services.AddNLPServices(builder.Configuration);

   // Register Semantic Layer services
   builder.Services.AddSemanticLayer(builder.Configuration);
   ```

2. **Configuration**:
   Configuration settings for both services are added to `appsettings.json`:
   ```json
   "NLP": {
     "ApiKey": "${NLP--ApiKey}",
     "EndpointUrl": "https://api.nlp-service.com/v1",
     ...
   },
   "SemanticLayer": {
     "ModelPath": "C:\\Program Files\\PPrePorter\\Models",
     ...
   }
   ```

3. **API Endpoints**:
   A new controller `NaturalLanguageController.cs` exposes the functionality through REST APIs:
   - POST `/api/naturallanguage/query` - Process a natural language query
   - POST `/api/naturallanguage/followup` - Process a follow-up question
   - POST `/api/naturallanguage/clarify` - Submit clarification to an ambiguous query

## Frontend Integration

1. **Service Layer**:
   `NaturalLanguageService.js` provides a client-side interface for the NLP APIs.

2. **UI Component**:
   `NaturalLanguageQuery.jsx` provides a user interface for:
   - Submitting queries in natural language
   - Voice input for queries
   - Responding to clarification questions
   - Viewing results and explanations
   - Seeing suggested queries

## How to Use

### For Developers

1. **Ensure Required Configuration**:
   - Add required configuration in `appsettings.json`
   - If using external NLP services, ensure API keys are set

2. **Register Routes**:
   - Add the NaturalLanguageQuery component to your frontend routes
   - Ensure the component is accessible from the main navigation

3. **Extending Functionality**:
   - To add domain-specific terminology, update the `TerminologyMappings` in the NLP configuration
   - To improve entity extraction, extend the `EntityExtractionService`

### For Users

1. Access the Natural Language Query feature through the application menu
2. Type a question about your data in plain English
3. Review results or provide clarification if needed
4. Ask follow-up questions to refine or explore further

## Examples of Natural Language Queries

- "What was our total revenue last month?"
- "Show me active players by country"
- "Which games generated the most revenue this quarter?"
- "What is the average deposit amount by payment method?"
- "Show me players who haven't logged in for 30 days"

## Troubleshooting

If queries aren't returning expected results:

1. **Check Entity Extraction**: Review which entities are being extracted from your query
2. **Check SQL Translation**: Review the SQL being generated from your natural language
3. **Add Domain Terminology**: Add domain-specific terms to the terminology mappings
4. **Refine Your Query**: Be more specific in your natural language query

## Future Enhancements

1. Integration with personalized dashboards
2. Guided query building for complex analytics
3. Automated insights and anomaly detection from natural language queries
4. Multi-language support