using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Translation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// Core implementation of the semantic layer service
    /// </summary>
    public class SemanticLayerService : ISemanticLayerService
    {
        private readonly ILogger<SemanticLayerService> _logger;
        private readonly SemanticLayerConfig _config;
        private readonly IDataModelService _dataModelService;
        private readonly IEntityMappingService _entityMappingService;
        private readonly ISqlTranslationService _sqlTranslationService;
        private readonly ICacheService _cacheService;
        
        public SemanticLayerService(
            ILogger<SemanticLayerService> logger,
            IOptions<SemanticLayerConfig> config,
            IDataModelService dataModelService,
            IEntityMappingService entityMappingService,
            ISqlTranslationService sqlTranslationService,
            ICacheService cacheService)
        {
            _logger = logger;
            _config = config.Value;
            _dataModelService = dataModelService;
            _entityMappingService = entityMappingService;
            _sqlTranslationService = sqlTranslationService;
            _cacheService = cacheService;
        }
        
        /// <summary>
        /// Translates a natural language query into SQL
        /// </summary>
        public async Task<SqlTranslationResult> TranslateToSqlAsync(string query, string? userId = null)
        {
            _logger.LogInformation("Processing natural language query: {Query}", query);
            
            try
            {
                // Check cache first if enabled
                if (_config.Cache.Enabled)
                {
                    var cacheKey = $"query:{query}:user:{userId ?? "anonymous"}";
                    var cachedResult = _cacheService.Get<SqlTranslationResult>(cacheKey);
                    
                    if (cachedResult != null)
                    {
                        _logger.LogInformation("Cache hit for query: {Query}", query);
                        return cachedResult;
                    }
                }
                
                // Extract query entities from the natural language query
                var entities = await _entityMappingService.ExtractEntitiesFromQueryAsync(query);
                
                // Create context with user ID if provided
                var context = userId != null ? new TranslationContext { UserId = userId } : null;
                
                // Translate the extracted entities to SQL
                var result = await TranslateEntitiesToSqlAsync(entities, context);
                
                // Cache the result if enabled
                if (_config.Cache.Enabled && result.Success)
                {
                    var cacheKey = $"query:{query}:user:{userId ?? "anonymous"}";
                    _cacheService.Set(cacheKey, result, TimeSpan.FromMinutes(_config.Cache.CacheDurationMinutes));
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating natural language query: {Query}", query);
                
                return new SqlTranslationResult
                {
                    Success = false,
                    ErrorMessage = $"Failed to translate query: {ex.Message}"
                };
            }
        }
        
        /// <summary>
        /// Translates structured query entities into SQL
        /// </summary>
        public async Task<SqlTranslationResult> TranslateEntitiesToSqlAsync(
            QueryEntities entities, 
            TranslationContext? context = null)
        {
            _logger.LogInformation("Translating query entities to SQL");
            
            try
            {
                // Map semantic entities to database fields
                var mappedEntities = await _entityMappingService.MapEntitiesToDatabaseFieldsAsync(entities);
                
                // Get the data model
                var dataModel = await _dataModelService.GetDataModelAsync();
                
                // Translate to SQL
                var result = await _sqlTranslationService.TranslateToSqlAsync(mappedEntities, dataModel, context);
                
                // Apply optimizations if configured and translation was successful
                if (_config.Performance.UseQueryHints && result.Success)
                {
                    result = await _sqlTranslationService.ApplyOptimizationsAsync(result, dataModel);
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating query entities to SQL");
                
                return new SqlTranslationResult
                {
                    Success = false,
                    ErrorMessage = $"Failed to translate query entities: {ex.Message}"
                };
            }
        }
    }
}