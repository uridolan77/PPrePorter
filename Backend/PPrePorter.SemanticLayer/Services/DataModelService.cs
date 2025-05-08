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
            
            // Initialize with default model
            _dataModel = GamingDataModel.GetDefaultModel();
        }
        
        /// <summary>
        /// Gets the current data model, refreshing if needed
        /// </summary>
        public async Task<DataModel> GetDataModelAsync()
        {
            // Check if auto-refresh is enabled and it's time to refresh
            if (_config.DataModel.AutoRefresh && 
                (DateTime.UtcNow - _lastRefreshTime).TotalMinutes > _config.DataModel.RefreshIntervalMinutes)
            {
                await RefreshDataModelAsync();
            }
            
            return _dataModel;
        }
        
        /// <summary>
        /// Refreshes the data model from the source
        /// </summary>
        public async Task<DataModel> RefreshDataModelAsync()
        {
            _logger.LogInformation("Refreshing data model");
            
            try
            {
                DataModel newModel;
                
                // Determine the source of the data model
                switch (_config.DataModel.Source.ToLowerInvariant())
                {
                    case "database":
                        newModel = await LoadModelFromDatabaseAsync();
                        break;
                    
                    case "file":
                        newModel = await LoadModelFromFileAsync();
                        break;
                    
                    default:
                        // Use default gaming model if source is not recognized
                        newModel = GamingDataModel.GetDefaultModel();
                        break;
                }
                
                // Auto-discover relationships if configured
                if (_config.DataModel.AutoDiscoverRelationships)
                {
                    DiscoverRelationships(newModel);
                }
                
                // Update the data model
                lock (_modelLock)
                {
                    _dataModel = newModel;
                    _lastRefreshTime = DateTime.UtcNow;
                }
                
                _logger.LogInformation("Data model refreshed successfully with {TableCount} tables, {ViewCount} views, and {RelationshipCount} relationships", 
                    newModel.Tables.Count, newModel.Views.Count, newModel.Relationships.Count);
                
                return newModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing data model");
                
                // Return current model on error
                return _dataModel;
            }
        }
        
        /// <summary>
        /// Gets a table by name
        /// </summary>
        public async Task<Table?> GetTableAsync(string tableName)
        {
            var model = await GetDataModelAsync();
            return model.GetTable(tableName);
        }
        
        /// <summary>
        /// Gets a view by name
        /// </summary>
        public async Task<View?> GetViewAsync(string viewName)
        {
            var model = await GetDataModelAsync();
            return model.GetView(viewName);
        }
        
        /// <summary>
        /// Gets all related tables for a table
        /// </summary>
        public async Task<List<Table>> GetRelatedTablesAsync(string tableName)
        {
            var model = await GetDataModelAsync();
            var relatedTables = new List<Table>();
            
            foreach (var relationship in model.Relationships)
            {
                if (relationship.FromTable.Equals(tableName, StringComparison.OrdinalIgnoreCase))
                {
                    var relatedTable = model.GetTable(relationship.ToTable);
                    if (relatedTable != null)
                    {
                        relatedTables.Add(relatedTable);
                    }
                }
                else if (relationship.ToTable.Equals(tableName, StringComparison.OrdinalIgnoreCase))
                {
                    var relatedTable = model.GetTable(relationship.FromTable);
                    if (relatedTable != null)
                    {
                        relatedTables.Add(relatedTable);
                    }
                }
            }
            
            return relatedTables;
        }
        
        /// <summary>
        /// Finds a path to join two tables
        /// </summary>
        public async Task<List<string>?> FindJoinPathAsync(string fromTable, string toTable)
        {
            var model = await GetDataModelAsync();
            return model.FindJoinPath(fromTable, toTable);
        }
        
        /// <summary>
        /// Loads the data model from a database
        /// </summary>
        private async Task<DataModel> LoadModelFromDatabaseAsync()
        {
            _logger.LogInformation("Loading data model from database");
            
            // This would be replaced with actual database introspection code
            // For now, we'll use the default gaming model
            var model = GamingDataModel.GetDefaultModel();
            
            // TODO: Implement database schema discovery
            // This could involve:
            // 1. Querying information_schema tables
            // 2. Reading metadata from the database
            // 3. Building tables, views, and relationships
            
            await Task.Delay(100); // Simulate async database work
            
            return model;
        }
        
        /// <summary>
        /// Loads the data model from a file
        /// </summary>
        private async Task<DataModel> LoadModelFromFileAsync()
        {
            _logger.LogInformation("Loading data model from file: {FilePath}", _config.DataModel.ModelDefinitionPath);
            
            // This would be replaced with actual file loading code
            // For now, we'll use the default gaming model
            var model = GamingDataModel.GetDefaultModel();
            
            // TODO: Implement file-based model loading
            // This could involve:
            // 1. Reading JSON or XML file
            // 2. Deserializing into DataModel object
            
            await Task.Delay(100); // Simulate async file I/O
            
            return model;
        }
        
        /// <summary>
        /// Discovers relationships between tables based on column names
        /// </summary>
        private void DiscoverRelationships(DataModel model)
        {
            _logger.LogInformation("Auto-discovering relationships");
            
            var relationships = new List<Relationship>();
            
            // Look for potential foreign key relationships based on naming conventions
            foreach (var table in model.Tables)
            {
                foreach (var column in table.Columns)
                {
                    // Skip columns that are already identified as foreign keys
                    if (column.IsForeignKey && !string.IsNullOrEmpty(column.ForeignKeyReference))
                    {
                        continue;
                    }
                    
                    // Look for columns that might be foreign keys based on naming (e.g., xxxID)
                    if (column.Name.EndsWith("ID", StringComparison.OrdinalIgnoreCase) ||
                        column.Name.EndsWith("Key", StringComparison.OrdinalIgnoreCase))
                    {
                        // Get the potential referenced table name
                        var potentialTableName = column.Name.Replace("ID", "").Replace("Key", "");
                        
                        // Find matching table that this column might reference
                        var referencedTable = model.Tables.FirstOrDefault(t => 
                            t.Name.Equals(potentialTableName, StringComparison.OrdinalIgnoreCase));
                        
                        if (referencedTable != null)
                        {
                            // Find primary key in the referenced table
                            var primaryKey = referencedTable.Columns.FirstOrDefault(c => c.IsPrimaryKey);
                            
                            if (primaryKey != null)
                            {
                                // Create the relationship
                                var relationship = new Relationship
                                {
                                    Name = $"FK_{table.Name}_{column.Name}_To_{referencedTable.Name}",
                                    FromTable = table.Name,
                                    FromColumn = column.Name,
                                    ToTable = referencedTable.Name,
                                    ToColumn = primaryKey.Name,
                                    RelationshipType = "ManyToOne",
                                    Cardinality = "N:1"
                                };
                                
                                // Add to the list of discovered relationships
                                relationships.Add(relationship);
                                
                                // Mark the column as a foreign key
                                column.IsForeignKey = true;
                                column.ForeignKeyReference = referencedTable.Name;
                            }
                        }
                    }
                }
            }
            
            // Add discovered relationships to the model
            foreach (var relationship in relationships)
            {
                // Check if the relationship already exists
                var existingRelationship = model.Relationships.FirstOrDefault(r =>
                    (r.FromTable == relationship.FromTable && r.FromColumn == relationship.FromColumn &&
                     r.ToTable == relationship.ToTable && r.ToColumn == relationship.ToColumn) ||
                    (r.FromTable == relationship.ToTable && r.FromColumn == relationship.ToColumn &&
                     r.ToTable == relationship.FromTable && r.ToColumn == relationship.FromColumn));
                
                if (existingRelationship == null)
                {
                    model.Relationships.Add(relationship);
                }
            }
            
            _logger.LogInformation("Discovered {Count} relationships", relationships.Count);
        }
    }
}