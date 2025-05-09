using PPrePorter.SemanticLayer.Models.Database;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Interface for services that provide data model information
    /// </summary>
    public interface IDataModelService
    {
        /// <summary>
        /// Gets the current data model
        /// </summary>
        Task<DataModel> GetDataModelAsync();
        
        /// <summary>
        /// Gets a table from the data model
        /// </summary>
        Task<Table?> GetTableAsync(string tableName);
        
        /// <summary>
        /// Gets a view from the data model
        /// </summary>
        Task<View?> GetViewAsync(string viewName);
        
        /// <summary>
        /// Gets relationships for a table
        /// </summary>
        Task<List<Relationship>> GetRelationshipsAsync(string tableName);
        
        /// <summary>
        /// Gets tables related to the specified table
        /// </summary>
        Task<List<Table>> GetRelatedTablesAsync(string tableName);
        
        /// <summary>
        /// Finds a join path between two tables
        /// </summary>
        Task<List<Relationship>> FindJoinPathAsync(string sourceTable, string targetTable);
        
        /// <summary>
        /// Refreshes the data model from the database
        /// </summary>
        Task<DataModel> RefreshDataModelAsync();
    }
}
