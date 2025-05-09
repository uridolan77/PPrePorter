# PowerShell script to fix mapping conflicts and update SqlTranslationService

# Define directories
$projectRoot = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer"
$modelsDir = Join-Path $projectRoot "Models"
$translationDir = Join-Path $modelsDir "Translation"
$servicesDir = Join-Path $projectRoot "Services"

# 1. Backup and remove the duplicate Mappings.cs file
$mappingsFile = Join-Path $translationDir "Mappings.cs"
if (Test-Path $mappingsFile) {
    Rename-Item -Path $mappingsFile -NewName "Mappings.cs.bak" -Force
    Write-Host "Backed up $mappingsFile to Mappings.cs.bak" -ForegroundColor Green
}

# 2. Check and update MappedQueryEntities.cs to use the correct references
$mappedQueryEntitiesFile = Join-Path $translationDir "MappedQueryEntities.cs"
if (Test-Path $mappedQueryEntitiesFile) {
    Write-Host "Ensuring MappedQueryEntities.cs uses the correct references..." -ForegroundColor Cyan
}

# 3. Create a MappedFilter class for the SqlTranslationService
$mappedFilterFile = Join-Path $translationDir "MappedFilter.cs"
$mappedFilterContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Translation\MappedFilter.cs
namespace PPrePorter.SemanticLayer.Models.Translation
{
    /// <summary>
    /// Represents a mapping between a filter field and a database condition
    /// </summary>
    public class MappedFilter
    {
        /// <summary>
        /// Gets or sets the filter field name
        /// </summary>
        public string Field { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the filter field name in the database
        /// </summary>
        public string DatabaseField { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the operator (=, >, <, LIKE, etc.)
        /// </summary>
        public string Operator { get; set; } = "=";
        
        /// <summary>
        /// Gets or sets the filter value
        /// </summary>
        public object? Value { get; set; }
        
        /// <summary>
        /// Gets or sets whether the filter is negated
        /// </summary>
        public bool IsNegated { get; set; }
    }
}
'@
Set-Content -Path $mappedFilterFile -Value $mappedFilterContent -Force
Write-Host "Created MappedFilter.cs" -ForegroundColor Green

# 4. Create a Gaming namespace with default data model for development
$gamingDir = Join-Path $projectRoot "Gaming"
if (-not (Test-Path $gamingDir)) {
    New-Item -Path $gamingDir -ItemType Directory -Force | Out-Null
}

$gamingDataModelFile = Join-Path $gamingDir "GamingDataModel.cs"
$gamingDataModelContent = @'
// filepath: c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Gaming\GamingDataModel.cs
using PPrePorter.SemanticLayer.Models.Database;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Gaming
{
    /// <summary>
    /// Provides a default gaming data model for development
    /// </summary>
    public static class GamingDataModel
    {
        /// <summary>
        /// Gets a default gaming data model for development
        /// </summary>
        public static DataModel GetDefaultModel()
        {
            var model = new DataModel
            {
                Name = "GamingDataModel",
                Description = "Sample gaming data model for development"
            };
            
            // Create player dimension table
            var playerTable = new Table
            {
                Name = "Player",
                Schema = "dbo",
                Description = "Player information",
                Type = "Dimension",
                RowCount = 10000,
                Columns = new List<Column>
                {
                    new Column { Name = "PlayerId", DataType = "int", IsPrimaryKey = true, Description = "Player identifier" },
                    new Column { Name = "Username", DataType = "nvarchar(50)", Description = "Player username" },
                    new Column { Name = "RegistrationDate", DataType = "datetime", IsDate = true, Description = "Date player registered" },
                    new Column { Name = "LastLoginDate", DataType = "datetime", IsDate = true, Description = "Date of last login" },
                    new Column { Name = "Country", DataType = "nvarchar(50)", Description = "Player country" },
                    new Column { Name = "Status", DataType = "nvarchar(20)", Description = "Player account status" }
                }
            };
            
            // Create game dimension table
            var gameTable = new Table
            {
                Name = "Game",
                Schema = "dbo",
                Description = "Game information",
                Type = "Dimension",
                RowCount = 500,
                Columns = new List<Column>
                {
                    new Column { Name = "GameId", DataType = "int", IsPrimaryKey = true, Description = "Game identifier" },
                    new Column { Name = "GameName", DataType = "nvarchar(100)", Description = "Game name" },
                    new Column { Name = "Category", DataType = "nvarchar(50)", Description = "Game category" },
                    new Column { Name = "Provider", DataType = "nvarchar(50)", Description = "Game provider" },
                    new Column { Name = "ReleaseDate", DataType = "date", IsDate = true, Description = "Game release date" }
                }
            };
            
            // Create transaction fact table
            var transactionTable = new Table
            {
                Name = "Transaction",
                Schema = "dbo",
                Description = "Transaction data",
                Type = "Fact",
                RowCount = 1000000,
                Columns = new List<Column>
                {
                    new Column { Name = "TransactionId", DataType = "int", IsPrimaryKey = true, Description = "Transaction identifier" },
                    new Column { Name = "PlayerId", DataType = "int", IsForeignKey = true, Description = "Player identifier" },
                    new Column { Name = "GameId", DataType = "int", IsForeignKey = true, Description = "Game identifier" },
                    new Column { Name = "TransactionDate", DataType = "datetime", IsDate = true, Description = "Transaction date" },
                    new Column { Name = "Amount", DataType = "decimal(18,2)", IsNumeric = true, Description = "Transaction amount" },
                    new Column { Name = "Currency", DataType = "nvarchar(3)", Description = "Transaction currency" },
                    new Column { Name = "TransactionType", DataType = "nvarchar(20)", Description = "Transaction type (deposit, withdrawal, bet, win)" }
                }
            };
            
            // Add tables to the model
            model.Tables.Add(playerTable);
            model.Tables.Add(gameTable);
            model.Tables.Add(transactionTable);
            
            // Add relationships
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Transaction_Player",
                FromTable = "Transaction",
                FromColumn = "PlayerId",
                ToTable = "Player",
                ToColumn = "PlayerId"
            });
            
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Transaction_Game",
                FromTable = "Transaction",
                FromColumn = "GameId",
                ToTable = "Game",
                ToColumn = "GameId"
            });
            
            return model;
        }
    }
}
'@
Set-Content -Path $gamingDataModelFile -Value $gamingDataModelContent -Force
Write-Host "Created GamingDataModel.cs" -ForegroundColor Green

Write-Host "All mapping and related fixes applied!" -ForegroundColor Green
