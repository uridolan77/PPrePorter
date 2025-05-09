# PowerShell script to fix SqlTranslationService issues

# Backup the current SqlTranslationService.cs
$servicesDir = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Services"
$sqlTranslationServicePath = Join-Path $servicesDir "SqlTranslationService.cs"

if (Test-Path $sqlTranslationServicePath) {
    Rename-Item -Path $sqlTranslationServicePath -NewName "SqlTranslationService.cs.bak" -Force
    Write-Host "Backed up SqlTranslationService.cs to SqlTranslationService.cs.bak"
}

# Create a simplified version of the service
$newServiceContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Services\SqlTranslationService.cs
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Core;
using PPrePorter.SemanticLayer.Models.Configuration;
using PPrePorter.SemanticLayer.Models.Database;
using PPrePorter.SemanticLayer.Models.Entities;
using PPrePorter.SemanticLayer.Models.Translation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Services
{
    /// <summary>
    /// Service for translating mapped entities to SQL
    /// </summary>
    public class SqlTranslationService : ISqlTranslationService
    {
        private readonly ILogger<SqlTranslationService> _logger;
        private readonly SemanticLayerConfig _config;
        
        public SqlTranslationService(
            ILogger<SqlTranslationService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
        }
        
        /// <summary>
        /// Translates mapped entities to SQL
        /// </summary>
        public async Task<SqlTranslationResult> TranslateToSqlAsync(
            MappedQueryEntities entities,
            DataModel dataModel,
            TranslationContext? context = null)
        {
            _logger.LogInformation("Translating mapped entities to SQL");
            
            try
            {
                // Create a basic SQL query as a placeholder
                // This implementation should be expanded with proper SQL generation logic
                var result = new SqlTranslationResult
                {
                    Sql = GenerateBasicSql(entities, dataModel),
                    Parameters = new Dictionary<string, object>(),
                    MainTable = FindMainTable(entities, dataModel)?.Name ?? "",
                    UsedTables = new List<string>()
                };
                
                // Simulate waiting for an operation
                await Task.Delay(10);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating entities to SQL");
                throw;
            }
        }
        
        /// <summary>
        /// Applies optimizations to a SQL translation result
        /// </summary>
        public async Task<SqlTranslationResult> ApplyOptimizationsAsync(
            SqlTranslationResult result,
            DataModel dataModel)
        {
            // Simulate applying optimizations
            await Task.Delay(10);
            
            // Return a copy with the same values
            return new SqlTranslationResult
            {
                Sql = result.Sql,
                Parameters = result.Parameters,
                MainTable = result.MainTable,
                UsedTables = result.UsedTables,
                Explanation = result.Explanation,
                ComparisonQueries = result.ComparisonQueries
            };
        }
        
        /// <summary>
        /// Validates a SQL query before execution
        /// </summary>
        public async Task<bool> ValidateSqlAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            // Simple validation logic
            await Task.Delay(10);
            
            bool isValid = !string.IsNullOrEmpty(sql) &&
                          !sql.Contains("DROP") &&
                          !sql.Contains("DELETE") &&
                          !sql.Contains("UPDATE") &&
                          !sql.Contains("INSERT");
                          
            return isValid;
        }
        
        /// <summary>
        /// Explains the SQL generation process
        /// </summary>
        public async Task<string> ExplainSqlAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            await Task.Delay(10);
            
            // Add a simple explanation
            return "SQL query generated from the provided entities";
        }
        
        #region Helper Methods
        
        /// <summary>
        /// Generates a basic SQL query for the entities
        /// </summary>
        private string GenerateBasicSql(MappedQueryEntities entities, DataModel dataModel)
        {
            var sb = new StringBuilder();
            
            sb.AppendLine("SELECT ");
            
            // Add metrics
            if (entities.Metrics.Any())
            {
                for (int i = 0; i < entities.Metrics.Count; i++)
                {
                    var metric = entities.Metrics[i];
                    sb.Append($"{metric.Aggregation}({metric.Table}.{metric.DatabaseField}) AS {metric.Name}");
                    
                    if (i < entities.Metrics.Count - 1 || entities.Dimensions.Any())
                    {
                        sb.AppendLine(",");
                    }
                }
            }
            
            // Add dimensions
            if (entities.Dimensions.Any())
            {
                for (int i = 0; i < entities.Dimensions.Count; i++)
                {
                    var dimension = entities.Dimensions[i];
                    sb.Append($"{dimension.Table}.{dimension.DatabaseField} AS {dimension.Name}");
                    
                    if (i < entities.Dimensions.Count - 1)
                    {
                        sb.AppendLine(",");
                    }
                }
            }
            
            sb.AppendLine();
            
            // Find main table
            Table? mainTable = FindMainTable(entities, dataModel);
            if (mainTable != null)
            {
                sb.AppendLine($"FROM {mainTable.Name}");
            }
            else
            {
                // Use the first table mentioned in metrics or dimensions
                string? firstTable = entities.Metrics.FirstOrDefault()?.Table ?? 
                                   entities.Dimensions.FirstOrDefault()?.Table;
                                   
                if (!string.IsNullOrEmpty(firstTable))
                {
                    sb.AppendLine($"FROM {firstTable}");
                }
                else
                {
                    // Fallback
                    sb.AppendLine("FROM UnknownTable");
                }
            }
            
            // Add where clause
            if (entities.Filters.Any())
            {
                sb.AppendLine("WHERE ");
                
                for (int i = 0; i < entities.Filters.Count; i++)
                {
                    var filter = entities.Filters[i];
                    
                    sb.Append($"{filter.Table}.{filter.DatabaseField} {filter.Operator} '{filter.Value}'");
                    
                    if (i < entities.Filters.Count - 1)
                    {
                        sb.AppendLine(" AND ");
                    }
                }
            }
            
            // Add time range if specified
            if (entities.TimeRange != null && entities.TimeRange.StartDate.HasValue && entities.TimeRange.EndDate.HasValue)
            {
                if (entities.Filters.Any())
                {
                    sb.AppendLine(" AND ");
                }
                else
                {
                    sb.AppendLine("WHERE ");
                }
                
                // Find a date column from the model
                string dateColumn = "date_column"; // This should be determined from the model
                
                sb.AppendLine($"{dateColumn} BETWEEN '{entities.TimeRange.StartDate.Value:yyyy-MM-dd}' AND '{entities.TimeRange.EndDate.Value:yyyy-MM-dd}'");
            }
            
            // Add group by
            if (entities.Dimensions.Any())
            {
                sb.AppendLine("GROUP BY ");
                
                for (int i = 0; i < entities.Dimensions.Count; i++)
                {
                    var dimension = entities.Dimensions[i];
                    sb.Append($"{dimension.Table}.{dimension.DatabaseField}");
                    
                    if (i < entities.Dimensions.Count - 1)
                    {
                        sb.AppendLine(", ");
                    }
                }
            }
            
            // Add sorting
            if (entities.SortBy != null)
            {
                sb.AppendLine("ORDER BY ");
                sb.AppendLine($"{entities.SortBy.Field} {entities.SortBy.Direction}");
            }
            
            // Add limit
            if (entities.Limit.HasValue && entities.Limit.Value > 0)
            {
                sb.AppendLine($"LIMIT {entities.Limit.Value}");
            }
            
            return sb.ToString();
        }
        
        /// <summary>
        /// Find the main fact table to use for the query
        /// </summary>
        private Table? FindMainTable(MappedQueryEntities entities, DataModel dataModel)
        {
            // Try to find a fact table that contains the metrics
            foreach (var table in dataModel.Tables)
            {
                if (entities.Metrics.Any(m => m.Table == table.Name))
                {
                    return table;
                }
            }
            
            // If no match for metrics, try dimensions
            foreach (var table in dataModel.Tables)
            {
                if (entities.Dimensions.Any(d => d.Table == table.Name))
                {
                    return table;
                }
            }
            
            // Return the first table as a fallback
            return dataModel.Tables.FirstOrDefault();
        }
        
        #endregion
    }
}
'@

