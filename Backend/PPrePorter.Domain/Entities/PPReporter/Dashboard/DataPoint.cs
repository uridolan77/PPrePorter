using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    // This class is designed to be compatible with ExplorerDataPoint
    public class DataPoint
    {
        public string Label { get; set; }
        public Dictionary<string, object> Dimensions { get; set; }
        public Dictionary<string, decimal> Metrics { get; set; }
        public DateTime? Timestamp { get; set; }
        
        // Conversion operators to facilitate conversion between DataPoint and ExplorerDataPoint
        public static implicit operator ExplorerDataPoint(DataPoint dp)
        {
            if (dp == null) return null;
            return new ExplorerDataPoint
            {
                Label = dp.Label,
                Dimensions = dp.Dimensions,
                Metrics = dp.Metrics,
                Timestamp = dp.Timestamp
            };
        }
        
        public static implicit operator DataPoint(ExplorerDataPoint dp)
        {
            if (dp == null) return null;
            return new DataPoint
            {
                Label = dp.Label,
                Dimensions = dp.Dimensions,
                Metrics = dp.Metrics,
                Timestamp = dp.Timestamp
            };
        }
        
        // Helper methods to convert lists
        public static List<ExplorerDataPoint> ToExplorerDataPoints(List<DataPoint> dataPoints)
        {
            if (dataPoints == null) return null;
            var result = new List<ExplorerDataPoint>();
            foreach (var dp in dataPoints)
            {
                result.Add(dp);
            }
            return result;
        }
        
        public static List<DataPoint> ToDataPoints(List<ExplorerDataPoint> dataPoints)
        {
            if (dataPoints == null) return null;
            var result = new List<DataPoint>();
            foreach (var dp in dataPoints)
            {
                result.Add(dp);
            }
            return result;
        }
    }

    // This class is designed to be compatible with ExplorerDataAnnotation
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
        
        // Conversion operators to facilitate conversion between DataAnnotation and ExplorerDataAnnotation
        public static implicit operator ExplorerDataAnnotation(DataAnnotation da)
        {
            if (da == null) return null;
            return new ExplorerDataAnnotation
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
        
        public static implicit operator DataAnnotation(ExplorerDataAnnotation da)
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
        
        // Helper methods to convert lists
        public static List<ExplorerDataAnnotation> ToExplorerDataAnnotations(List<DataAnnotation> annotations)
        {
            if (annotations == null) return null;
            var result = new List<ExplorerDataAnnotation>();
            foreach (var a in annotations)
            {
                result.Add(a);
            }
            return result;
        }
        
        public static List<DataAnnotation> ToDataAnnotations(List<ExplorerDataAnnotation> annotations)
        {
            if (annotations == null) return null;
            var result = new List<DataAnnotation>();
            foreach (var a in annotations)
            {
                result.Add(a);
            }
            return result;
        }
    }
}
