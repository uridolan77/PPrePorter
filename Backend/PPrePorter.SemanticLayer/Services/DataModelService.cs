using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Gaming;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// Service for managing the data model
    /// </summary>
    public class DataModelService : IDataModelService
    {
        private readonly ILogger<DataModelService> _logger;
        private readonly SemanticLayerConfig _config;
        private DataModel _dataModel;
        private readonly object _modelLock = new object();
        private DateTime _lastRefreshTime = DateTime.MinValue;
        
        public DataModelService(
            ILogger<DataModelService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
            
            // Initialize with a default model
            _dataModel = GamingDataModel.GetDefaultModel();
            
            _logger.LogInformation("Data model service initialized with default gaming model");
        }
        
        /// <summary>
        /// Gets the current data model
        /// </summary>
        public async Task<DataModel> GetDataModelAsync()
        {
            // Auto-refresh if needed
            if (ShouldRefreshModel())
            {
                await RefreshDataModelAsync();
            }
            
            return _dataModel;
        }
        
        /// <summary>
        /// Gets a table from the data model
        /// </summary>
        public async Task<Table?> GetTableAsync(string tableName)
        {
            if (string.IsNullOrEmpty(tableName))
            {
                return null;
            }
            
            // Auto-refresh if needed
            if (ShouldRefreshModel())
            {
                await RefreshDataModelAsync();
            }
            
            return _dataModel.Tables.FirstOrDefault(t => 
                string.Equals(t.Name, tableName, StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// Gets a view from the data model
        /// </summary>
        public async Task<View?> GetViewAsync(string viewName)
        {
            if (string.IsNullOrEmpty(viewName))
            {
                return null;
            }
            
            // Auto-refresh if needed
            if (ShouldRefreshModel())
            {
                await RefreshDataModelAsync();
            }
            
            return _dataModel.Views.FirstOrDefault(v => 
                string.Equals(v.Name, viewName, StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// Gets relationships for a table
        /// </summary>
        public async Task<List<Relationship>> GetRelationshipsAsync(string tableName)
        {
            if (string.IsNullOrEmpty(tableName))
            {
                return new List<Relationship>();
            }
            
            // Auto-refresh if needed
            if (ShouldRefreshModel())
            {
                await RefreshDataModelAsync();
            }
            
            return _dataModel.Relationships.Where(r => 
                string.Equals(r.SourceTable, tableName, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(r.TargetTable, tableName, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Gets tables related to the specified table
        /// </summary>
        public async Task<List<Table>> GetRelatedTablesAsync(string tableName)
        {
            if (string.IsNullOrEmpty(tableName))
            {
                return new List<Table>();
            }
            
            // Get relationships for the table
            var relationships = await GetRelationshipsAsync(tableName);
            
            // Get related table names
            var relatedTableNames = relationships
                .Select(r => r.SourceTable == tableName ? r.TargetTable : r.SourceTable)
                .Distinct()
                .ToList();
            
            // Get table objects
            var relatedTables = new List<Table>();
            foreach (var relatedTableName in relatedTableNames)
            {
                var table = await GetTableAsync(relatedTableName);
                if (table != null)
                {
                    relatedTables.Add(table);
                }
            }
            
            return relatedTables;
        }
        
        /// <summary>
        /// Finds a join path between two tables
        /// </summary>
        public async Task<List<Relationship>> FindJoinPathAsync(string sourceTable, string targetTable)
        {
            if (string.IsNullOrEmpty(sourceTable) || string.IsNullOrEmpty(targetTable))
            {
                return new List<Relationship>();
            }
            
            // Auto-refresh if needed
            if (ShouldRefreshModel())
            {
                await RefreshDataModelAsync();
            }
            
            // Simple breadth-first search to find a path
            var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var queue = new Queue<(string Table, List<Relationship> Path)>();
            
            // Start from source table
            visited.Add(sourceTable);
            queue.Enqueue((sourceTable, new List<Relationship>()));
            
            while (queue.Count > 0)
            {
                var (currentTable, path) = queue.Dequeue();
                
                // Check if we've reached the target
                if (string.Equals(currentTable, targetTable, StringComparison.OrdinalIgnoreCase))
                {
                    return path;
                }
                
                // Find all relationships for the current table
                var relationships = _dataModel.Relationships.Where(r => 
                    string.Equals(r.SourceTable, currentTable, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(r.TargetTable, currentTable, StringComparison.OrdinalIgnoreCase))
                    .ToList();
                
                foreach (var rel in relationships)
                {
                    string nextTable = rel.SourceTable == currentTable ? rel.TargetTable : rel.SourceTable;
                    
                    if (!visited.Contains(nextTable))
                    {
                        // Create a new path with the current relationship
                        var newPath = new List<Relationship>(path) { rel };
                        
                        // Mark as visited and add to queue
                        visited.Add(nextTable);
                        queue.Enqueue((nextTable, newPath));
                    }
                }
            }
            
            // No path found
            return new List<Relationship>();
        }
        
        /// <summary>
        /// Refreshes the data model from the database
        /// </summary>
        public async Task<DataModel> RefreshDataModelAsync()
        {
            _logger.LogInformation("Refreshing data model");
            
            try
            {
                // Use lock to prevent multiple concurrent refreshes
                lock (_modelLock)
                {
                    // For now, just use the default model
                    // In a real implementation, you would query the database metadata here
                    _dataModel = GamingDataModel.GetDefaultModel();
                    _lastRefreshTime = DateTime.UtcNow;
                }
                
                _logger.LogInformation("Data model refreshed successfully");
                
                return _dataModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing data model");
                throw;
            }
        }
        
        /// <summary>
        /// Determines if the model should be refreshed based on time since last refresh
        /// </summary>
        private bool ShouldRefreshModel()
        {
            // Refresh if the model is more than 1 hour old
            return (DateTime.UtcNow - _lastRefreshTime).TotalHours > 1;
        }
    }
}
