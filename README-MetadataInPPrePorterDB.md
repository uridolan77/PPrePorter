# Metadata Table Implementation in PPrePorterDB

This document outlines the implementation of a generic metadata table in the PPrePorterDB database for use with the DailyActionsDB data.

## Overview

Since we can't add tables to DailyActionsDB, we've implemented a single `dbo.tbl_Metadata` table in PPrePorterDB that holds all lookup items with a `MetadataType` field to distinguish between different types of metadata.

## Implementation Steps

### 1. Extract Metadata from DailyActionsDB

We've created a script to extract all metadata from DailyActionsDB:

```sql
-- Script to extract metadata from DailyActionsDB for export to CSV
-- Run this script against DailyActionsDB to extract all metadata values

-- Create a temporary table to hold all metadata
IF OBJECT_ID('tempdb..#AllMetadata') IS NOT NULL
    DROP TABLE #AllMetadata;

CREATE TABLE #AllMetadata (
    MetadataType NVARCHAR(50) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0
);

-- Extract Gender values
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT DISTINCT 
    'Gender' AS MetadataType,
    Gender AS Code, 
    Gender AS Name, 
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY Gender) AS DisplayOrder
FROM common.tbl_Daily_actions_players WITH (NOLOCK)
WHERE Gender IS NOT NULL AND Gender <> ''
ORDER BY Gender;

-- Similar extractions for other metadata types...

-- Output all metadata in CSV format
SELECT 
    MetadataType,
    Code,
    Name,
    ISNULL(Description, '') AS Description,
    CASE WHEN IsActive = 1 THEN 'TRUE' ELSE 'FALSE' END AS IsActive,
    DisplayOrder,
    NULL AS ParentId,
    NULL AS AdditionalData,
    CONVERT(VARCHAR(23), GETUTCDATE(), 126) AS CreatedDate,
    NULL AS UpdatedDate
FROM #AllMetadata
ORDER BY MetadataType, DisplayOrder, Name;
```

### 2. Create Metadata Table in PPrePorterDB

We've created a script to create the metadata table in PPrePorterDB:

```sql
-- Create Metadata table in PPrePorterDB (dbo schema)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.tbl_Metadata (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MetadataType NVARCHAR(50) NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0,
        ParentId INT NULL,
        AdditionalData NVARCHAR(MAX) NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
        UpdatedDate DATETIME NULL
    );
    
    -- Add indexes for faster lookups
    CREATE UNIQUE INDEX IX_Metadata_Type_Code ON dbo.tbl_Metadata(MetadataType, Code);
    CREATE INDEX IX_Metadata_Type ON dbo.tbl_Metadata(MetadataType);
    CREATE INDEX IX_Metadata_ParentId ON dbo.tbl_Metadata(ParentId);
    
    PRINT 'Created dbo.tbl_Metadata table in PPrePorterDB';
END
```

### 3. Import Metadata from CSV

We've created a script to import the metadata from CSV into PPrePorterDB:

```sql
-- Import data from CSV file
-- Replace 'C:\path\to\metadata.csv' with the actual path to your CSV file
-- You'll need to use BULK INSERT or OPENROWSET depending on your SQL Server version and permissions

-- After importing the data, insert it into the actual metadata table
INSERT INTO dbo.tbl_Metadata (
    MetadataType,
    Code,
    Name,
    Description,
    IsActive,
    DisplayOrder,
    ParentId,
    AdditionalData,
    CreatedDate,
    UpdatedDate
)
SELECT
    MetadataType,
    Code,
    Name,
    NULLIF(Description, ''),
    CASE WHEN UPPER(IsActive) = 'TRUE' THEN 1 ELSE 0 END,
    DisplayOrder,
    CASE WHEN ParentId = 'NULL' OR ParentId IS NULL THEN NULL ELSE CAST(ParentId AS INT) END,
    NULLIF(AdditionalData, ''),
    CASE WHEN CreatedDate = 'NULL' OR CreatedDate IS NULL THEN GETUTCDATE() ELSE CONVERT(DATETIME, CreatedDate) END,
    CASE WHEN UpdatedDate = 'NULL' OR UpdatedDate IS NULL THEN NULL ELSE CONVERT(DATETIME, UpdatedDate) END
FROM #ImportedMetadata
WHERE NOT EXISTS (
    SELECT 1 
    FROM dbo.tbl_Metadata 
    WHERE dbo.tbl_Metadata.MetadataType = #ImportedMetadata.MetadataType 
    AND dbo.tbl_Metadata.Code = #ImportedMetadata.Code
);
```

### 4. Create Stored Procedures

