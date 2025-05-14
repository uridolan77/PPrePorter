using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// DTO for filtering daily actions in DailyActionsDB
    /// </summary>
    public class DailyActionFilterDto
    {
        /// <summary>
        /// The start date for the filter
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// The end date for the filter
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// The white label IDs to filter by
        /// </summary>
        public List<int> WhiteLabelIds { get; set; } = new List<int>();

        /// <summary>
        /// The player IDs to filter by
        /// </summary>
        public List<long> PlayerIds { get; set; } = new List<long>();

        /// <summary>
        /// The field to group by
        /// </summary>
        public GroupByOption GroupBy { get; set; }

        /// <summary>
        /// The page number
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// The page size
        /// </summary>
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// The field to sort by
        /// </summary>
        public string SortField { get; set; }
    }

    /// <summary>
    /// Options for grouping daily actions
    /// </summary>
    public enum GroupByOption
    {
        None = 0,
        Date = 1,
        WhiteLabel = 2,
        Player = 3,
        Country = 4,
        Currency = 5,
        Platform = 6
    }
}
