using System;
using System.Collections.Generic;
using System.Linq;

namespace PPrePorter.SemanticLayer.Models.Configuration
{
    /// <summary>
    /// Configuration for the semantic layer
    /// </summary>
    public class SemanticLayerConfig
    {
        /// <summary>
        /// Gets or sets the default database connection string name to use
        /// </summary>
        public string DefaultConnectionStringName { get; set; } = "PPRePorterDB";

        /// <summary>
        /// Gets or sets the maximum number of rows that can be returned in a single query
        /// </summary>
        public int MaxQueryRows { get; set; } = 50000;

        /// <summary>
        /// Gets or sets the query timeout in seconds
        /// </summary>
        public int QueryTimeoutSeconds { get; set; } = 60;

        /// <summary>
        /// Gets or sets the default cache duration in minutes
        /// </summary>
        public int DefaultCacheDurationMinutes { get; set; } = 15;

        /// <summary>
        /// Gets or sets whether query caching is enabled
        /// </summary>
        public bool EnableQueryCaching { get; set; } = true;

        /// <summary>
        /// Gets or sets the mapping configuration for entities and database tables
        /// </summary>
        public EntityMappingConfig EntityMapping { get; set; } = new EntityMappingConfig();
        
        /// <summary>
        /// Gets or sets the logging configuration for semantic layer operations
        /// </summary>
        public LoggingConfig Logging { get; set; } = new LoggingConfig();
        
        /// <summary>
        /// Gets or sets the security configuration for semantic layer access
        /// </summary>
        public SecurityConfig Security { get; set; } = new SecurityConfig();
    }

    /// <summary>
    /// Configuration for entity mapping
    /// </summary>
    public class EntityMappingConfig
    {
        /// <summary>
        /// Gets or sets whether to automatically derive dimensions from foreign keys
        /// </summary>
        public bool AutoDiscoverDimensions { get; set; } = true;

        /// <summary>
        /// Gets or sets whether to automatically derive metrics from numeric columns
        /// </summary>
        public bool AutoDiscoverMetrics { get; set; } = true;

        /// <summary>
        /// Gets or sets the default schema to use for tables
        /// </summary>
        public string DefaultSchema { get; set; } = "dbo";

        /// <summary>
        /// Gets or sets the list of tables to include in the semantic layer
        /// </summary>
        public List<string> IncludedTables { get; set; } = new List<string>();

        /// <summary>
        /// Gets or sets the list of tables to exclude from the semantic layer
        /// </summary>
        public List<string> ExcludedTables { get; set; } = new List<string>();
        
        /// <summary>
        /// Gets or sets custom SQL expressions for complex metrics
        /// </summary>
        public Dictionary<string, string> CustomMetricExpressions { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Configuration for semantic layer logging
    /// </summary>
    public class LoggingConfig
    {
        /// <summary>
        /// Gets or sets whether to log query execution
        /// </summary>
        public bool LogQueryExecution { get; set; } = true;

        /// <summary>
        /// Gets or sets whether to log errors
        /// </summary>
        public bool LogErrors { get; set; } = true;

        /// <summary>
        /// Gets or sets whether to log performance metrics
        /// </summary>
        public bool LogPerformance { get; set; } = true;

        /// <summary>
        /// Gets or sets the log level
        /// </summary>
        public string LogLevel { get; set; } = "Information";
    }

    /// <summary>
    /// Configuration for semantic layer security
    /// </summary>
    public class SecurityConfig
    {
        /// <summary>
        /// Gets or sets whether row-level security is enabled
        /// </summary>
        public bool EnableRowLevelSecurity { get; set; } = false;

        /// <summary>
        /// Gets or sets whether column-level security is enabled
        /// </summary>
        public bool EnableColumnLevelSecurity { get; set; } = false;

        /// <summary>
        /// Gets or sets the list of roles with full access to all semantic layer entities
        /// </summary>
        public List<string> AdminRoles { get; set; } = new List<string> { "Administrator" };
        
        /// <summary>
        /// Gets or sets the mapping of roles to accessible dimensions and metrics
        /// </summary>
        public Dictionary<string, List<string>> RoleEntityAccess { get; set; } = new Dictionary<string, List<string>>();
    }
}