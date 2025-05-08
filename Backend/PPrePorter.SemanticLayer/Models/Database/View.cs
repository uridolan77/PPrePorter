using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database view
    /// </summary>
    public class View
    {
        /// <summary>
        /// Name of the view
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Schema of the view
        /// </summary>
        public string Schema { get; set; } = "dbo";
        
        /// <summary>
        /// Description of the view
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Columns in the view
        /// </summary>
        public List<Column> Columns { get; set; } = new List<Column>();
        
        /// <summary>
        /// SQL query that defines the view
        /// </summary>
        public string? SqlDefinition { get; set; }
        
        /// <summary>
        /// Whether this is a materialized view
        /// </summary>
        public bool IsMaterialized { get; set; }
        
        /// <summary>
        /// Source tables used in the view
        /// </summary>
        public List<string> SourceTables { get; set; } = new List<string>();
        
        /// <summary>
        /// Gets the fully qualified name of the view
        /// </summary>
        public string FullName => $"{Schema}.{Name}";
        
        /// <summary>
        /// Gets a column by name
        /// </summary>
        public Column? GetColumn(string columnName)
        {
            return Columns.Find(c => c.Name.Equals(columnName, System.StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// When the view was last refreshed (for materialized views)
        /// </summary>
        public DateTime? LastRefreshed { get; set; }
        
        /// <summary>
        /// Refresh schedule for materialized views
        /// </summary>
        public string? RefreshSchedule { get; set; }
        
        /// <summary>
        /// Performance metrics for the view
        /// </summary>
        public ViewPerformanceMetrics? PerformanceMetrics { get; set; }
        
        /// <summary>
        /// Access control information for the view
        /// </summary>
        public ViewAccessControl? AccessControl { get; set; }
    }
    
    /// <summary>
    /// Performance metrics for a view
    /// </summary>
    public class ViewPerformanceMetrics
    {
        /// <summary>
        /// Average execution time in milliseconds
        /// </summary>
        public double AverageExecutionTimeMs { get; set; }
        
        /// <summary>
        /// Number of times the view has been accessed
        /// </summary>
        public int AccessCount { get; set; }
        
        /// <summary>
        /// Last time the view was accessed
        /// </summary>
        public DateTime? LastAccessed { get; set; }
        
        /// <summary>
        /// Estimated row count
        /// </summary>
        public long EstimatedRowCount { get; set; }
        
        /// <summary>
        /// Estimated size in bytes
        /// </summary>
        public long EstimatedSizeBytes { get; set; }
    }
    
    /// <summary>
    /// Access control information for a view
    /// </summary>
    public class ViewAccessControl
    {
        /// <summary>
        /// Roles that have access to this view
        /// </summary>
        public List<string> AuthorizedRoles { get; set; } = new List<string>();
        
        /// <summary>
        /// Whether the view is accessible to all users
        /// </summary>
        public bool IsPublic { get; set; }
        
        /// <summary>
        /// Row-level security expression
        /// </summary>
        public string? RowLevelSecurityExpression { get; set; }
    }
}