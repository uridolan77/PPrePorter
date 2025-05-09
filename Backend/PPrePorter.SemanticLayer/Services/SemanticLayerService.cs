using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System;
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
                if (_config.EnableQueryCaching)
                {
                    var cacheKey = $"query:{query}:user:{userId ?? "anonymous"}";
                    var cachedResult = await _cacheService.GetCachedTranslationAsync(cacheKey);

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
                if (_config.EnableQueryCaching && result.Success)
                {
                    var cacheKey = $"query:{query}:user:{userId ?? "anonymous"}";
                    await _cacheService.CacheTranslationAsync(cacheKey, result);
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
                if (result.Success)
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

        /// <summary>
        /// Gets entity suggestions for a term
        /// </summary>
        public async Task<List<string>> GetSuggestionsAsync(string entityType, string term)
        {
            _logger.LogInformation("Getting suggestions for {EntityType}: {Term}", entityType, term);

            try
            {
                return await _entityMappingService.GetSuggestionsAsync(entityType, term);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting suggestions for {EntityType}: {Term}", entityType, term);
                return new List<string>();
            }
        }

        /// <summary>
        /// Records user feedback about entity mappings
        /// </summary>
        public async Task RecordFeedbackAsync(string originalTerm, string mappedTerm, bool isCorrect)
        {
            _logger.LogInformation("Recording feedback: {OriginalTerm} -> {MappedTerm}, IsCorrect: {IsCorrect}",
                originalTerm, mappedTerm, isCorrect);

            try
            {
                await _entityMappingService.RecordFeedbackAsync(originalTerm, mappedTerm, isCorrect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording feedback");
            }
        }

        /// <summary>
        /// Gets the current data model
        /// </summary>
        public async Task<DataModel> GetDataModelAsync()
        {
            _logger.LogInformation("Getting data model");

            try
            {
                return await _dataModelService.GetDataModelAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data model");
                throw;
            }
        }

        /// <summary>
        /// Refreshes the data model from the database
        /// </summary>
        public async Task<DataModel> RefreshDataModelAsync()
        {
            _logger.LogInformation("Refreshing data model");

            try
            {
                return await _dataModelService.RefreshDataModelAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing data model");
                throw;
            }
        }

        /// <summary>
        /// Clears the cache
        /// </summary>
        public async Task ClearCacheAsync()
        {
            _logger.LogInformation("Clearing cache");

            try
            {
                await _cacheService.ClearAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache");
                throw;
            }
        }
    }
}