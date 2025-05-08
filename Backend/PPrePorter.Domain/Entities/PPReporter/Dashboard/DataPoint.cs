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
    }
}
