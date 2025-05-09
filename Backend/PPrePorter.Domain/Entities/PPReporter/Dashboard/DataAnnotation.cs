using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    // Class for data annotations
    public class DataAnnotation
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } // e.g., "note", "alert", "insight"
        public string RelatedDimension { get; set; }
        public string RelatedMetric { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public DateTime ModifiedAt { get; set; }

        // Conversion method to create ExplorerDataAnnotation
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

        // Static factory method to create from ExplorerDataAnnotation
        public static DataAnnotation FromExplorerDataAnnotation(ExplorerDataAnnotation da)
        {
            if (da == null) return null;
            return new DataAnnotation
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