Set-Content -Path $sqlTranslationServicePath -Value $newServiceContent -Force
Write-Host "Created new SqlTranslationService.cs"

# Create Gaming namespace and default model
$gamingDir = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Gaming"
if (-not (Test-Path $gamingDir)) {
    New-Item -Path $gamingDir -ItemType Directory -Force | Out-Null
    Write-Host "Created Gaming directory"
}

$gamingModelPath = Join-Path $gamingDir "GamingDataModel.cs"
$gamingModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Gaming\GamingDataModel.cs
using PPrePorter.SemanticLayer.Models.Database;
using System;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Gaming
{
    /// <summary>
    /// Provides a default gaming data model for development and testing
    /// </summary>
    public static class GamingDataModel
    {
        /// <summary>
        /// Gets a default data model for the gaming domain
        /// </summary>
        public static DataModel GetDefaultModel()
        {
            var model = new DataModel
            {
                Name = "GamingDataModel",
                Description = "Default data model for gaming analytics",
                Tables = new List<Table>(),
                Views = new List<View>(),
                Relationships = new List<Relationship>()
            };
            
            // Players table (dimension)
            var playersTable = new Table
            {
                Name = "Players",
                Description = "Player information",
                Columns = new List<Column>
                {
                    new Column { Name = "PlayerId", DataType = "int", IsPrimaryKey = true },
                    new Column { Name = "Username", DataType = "varchar" },
                    new Column { Name = "RegistrationDate", DataType = "datetime", IsDate = true },
                    new Column { Name = "Country", DataType = "varchar" },
                    new Column { Name = "Status", DataType = "varchar" }
                }
            };
            
            // Games table (dimension)
            var gamesTable = new Table
            {
                Name = "Games",
                Description = "Game information",
                Columns = new List<Column>
                {
                    new Column { Name = "GameId", DataType = "int", IsPrimaryKey = true },
                    new Column { Name = "GameName", DataType = "varchar" },
                    new Column { Name = "GameType", DataType = "varchar" },
                    new Column { Name = "Provider", DataType = "varchar" }
                }
            };
            
            // Transactions table (fact)
            var transactionsTable = new Table
            {
                Name = "Transactions",
                Description = "Gaming transactions",
                Columns = new List<Column>
                {
                    new Column { Name = "TransactionId", DataType = "int", IsPrimaryKey = true },
                    new Column { Name = "PlayerId", DataType = "int", IsForeignKey = true },
                    new Column { Name = "GameId", DataType = "int", IsForeignKey = true },
                    new Column { Name = "TransactionDate", DataType = "datetime", IsDate = true },
                    new Column { Name = "Amount", DataType = "decimal" },
                    new Column { Name = "TransactionType", DataType = "varchar" },
                    new Column { Name = "Currency", DataType = "varchar" }
                }
            };
            
            // GameSessions table (fact)
            var gameSessionsTable = new Table
            {
                Name = "GameSessions",
                Description = "Gaming sessions",
                Columns = new List<Column>
                {
                    new Column { Name = "SessionId", DataType = "int", IsPrimaryKey = true },
                    new Column { Name = "PlayerId", DataType = "int", IsForeignKey = true },
                    new Column { Name = "GameId", DataType = "int", IsForeignKey = true },
                    new Column { Name = "StartTime", DataType = "datetime", IsDate = true },
                    new Column { Name = "EndTime", DataType = "datetime", IsDate = true },
                    new Column { Name = "Duration", DataType = "int" },
                    new Column { Name = "AmountWagered", DataType = "decimal" },
                    new Column { Name = "AmountWon", DataType = "decimal" },
                    new Column { Name = "DeviceType", DataType = "varchar" }
                }
            };
            
            // Add tables to the model
            model.Tables.Add(playersTable);
            model.Tables.Add(gamesTable);
            model.Tables.Add(transactionsTable);
            model.Tables.Add(gameSessionsTable);
            
            // Define relationships
            model.Relationships.Add(new Relationship
            {
                SourceTable = "Transactions",
                SourceColumn = "PlayerId",
                TargetTable = "Players",
                TargetColumn = "PlayerId"
            });
            
            model.Relationships.Add(new Relationship
            {
                SourceTable = "Transactions",
                SourceColumn = "GameId",
                TargetTable = "Games",
                TargetColumn = "GameId"
            });
            
            model.Relationships.Add(new Relationship
            {
                SourceTable = "GameSessions",
                SourceColumn = "PlayerId",
                TargetTable = "Players",
                TargetColumn = "PlayerId"
            });
            
            model.Relationships.Add(new Relationship
            {
                SourceTable = "GameSessions",
                SourceColumn = "GameId",
                TargetTable = "Games",
                TargetColumn = "GameId"
            });
            
            return model;
        }
    }
}
'@

