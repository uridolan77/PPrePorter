using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Dashboard.Insights
{
    /// <summary>
    /// Mock implementation of IDataAnnotationService for development purposes
    /// </summary>
    public class MockDataAnnotationService : IDataAnnotationService
    {
        public Task<DataAnnotation> AddAnnotationAsync(DataAnnotation annotation)
        {
            // Set an ID and return the annotation
            annotation.Id = new Random().Next(1, 1000).ToString();
            return Task.FromResult(annotation);
        }

        public Task DeleteAnnotationAsync(int annotationId)
        {
            // No-op for mock implementation
            return Task.CompletedTask;
        }

        public Task<DataAnnotation> GetAnnotationByIdAsync(int annotationId)
        {
            // Return a mock annotation
            return Task.FromResult(new DataAnnotation
            {
                Id = annotationId.ToString(),
                Title = "Mock Annotation",
                Description = "This is a mock annotation for development purposes.",
                Type = "note",
                RelatedMetric = "revenue",
                UserId = "1",
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            });
        }

        public Task<List<DataAnnotation>> GetAnnotationsForDateRangeAsync(DateTime startDate, DateTime endDate, string userId)
        {
            // Return a list with a single annotation for mock implementation
            return Task.FromResult(new List<DataAnnotation>
            {
                new DataAnnotation
                {
                    Id = "1",
                    Title = "Mock Annotation",
                    Description = "This is a mock annotation for development purposes.",
                    Type = "note",
                    RelatedMetric = "revenue",
                    UserId = userId,
                    CreatedBy = "System",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    ModifiedAt = DateTime.UtcNow.AddDays(-1)
                }
            });
        }

        public Task ShareAnnotationAsync(int annotationId, string targetUserId)
        {
            // No-op for mock implementation
            return Task.CompletedTask;
        }

        public Task<DataAnnotation> UpdateAnnotationAsync(DataAnnotation annotation)
        {
            // Update the modified date and return the annotation
            annotation.ModifiedAt = DateTime.UtcNow;
            return Task.FromResult(annotation);
        }

        public Task<DataAnnotation> GetAnnotationAsync(int annotationId)
        {
            // Return a mock annotation
            return GetAnnotationByIdAsync(annotationId);
        }

        public Task<List<DataAnnotation>> GetAnnotationsForDataTypeAsync(string dataType, string userId)
        {
            // Return a list with a single annotation for mock implementation
            return Task.FromResult(new List<DataAnnotation>
            {
                new DataAnnotation
                {
                    Id = "2",
                    Title = $"Mock {dataType} Annotation",
                    Description = $"This is a mock {dataType} annotation for development purposes.",
                    Type = "note",
                    RelatedMetric = dataType,
                    UserId = userId,
                    CreatedBy = "System",
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    ModifiedAt = DateTime.UtcNow.AddDays(-2)
                }
            });
        }

        public Task<List<DataAnnotation>> GetRevenueAnnotationsAsync(string userId)
        {
            // Return a list with a single revenue annotation for mock implementation
            return Task.FromResult(new List<DataAnnotation>
            {
                new DataAnnotation
                {
                    Id = "3",
                    Title = "Mock Revenue Annotation",
                    Description = "This is a mock revenue annotation for development purposes.",
                    Type = "note",
                    RelatedMetric = "revenue",
                    UserId = userId,
                    CreatedBy = "System",
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    ModifiedAt = DateTime.UtcNow.AddDays(-3)
                }
            });
        }

        public Task<List<DataAnnotation>> GetRegistrationAnnotationsAsync(string userId)
        {
            // Return a list with a single registration annotation for mock implementation
            return Task.FromResult(new List<DataAnnotation>
            {
                new DataAnnotation
                {
                    Id = "4",
                    Title = "Mock Registration Annotation",
                    Description = "This is a mock registration annotation for development purposes.",
                    Type = "note",
                    RelatedMetric = "registrations",
                    UserId = userId,
                    CreatedBy = "System",
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    ModifiedAt = DateTime.UtcNow.AddDays(-4)
                }
            });
        }
    }
}
