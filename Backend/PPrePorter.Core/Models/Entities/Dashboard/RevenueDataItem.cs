using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a revenue data item
    /// </summary>
    public class RevenueDataItem
    {
        /// <summary>
        /// Key for the data item
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Timestamp for the data item
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Metrics associated with the data item
        /// </summary>
        public Dictionary<string, decimal> Metrics { get; set; } = new Dictionary<string, decimal>();
    }
}
