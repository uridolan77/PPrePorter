using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PPrePorter.API.Features.Reports.Models
{
    /// <summary>
    /// Request model for filtering daily actions
    /// </summary>
    public class DailyActionFilterRequest
    {
        /// <summary>
        /// Start date for the filter (inclusive)
        /// </summary>
        public DateTime StartDate { get; set; } = DateTime.UtcNow.Date.AddDays(-30);

        /// <summary>
        /// End date for the filter (inclusive)
        /// </summary>
        public DateTime EndDate { get; set; } = DateTime.UtcNow.Date;

        /// <summary>
        /// List of white label IDs to filter by
        /// </summary>
        public List<int>? WhiteLabelIds { get; set; }

        /// <summary>
        /// List of player IDs to filter by
        /// </summary>
        public List<int>? PlayerIds { get; set; }

        /// <summary>
        /// Page number for pagination (1-based)
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// Page size for pagination
        /// </summary>
        [Range(1, 1000, ErrorMessage = "Page size must be between 1 and 1000")]
        public int PageSize { get; set; } = 50;

        /// <summary>
        /// Group by option
        /// </summary>
        public GroupByOption GroupBy { get; set; } = GroupByOption.Day;
    }
}