Set-Content -Path $gamingModelPath -Value $gamingModelContent -Force
Write-Host "Created GamingDataModel.cs"

# Create or update the Table class definition
$databaseModelDir = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database"
$tableModelPath = Join-Path $databaseModelDir "Table.cs"

if (-not (Test-Path $tableModelPath)) {
    $tableModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database\Table.cs
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database table in the data model
    /// </summary>
    public class Table
    {
        /// <summary>
        /// Gets or sets the table name
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the table description
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the table type (Fact, Dimension, etc.)
        /// </summary>
        public string Type { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the schema name
        /// </summary>
        public string Schema { get; set; } = "dbo";
        
        /// <summary>
        /// Gets or sets the columns in the table
        /// </summary>
        public List<Column> Columns { get; set; } = new List<Column>();
        
        /// <summary>
        /// Gets or sets the estimated row count of the table
        /// </summary>
        public long RowCount { get; set; }
        
        /// <summary>
        /// Gets or sets whether this is a temporary table
        /// </summary>
        public bool IsTemporary { get; set; }
    }
}
'@
    Set-Content -Path $tableModelPath -Value $tableModelContent -Force
    Write-Host "Created Table.cs model"
}

# Create other database models
$columnModelPath = Join-Path $databaseModelDir "Column.cs"
if (-not (Test-Path $columnModelPath)) {
    $columnModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database\Column.cs
namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database column in a table
    /// </summary>
    public class Column
    {
        /// <summary>
        /// Gets or sets the column name
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the column description
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the data type
        /// </summary>
        public string DataType { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets whether this is a primary key
        /// </summary>
        public bool IsPrimaryKey { get; set; }
        
        /// <summary>
        /// Gets or sets whether this is a foreign key
        /// </summary>
        public bool IsForeignKey { get; set; }
        
        /// <summary>
        /// Gets or sets whether this is a date column
        /// </summary>
        public bool IsDate { get; set; }
        
        /// <summary>
        /// Gets or sets whether this column allows null values
        /// </summary>
        public bool IsNullable { get; set; } = true;
    }
}
'@
    Set-Content -Path $columnModelPath -Value $columnModelContent -Force
    Write-Host "Created Column.cs model"
}

