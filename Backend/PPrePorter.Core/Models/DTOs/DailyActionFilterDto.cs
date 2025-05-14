using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for filtering daily actions
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
        /// The game IDs to filter by
        /// </summary>
        public List<long> GameIds { get; set; } = new List<long>();

        /// <summary>
        /// The country IDs to filter by
        /// </summary>
        public List<int> CountryIds { get; set; } = new List<int>();

        /// <summary>
        /// The currency IDs to filter by
        /// </summary>
        public List<int> CurrencyIds { get; set; } = new List<int>();

        /// <summary>
        /// The platforms to filter by
        /// </summary>
        public List<string> Platforms { get; set; } = new List<string>();

        /// <summary>
        /// The group by option
        /// </summary>
        public GroupByOption GroupBy { get; set; } = GroupByOption.None;

        /// <summary>
        /// The page number for pagination
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// The page size for pagination
        /// </summary>
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// The sort field
        /// </summary>
        public string SortField { get; set; } = "Date";

        /// <summary>
        /// The sort direction
        /// </summary>
        public SortDirection SortDirection { get; set; } = SortDirection.Descending;

        /// <summary>
        /// Computes a hash code for the filter
        /// </summary>
        /// <returns>The hash code</returns>
        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 17;
                hash = hash * 23 + StartDate.GetHashCode();
                hash = hash * 23 + EndDate.GetHashCode();
                
                if (WhiteLabelIds != null)
                {
                    foreach (var id in WhiteLabelIds)
                    {
                        hash = hash * 23 + id.GetHashCode();
                    }
                }
                
                hash = hash * 23 + GroupBy.GetHashCode();
                hash = hash * 23 + PageNumber.GetHashCode();
                hash = hash * 23 + PageSize.GetHashCode();
                hash = hash * 23 + (SortField?.GetHashCode() ?? 0);
                hash = hash * 23 + SortDirection.GetHashCode();
                
                return hash;
            }
        }
    }

    /// <summary>
    /// Enum for group by options
    /// </summary>
    public enum GroupByOption
    {
        /// <summary>
        /// No grouping
        /// </summary>
        None = 0,

        /// <summary>
        /// Group by day
        /// </summary>
        Day = 1,

        /// <summary>
        /// Group by month
        /// </summary>
        Month = 2,

        /// <summary>
        /// Group by year
        /// </summary>
        Year = 3,

        /// <summary>
        /// Group by player
        /// </summary>
        Player = 4,

        /// <summary>
        /// Group by game
        /// </summary>
        Game = 5,

        /// <summary>
        /// Group by white label
        /// </summary>
        WhiteLabel = 6,

        /// <summary>
        /// Group by country
        /// </summary>
        Country = 7,

        /// <summary>
        /// Group by currency
        /// </summary>
        Currency = 8,

        /// <summary>
        /// Group by platform
        /// </summary>
        Platform = 9
    }

    /// <summary>
    /// Enum for sort direction
    /// </summary>
    public enum SortDirection
    {
        /// <summary>
        /// Ascending sort
        /// </summary>
        Ascending = 0,

        /// <summary>
        /// Descending sort
        /// </summary>
        Descending = 1
    }
}
