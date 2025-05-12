using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using Dashboard = PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Implementation of IDataAnnotationService that manages user-created annotations on dashboard data
    /// </summary>
    public class DataAnnotationService : IDataAnnotationService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly ICachingService _cachingService;
        private readonly ILogger<DataAnnotationService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="DataAnnotationService"/> class
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="cachingService">Caching service</param>
        /// <param name="logger">Logger</param>
        public DataAnnotationService(
            IPPRePorterDbContext dbContext,
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
        /// <param name="annotation">Annotation to add</param>
        /// <returns>Added annotation</returns>
        public async Task<DataAnnotation> AddAnnotationAsync(DataAnnotation annotation)
        {
            try
            {
                if (annotation == null)
                    throw new ArgumentNullException(nameof(annotation));

                // Set created date if not set
                if (annotation.CreatedAt == default)
                    annotation.CreatedAt = DateTime.UtcNow;

                // Add to database
                _dbContext.Annotations.Add(annotation);
                await _dbContext.SaveChangesAsync();

                // Invalidate cache
                await InvalidateAnnotationCacheAsync(annotation.DataType, annotation.CreatedBy);

                _logger.LogInformation("Added annotation {AnnotationId} for {DataType}", annotation.Id, annotation.DataType);

                return annotation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding annotation for {DataType}", annotation?.DataType);
                throw;
            }
        }

        /// <summary>
        /// Update an existing annotation
        /// </summary>
        /// <param name="annotation">Annotation to update</param>
        /// <returns>Updated annotation</returns>
        public async Task<DataAnnotation> UpdateAnnotationAsync(DataAnnotation annotation)
        {
            try
            {
                if (annotation == null)
                    throw new ArgumentNullException(nameof(annotation));

                if (string.IsNullOrEmpty(annotation.Id))
                    throw new ArgumentException("Annotation ID cannot be null or empty", nameof(annotation));

                // Get existing annotation
                var existingAnnotation = await _dbContext.Annotations.FindAsync(annotation.Id);
                if (existingAnnotation == null)
                    throw new KeyNotFoundException($"Annotation with ID {annotation.Id} not found");

                // Update properties
                existingAnnotation.Title = annotation.Title;
                existingAnnotation.Description = annotation.Description;
                existingAnnotation.DataType = annotation.DataType;
                existingAnnotation.StartDate = annotation.StartDate;
                existingAnnotation.EndDate = annotation.EndDate;
                existingAnnotation.RelatedMetric = annotation.RelatedMetric;
                existingAnnotation.Color = annotation.Color;
                existingAnnotation.Icon = annotation.Icon;
                existingAnnotation.IsPublic = annotation.IsPublic;
                existingAnnotation.UpdatedAt = DateTime.UtcNow;

                // Save changes
                await _dbContext.SaveChangesAsync();

                // Invalidate cache
                await InvalidateAnnotationCacheAsync(existingAnnotation.DataType, existingAnnotation.CreatedBy);

                _logger.LogInformation("Updated annotation {AnnotationId} for {DataType}", existingAnnotation.Id, existingAnnotation.DataType);

                return existingAnnotation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating annotation {AnnotationId}", annotation?.Id);
                throw;
            }
        }

        /// <summary>
        /// Delete an annotation by its ID
        /// </summary>
        /// <param name="annotationId">Annotation ID</param>
        public async Task DeleteAnnotationAsync(int annotationId)
        {
            try
            {
                if (annotationId <= 0)
                    throw new ArgumentException("Annotation ID must be greater than zero", nameof(annotationId));

                // Get existing annotation
                var existingAnnotation = await _dbContext.Annotations.FindAsync(annotationId);
                if (existingAnnotation == null)
                    throw new KeyNotFoundException($"Annotation with ID {annotationId} not found");

                // Remove from database
                _dbContext.Annotations.Remove(existingAnnotation);
                await _dbContext.SaveChangesAsync();

                // Invalidate cache
                await InvalidateAnnotationCacheAsync(existingAnnotation.DataType, existingAnnotation.CreatedBy);

                _logger.LogInformation("Deleted annotation {AnnotationId} for {DataType}", annotationId, existingAnnotation.DataType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting annotation {AnnotationId}", annotationId);
                throw;
            }
        }

        /// <summary>
        /// Get annotation by ID
        /// </summary>
        /// <param name="annotationId">Annotation ID</param>
        /// <returns>Annotation</returns>
        public async Task<DataAnnotation> GetAnnotationAsync(int annotationId)
        {
            try
            {
                if (annotationId <= 0)
                    throw new ArgumentException("Annotation ID must be greater than zero", nameof(annotationId));

                // Get from database
                var annotation = await _dbContext.Annotations.FindAsync(annotationId);
                if (annotation == null)
                    throw new KeyNotFoundException($"Annotation with ID {annotationId} not found");

                return annotation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotation {AnnotationId}", annotationId);
                throw;
            }
        }

        /// <summary>
        /// Get all annotations for a specific data type
        /// </summary>
        /// <param name="dataType">Data type</param>
        /// <param name="userId">User ID (optional)</param>
        /// <returns>List of annotations</returns>
        public async Task<List<DataAnnotation>> GetAnnotationsForDataTypeAsync(string dataType, string userId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(dataType))
                    throw new ArgumentException("Data type cannot be null or empty", nameof(dataType));

                var cacheKey = $"annotations:datatype:{dataType}:{userId ?? "all"}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Build query
                        var query = _dbContext.Annotations.AsNoTracking()
                            .Where(a => a.DataType == dataType);

                        // Filter by user if specified
                        if (!string.IsNullOrEmpty(userId))
                        {
                            query = query.Where(a => a.CreatedBy == userId || a.IsPublic);
                        }

                        // Execute query
                        var annotations = await query.ToListAsync();

                        _logger.LogInformation("Retrieved {Count} annotations for data type {DataType}", annotations.Count, dataType);

                        return annotations;
                    },
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotations for data type {DataType}", dataType);
                return new List<DataAnnotation>();
            }
        }

        /// <summary>
        /// Get annotations for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="userId">User ID (optional)</param>
        /// <returns>List of annotations</returns>
        public async Task<List<DataAnnotation>> GetAnnotationsForDateRangeAsync(DateTime startDate, DateTime endDate, string userId = null)
        {
            try
            {
                if (startDate > endDate)
                    throw new ArgumentException("Start date must be before or equal to end date", nameof(startDate));

                var cacheKey = $"annotations:daterange:{startDate:yyyyMMdd}:{endDate:yyyyMMdd}:{userId ?? "all"}";

                return await _cachingService.GetOrCreateAsync(
                    cacheKey,
                    async () =>
                    {
                        // Build query
                        var query = _dbContext.Annotations.AsNoTracking()
                            .Where(a =>
                                (a.StartDate <= endDate && (a.EndDate == null || a.EndDate >= startDate)));

                        // Filter by user if specified
                        if (!string.IsNullOrEmpty(userId))
                        {
                            query = query.Where(a => a.CreatedBy == userId || a.IsPublic);
                        }

                        // Execute query
                        var annotations = await query.ToListAsync();

                        _logger.LogInformation("Retrieved {Count} annotations for date range {StartDate} to {EndDate}",
                            annotations.Count, startDate, endDate);

                        return annotations;
                    },
                    slidingExpiration: TimeSpan.FromMinutes(15),
                    absoluteExpiration: TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting annotations for date range {StartDate} to {EndDate}", startDate, endDate);
                return new List<DataAnnotation>();
            }
        }

        /// <summary>
        /// Get annotations on revenue data
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <returns>List of annotations</returns>
        public async Task<List<DataAnnotation>> GetRevenueAnnotationsAsync(string userId = null)
        {
            try
            {
                return await GetAnnotationsForDataTypeAsync("Revenue", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue annotations");
                return new List<DataAnnotation>();
            }
        }

        /// <summary>
        /// Get annotations on registration data
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <returns>List of annotations</returns>
        public async Task<List<DataAnnotation>> GetRegistrationAnnotationsAsync(string userId = null)
        {
            try
            {
                return await GetAnnotationsForDataTypeAsync("Registration", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting registration annotations");
                return new List<DataAnnotation>();
            }
        }

        /// <summary>
        /// Share annotation with a specific user or user group
        /// </summary>
        /// <param name="annotationId">Annotation ID</param>
        /// <param name="targetUserId">Target user ID</param>
        public async Task ShareAnnotationAsync(int annotationId, string targetUserId)
        {
            try
            {
                if (annotationId <= 0)
                    throw new ArgumentException("Annotation ID must be greater than zero", nameof(annotationId));

                if (string.IsNullOrEmpty(targetUserId))
                    throw new ArgumentException("Target user ID cannot be null or empty", nameof(targetUserId));

                // Get existing annotation
                var existingAnnotation = await _dbContext.Annotations.FindAsync(annotationId);
                if (existingAnnotation == null)
                    throw new KeyNotFoundException($"Annotation with ID {annotationId} not found");

                // Create annotation share
                var annotationShare = new Dashboard.SharedAnnotation
                {
                    AnnotationId = annotationId.ToString(),
                    SharedWithUserId = targetUserId,
                    SharedAt = DateTime.UtcNow,
                    IsActive = true,
                    SharedByUserId = existingAnnotation.UserId
                };

                // Add to database
                _dbContext.AnnotationShares.Add(annotationShare);
                await _dbContext.SaveChangesAsync();

                // Invalidate cache
                await InvalidateAnnotationCacheAsync(existingAnnotation.DataType, targetUserId);

                _logger.LogInformation("Shared annotation {AnnotationId} with user {UserId}", annotationId, targetUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing annotation {AnnotationId} with user {UserId}", annotationId, targetUserId);
                throw;
            }
        }

        #region Helper Methods

        /// <summary>
        /// Invalidate annotation cache
        /// </summary>
        /// <param name="dataType">Data type</param>
        /// <param name="userId">User ID</param>
        private async Task InvalidateAnnotationCacheAsync(string dataType, string userId)
        {
            try
            {
                // Invalidate data type cache
                await _cachingService.RemoveAsync($"annotations:datatype:{dataType}:{userId ?? "all"}");
                await _cachingService.RemoveAsync($"annotations:datatype:{dataType}:all");

                // Invalidate date range caches (can't target specific ones, so remove all)
                // In a real implementation, we would track which date ranges are cached
                // and only invalidate those that overlap with the annotation's date range
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating annotation cache for {DataType} and user {UserId}", dataType, userId);
            }
        }

        #endregion
    }
}
