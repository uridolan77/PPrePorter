using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a request for segment comparison
    /// </summary>
    public class SegmentComparisonRequest
    {
        /// <summary>
        /// First segment start date
        /// </summary>
        public DateTime Segment1StartDate { get; set; }

        /// <summary>
        /// First segment end date
        /// </summary>
        public DateTime Segment1EndDate { get; set; }

        /// <summary>
        /// Second segment start date
        /// </summary>
        public DateTime Segment2StartDate { get; set; }

        /// <summary>
        /// Second segment end date
        /// </summary>
        public DateTime Segment2EndDate { get; set; }

        /// <summary>
        /// Metrics to compare
        /// </summary>
        public string[] Metrics { get; set; }

        /// <summary>
        /// White label IDs to filter by
        /// </summary>
        public int[] WhiteLabelIds { get; set; }

        /// <summary>
        /// Country codes to filter by
        /// </summary>
        public string[] CountryCodes { get; set; }

        /// <summary>
        /// Game providers to filter by
        /// </summary>
        public string[] GameProviders { get; set; }

        /// <summary>
        /// First segment name
        /// </summary>
        public string Segment1Name { get; set; }

        /// <summary>
        /// Second segment name
        /// </summary>
        public string Segment2Name { get; set; }

        /// <summary>
        /// Segment type (e.g., "Time", "WhiteLabel", "Country")
        /// </summary>
        public string SegmentType { get; set; }
    }
}
