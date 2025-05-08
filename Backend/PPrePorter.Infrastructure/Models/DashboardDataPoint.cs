using System;
using System.Collections.Generic;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Infrastructure.Models
{
    // Create a separate class to avoid ambiguity with the one in Domain
    public class DashboardDataPoint
    {
        public string Label { get; set; }
        public Dictionary<string, object> Dimensions { get; set; }
        public Dictionary<string, decimal> Metrics { get; set; }
        public DateTime? Timestamp { get; set; }
        
        // Method to convert to ExplorerDataPoint
        public ExplorerDataPoint ToExplorerDataPoint()
        {
            return new ExplorerDataPoint
            {
                Label = Label,
                Dimensions = Dimensions,
                Metrics = Metrics,
                Timestamp = Timestamp
            };
        }
        
        // Method to create from Domain.DataPoint
        public static DashboardDataPoint FromDataPoint(DataPoint dataPoint)
        {
            if (dataPoint == null) return null;
            return new DashboardDataPoint
            {
                Label = dataPoint.Label,
                Dimensions = dataPoint.Dimensions,
                Metrics = dataPoint.Metrics,
                Timestamp = dataPoint.Timestamp
            };
        }
    }
}
