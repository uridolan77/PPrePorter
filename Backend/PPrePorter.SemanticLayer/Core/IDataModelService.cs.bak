using PPrePorter.SemanticLayer.Models.Database;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Core
{
    /// <summary>
    /// Service for managing the data model
    /// </summary>
    public interface IDataModelService
    {
        /// <summary>
        /// Gets the current data model
        /// </summary>
        Task<DataModel> GetDataModelAsync();
        
        /// <summary>
        /// Refreshes the data model from the source
        /// </summary>
        Task<DataModel> RefreshDataModelAsync();
        
        /// <summary>
        /// Gets a table by name
        /// </summary>
        Task<Table?> GetTableAsync(string tableName);
        
        /// <summary>
        /// Gets a view by name
        /// </summary>
        Task<View?> GetViewAsync(string viewName);
        
        /// <summary>
        /// Gets all related tables for a table
        /// </summary>
        Task<List<Table>> GetRelatedTablesAsync(string tableName);
        
        /// <summary>
        /// Finds a path to join two tables
        /// </summary>
        Task<List<string>?> FindJoinPathAsync(string fromTable, string toTable);
    }
}