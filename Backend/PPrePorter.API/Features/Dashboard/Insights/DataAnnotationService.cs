using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Infrastructure.Data;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Implementation of IDataAnnotationService that manages user-created annotations on dashboard data
    /// </summary>
    public class DataAnnotationService : IDataAnnotationService
    {
        private readonly PPRePorterDbContext _dbContext;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DataAnnotationService> _logger;

        public DataAnnotationService(
            PPRePorterDbContext dbContext,
            ICachingService cachingService,
            ILogger<DataAnnotationService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _cachingService = cachingService ?? throw new ArgumentNullException(nameof(cachingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Add a new annotation to a data point or range
        /// </summary>
        public async Task<DataAnnotation> AddAnnotationAsync(DataAnnotation annotation)
        {
            try
            {
                if (annotation == null)
                    throw new ArgumentNullException(nameof(annotation));

                // Generate a new ID if not provided
                if (string.IsNullOrEmpty(annotation.Id))
                {
                    annotation.Id = Guid.NewGuid().ToString();
                }

                // Create a new entity
                var entity = new Infrastructure.Entities.Annotation
                {
                    Id = annotation.Id,
                    Title = annotation.Title,
                    Description = annotation.Description,
                    Type = annotation.Type,
                    RelatedDimension = annotation.RelatedDimension,
                    RelatedMetric = annotation.RelatedMetric,
                    CreatedBy = annotation.CreatedBy,
                    CreatedAt = annotation.CreatedAt,
                    UserId = annotation.UserId,
                    ModifiedAt = annotation.ModifiedAt
                };

                // Add to database
                _dbContext.Annotations.Add(entity);
                await _dbContext.SaveChangesAsync();

                // Clear cache
                await ClearAnnotationCacheAsync();

                _logger.LogInformation("Added annotation {Id} for user {UserId}", annotation.Id, annotation.UserId);

                return annotation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding annotation");
                throw;
            }
        }

        /// <summary>
        /// Update an existing annotation
        /// </summary>
        public async Task<DataAnnotation> UpdateAnnotationAsync(DataAnnotation annotation)
        {
            try
            {
                if (annotation == null)
                    throw new ArgumentNullException(nameof(annotation));

                // Find the entity
                var entity = await _dbContext.Annotations.FindAsync(annotation.Id);
                if (entity == null)
                {
                    throw new KeyNotFoundException($"Annotation with ID {annotation.Id} not found");
                }

                // Update properties
                entity.Title = annotation.Title;
                entity.Description = annotation.Description;
                entity.Type = annotation.Type;
                entity.RelatedDimension = annotation.RelatedDimension;
                entity.RelatedMetric = annotation.RelatedMetric;
                entity.ModifiedAt = DateTime.UtcNow;

                // Save changes
                await _dbContext.SaveChangesAsync();

                // Clear cache
                await ClearAnnotationCacheAsync();

                _logger.LogInformation("Updated annotation {Id}", annotation.Id);

                return annotation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating annotation {Id}", annotation?.Id);
                throw;
            }
        }

        /// <summary>
        /// Delete an annotation by its ID
        /// </summary>
        public async Task DeleteAnnotationAsync(int annotationId)
        {
            try
            {
                // Find the entity
                var entity = await _dbContext.Annotations.FindAsync(annotationId.ToString());
                if (entity == null)
                {
                    throw new KeyNotFoundException($"Annotation with ID {annotationId} not found");
                }

                // Remove from database
                _dbContext.Annotations.Remove(entity);
                await _dbContext.SaveChangesAsync();

                // Clear cache
                await ClearAnnotationCacheAsync();

                _logger.LogInformation("Deleted annotation {Id}", annotationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting annotation {Id}", annotationId);
                throw;
            }
        }

        /// <summary>
        /// Get annotation by ID
        /// </summary>
        public async Task<DataAnnotation> GetAnnotationAsync(int annotationId)
        {
            try
            {
                // Find the entity
                var entity = await _dbContext.Annotations.FindAsync(annotationId.ToString());
                if (entity == null)
                {
                    return null;
                }

                // Convert to domain entity
                return new DataAnnotation
                {
                    Id = entity.Id,
                    Title = entity.Title,
                    Description = entity.Description,
                    Type = entity.Type,
                    RelatedDimension = entity.RelatedDimension,
                    RelatedMetric = entity.RelatedMetric,
                    CreatedBy = entity.CreatedBy,
                    CreatedAt = entity.CreatedAt,
                    UserId = entity.UserId,
                    ModifiedAt = entity.ModifiedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotation {Id}", annotationId);
                throw;
            }
        }

        /// <summary>
        /// Get all annotations for a specific data type
        /// </summary>
        public async Task<List<DataAnnotation>> GetAnnotationsForDataTypeAsync(string dataType, string userId = null)
        {
            try
            {
                var cacheKey = $"annotations:datatype:{dataType}:{userId ?? "all"}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchAnnotationsForDataTypeAsync(dataType, userId),
                    slidingExpiration: TimeSpan.FromMinutes(5),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotations for data type {DataType}", dataType);
                throw;
            }
        }

        private async Task<List<DataAnnotation>> FetchAnnotationsForDataTypeAsync(string dataType, string userId)
        {
            // Build query
            var query = _dbContext.Annotations.AsQueryable();

            // Filter by data type
            if (!string.IsNullOrEmpty(dataType))
            {
                query = query.Where(a => a.Type == dataType);
            }

            // Filter by user ID if provided
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(a => a.UserId == userId);
            }

            // Execute query
            var entities = await query.ToListAsync();

            // Convert to domain entities
            return entities.Select(e => new DataAnnotation
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Type = e.Type,
                RelatedDimension = e.RelatedDimension,
                RelatedMetric = e.RelatedMetric,
                CreatedBy = e.CreatedBy,
                CreatedAt = e.CreatedAt,
                UserId = e.UserId,
                ModifiedAt = e.ModifiedAt
            }).ToList();
        }

        /// <summary>
        /// Get annotations for a specific date range
        /// </summary>
        public async Task<List<DataAnnotation>> GetAnnotationsForDateRangeAsync(DateTime startDate, DateTime endDate, string userId = null)
        {
            try
            {
                var cacheKey = $"annotations:daterange:{startDate:yyyyMMdd}-{endDate:yyyyMMdd}:{userId ?? "all"}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () => await FetchAnnotationsForDateRangeAsync(startDate, endDate, userId),
                    slidingExpiration: TimeSpan.FromMinutes(5),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotations for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        private async Task<List<DataAnnotation>> FetchAnnotationsForDateRangeAsync(DateTime startDate, DateTime endDate, string userId)
        {
            // Build query
            var query = _dbContext.Annotations.AsQueryable();

            // Filter by date range
            query = query.Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate);

            // Filter by user ID if provided
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(a => a.UserId == userId);
            }

            // Execute query
            var entities = await query.ToListAsync();

            // Convert to domain entities
            return entities.Select(e => new DataAnnotation
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Type = e.Type,
                RelatedDimension = e.RelatedDimension,
                RelatedMetric = e.RelatedMetric,
                CreatedBy = e.CreatedBy,
                CreatedAt = e.CreatedAt,
                UserId = e.UserId,
                ModifiedAt = e.ModifiedAt
            }).ToList();
        }

        /// <summary>
        /// Get annotations on revenue data
        /// </summary>
        public async Task<List<DataAnnotation>> GetRevenueAnnotationsAsync(string userId = null)
        {
            return await GetAnnotationsForDataTypeAsync("Revenue", userId);
        }

        /// <summary>
        /// Get annotations on registration data
        /// </summary>
        public async Task<List<DataAnnotation>> GetRegistrationAnnotationsAsync(string userId = null)
        {
            return await GetAnnotationsForDataTypeAsync("Registration", userId);
        }

        /// <summary>
        /// Share annotation with a specific user or user group
        /// </summary>
        public async Task ShareAnnotationAsync(int annotationId, string targetUserId)
        {
            try
            {
                // Find the annotation
                var annotation = await GetAnnotationAsync(annotationId);
                if (annotation == null)
                {
                    throw new KeyNotFoundException($"Annotation with ID {annotationId} not found");
                }

                // Create a shared annotation record
                var sharedAnnotation = new Infrastructure.Entities.SharedAnnotation
                {
                    AnnotationId = annotation.Id,
                    SharedWithUserId = targetUserId,
                    SharedAt = DateTime.UtcNow
                };

                // Add to database
                _dbContext.SharedAnnotations.Add(sharedAnnotation);
                await _dbContext.SaveChangesAsync();

                // Clear cache
                await ClearAnnotationCacheAsync();

                _logger.LogInformation("Shared annotation {Id} with user {UserId}", annotationId, targetUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing annotation {Id} with user {UserId}", annotationId, targetUserId);
                throw;
            }
        }

        private async Task ClearAnnotationCacheAsync()
        {
            // Clear all annotation-related cache entries
            await _cachingService.RemoveByPrefixAsync("annotations:");
        }
    }
}
