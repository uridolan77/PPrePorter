using System;
using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// Hierarchical DTO for multi-level grouped DailyActions data
    /// </summary>
    public class HierarchicalDailyActionDto
    {
        /// <summary>
        /// Unique identifier for the group
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// Group key (e.g., "Day", "Label", "Country")
        /// </summary>
        public string GroupKey { get; set; } = string.Empty;
        
        /// <summary>
        /// Group value (e.g., "2023-05-01", "Casino A", "United Kingdom")
        /// </summary>
        public string GroupValue { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional data related to the group (e.g., date object, whiteLabelId)
        /// </summary>
        public object? GroupData { get; set; }
        
        /// <summary>
        /// Path to this node in the hierarchy (used for loading children)
        /// </summary>
        public string Path { get; set; } = string.Empty;
        
        /// <summary>
        /// Level in the hierarchy (0-based)
        /// </summary>
        public int Level { get; set; }
        
        /// <summary>
        /// Child groups when expanded
        /// </summary>
        public List<HierarchicalDailyActionDto> Children { get; set; } = new List<HierarchicalDailyActionDto>();
        
        /// <summary>
        /// Whether this group has children
        /// </summary>
        public bool HasChildren { get; set; }
        
        /// <summary>
        /// Whether children have been loaded
        /// </summary>
        public bool ChildrenLoaded { get; set; }
        
        /// <summary>
        /// Metrics for this group (e.g., "registrations": 100, "deposits": 5000)
        /// </summary>
        public Dictionary<string, decimal> Metrics { get; set; } = new Dictionary<string, decimal>();
    }
    
    /// <summary>
    /// Request DTO for loading children of a group
    /// </summary>
    public class GroupChildrenRequestDto
    {
        /// <summary>
        /// Path to the parent node
        /// </summary>
        public string ParentPath { get; set; } = string.Empty;
        
        /// <summary>
        /// Level of the children to load
        /// </summary>
        public int ChildLevel { get; set; }
        
        /// <summary>
        /// Group by option for the children
        /// </summary>
        public GroupByOption GroupBy { get; set; }
        
        /// <summary>
        /// Filter parameters
        /// </summary>
        public DailyActionFilterDto Filter { get; set; } = new DailyActionFilterDto();
    }
    
    /// <summary>
    /// Response DTO for hierarchical grouped data
    /// </summary>
    public class HierarchicalDailyActionResponseDto
    {
        /// <summary>
        /// Root level groups
        /// </summary>
        public List<HierarchicalDailyActionDto> Data { get; set; } = new List<HierarchicalDailyActionDto>();
        
        /// <summary>
        /// Summary metrics
        /// </summary>
        public DailyActionsSummaryDto Summary { get; set; } = new DailyActionsSummaryDto();
        
        /// <summary>
        /// Total count of records (before grouping)
        /// </summary>
        public int TotalCount { get; set; }
        
        /// <summary>
        /// Group by levels used
        /// </summary>
        public List<GroupByOption> GroupByLevels { get; set; } = new List<GroupByOption>();
        
        /// <summary>
        /// Start date of the report
        /// </summary>
        public DateTime StartDate { get; set; }
        
        /// <summary>
        /// End date of the report
        /// </summary>
        public DateTime EndDate { get; set; }
        
        /// <summary>
        /// Applied filters
        /// </summary>
        public DailyActionFilterDto AppliedFilters { get; set; } = new DailyActionFilterDto();
    }
}
