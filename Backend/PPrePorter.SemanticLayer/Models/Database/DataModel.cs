using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents the data model for the database
    /// </summary>
    public class DataModel
    {
        /// <summary>
        /// Tables in the data model
        /// </summary>
        public List<Table> Tables { get; set; } = new List<Table>();
        
        /// <summary>
        /// Views in the data model
        /// </summary>
        public List<View> Views { get; set; } = new List<View>();
        
        /// <summary>
        /// Relationships between tables
        /// </summary>
        public List<Relationship> Relationships { get; set; } = new List<Relationship>();
        
        /// <summary>
        /// Fact tables in the model
        /// </summary>
        private HashSet<string> _factTables = new HashSet<string>();
        
        /// <summary>
        /// Dimension tables in the model
        /// </summary>
        private HashSet<string> _dimensionTables = new HashSet<string>();
        
        /// <summary>
        /// Gets a table by name
        /// </summary>
        public Table? GetTable(string tableName)
        {
            return Tables.Find(t => t.Name.Equals(tableName, System.StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// Gets a view by name
        /// </summary>
        public View? GetView(string viewName)
        {
            return Views.Find(v => v.Name.Equals(viewName, System.StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// Gets the relationship between two tables
        /// </summary>
        public Relationship? GetRelationship(string fromTable, string toTable)
        {
            return Relationships.Find(r =>
                (r.FromTable.Equals(fromTable, System.StringComparison.OrdinalIgnoreCase) && 
                 r.ToTable.Equals(toTable, System.StringComparison.OrdinalIgnoreCase)) ||
                (r.FromTable.Equals(toTable, System.StringComparison.OrdinalIgnoreCase) && 
                 r.ToTable.Equals(fromTable, System.StringComparison.OrdinalIgnoreCase)));
        }
        
        /// <summary>
        /// Gets all fact tables
        /// </summary>
        public List<string> GetFactTables()
        {
            return new List<string>(_factTables);
        }
        
        /// <summary>
        /// Gets all dimension tables
        /// </summary>
        public List<string> GetDimensionTables()
        {
            return new List<string>(_dimensionTables);
        }
        
        /// <summary>
        /// Checks if a table is a fact table
        /// </summary>
        public bool IsFactTable(string tableName)
        {
            return _factTables.Contains(tableName);
        }
        
        /// <summary>
        /// Checks if a table is a dimension table
        /// </summary>
        public bool IsDimensionTable(string tableName)
        {
            return _dimensionTables.Contains(tableName);
        }
        
        /// <summary>
        /// Adds a fact table to the model
        /// </summary>
        public void AddFactTable(string tableName)
        {
            _factTables.Add(tableName);
        }
        
        /// <summary>
        /// Adds a dimension table to the model
        /// </summary>
        public void AddDimensionTable(string tableName)
        {
            _dimensionTables.Add(tableName);
        }
        
        /// <summary>
        /// Gets materialized views for a table
        /// </summary>
        public List<View> GetMaterializedViewsForTable(string tableName)
        {
            return Views.FindAll(v => 
                v.IsMaterialized && 
                v.SourceTables.Contains(tableName));
        }
        
        /// <summary>
        /// Finds a path to join two tables
        /// </summary>
        public List<string>? FindJoinPath(string fromTable, string toTable)
        {
            // If the tables are directly related, return them
            var directRelationship = GetRelationship(fromTable, toTable);
            if (directRelationship != null)
            {
                return new List<string> { fromTable, toTable };
            }
            
            // Use breadth-first search to find a path
            var queue = new Queue<List<string>>();
            var visited = new HashSet<string>();
            
            queue.Enqueue(new List<string> { fromTable });
            visited.Add(fromTable);
            
            while (queue.Count > 0)
            {
                var path = queue.Dequeue();
                var currentTable = path[path.Count - 1];
                
                // Find all tables related to the current one
                var relatedTables = GetRelatedTables(currentTable);
                
                foreach (var relatedTable in relatedTables)
                {
                    if (relatedTable.Equals(toTable, System.StringComparison.OrdinalIgnoreCase))
                    {
                        // Found the target table
                        path.Add(toTable);
                        return path;
                    }
                    
                    if (!visited.Contains(relatedTable))
                    {
                        visited.Add(relatedTable);
                        
                        var newPath = new List<string>(path);
                        newPath.Add(relatedTable);
                        queue.Enqueue(newPath);
                    }
                }
            }
            
            // No path found
            return null;
        }
        
        /// <summary>
        /// Gets all tables related to a given table
        /// </summary>
        private List<string> GetRelatedTables(string tableName)
        {
            var relatedTables = new List<string>();
            
            foreach (var relationship in Relationships)
            {
                if (relationship.FromTable.Equals(tableName, System.StringComparison.OrdinalIgnoreCase))
                {
                    relatedTables.Add(relationship.ToTable);
                }
                else if (relationship.ToTable.Equals(tableName, System.StringComparison.OrdinalIgnoreCase))
                {
                    relatedTables.Add(relationship.FromTable);
                }
            }
            
            return relatedTables;
        }
    }
}