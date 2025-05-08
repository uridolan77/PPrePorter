using System;
using System.Collections.Generic;
using System.Linq;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Domain.Extensions
{
    public static class DataPointExtensions
    {
        // Convert a DataPoint to an ExplorerDataPoint
        public static ExplorerDataPoint ToExplorerDataPoint(this DataPoint dataPoint)
        {
            if (dataPoint == null) return null;
            return new ExplorerDataPoint
            {
                Label = dataPoint.Label,
                Dimensions = dataPoint.Dimensions,
                Metrics = dataPoint.Metrics,
                Timestamp = dataPoint.Timestamp
            };
        }

        // Convert an ExplorerDataPoint to a DataPoint
        public static DataPoint ToDataPoint(this ExplorerDataPoint explorerDataPoint)
        {
            if (explorerDataPoint == null) return null;
            return new DataPoint
            {
                Label = explorerDataPoint.Label,
                Dimensions = explorerDataPoint.Dimensions,
                Metrics = explorerDataPoint.Metrics,
                Timestamp = explorerDataPoint.Timestamp
            };
        }

        // Convert a list of DataPoints to a list of ExplorerDataPoints
        public static List<ExplorerDataPoint> ToExplorerDataPoints(this IEnumerable<DataPoint> dataPoints)
        {
            if (dataPoints == null) return null;
            return dataPoints.Select(dp => dp.ToExplorerDataPoint()).ToList();
        }

        // Convert a list of ExplorerDataPoints to a list of DataPoints
        public static List<DataPoint> ToDataPoints(this IEnumerable<ExplorerDataPoint> explorerDataPoints)
        {
            if (explorerDataPoints == null) return null;
            return explorerDataPoints.Select(dp => dp.ToDataPoint()).ToList();
        }

        // Convert a DashboardDataAnnotation to an ExplorerDataAnnotation
        public static ExplorerDataAnnotation ToExplorerDataAnnotation(this DashboardDataAnnotation annotation)
        {
            if (annotation == null) return null;
            return new ExplorerDataAnnotation
            {
                Id = annotation.Id,
                Title = annotation.Title,
                Description = annotation.Description,
                Type = annotation.Type,
                RelatedDimension = annotation.RelatedDimension,
                RelatedMetric = annotation.RelatedMetric,
                CreatedBy = annotation.CreatedBy,
                CreatedAt = annotation.CreatedAt
            };
        }

        // Convert an ExplorerDataAnnotation to a DashboardDataAnnotation
        public static DashboardDataAnnotation ToDashboardDataAnnotation(this ExplorerDataAnnotation explorerAnnotation)
        {
            if (explorerAnnotation == null) return null;
            return new DashboardDataAnnotation
            {
                Id = explorerAnnotation.Id,
                Title = explorerAnnotation.Title,
                Description = explorerAnnotation.Description,
                Type = explorerAnnotation.Type,
                RelatedDimension = explorerAnnotation.RelatedDimension,
                RelatedMetric = explorerAnnotation.RelatedMetric,
                CreatedBy = explorerAnnotation.CreatedBy,
                CreatedAt = explorerAnnotation.CreatedAt
            };
        }

        // Convert a list of DashboardDataAnnotations to a list of ExplorerDataAnnotations
        public static List<ExplorerDataAnnotation> ToExplorerDataAnnotations(this IEnumerable<DashboardDataAnnotation> annotations)
        {
            if (annotations == null) return null;
            return annotations.Select(a => a.ToExplorerDataAnnotation()).ToList();
        }

        // Convert a list of ExplorerDataAnnotations to a list of DashboardDataAnnotations
        public static List<DashboardDataAnnotation> ToDashboardDataAnnotations(this IEnumerable<ExplorerDataAnnotation> explorerAnnotations)
        {
            if (explorerAnnotations == null) return null;
            return explorerAnnotations.Select(a => a.ToDashboardDataAnnotation()).ToList();
        }
    }
}