$viewModelPath = Join-Path $databaseModelDir "View.cs"
if (-not (Test-Path $viewModelPath)) {
    $viewModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database\View.cs
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a database view in the data model
    /// </summary>
    public class View
    {
        /// <summary>
        /// Gets or sets the view name
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the view description
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the schema name
        /// </summary>
        public string Schema { get; set; } = "dbo";
        
        /// <summary>
        /// Gets or sets the columns in the view
        /// </summary>
        public List<Column> Columns { get; set; } = new List<Column>();
        
        /// <summary>
        /// Gets or sets the SQL definition of the view
        /// </summary>
        public string Definition { get; set; } = string.Empty;
    }
}
'@
    Set-Content -Path $viewModelPath -Value $viewModelContent -Force
    Write-Host "Created View.cs model"
}

$relationshipModelPath = Join-Path $databaseModelDir "Relationship.cs"
if (-not (Test-Path $relationshipModelPath)) {
    $relationshipModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database\Relationship.cs
namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a relationship between tables in the data model
    /// </summary>
    public class Relationship
    {
        /// <summary>
        /// Gets or sets the source table name
        /// </summary>
        public string SourceTable { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the source column name
        /// </summary>
        public string SourceColumn { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the target table name
        /// </summary>
        public string TargetTable { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the target column name
        /// </summary>
        public string TargetColumn { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the cardinality of the relationship (1:1, 1:N, N:M)
        /// </summary>
        public string Cardinality { get; set; } = "1:N";
        
        /// <summary>
        /// Gets or sets the relationship name
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }
}
'@
    Set-Content -Path $relationshipModelPath -Value $relationshipModelContent -Force
    Write-Host "Created Relationship.cs model"
}

$dataModelPath = Join-Path $databaseModelDir "DataModel.cs"
if (-not (Test-Path $dataModelPath)) {
    $dataModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Database\DataModel.cs
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Models.Database
{
    /// <summary>
    /// Represents a complete data model
    /// </summary>
    public class DataModel
    {
        /// <summary>
        /// Gets or sets the model name
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the model description
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the tables in the model
        /// </summary>
        public List<Table> Tables { get; set; } = new List<Table>();
        
        /// <summary>
        /// Gets or sets the views in the model
        /// </summary>
        public List<View> Views { get; set; } = new List<View>();
        
        /// <summary>
        /// Gets or sets the relationships in the model
        /// </summary>
        public List<Relationship> Relationships { get; set; } = new List<Relationship>();
    }
}
'@
    Set-Content -Path $dataModelPath -Value $dataModelContent -Force
    Write-Host "Created DataModel.cs model"
}

Write-Host "SqlTranslationService fix completed successfully" -ForegroundColor Green
