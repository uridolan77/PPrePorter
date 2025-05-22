# PPrePorter Backend

## Project Structure

The PPrePorter backend has been reorganized into a cleaner, more modular structure:

### New Projects

1. **PP.CachingService**
   - Provides caching functionality for the application
   - Supports both in-memory and Redis caching
   - Includes cache statistics and monitoring

2. **PP.DailyActionsDBService**
   - Handles all interactions with the DailyActionsDB database
   - Includes models, repositories, and services
   - Implements NOLOCK functionality for improved performance

3. **PP.PPrePorterCore**
   - Core functionality for the PPrePorter application
   - Handles user management, authentication, and authorization
   - Provides common utilities and services

### Removed Projects

The following projects have been removed and their functionality has been migrated to the new projects:

1. **PPrePorter.Core**
2. **PPrePorter.DailyActionsDB**
3. **PPrePorter.Domain**
4. **PPrePorter.Infrastructure**

### Retained Projects

The following projects have been retained:

1. **PPrePorter.API** - The main API project
2. **PPrePorter.AzureServices** - Azure-specific services
3. **PPrePorter.CQRS** - CQRS implementation
4. **PPrePorter.ExporterScheduler** - Export and scheduling functionality
5. **PPrePorter.gRPC.Core** - gRPC functionality
6. **PPrePorter.NLP** - Natural language processing
7. **PPrePorter.PythonML** - Python machine learning integration
8. **PPrePorter.SemanticLayer** - Semantic layer for data analysis
9. **PPrePorter.Tests** - Test project

## Migration Notes

### Database Access

- The ReadUncommittedInterceptor has been moved to PP.DailyActionsDBService
- All database access is now handled through the PP.DailyActionsDBService project
- NOLOCK functionality is applied automatically to all queries

### Caching

- Caching is now handled through the PP.CachingService project
- Both in-memory and Redis caching are supported
- Cache statistics and monitoring are available

### Core Functionality

- Core functionality has been moved to PP.PPrePorterCore
- User management, authentication, and authorization are handled here
- Common utilities and services are provided

## Getting Started

1. Open the solution in Visual Studio
2. Build the solution
3. Run the PPrePorter.API project

## Configuration

Configuration is handled through appsettings.json and environment variables. The following settings are available:

- **ConnectionStrings**: Database connection strings
- **Cache**: Caching configuration
- **JwtSettings**: JWT authentication settings
- **Logging**: Logging configuration

## Dependencies

- .NET 9.0
- Entity Framework Core 9.0
- SQL Server
- Redis (optional)
