using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    /// <summary>
    /// Service for managing user-created annotations on dashboard data
    /// </summary>
    public interface IDataAnnotationService
    {
        /// <summary>
        /// Add a new annotation to a data point or range
        /// </summary>
        Task<DataAnnotation> AddAnnotationAsync(DataAnnotation annotation);
        
        /// <summary>
        /// Update an existing annotation
        /// </summary>
        Task<DataAnnotation> UpdateAnnotationAsync(DataAnnotation annotation);
        
        /// <summary>
        /// Delete an annotation by its ID
        /// </summary>
        Task DeleteAnnotationAsync(int annotationId);
        
        /// <summary>
        /// Get annotation by ID
        /// </summary>
        Task<DataAnnotation> GetAnnotationAsync(int annotationId);
        
        /// <summary>
        /// Get all annotations for a specific data type
        /// </summary>
        Task<List<DataAnnotation>> GetAnnotationsForDataTypeAsync(string dataType, string userId = null);
        
        /// <summary>
        /// Get annotations for a specific date range
        /// </summary>
        Task<List<DataAnnotation>> GetAnnotationsForDateRangeAsync(DateTime startDate, DateTime endDate, string userId = null);
        
        /// <summary>
        /// Get annotations on revenue data
        /// </summary>
        Task<List<DataAnnotation>> GetRevenueAnnotationsAsync(string userId = null);
        
        /// <summary>
        /// Get annotations on registration data
        /// </summary>
        Task<List<DataAnnotation>> GetRegistrationAnnotationsAsync(string userId = null);
        
        /// <summary>
        /// Share annotation with a specific user or user group
        /// </summary>
        Task ShareAnnotationAsync(int annotationId, string targetUserId);
    }
}