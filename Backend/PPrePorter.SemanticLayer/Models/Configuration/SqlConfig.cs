namespace PPrePorter.SemanticLayer.Models.Configuration
{
    /// <summary>
    /// SQL-specific configuration
    /// </summary>
    public class SqlConfig
    {
        /// <summary>
        /// Gets or sets the database type (SqlServer, PostgreSQL, etc.)
        /// </summary>
        public string DatabaseType { get; set; } = "SqlServer";
        
        /// <summary>
        /// Gets or sets whether to enable query hints for optimization
        /// </summary>
        public bool EnableQueryHints { get; set; } = true;
        
        /// <summary>
        /// Gets or sets whether to enable table hints for optimization
        /// </summary>
        public bool EnableTableHints { get; set; } = true;
        
        /// <summary>
        /// Gets or sets whether to enable index hints for optimization
        /// </summary>
        public bool EnableIndexHints { get; set; } = false;
        
        /// <summary>
        /// Gets or sets whether to enable CTE optimization
        /// </summary>
        public bool EnableCteOptimization { get; set; } = true;
        
        /// <summary>
        /// Gets or sets the row count threshold for applying NOLOCK hints
        /// </summary>
        public int NoLockThreshold { get; set; } = 10000;
    }
}