We've created stored procedures to access the metadata:

```sql
-- Create a stored procedure to get metadata by type
CREATE PROCEDURE [dbo].[sp_GetMetadataByType]
    @MetadataType NVARCHAR(50),
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        MetadataType,
        Code,
        Name,
        Description,
        IsActive,
        DisplayOrder,
        ParentId,
        AdditionalData,
        CreatedDate,
        UpdatedDate
    FROM 
        dbo.tbl_Metadata WITH (NOLOCK)
    WHERE 
        MetadataType = @MetadataType
        AND (@IncludeInactive = 1 OR IsActive = 1)
    ORDER BY 
        DisplayOrder, Name
END
```

### 5. Create MetadataItem Model

We've created a model for the metadata table:

```csharp
[Table("tbl_Metadata", Schema = "dbo")]
public class MetadataItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string MetadataType { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; } = 0;

    public int? ParentId { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? AdditionalData { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }
}
```

### 6. Create MetadataService

We've created a service to access the metadata:

```csharp
public class MetadataService : IMetadataService
{
    private readonly PPRePorterDbContext _dbContext;
    private readonly IGlobalCacheService _cacheService;
    private readonly ILogger<MetadataService> _logger;
    private const string CacheKeyPrefix = "Metadata_";

    // Constructor and implementation of interface methods...
}
```

### 7. Register MetadataService

We've registered the MetadataService in the dependency injection container:

```csharp
public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
{
    // Register the PPRePorterDbContext
    services.AddDbContext<PPRePorterDbContext>((serviceProvider, options) =>
    {
        var connectionStringResolver = serviceProvider.GetRequiredService<IConnectionStringResolverService>();
        var connectionStringTemplate = configuration.GetConnectionString("PPRePorterDB");
        
        options.UseSqlServer(connectionStringTemplate);
    });

    // Register the PPRePorterDbContext as a scoped service
    services.AddScoped<IPPRePorterDbContext>(provider => provider.GetRequiredService<PPRePorterDbContext>());

    // Register the MetadataService
    services.AddScoped<IMetadataService, MetadataService>();

    return services;
}
```

## How to Use

### 1. Run the Scripts

1. Run `Scripts/ExtractMetadataFromDailyActionsDB.sql` against DailyActionsDB to extract metadata
2. Export the results to a CSV file
3. Run `Scripts/ImportMetadataFromCSV.sql` against PPrePorterDB to import the metadata

### 2. Use the MetadataService

Inject the `IMetadataService` into your classes:

```csharp
private readonly IMetadataService _metadataService;

public MyClass(IMetadataService metadataService)
{
    _metadataService = metadataService;
}
```

Then, use it to get metadata:

```csharp
// Get all genders
var genders = await _metadataService.GetGendersAsync();

// Get all statuses, including inactive ones
var statuses = await _metadataService.GetStatusesAsync(includeInactive: true);

// Get a specific metadata item
var gender = await _metadataService.GetMetadataByTypeAndCodeAsync(MetadataTypes.Gender, "Male");

// Get a custom metadata type
var customMetadata = await _metadataService.GetMetadataByTypeAsync("CustomType");
```

### 3. Preload Metadata

The metadata is automatically preloaded when the application starts:

```csharp
public async Task PreloadMetadataAsync()
{
    _logger.LogInformation("Preloading metadata into cache");

    // Get all metadata types
    var metadataTypes = await _dbContext.Metadata
        .Select(m => m.MetadataType)
        .Distinct()
        .ToListAsync();

    // Preload each metadata type
    foreach (var metadataType in metadataTypes)
    {
        _logger.LogDebug("Preloading {MetadataType} metadata", metadataType);
        
        // Preload active items
        await GetMetadataByTypeAsync(metadataType, false);
        
        // Preload all items (including inactive)
        await GetMetadataByTypeAsync(metadataType, true);
    }

    _logger.LogInformation("Preloaded {Count} metadata types into cache", metadataTypes.Count);
}
```

## Benefits

1. **Centralized Metadata**: All metadata is stored in a single table in PPrePorterDB
2. **Cached Access**: Metadata is cached for efficient access
3. **No DailyActionsDB Modifications**: No need to modify DailyActionsDB schema
4. **Consistent API**: The `MetadataService` provides a consistent API for accessing all types of metadata
5. **Extensibility**: New metadata types can be added without changing the schema

## Next Steps

1. **Update DailyActionsService**: Update the DailyActionsService to use the MetadataService
2. **Create API Endpoints**: Create API endpoints to expose the metadata
3. **Update Frontend**: Update the frontend to use the metadata API endpoints
