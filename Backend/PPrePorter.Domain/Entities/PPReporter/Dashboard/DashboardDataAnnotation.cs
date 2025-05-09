using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    // This class is designed to be compatible with ExplorerDataAnnotation
    public class DashboardDataAnnotation
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } // e.g., "note", "alert", "insight"
        public string RelatedDimension { get; set; }
        public string RelatedMetric { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Conversion methods to facilitate conversion between DashboardDataAnnotation and ExplorerDataAnnotation
        public ExplorerDataAnnotation ToExplorerDataAnnotation()
        {
            return new ExplorerDataAnnotation
            {
                Id = Id,
                Title = Title,
                Description = Description,
                Type = Type,
                RelatedDimension = RelatedDimension,
                RelatedMetric = RelatedMetric,
                CreatedBy = CreatedBy,
                CreatedAt = CreatedAt
            };
        }
        
        public static DashboardDataAnnotation FromExplorerDataAnnotation(ExplorerDataAnnotation da)
        {
            if (da == null) return null;
            return new DashboardDataAnnotation
            {
                Id = da.Id,
                Title = da.Title,
                Description = da.Description,
                Type = da.Type,
                RelatedDimension = da.RelatedDimension,
                RelatedMetric = da.RelatedMetric,
                CreatedBy = da.CreatedBy,
                CreatedAt = da.CreatedAt
            };
        }
    }
}
